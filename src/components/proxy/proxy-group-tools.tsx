import {
  MoreHorizRounded,
  NetworkCheckRounded,
  CloseRounded,
} from '@mui/icons-material'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  type SxProps,
  TextField,
} from '@mui/material'
import { useDebounceFn } from 'ahooks'
import { memo, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { useDesktopText } from '@/hooks/use-desktop-text'
import { useVerge } from '@/hooks/use-verge'
import delayManager from '@/services/delay'

import { BaseSearchBox, type SearchState } from '../base'

import type { ProxySortType } from './use-filter-sort'
import type { HeadState } from './use-head-state'

interface Props {
  sx?: SxProps
  url?: string
  groupName: string
  headState: HeadState
  onLocation: () => void
  onCheckDelay: () => void
  onHeadState: (val: Partial<HeadState>) => void
}
export const ProxyGroupTools = memo(function ProxyGroupTools({
  sx,
  url,
  groupName,
  headState,
  onCheckDelay,
  onHeadState,
  onLocation,
}: Props) {
  const { t } = useTranslation()
  const text = useDesktopText()
  const { verge } = useVerge()
  const {
    textState,
    testUrl,
    filterText,
    filterMatchCase,
    filterMatchWholeWord,
    filterUseRegularExpression,
    sortType,
    showType,
  } = headState
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultUrl =
    verge?.default_latency_test?.trim() ||
    'http://cp.cloudflare.com/generate_204'
  useEffect(() => {
    delayManager.setUrl(groupName, testUrl?.trim() || url || defaultUrl)
  }, [groupName, testUrl, url, defaultUrl])
  const { run: applyFilter, flush: flushFilter } = useDebounceFn(
    (state: SearchState) =>
      onHeadState({
        filterText: state.text,
        filterMatchCase: state.matchCase,
        filterMatchWholeWord: state.matchWholeWord,
        filterUseRegularExpression: state.useRegularExpression,
      }),
    { wait: 180 },
  )
  useEffect(() => {
    if (textState !== 'filter') flushFilter()
  }, [textState, flushFilter])
  useEffect(() => () => flushFilter(), [flushFilter])
  useEffect(() => {
    if (textState) inputRef.current?.focus()
  }, [textState])
  const expand = () => {
    if (!headState.open) {
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync
      flushSync(() => onHeadState({ open: true }))
    }
  }
  const action = (fn: () => void) => {
    setAnchor(null)
    fn()
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ml: 'auto',
        ...sx,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {textState === 'filter' && (
        <Box sx={{ width: 160 }}>
          <BaseSearchBox
            inputRef={inputRef}
            defaultValue={filterText}
            matchCase={filterMatchCase}
            matchWholeWord={filterMatchWholeWord}
            useRegularExpression={filterUseRegularExpression}
            onSearch={(_, state) => applyFilter(state)}
          />
        </Box>
      )}
      {textState === 'url' && (
        <TextField
          inputRef={inputRef}
          size="small"
          value={testUrl}
          onChange={(event) => onHeadState({ testUrl: event.target.value })}
          placeholder={t('proxies.page.placeholders.delayCheckUrl')}
          slotProps={{
            htmlInput: {
              'aria-label': t('proxies.page.placeholders.delayCheckUrl'),
            },
          }}
          sx={{ width: 180 }}
        />
      )}
      {textState && (
        <IconButton
          size="small"
          aria-label={t('shared.actions.close')}
          onClick={() => onHeadState({ textState: null })}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      )}
      <IconButton
        size="small"
        title={t('proxies.page.tooltips.delayCheck')}
        aria-label={t('proxies.page.tooltips.delayCheck')}
        onClick={() => {
          expand()
          onCheckDelay()
        }}
      >
        <NetworkCheckRounded fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        title={text('更多操作', 'More actions')}
        aria-label={text('更多操作', 'More actions')}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem
          onClick={() =>
            action(() => {
              expand()
              onLocation()
            })
          }
        >
          {t('proxies.page.tooltips.locate')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            action(() => {
              expand()
              onHeadState({ textState: 'filter' })
            })
          }
        >
          {t('proxies.page.tooltips.filter')}
        </MenuItem>
        {([0, 1, 2] as ProxySortType[]).map((value) => (
          <MenuItem
            key={value}
            selected={sortType === value}
            onClick={() =>
              action(() => {
                expand()
                onHeadState({ sortType: value })
              })
            }
          >
            {
              [
                t('proxies.page.tooltips.sortDefault'),
                t('proxies.page.tooltips.sortDelay'),
                t('proxies.page.tooltips.sortName'),
              ][value]
            }
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => action(() => onHeadState({ textState: 'url' }))}
        >
          {t('proxies.page.tooltips.delayCheckUrl')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            action(() => {
              expand()
              onHeadState({ showType: !showType })
            })
          }
        >
          {showType
            ? t('proxies.page.tooltips.showBasic')
            : t('proxies.page.tooltips.showDetail')}
        </MenuItem>
      </Menu>
    </Box>
  )
})
