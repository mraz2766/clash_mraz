import {
  CheckRounded,
  LanguageRounded,
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

import { useDesktopText } from '@/hooks/use-desktop-text'
import { useProxySelection } from '@/hooks/use-proxy-selection'
import { easeOut, springs } from '@/lib/motion'
import { navItems } from '@/pages/_navigation'
import {
  useAppRefreshers,
  useClashConfigData,
  useProxiesData,
} from '@/providers/app-data-context'
import { patchClashMode } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'

// Manually switchable groups, matching the proxies page.
const SWITCHABLE_GROUPS = new Set(['Selector', 'URLTest', 'Fallback'])
const MODES = ['rule', 'global', 'direct'] as const
const MAX_RESULTS = 60

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

/** Ctrl+K palette: jump to a page, switch proxy mode or pick a node from any group. */
export default function CommandPalette({ onClose }: Props) {
  const { t } = useTranslation()
  const text = useDesktopText()
  const navigate = useNavigate()
  const { proxyView } = useProxiesData()
  const { clashConfig } = useClashConfigData()
  const { refreshProxy, refreshClashConfig } = useAppRefreshers()
  const { changeProxy } = useProxySelection({ onSuccess: refreshProxy })

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

    return [...pages, ...modes, ...nodes]
  }, [
    t,
    text,
    navigate,
    clashConfig?.mode,
    proxyView,
    refreshClashConfig,
    changeProxy,
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
                '搜索页面、模式或节点…',
                'Search pages, modes or nodes…',
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
