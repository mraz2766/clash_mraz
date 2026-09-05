import {
  ComputerRounded,
  TroubleshootRounded,
  InfoOutlined,
  SvgIconComponent,
} from '@mui/icons-material'
import {
  Box,
  Typography,
  Stack,
  ButtonBase,
  Tooltip,
  Fade,
} from '@mui/material'
import { useState, useMemo, memo, FC } from 'react'
import { useTranslation } from 'react-i18next'

import ProxyControlSwitches from '@/components/shared/proxy-control-switches'
import { useSystemProxyState } from '@/hooks/use-system-proxy-state'
import { useSystemState } from '@/hooks/use-system-state'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'

const LOCAL_STORAGE_TAB_KEY = 'clash-verge-proxy-active-tab'

interface TabButtonProps {
  isActive: boolean
  onClick: () => void
  icon: SvgIconComponent
  label: string
  hasIndicator?: boolean
}

// Tab组件
const TabButton: FC<TabButtonProps> = memo(
  ({ isActive, onClick, icon: Icon, label, hasIndicator = false }) => (
    <ButtonBase
      className="home-choice"
      aria-pressed={isActive}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        bgcolor: isActive ? 'var(--md-primary-container)' : 'transparent',
        color: isActive ? 'var(--md-on-primary-container)' : 'text.secondary',
        borderRadius: 1.5,
        flex: 1,
        minHeight: 36,
        transition:
          'background-color var(--md-motion), color var(--md-motion), transform var(--md-motion-fast)',
        position: 'relative',
        '&:hover': {
          bgcolor: isActive ? 'var(--md-primary-container)' : 'var(--md-hover)',
        },
        '&:active': { transform: 'scale(0.985)' },
      }}
    >
      <Icon fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {hasIndicator && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'success.main',
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        />
      )}
    </ButtonBase>
  ),
)

interface TabDescriptionProps {
  description: string
  tooltipTitle: string
}

// 描述文本组件
const TabDescription: FC<TabDescriptionProps> = memo(
  ({ description, tooltipTitle }) => (
    <Fade in={true} timeout={200}>
      <Typography
        variant="caption"
        component="div"
        sx={{
          width: '100%',
          textAlign: 'start',
          color: 'text.secondary',
          p: 1.5,
          fontSize: 13,
          borderRadius: 1,
          backgroundColor: 'var(--md-surface-container)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}
      >
        {description}
        <Tooltip title={tooltipTitle}>
          <InfoOutlined sx={{ fontSize: 14, opacity: 0.7, flexShrink: 0 }} />
        </Tooltip>
      </Typography>
    </Fade>
  ),
)

export const ProxyTunCard: FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>(
    () => localStorage.getItem(LOCAL_STORAGE_TAB_KEY) || 'system',
  )

  const { verge } = useVerge()
  const { isTunModeAvailable } = useSystemState()
  // Display the observed OS state, not the requested configuration.
  const { indicator: systemProxyIndicator } = useSystemProxyState()

  const { enable_tun_mode } = verge ?? {}

  const handleError = (err: unknown) => {
    showNotice.error(err)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, tab)
  }

  const tabDescription = useMemo(() => {
    if (activeTab === 'system') {
      return {
        text: systemProxyIndicator
          ? t('home.components.proxyTun.status.systemProxyEnabled')
          : t('home.components.proxyTun.status.systemProxyDisabled'),
        tooltip: t('home.components.proxyTun.tooltips.systemProxy'),
      }
    } else {
      return {
        text: !isTunModeAvailable
          ? t('home.components.proxyTun.status.tunModeServiceRequired')
          : enable_tun_mode
            ? t('home.components.proxyTun.status.tunModeEnabled')
            : t('home.components.proxyTun.status.tunModeDisabled'),
        tooltip: t('home.components.proxyTun.tooltips.tunMode'),
      }
    }
  }, [activeTab, systemProxyIndicator, enable_tun_mode, isTunModeAvailable, t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <TabButton
          isActive={activeTab === 'system'}
          onClick={() => handleTabChange('system')}
          icon={ComputerRounded}
          label={t('settings.sections.system.toggles.systemProxy')}
          hasIndicator={systemProxyIndicator}
        />
        <TabButton
          isActive={activeTab === 'tun'}
          onClick={() => handleTabChange('tun')}
          icon={TroubleshootRounded}
          label={t('settings.sections.system.toggles.tunMode')}
          hasIndicator={enable_tun_mode && isTunModeAvailable}
        />
      </Stack>

      <Box
        sx={{
          width: '100%',
          my: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <TabDescription
          description={tabDescription.text}
          tooltipTitle={tabDescription.tooltip}
        />
      </Box>

      <Box
        sx={{
          mt: 0,
          p: 0,
          bgcolor: 'transparent',
          borderRadius: 2,
        }}
      >
        <ProxyControlSwitches
          onError={handleError}
          label={
            activeTab === 'system'
              ? t('settings.sections.system.toggles.systemProxy')
              : t('settings.sections.system.toggles.tunMode')
          }
          noRightPadding={true}
        />
      </Box>
    </Box>
  )
}
