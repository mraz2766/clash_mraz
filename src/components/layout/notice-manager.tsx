import { CloseRounded } from '@mui/icons-material'
import {
  Alert,
  IconButton,
  Box,
  Stack,
  type SnackbarOrigin,
} from '@mui/material'
import { AnimatePresence, m } from 'motion/react'
import React, { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'

import { springs } from '@/lib/motion'
import {
  boundNoticeText,
  subscribeNotices,
  hideNotice,
  getSnapshotNotices,
  showNotice,
} from '@/services/notice-service'
import type { TranslationKey } from '@/types/generated/i18n-keys'

// Distance a notice must be flung sideways before it is dismissed.
const SWIPE_DISMISS_PX = 80

type NoticePosition = NonNullable<IVergeConfig['notice_position']>
type NoticeItem = ReturnType<typeof getSnapshotNotices>[number]
type TranslationFn = ReturnType<typeof useTranslation>['t']

const VALID_POSITIONS: NoticePosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

const resolvePosition = (position?: NoticePosition | null): NoticePosition => {
  if (position && VALID_POSITIONS.includes(position)) {
    return position
  }
  return 'bottom-right'
}

const getAnchorOrigin = (position: NoticePosition): SnackbarOrigin => {
  const [vertical, horizontal] = position.split('-') as [
    SnackbarOrigin['vertical'],
    SnackbarOrigin['horizontal'],
  ]
  return { vertical, horizontal }
}

/** Resolve notice text, bounding display output but not clipboard content. */
const resolveNoticeMessage = (
  notice: NoticeItem,
  t: TranslationFn,
  options?: { bounded?: boolean },
): React.ReactNode => {
  const bound = (text: React.ReactNode): React.ReactNode =>
    options?.bounded === false || typeof text !== 'string'
      ? text
      : boundNoticeText(text)

  const i18n = notice.i18n
  if (!i18n) return bound(notice.message)

  const source = (i18n.params ?? {}) as Record<string, unknown>
  // Bound both parameters and their final interpolation.
  const params =
    options?.bounded === false
      ? source
      : Object.fromEntries(
          Object.entries(source).map(([key, value]) => [
            key,
            typeof value === 'string' ? boundNoticeText(value) : value,
          ]),
        )
  const { prefixKey, prefixParams, prefix, message, ...restParams } = params

  const prefixKeyParams =
    prefixParams && typeof prefixParams === 'object'
      ? (prefixParams as Record<string, unknown>)
      : undefined

  const resolvedPrefix =
    typeof prefixKey === 'string'
      ? t(prefixKey as TranslationKey, {
          defaultValue: prefixKey,
          ...(prefixKeyParams ?? {}),
          ...restParams,
        })
      : typeof prefix === 'string'
        ? prefix
        : undefined

  const messageStr = typeof message === 'string' ? message : undefined

  const defaultValue =
    messageStr === undefined
      ? undefined
      : resolvedPrefix
        ? `${resolvedPrefix} ${messageStr}`
        : messageStr

  return bound(
    t(i18n.key as TranslationKey, {
      defaultValue,
      ...restParams,
      ...(resolvedPrefix !== undefined ? { prefix: resolvedPrefix } : {}),
      ...(messageStr !== undefined ? { message: messageStr } : {}),
    }),
  )
}

const extractNoticeCopyText = (input: unknown): string | undefined => {
  if (input === null || input === undefined) return undefined
  if (typeof input === 'string') return input
  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input)
  }
  if (input instanceof Error) {
    return input.message || input.name
  }
  if (React.isValidElement(input)) return undefined
  if (typeof input === 'object') {
    const maybeMessage = (input as { message?: unknown }).message
    if (typeof maybeMessage === 'string') return maybeMessage
  }
  try {
    return JSON.stringify(input)
  } catch {
    return String(input)
  }
}

const resolveNoticeCopyText = (
  notice: NoticeItem,
  t: TranslationFn,
): string | undefined => {
  if (
    notice.i18n?.key === 'shared.feedback.notices.prefixedRaw' ||
    notice.i18n?.key === 'shared.feedback.notices.raw'
  ) {
    const rawText = extractNoticeCopyText(notice.i18n?.params?.message)
    if (rawText) return rawText
  }

  return (
    extractNoticeCopyText(
      resolveNoticeMessage(notice, t, { bounded: false }),
    ) ?? extractNoticeCopyText(notice.message)
  )
}

interface NoticeManagerProps {
  position?: NoticePosition | null
}

export const NoticeManager: React.FC<NoticeManagerProps> = ({ position }) => {
  const { t } = useTranslation()
  const resolvedPosition = useMemo(() => resolvePosition(position), [position])
  const anchorOrigin = useMemo(
    () => getAnchorOrigin(resolvedPosition),
    [resolvedPosition],
  )
  const currentNotices = useSyncExternalStore(
    subscribeNotices,
    getSnapshotNotices,
  )

  const enterOffset = anchorOrigin.horizontal === 'left' ? -32 : 32

  const handleClose = (id: number) => {
    hideNotice(id)
  }

  const handleNoticeCopy = useCallback(
    async (notice: NoticeItem) => {
      const text = resolveNoticeCopyText(notice, t)
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        showNotice.success(
          'shared.feedback.notifications.common.copySuccess',
          1000,
        )
      } catch (error) {
        console.warn('[NoticeManager] copy to clipboard failed:', error)
      }
    },
    [t],
  )

  return (
    <Box
      sx={{
        position: 'fixed',
        top: anchorOrigin.vertical === 'top' ? '20px' : 'auto',
        bottom: anchorOrigin.vertical === 'bottom' ? '20px' : 'auto',
        left: anchorOrigin.horizontal === 'left' ? '20px' : 'auto',
        right: anchorOrigin.horizontal === 'right' ? '20px' : 'auto',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
      }}
    >
      {/* Notices slide in from their edge, reflow as others leave, and can be swiped away. */}
      <AnimatePresence initial={false}>
        {currentNotices.map((notice) => (
          <m.div
            key={notice.id}
            layout
            initial={{ opacity: 0, x: enterOffset, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: enterOffset, scale: 0.96 }}
            transition={springs.gentle}
            drag="x"
            dragSnapToOrigin
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > SWIPE_DISMISS_PX) {
                handleClose(notice.id)
              }
            }}
            style={{ width: '100%', cursor: 'grab' }}
          >
            <Alert
              severity={notice.type}
              variant="filled"
              sx={{ width: '100%', boxShadow: '0 6px 20px rgba(0,0,0,0.14)' }}
              onContextMenu={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void handleNoticeCopy(notice)
              }}
              action={
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: 'center' }}
                >
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleClose(notice.id)}
                  >
                    <CloseRounded fontSize="inherit" />
                  </IconButton>
                </Stack>
              }
            >
              {resolveNoticeMessage(notice, t)}
            </Alert>
          </m.div>
        ))}
      </AnimatePresence>
    </Box>
  )
}
