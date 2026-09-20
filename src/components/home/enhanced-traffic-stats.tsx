import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  CloudDownloadRounded,
  CloudUploadRounded,
  LinkRounded,
  MemoryRounded,
} from '@mui/icons-material'
import { Box, PaletteColor, Paper, Typography, useTheme } from '@mui/material'
import { ReactNode, memo, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { TrafficErrorBoundary } from '@/components/shared/traffic-error-boundary'
import { useConnectionSummaryData } from '@/hooks/use-connection-data'
import { useMemoryData } from '@/hooks/use-memory-data'
import { useTrafficData } from '@/hooks/use-traffic-data'
import { useVerge } from '@/hooks/use-verge'
import { useVisibility } from '@/hooks/use-visibility'
import parseTraffic from '@/utils/parse-traffic'

import {
  EnhancedCanvasTrafficGraph,
  type EnhancedCanvasTrafficGraphRef,
} from './enhanced-canvas-traffic-graph'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: string | number
  unit: string
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  onClick?: () => void
}

// 全局变量类型定义
declare global {
  interface Window {
    animationFrameId?: number
    lastTrafficData?: {
      up: number
      down: number
    }
  }
}

// 统计卡片组件 - 使用memo优化
const CompactStatCard = memo(
  ({ icon, title, value, unit, color, onClick }: StatCardProps) => {
    const theme = useTheme()

    // 获取调色板颜色 - 使用useMemo避免重复计算
    const colorValue = useMemo(() => {
      const palette = theme.palette
      if (
        color in palette &&
        palette[color as keyof typeof palette] &&
        'main' in (palette[color as keyof typeof palette] as PaletteColor)
      ) {
        return (palette[color as keyof typeof palette] as PaletteColor).main
      }
      return palette.primary.main
    }, [theme.palette, color])

    return (
      <Box
        className="traffic-metric"
        onClick={onClick}
        sx={{ cursor: onClick ? 'pointer' : undefined }}
      >
        <Typography
          component="div"
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Box
            component="span"
            sx={{
              color: colorValue,
              display: 'flex',
              '& svg': { fontSize: 13 },
            }}
          >
            {icon}
          </Box>
          {title}
        </Typography>
        <Typography
          component="div"
          className="metric-value"
          sx={{
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
            letterSpacing: '-.5px',
            fontWeight: 600,
          }}
        >
          {value ?? '—'}{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            {unit}
          </Typography>
        </Typography>
      </Box>
    )
  },
)

// 添加显示名称
CompactStatCard.displayName = 'CompactStatCard'

export const EnhancedTrafficStats = ({
  view = 'full',
}: {
  view?: 'full' | 'summary' | 'detail'
}) => {
  const { t } = useTranslation()
  const { verge } = useVerge()
  const trafficRef = useRef<EnhancedCanvasTrafficGraphRef>(null)
  const pageVisible = useVisibility()

  // 是否显示流量图表
  const trafficGraph = verge?.traffic_graph ?? true
  const displayMemory = verge?.enable_memory_usage ?? true

  const {
    response: { data: traffic },
  } = useTrafficData({ enabled: pageVisible })

  const {
    response: { data: memory },
  } = useMemoryData({ enabled: displayMemory && pageVisible })

  const {
    response: { data: connectionSummary },
  } = useConnectionSummaryData({ enabled: pageVisible })

  // Canvas组件现在直接从全局Hook获取数据，无需手动添加数据点

  // 使用useMemo计算解析后的流量数据
  const parsedData = useMemo(() => {
    const [up, upUnit] = parseTraffic(traffic?.up || 0)
    const [down, downUnit] = parseTraffic(traffic?.down || 0)
    const [inuse, inuseUnit] = parseTraffic(memory?.inuse || 0)
    const [uploadTotal, uploadTotalUnit] = parseTraffic(traffic?.upTotal || 0)
    const [downloadTotal, downloadTotalUnit] = parseTraffic(
      traffic?.downTotal || 0,
    )

    return {
      up,
      upUnit,
      down,
      downUnit,
      inuse,
      inuseUnit,
      uploadTotal,
      uploadTotalUnit,
      downloadTotal,
      downloadTotalUnit,
      connectionsCount: connectionSummary?.activeConnectionCount,
    }
  }, [traffic, memory, connectionSummary])

  // 渲染流量图表 - 使用useMemo缓存渲染结果
  const trafficGraphComponent = useMemo(() => {
    if (!trafficGraph || !pageVisible || view === 'summary') return null

    return (
      <Paper
        elevation={0}
        sx={{
          height: 158,
          cursor: 'pointer',
          border: 'none',
          backgroundColor: 'transparent',
          borderRadius: 2,
          overflow: 'hidden',
        }}
        onClick={() => trafficRef.current?.toggleStyle()}
      >
        <div style={{ height: '100%', position: 'relative' }}>
          <EnhancedCanvasTrafficGraph ref={trafficRef} />
        </div>
      </Paper>
    )
  }, [trafficGraph, pageVisible, view])

  // 使用useMemo计算统计卡片配置
  const statCards = useMemo(() => {
    const cards: StatCardProps[] = [
      {
        icon: <ArrowUpwardRounded fontSize="small" />,
        title: t('home.components.traffic.metrics.uploadSpeed'),
        value: parsedData.up,
        unit: `${parsedData.upUnit}/s`,
        color: 'secondary' as const,
      },
      {
        icon: <ArrowDownwardRounded fontSize="small" />,
        title: t('home.components.traffic.metrics.downloadSpeed'),
        value: parsedData.down,
        unit: `${parsedData.downUnit}/s`,
        color: 'primary' as const,
      },
      {
        icon: <LinkRounded fontSize="small" />,
        title: t('home.components.traffic.metrics.activeConnections'),
        value: parsedData.connectionsCount,
        unit: '',
        color: 'success' as const,
      },
      {
        icon: <CloudUploadRounded fontSize="small" />,
        title: t('shared.labels.uploaded'),
        value: parsedData.uploadTotal,
        unit: parsedData.uploadTotalUnit,
        color: 'secondary' as const,
      },
      {
        icon: <CloudDownloadRounded fontSize="small" />,
        title: t('shared.labels.downloaded'),
        value: parsedData.downloadTotal,
        unit: parsedData.downloadTotalUnit,
        color: 'primary' as const,
      },
    ]

    if (displayMemory) {
      cards.push({
        icon: <MemoryRounded fontSize="small" />,
        title: t('home.components.traffic.metrics.memoryUsage'),
        value: parsedData.inuse,
        unit: parsedData.inuseUnit,
        color: 'secondary' as const,
      })
    }

    return cards
  }, [t, parsedData, displayMemory])

  return (
    <TrafficErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[EnhancedTrafficStats] 组件错误:', error, errorInfo)
      }}
    >
      {view !== 'detail' && (
        <Box className="traffic-headline">
          {statCards.slice(0, 3).map((card) => (
            <CompactStatCard key={card.title} {...card} />
          ))}
        </Box>
      )}
      {view !== 'summary' && trafficGraph && trafficGraphComponent}
      {(view !== 'summary' || !trafficGraph) && (
        <Box className="traffic-footnote">
          {statCards.slice(3).map((card) => (
            <CompactStatCard key={card.title} {...card} />
          ))}
        </Box>
      )}
    </TrafficErrorBoundary>
  )
}
