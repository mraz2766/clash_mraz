import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const controls = vi.hoisted(() => ({
  toggle: vi.fn(),
  notice: vi.fn(),
  change: undefined as undefined | ((event: unknown, value: boolean) => void),
}))

vi.mock('@mui/icons-material', () => ({
  DeleteForeverRounded: () => null,
  PauseCircleOutlineRounded: () => null,
  PlayCircleOutlineRounded: () => null,
  SettingsRounded: () => null,
  WarningRounded: () => null,
}))
vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => children,
  Typography: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('ahooks', () => ({ useLockFn: (fn: unknown) => fn }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/components/base', () => ({
  Switch: ({ onChange }: { onChange: typeof controls.change }) => {
    controls.change = onChange
    return null
  },
  TooltipIcon: () => null,
}))
vi.mock('@/components/setting/mods/sysproxy-viewer', () => ({
  SysproxyViewer: () => null,
}))
vi.mock('@/components/setting/mods/tun-viewer', () => ({
  TunViewer: () => null,
}))
vi.mock('@/hooks/use-service-uninstaller', () => ({
  useServiceUninstaller: () => ({}),
}))
vi.mock('@/hooks/use-system-proxy-state', () => ({
  useSystemProxyState: () => ({
    indicator: false,
    toggleSystemProxy: controls.toggle,
  }),
}))
vi.mock('@/hooks/use-system-state', () => ({
  useSystemState: () => ({
    runState: { mode: 'NotRunning', serviceUsable: false },
    isTunModeAvailable: false,
    isLoading: false,
  }),
}))
vi.mock('@/hooks/use-verge', () => ({ useVerge: () => ({ verge: {} }) }))
vi.mock('@/services/notice-service', () => ({
  showNotice: { error: controls.notice },
}))
vi.mock('@/services/service-request', () => ({ requestService: vi.fn() }))

import ProxyControlSwitches from './proxy-control-switches'

describe('system proxy requests with a stale NotRunning snapshot', () => {
  beforeEach(() => {
    controls.toggle.mockReset().mockResolvedValue(undefined)
    controls.notice.mockClear()
    controls.change = undefined
  })

  it.each([true, false])(
    'forwards the requested state %s to the backend',
    (enabled) => {
      renderToStaticMarkup(React.createElement(ProxyControlSwitches))
      controls.change!({}, enabled)
      expect(controls.toggle).toHaveBeenCalledWith(enabled)
      expect(controls.notice).not.toHaveBeenCalled()
    },
  )

  it('still reports a real backend readiness failure', async () => {
    const error = new Error('SYSPROXY_CORE_NOT_READY')
    controls.toggle.mockRejectedValue(error)
    const onError = vi.fn()
    renderToStaticMarkup(React.createElement(ProxyControlSwitches, { onError }))
    controls.change!({}, true)
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error))
  })
})
