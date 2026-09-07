import {
  DirectionsRounded,
  LanguageRounded,
  MultipleStopRounded,
} from '@mui/icons-material'
import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { useLockFn } from 'ahooks'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BaseConfig } from 'tauri-plugin-mihomo-api'

import { useClashMode, useRuntimeConfig } from '@/hooks/use-clash'
import {
  useAppRefreshers,
  useClashConfigData,
  useCoreDataStatus,
} from '@/providers/app-data-context'
import { patchClashMode } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { setCacheData } from '@/services/query-client'
import type { TranslationKey } from '@/types/generated/i18n-keys'

const CLASH_MODES = ['rule', 'global', 'direct'] as const
type ClashMode = (typeof CLASH_MODES)[number]

const isClashMode = (mode: string): mode is ClashMode =>
  (CLASH_MODES as readonly string[]).includes(mode)

const toClashMode = (mode?: string | null) => {
  const normalized = mode?.toLowerCase()
  return normalized && isClashMode(normalized) ? normalized : undefined
}

const MODE_META: Record<
  ClashMode,
  { label: TranslationKey; description: TranslationKey }
> = {
  rule: {
    label: 'home.components.clashMode.labels.rule',
    description: 'home.components.clashMode.descriptions.rule',
  },
  global: {
    label: 'home.components.clashMode.labels.global',
    description: 'home.components.clashMode.descriptions.global',
  },
  direct: {
    label: 'home.components.clashMode.labels.direct',
    description: 'home.components.clashMode.descriptions.direct',
  },
}

const MODE_ICONS: Record<ClashMode, ReactNode> = {
  rule: <MultipleStopRounded fontSize="small" />,
  global: <LanguageRounded fontSize="small" />,
  direct: <DirectionsRounded fontSize="small" />,
}

export const ClashModeCard = () => {
  const { t } = useTranslation()
  const { clashConfig } = useClashConfigData()
  const { isCoreDataPending } = useCoreDataStatus()
  const { refreshClashConfig } = useAppRefreshers()

  const [optimisticMode, setOptimisticMode] = useState<ClashMode | null>(null)

  const controllerMode = toClashMode(clashConfig?.mode)
  const needFallback = !controllerMode
  const { data: runtimeConfig, isPending: isRuntimeConfigPending } =
    useRuntimeConfig(needFallback)
  const runtimeMode = toClashMode(runtimeConfig?.mode)
  const {
    data: backendMode,
    isPending: isBackendModePending,
    refetch: refetchBackendMode,
  } = useClashMode(needFallback)
  // Saved config is refreshed on mode changes; runtime config may be stale.
  const fallbackMode = toClashMode(backendMode) ?? runtimeMode

  const resolvedMode = controllerMode ?? fallbackMode
  const currentMode = optimisticMode ?? resolvedMode

  const modeDescription = currentMode
    ? t(MODE_META[currentMode].description)
    : isCoreDataPending || isRuntimeConfigPending || isBackendModePending
      ? '\u00A0'
      : t('home.components.clashMode.errors.communication')

  const onChangeMode = useLockFn(async (mode: ClashMode) => {
    if (mode === currentMode) return

    setOptimisticMode(mode)
    try {
      await patchClashMode(mode)
    } catch (error) {
      setOptimisticMode(null)
      showNotice.error(error)
      return
    }

    // Write through the live cache to avoid flashing the old mode during refetch.
    setCacheData<BaseConfig>(['getClashConfig'], (old) =>
      old ? { ...old, mode } : old,
    )
    await Promise.allSettled([refreshClashConfig(), refetchBackendMode()])
    setOptimisticMode(null)
  })

  const buttonStyles = (mode: ClashMode) => ({
    cursor: 'pointer',
    px: 2,
    py: 1,
    minHeight: 36,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    bgcolor:
      mode === currentMode ? 'var(--md-primary-container)' : 'transparent',
    color:
      mode === currentMode
        ? 'var(--md-on-primary-container)'
        : 'text.secondary',
    borderRadius: 1.5,
    transition:
      'background-color var(--md-motion), color var(--md-motion), transform var(--md-motion-fast)',
    position: 'relative',
    overflow: 'visible',
    '&:hover': {
      bgcolor:
        mode === currentMode
          ? 'var(--md-primary-container)'
          : 'var(--md-hover)',
    },
    '&:active': { transform: 'scale(0.985)' },
  })

  const descriptionStyles = {
    width: '100%',
    textAlign: 'start',
    color: 'text.secondary',
    p: 1.5,
    fontSize: 13,
    borderRadius: 1,
    backgroundColor: 'transparent',
    wordBreak: 'break-word',
    hyphens: 'auto',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {CLASH_MODES.map((mode) => (
          <ButtonBase
            key={mode}
            className="home-choice"
            aria-pressed={mode === currentMode}
            onClick={() => onChangeMode(mode)}
            sx={buttonStyles(mode)}
          >
            {MODE_ICONS[mode]}
            <Typography
              variant="body2"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            >
              {t(MODE_META[mode].label)}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>

      <Box
        className="mode-description"
        sx={{
          width: '100%',
          my: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Typography variant="caption" component="div" sx={descriptionStyles}>
          {modeDescription}
        </Typography>
      </Box>
    </Box>
  )
}
