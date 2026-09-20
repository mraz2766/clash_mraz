import { CheckCircleOutlineRounded, PushPinOutlined } from '@mui/icons-material'
import {
  alpha,
  Box,
  CircularProgress,
  ListItemButton,
  styled,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { BaseLoading } from '@/components/base'
import { useDesktopText } from '@/hooks/use-desktop-text'
import { useProxyDelayState } from '@/hooks/use-proxy-delay-state'
import { useProxySelectionStatus } from '@/hooks/use-proxy-selection-status'
import delayManager from '@/services/delay'
import {
  memberDetails,
  type ProxyGroupView,
  type ResolvedProxyMember,
} from '@/types/proxy-view'

import { proxyStatusColor } from './proxy-status-color'

interface Props {
  group: ProxyGroupView
  member: ResolvedProxyMember
  selected: boolean
  showType?: boolean
  onClick?: (member: ResolvedProxyMember) => void
}

// 多列布局
export const ProxyItemMini = (props: Props) => {
  const { group, member, selected, showType = true, onClick } = props
  const pending = useProxySelectionStatus()
  const text = useDesktopText()
  const switching =
    pending?.groupName === group.name && pending.proxyName === member.ref.name
  const details = memberDetails(member)
  const unresolved = member.kind === 'unresolved'
  const name = member.ref.name
  const type = unresolved ? member.ref.reason : (details?.type ?? '')
  const now = member.kind === 'group' ? member.group.now : undefined

  const { t } = useTranslation()

  // -1/<=0 为不显示，-2 为 loading
  const { delayValue, isPreset, timeout, onDelay } = useProxyDelayState(
    member,
    group.name,
  )

  return (
    <ListItemButton
      aria-busy={switching}
      aria-pressed={selected}
      dense
      disabled={unresolved}
      selected={!unresolved && selected}
      onClick={unresolved ? undefined : () => onClick?.(member)}
      sx={[
        {
          height: 56,
          borderRadius: 1.5,
          pl: 1.5,
          pr: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        () => {
          const bgcolor = 'var(--md-surface)'
          const showDelay = delayValue > 0

          return {
            '&:hover .the-check': { display: !showDelay ? 'block' : 'none' },
            '&:hover .the-delay': { display: showDelay ? 'block' : 'none' },
            '&:hover .the-icon': { display: 'none' },
            '&.Mui-selected': {
              bgcolor: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
            },
            backgroundColor: bgcolor,
          }
        },
      ]}
    >
      {switching ? (
        <CircularProgress
          size={14}
          aria-label={text('切换中', 'Switching')}
          sx={{ mr: 1 }}
        />
      ) : selected ? (
        <CheckCircleOutlineRounded
          sx={{ fontSize: 16, mr: 1, flexShrink: 0 }}
        />
      ) : null}
      {!unresolved && group.fixed === name && (
        <PushPinOutlined
          titleAccess={t('proxies.page.labels.delayCheckReset')}
          sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }}
        />
      )}
      <Box title={`${name}\n${now ?? ''}`} sx={{ overflow: 'hidden' }}>
        <Typography
          variant="body2"
          component="div"
          color="text.primary"
          sx={{
            display: 'block',
            textOverflow: 'ellipsis',
            wordBreak: 'break-all',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Typography>

        {showType && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              flex: 'none',
              marginTop: '4px',
            }}
          >
            {now && (
              <Typography
                variant="body2"
                component="div"
                color="text.secondary"
                sx={{
                  display: 'block',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  marginRight: '8px',
                }}
              >
                {now}
              </Typography>
            )}
            <TypeBox color="text.secondary" component="span">
              {type}
            </TypeBox>
            {!unresolved && details?.udp && (
              <TypeBox color="text.secondary" component="span">
                UDP
              </TypeBox>
            )}
            {!unresolved && details?.xudp && (
              <TypeBox color="text.secondary" component="span">
                XUDP
              </TypeBox>
            )}
            {!unresolved && details?.tfo && (
              <TypeBox color="text.secondary" component="span">
                TFO
              </TypeBox>
            )}
            {!unresolved && details?.mptcp && (
              <TypeBox color="text.secondary" component="span">
                MPTCP
              </TypeBox>
            )}
            {!unresolved && details?.smux && (
              <TypeBox color="text.secondary" component="span">
                SMUX
              </TypeBox>
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{ ml: 0.5, color: 'primary.main', display: isPreset ? 'none' : '' }}
      >
        {!unresolved && delayValue === -2 && (
          <Widget>
            <BaseLoading />
          </Widget>
        )}
        {!unresolved && delayValue !== -2 && (
          <Widget
            className="the-check"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void onDelay()
            }}
            sx={({ palette }) => ({
              display: 'none', // hover 时显示
              ':hover': { bgcolor: alpha(palette.primary.main, 0.15) },
            })}
          >
            {t('shared.actions.check')}
          </Widget>
        )}

        {!unresolved && delayValue >= 0 && (
          // 显示延迟
          <Widget
            className="the-delay"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void onDelay()
            }}
            sx={({ palette }) => ({
              color: proxyStatusColor(delayValue, timeout),
              ':hover': { bgcolor: alpha(palette.primary.main, 0.15) },
            })}
          >
            {delayManager.formatDelay(delayValue, timeout)}
          </Widget>
        )}
      </Box>
    </ListItemButton>
  )
}

const Widget = styled(Box)(({ theme: { typography } }) => ({
  padding: '2px 4px',
  fontSize: 14,
  fontFamily: typography.fontFamily,
  borderRadius: '4px',
}))

const TypeBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'component',
})<{ component?: React.ElementType }>(({ theme: { typography } }) => ({
  display: 'inline-block',
  border: '1px solid var(--md-outline)',
  borderColor: 'var(--md-outline)',
  color: 'var(--md-text-secondary)',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: typography.fontFamily,
  marginRight: '4px',
  marginTop: 'auto',
  padding: '0 4px',
  lineHeight: 1.5,
}))
