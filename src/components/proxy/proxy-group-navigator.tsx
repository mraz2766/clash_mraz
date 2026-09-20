import { ListRounded } from '@mui/icons-material'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'

import { useDesktopText } from '@/hooks/use-desktop-text'

interface ProxyGroupNavigatorProps {
  proxyGroupNames: string[]
  onGroupLocation: (groupName: string) => void
  enableHoverJump?: boolean
  hoverDelay?: number
}
export const DEFAULT_HOVER_DELAY = 280
export const ProxyGroupNavigator = ({
  proxyGroupNames,
  onGroupLocation,
}: ProxyGroupNavigatorProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const text = useDesktopText()
  if (!proxyGroupNames.length) return null
  return (
    <Box sx={{ position: 'absolute', right: 16, bottom: 16, zIndex: 10 }}>
      <Button
        variant="outlined"
        startIcon={<ListRounded />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ bgcolor: 'var(--md-surface)', boxShadow: '0 3px 14px #00000010' }}
      >
        {text('跳转代理组', 'Jump to group')}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { maxHeight: 360 } } }}
      >
        {[...new Set(proxyGroupNames)].map((name) => (
          <MenuItem
            key={name}
            onClick={() => {
              setAnchor(null)
              onGroupLocation(name)
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
