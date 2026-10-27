import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  MemoryRounded,
} from '@mui/icons-material'
import type { BoxProps, SvgIconProps, TypographyProps } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { AnimatedNumber } from '@/components/base/animated-number'
import { LightweightTrafficErrorBoundary } from '@/components/shared/traffic-error-boundary'
import { useMemoryData } from '@/hooks/use-memory-data'
import { useTrafficColors } from '@/hooks/use-traffic-colors'
import { useTrafficData } from '@/hooks/use-traffic-data'
import { useVerge } from '@/hooks/use-verge'
import { useVisibility } from '@/hooks/use-visibility'
import parseTraffic from '@/utils/parse-traffic'

import { TrafficGraph, type TrafficRef } from './traffic-graph'

export const LayoutTraffic = () => {
  const { t } = useTranslation()
  const { verge } = useVerge()

  const location = useLocation()
  // Home already shows live speed and memory in its traffic section.
  const hiddenOnHome =
    location.pathname === '/' && (verge?.home_cards?.traffic ?? true)
  const trafficGraph =
    (verge?.traffic_graph ?? true) && location.pathname !== '/'
  const displayMemory = verge?.enable_memory_usage ?? true

  const trafficRef = useRef<TrafficRef>(null)
  const trafficColors = useTrafficColors()
  const pageVisible = useVisibility()
  const active = pageVisible && !hiddenOnHome

  const {
    response: { data: traffic },
  } = useTrafficData({ enabled: active })
  const {
    response: { data: memory },
  } = useMemoryData({ enabled: displayMemory && active })

  useEffect(() => {
    if (trafficRef.current) {
      trafficRef.current.appendData({
        up: traffic?.up || 0,
        down: traffic?.down || 0,
        upTotal: traffic?.upTotal || 0,
        downTotal: traffic?.downTotal || 0,
      })
    }
  }, [traffic])

  const [up, upUnit] = parseTraffic(traffic?.up || 0)
  const [down, downUnit] = parseTraffic(traffic?.down || 0)
  const [inuse, inuseUnit] = parseTraffic(memory?.inuse || 0)

  const boxStyle: Pick<BoxProps, 'sx'> = {
    sx: {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    },
  }
  const iconStyle: Pick<SvgIconProps, 'sx'> = {
    sx: { mr: '8px', fontSize: 16 },
  }
  const valStyle: Pick<TypographyProps, 'component' | 'sx'> = {
    component: 'span',
    sx: { flex: '1 1 56px', userSelect: 'none', textAlign: 'center' },
  }
  const unitStyle: Pick<TypographyProps, 'component' | 'color' | 'sx'> = {
    component: 'span',
    color: 'text.secondary',
    sx: {
      flex: '0 1 27px',
      userSelect: 'none',
      fontSize: '12px',
      textAlign: 'right',
    },
  }

  if (hiddenOnHome) return null

  return (
    <LightweightTrafficErrorBoundary>
      <Box sx={{ position: 'relative' }}>
        {trafficGraph && pageVisible && (
          <div
            style={{ width: '100%', height: 60, marginBottom: 6 }}
            onClick={trafficRef.current?.toggleStyle}
          >
            <TrafficGraph ref={trafficRef} />
          </div>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box
            title={`${t('home.components.traffic.metrics.uploadSpeed')}`}
            {...boxStyle}
            sx={{
              ...boxStyle.sx,
            }}
          >
            <ArrowUpwardRounded
              sx={{
                ...iconStyle.sx,
                color:
                  (traffic?.up || 0) > 0 ? trafficColors.up : 'text.disabled',
              }}
            />
            <Typography
              {...valStyle}
              sx={{ ...valStyle.sx, fontVariantNumeric: 'tabular-nums' }}
            >
              {up}
            </Typography>
            <Typography {...unitStyle}>{upUnit}/s</Typography>
          </Box>

          <Box
            title={`${t('home.components.traffic.metrics.downloadSpeed')}`}
            {...boxStyle}
            sx={{
              ...boxStyle.sx,
            }}
          >
            <ArrowDownwardRounded
              sx={{
                ...iconStyle.sx,
                color:
                  (traffic?.down || 0) > 0
                    ? trafficColors.down
                    : 'text.disabled',
              }}
            />
            <Typography
              {...valStyle}
              sx={{ ...valStyle.sx, fontVariantNumeric: 'tabular-nums' }}
            >
              {down}
            </Typography>
            <Typography {...unitStyle}>{downUnit}/s</Typography>
          </Box>

          {displayMemory && (
            <Box
              title={`${t('home.components.traffic.metrics.memoryUsage')} `}
              {...boxStyle}
              sx={{
                ...boxStyle.sx,
                cursor: 'auto',
              }}
              color={'disabled'}
              onClick={async () => {}}
            >
              <MemoryRounded
                sx={{ ...iconStyle.sx, color: 'text.secondary' }}
              />
              <Typography
                {...valStyle}
                sx={{ ...valStyle.sx, fontVariantNumeric: 'tabular-nums' }}
              >
                <AnimatedNumber value={inuse} resetKey={inuseUnit} />
              </Typography>
              <Typography {...unitStyle}>{inuseUnit}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </LightweightTrafficErrorBoundary>
  )
}
