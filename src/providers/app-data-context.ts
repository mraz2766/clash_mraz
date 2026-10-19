import { Context, createContext, use } from 'react'
import {
  BaseConfig,
  getRuleProviders,
  getRules,
  RuleProvider,
} from 'tauri-plugin-mihomo-api'

import { getAppUptime } from '@/services/cmds'
import { useQuery } from '@/services/query-client'
import type { ProxyViewV1 } from '@/types/proxy-view'

export interface ProxiesContextType {
  proxyView: ProxyViewV1 | undefined
  isProxyViewPending: boolean
  isProxyViewError: boolean
}

export interface ClashConfigContextType {
  clashConfig: BaseConfig | undefined
  isClashConfigPending: boolean
}

export interface SystemContextType {
  sysproxy: any
  runningMode?: string
  isRunningModePending: boolean
  systemProxyAddress: string
}

export interface CoreDataStatusContextType {
  isCoreDataPending: boolean
}

export interface RefreshersContextType {
  refreshProxy: () => Promise<unknown>
  refreshClashConfig: () => Promise<unknown>
  refreshRules: () => Promise<unknown>
  refreshSysproxy: () => Promise<unknown>
  refreshRuleProviders: () => Promise<unknown>
  refreshAll: () => Promise<unknown>
}

export const ProxiesContext = createContext<ProxiesContextType | null>(null)
export const ClashConfigContext = createContext<ClashConfigContextType | null>(
  null,
)
export const SystemContext = createContext<SystemContextType | null>(null)
export const CoreDataStatusContext =
  createContext<CoreDataStatusContextType | null>(null)
export const RefreshersContext = createContext<RefreshersContextType | null>(
  null,
)

const useCtx = <T>(ctx: Context<T | null>, hookName: string): T => {
  const v = use(ctx)
  if (!v) throw new Error(`${hookName} must be used within AppDataProvider`)
  return v
}

export const useProxiesData = (): ProxiesContextType =>
  useCtx(ProxiesContext, 'useProxiesData')

export const rulesQueryKey = ['getRules'] as const
export const ruleProvidersQueryKey = ['getRuleProviders'] as const

const TQ_RULES = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: 1500,
  retry: 3,
  retryDelay: (attempt: number) => Math.min(200 * 2 ** attempt, 3000),
} as const

const EMPTY_RULES: never[] = []
const EMPTY_RULE_PROVIDERS: Record<string, RuleProvider> = {}

// Rules can be large, so they load only while a consumer is mounted.
export const useRulesData = () => {
  const { data: rulesData } = useQuery({
    queryKey: rulesQueryKey,
    queryFn: getRules,
    ...TQ_RULES,
  })
  const { data: ruleProviders } = useQuery({
    queryKey: ruleProvidersQueryKey,
    queryFn: getRuleProviders,
    ...TQ_RULES,
    revalidateOnMount: false,
  })

  return {
    rules: rulesData?.rules ?? EMPTY_RULES,
    ruleProviders: ruleProviders?.providers ?? EMPTY_RULE_PROVIDERS,
  }
}

export const useClashConfigData = (): ClashConfigContextType =>
  useCtx(ClashConfigContext, 'useClashConfigData')

export const useSystemData = (): SystemContextType =>
  useCtx(SystemContext, 'useSystemData')

// Polled only while the diagnostics card that shows it is mounted.
export const useUptimeData = () => {
  const { data } = useQuery({
    queryKey: ['appUptime'],
    queryFn: getAppUptime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5000,
    refetchInterval: 3000,
    retry: 1,
  })
  return { uptime: data || 0 }
}

export const useAppRefreshers = (): RefreshersContextType =>
  useCtx(RefreshersContext, 'useAppRefreshers')

export const useCoreDataStatus = (): CoreDataStatusContextType =>
  useCtx(CoreDataStatusContext, 'useCoreDataStatus')
