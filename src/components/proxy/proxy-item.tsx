import { CheckCircleOutlineRounded } from '@mui/icons-material'
import {
  alpha,
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseLoading } from '@/components/base'
import { useProxyDelayState } from '@/hooks/use-proxy-delay-state'
import { desktopMotion } from '@/lib/motion'
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
  sx?: SxProps<Theme>
  onClick?: (member: ResolvedProxyMember) => void
}

const Widget = styled(Box)(() => ({
  padding: '3px 6px',
  fontSize: 14,
  borderRadius: '4px',
}))

const TypeBox = styled('span')(({ theme }) => ({
  display: 'inline-block',
  flexShrink: 0,
  border: '1px solid var(--md-outline)',
  borderColor: alpha(theme.palette.text.secondary, 0.36),
  color: theme.palette.text.secondary,
  borderRadius: 4,
  fontSize: 11,
  marginRight: '4px',
  padding: '0 2px',
  lineHeight: 1.5,
}))

export const ProxyItem = (props: Props) => {
  const { t } = useTranslation()
  const { group, member, selected, showType = true, sx, onClick } = props
  const details = memberDetails(member)
  const unresolved = member.kind === 'unresolved'
  const name = member.ref.name
  const type = unresolved ? member.ref.reason : (details?.type ?? '')
  const now = member.kind === 'group' ? member.group.now : undefined

  // -1/<=0 为不显示，-2 为 loading
  const { delayValue, isPreset, timeout, onDelay } = useProxyDelayState(
    member,
    group.name,
  )
  const valueRef = useRef<HTMLSpanElement>(null)
  const previousDelayRef = useRef(delayValue)
  useEffect(() => {
    const previous = previousDelayRef.current
    previousDelayRef.current = delayValue
    // Do not replay entrance effects when the virtualizer mounts cached rows.
    if (
      previous === -1 ||
      previous === delayValue ||
      delayValue <= 0 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const animation = valueRef.current?.animate?.(
      [
        { opacity: 0, transform: 'translateY(2px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: desktopMotion.standard, easing: desktopMotion.easing },
    )
    return () => animation?.cancel()
  }, [delayValue])

  return (
    <ListItem sx={sx}>
      <ListItemButton
        className="proxy-row"
        dense
        disabled={unresolved}
        selected={!unresolved && selected}
        onClick={unresolved ? undefined : () => onClick?.(member)}
        sx={[
          { borderRadius: 1 },
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
              marginBottom: '2px',
              height: '46px',
            }
          },
        ]}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            flexShrink: 0,
            mr: 1.5,
            bgcolor: proxyStatusColor(delayValue, timeout),
          }}
        />
        <ListItemText
          sx={{
            minWidth: 0,
            '& .MuiListItemText-secondary': {
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            },
          }}
          title={name}
          secondary={
            <>
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginRight: '8px',
                  fontSize: '14px',
                  color: 'text.primary',
                }}
              >
                {name}
                {showType && now && ` - ${now}`}
              </Box>
              {showType && <TypeBox>{type}</TypeBox>}
              {!unresolved && showType && details?.udp && (
                <TypeBox>UDP</TypeBox>
              )}
              {!unresolved && showType && details?.xudp && (
                <TypeBox>XUDP</TypeBox>
              )}
              {!unresolved && showType && details?.tfo && (
                <TypeBox>TFO</TypeBox>
              )}
              {!unresolved && showType && details?.mptcp && (
                <TypeBox>MPTCP</TypeBox>
              )}
              {!unresolved && showType && details?.smux && (
                <TypeBox>SMUX</TypeBox>
              )}
            </>
          }
        />

        <ListItemIcon
          sx={{
            justifyContent: 'flex-end',
            color: 'primary.main',
            display: isPreset ? 'none' : '',
          }}
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

          {!unresolved && delayValue > 0 && (
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
              <span ref={valueRef} className="md-value-change">
                {delayManager.formatDelay(delayValue, timeout)}
              </span>
            </Widget>
          )}

          {!unresolved && delayValue !== -2 && delayValue <= 0 && selected && (
            // 展示已选择的 icon
            <CheckCircleOutlineRounded
              className="the-icon"
              sx={{ fontSize: 16 }}
            />
          )}
        </ListItemIcon>
      </ListItemButton>
    </ListItem>
  )
}
