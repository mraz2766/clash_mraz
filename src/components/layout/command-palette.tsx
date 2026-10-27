import {
  CheckRounded,
  DnsOutlined,
  LanguageRounded,
  PowerSettingsNewRounded,
  SearchRounded,
  TuneRounded,
} from '@mui/icons-material'
import { Box, InputBase, Modal, Typography } from '@mui/material'
import { m } from 'motion/react'
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { closeAllConnections } from 'tauri-plugin-mihomo-api'

import { useDesktopText } from '@/hooks/use-desktop-text'
import { useProfiles } from '@/hooks/use-profiles'
import { useProxySelection } from '@/hooks/use-proxy-selection'
import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useVerge } from '@/hooks/use-verge'
import { easeOut, springs } from '@/lib/motion'
import { navItems } from '@/pages/_navigation'
import {
  useAppRefreshers,
  useClashConfigData,
  useProxiesData,
} from '@/providers/app-data-context'
import { patchClashMode } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { requestService } from '@/services/service-request'

// Manually switchable groups, matching the proxies page.
const SWITCHABLE_GROUPS = new Set(['Selector', 'URLTest', 'Fallback'])
const MODES = ['rule', 'global', 'direct'] as const
const MAX_RESULTS = 60
// Profile entries that are subscriptions; merge and script entries are enhancements.
const SWITCHABLE_PROFILES = new Set(['remote', 'local'])

interface Command {
  id: string
  section: string
  label: string
  detail?: string
  icon: ReactNode
  current?: boolean
  run: () => void | Promise<void>
}

interface Props {
  onClose: () => void
}

/**
 * Ctrl+K palette: jump to a page, toggle system proxy or TUN, switch proxy mode,
 * subscription, or pick a node from any group.
 */
export default function CommandPalette({ onClose }: Props) {
  const { t } = useTranslation()
  const text = useDesktopText()
  const navigate = useNavigate()
  const { proxyView } = useProxiesData()
  const { clashConfig } = useClashConfigData()
  const { refreshProxy, refreshClashConfig } = useAppRefreshers()
  const { changeProxy } = useProxySelection({ onSuccess: refreshProxy })
  const { profiles, patchProfiles } = useProfiles()
  const { verge, mutateVerge, patchVerge } = useVerge()
  const { indicator: systemProxyOn, toggleSystemProxy } = useSystemProxyState()
  const { isTunModeAvailable } = useSystemState()
  const tunOn = Boolean(verge?.enable_tun_mode && isTunModeAvailable)

  // Same guarded paths as the home switches and the profiles page; read through
  // a ref so the command list does not rebuild on every render.
  const actionsRef = useRef({
    toggleSystemProxy: async () => {},
    toggleTun: async () => {},
    switchProfile: async (_uid: string) => {},
  })
  actionsRef.current = {
    toggleSystemProxy: async () => {
      try {
        await toggleSystemProxy(!systemProxyOn)
      } catch (error) {
        showNotice.error(error)
      }
    },
    toggleTun: async () => {
      const next = !tunOn
      if (next && !isTunModeAvailable) {
        requestService({
          reason: 'tunNeedsService',
          restore: { enable_tun_mode: next },
        })
        return
      }
      try {
        mutateVerge(
          (prev) => (prev ? { ...prev, enable_tun_mode: next } : prev),
          false,
        )
        await patchVerge({ enable_tun_mode: next })
      } catch (error) {
        showNotice.error(error)
      }
    },
    switchProfile: async (uid: string) => {
      try {
        const outcome = await patchProfiles({ current: uid })
        if (outcome.status === 'busy') {
          showNotice.info(
            'profiles.page.feedback.notifications.switchBusy',
            2000,
          )
        } else if (outcome.status === 'valid') {
          void closeAllConnections().catch(() => {})
          showNotice.success(
            'profiles.page.feedback.notifications.profileSwitched',
            1000,
          )
        }
      } catch (error) {
        showNotice.error(error, 4000)
      }
    },
  }

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on the next frame: the portal has attached by then, and a focus
  // trap remount (StrictMode) cannot hand focus back to the opener.
  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = navItems.map((item) => ({
      id: `page:${item.path}`,
      section: text('页面', 'Pages'),
      label: t(item.label),
      icon: item.icon[0],
      run: () => navigate(item.path),
    }))

    const currentMode = clashConfig?.mode?.toLowerCase()
    const modes: Command[] = MODES.map((mode) => ({
      id: `mode:${mode}`,
      section: text('代理模式', 'Proxy mode'),
      label: t(`proxies.page.modes.${mode}`),
      icon: <TuneRounded />,
      current: currentMode === mode,
      run: async () => {
        try {
          await patchClashMode(mode)
          await refreshClashConfig()
        } catch (error) {
          showNotice.error(error)
        }
      },
    }))

    // In global mode traffic follows the GLOBAL group, so offer its nodes first.
    const switchable = (proxyView?.groups ?? []).filter(
      (group) => !group.hidden && SWITCHABLE_GROUPS.has(group.type),
    )
    const groups =
      currentMode === 'global' && proxyView?.global
        ? [proxyView.global, ...switchable]
        : switchable
    const nodes: Command[] = groups.flatMap((group) =>
      group.members
        .filter((member) => member.kind !== 'unresolved')
        .map((member) => ({
          id: `node:${group.name}:${member.name}`,
          section: text('节点', 'Nodes'),
          label: member.name,
          detail: group.name,
          icon: <LanguageRounded />,
          current: group.now === member.name,
          run: () =>
            changeProxy(group.name, member.name, group.now, group.fixed),
        })),
    )

    const systemProxyLabel = t(
      'settings.sections.proxyControl.fields.systemProxy',
    )
    const tunLabel = t('settings.sections.proxyControl.fields.tunMode')
    const quick: Command[] = [
      {
        id: 'action:system-proxy',
        section: text('快捷操作', 'Quick actions'),
        label: systemProxyOn
          ? text(`关闭${systemProxyLabel}`, `Turn off ${systemProxyLabel}`)
          : text(`开启${systemProxyLabel}`, `Turn on ${systemProxyLabel}`),
        icon: <PowerSettingsNewRounded />,
        run: () => actionsRef.current.toggleSystemProxy(),
      },
      {
        id: 'action:tun',
        section: text('快捷操作', 'Quick actions'),
        label: tunOn
          ? text(`关闭${tunLabel}`, `Turn off ${tunLabel}`)
          : text(`开启${tunLabel}`, `Turn on ${tunLabel}`),
        icon: <PowerSettingsNewRounded />,
        run: () => actionsRef.current.toggleTun(),
      },
    ]

    const subscriptions: Command[] = (profiles?.items ?? [])
      .filter((item) => item?.uid && SWITCHABLE_PROFILES.has(item.type ?? ''))
      .map((item) => ({
        id: `profile:${item.uid}`,
        section: text('订阅', 'Subscriptions'),
        label: item.name || item.uid,
        icon: <DnsOutlined />,
        current: profiles?.current === item.uid,
        run: () => actionsRef.current.switchProfile(item.uid),
      }))

    return [...quick, ...pages, ...modes, ...subscriptions, ...nodes]
  }, [
    t,
    text,
    navigate,
    clashConfig?.mode,
    proxyView,
    refreshClashConfig,
    changeProxy,
    profiles,
    systemProxyOn,
    tunOn,
  ])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matched = needle
      ? commands.filter((command) =>
          `${command.label} ${command.detail ?? ''}`
            .toLowerCase()
            .includes(needle),
        )
      : commands
    return matched.slice(0, MAX_RESULTS)
  }, [commands, query])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const execute = (command: Command | undefined) => {
    if (!command) return
    onClose()
    void command.run()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      execute(results[active])
    }
  }

  return (
    // disableAutoFocus: the trap would otherwise park focus on its container
    // instead of the search box.
    <Modal open onClose={onClose} hideBackdrop disableAutoFocus>
      <Box
        sx={{ position: 'fixed', inset: 0, outline: 'none' }}
        onClick={onClose}
      >
        <m.div
          className="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.16 }}
        />
        <m.div
          className="command-palette"
          role="dialog"
          aria-label={text('命令面板', 'Command palette')}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: -6,
            scale: 0.98,
            transition: { duration: 0.12, ease: easeOut },
          }}
          transition={springs.snappy}
          onClick={(event) => event.stopPropagation()}
        >
          <Box className="command-palette-search">
            <SearchRounded sx={{ color: 'text.secondary' }} />
            <InputBase
              autoFocus
              inputRef={inputRef}
              fullWidth
              value={query}
              placeholder={text(
                '搜索操作、页面、订阅或节点…',
                'Search actions, pages, subscriptions or nodes…',
              )}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              inputProps={{
                'aria-label': text('搜索命令', 'Search commands'),
                role: 'combobox',
                'aria-expanded': true,
                'aria-controls': 'command-palette-list',
                'aria-activedescendant': results[active]
                  ? `command-${active}`
                  : undefined,
              }}
            />
          </Box>

          <div
            ref={listRef}
            id="command-palette-list"
            role="listbox"
            className="command-palette-list"
          >
            {results.length === 0 && (
              <Typography className="command-palette-empty">
                {text('没有匹配的结果', 'No matching results')}
              </Typography>
            )}
            {results.map((command, index) => (
              <div key={command.id}>
                {(index === 0 ||
                  results[index - 1].section !== command.section) && (
                  <div className="command-palette-section">
                    {command.section}
                  </div>
                )}
                <div
                  id={`command-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === active}
                  className="command-palette-item"
                  onMouseMove={() => setActive(index)}
                  onClick={() => execute(command)}
                >
                  {/* The highlight glides between rows as the selection moves. */}
                  {index === active && (
                    <m.span
                      layoutId="command-palette-active"
                      className="command-palette-highlight"
                      transition={springs.snappy}
                    />
                  )}
                  <span className="command-palette-icon">{command.icon}</span>
                  <span className="command-palette-label">{command.label}</span>
                  {command.detail && (
                    <span className="command-palette-detail">
                      {command.detail}
                    </span>
                  )}
                  {command.current && (
                    <CheckRounded className="command-palette-check" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="command-palette-footer">
            {text(
              '↑↓ 选择 · Enter 确认 · Esc 关闭',
              '↑↓ to navigate · Enter to run · Esc to close',
            )}
          </div>
        </m.div>
      </Box>
    </Modal>
  )
}
