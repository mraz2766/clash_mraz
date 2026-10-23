import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { useMatch, useNavigate, useResolvedPath } from 'react-router'

import type { SortableItemRenderProps } from '@/components/base/sortable-item'
import { useVerge } from '@/hooks/use-verge'
import { springs } from '@/lib/motion'

interface Props {
  to: string
  children: string
  icon: ReactNode[]
  sortable?: SortableItemRenderProps
}
export const LayoutItem = (props: Props) => {
  const { to, children, icon, sortable } = props
  const { verge } = useVerge()
  const { menu_icon } = verge ?? {}
  const navCollapsed = verge?.collapse_navbar ?? false
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: true })
  const navigate = useNavigate()

  const effectiveMenuIcon =
    navCollapsed && menu_icon === 'disable' ? 'monochrome' : menu_icon

  return (
    <ListItem
      ref={sortable?.ref}
      style={sortable?.style}
      sx={{ py: 0.5, maxWidth: 250, mx: 'auto', padding: '4px 0px' }}
    >
      <ListItemButton
        className="md-nav-item"
        data-destination={to}
        ref={sortable?.handleRef}
        selected={!!match}
        aria-current={match ? 'page' : undefined}
        sx={[
          {
            borderRadius: 'var(--radius-xl)',
            minHeight: 42,
            marginLeft: 1.25,
            paddingLeft: 1,
            paddingRight: 1,
            marginRight: 1.25,
            cursor: 'pointer',
            '& .MuiListItemText-primary': {
              color: 'text.primary',
              fontWeight: 500,
            },
          },
          {
            '&.Mui-selected, &.Mui-selected:hover': {
              bgcolor: 'transparent',
            },
            '&.Mui-selected .MuiListItemText-primary, &.Mui-selected .MuiListItemIcon-root':
              { color: 'var(--md-on-primary-container)' },
            '& .MuiSvgIcon-root': { fontSize: 20 },
          },
        ]}
        title={navCollapsed ? children : undefined}
        aria-label={navCollapsed ? children : undefined}
        onClick={() => navigate(to)}
      >
        {/* One shared pill that glides to the active page. */}
        {match && (
          <m.span
            layoutId="nav-indicator"
            className="md-nav-indicator"
            transition={springs.snappy}
            aria-hidden="true"
          />
        )}
        {(effectiveMenuIcon === 'monochrome' || !effectiveMenuIcon) && (
          <ListItemIcon
            sx={{
              color: 'text.secondary',
              minWidth: 36,
              marginLeft: '6px',
              cursor: 'inherit',
            }}
          >
            {icon[0]}
          </ListItemIcon>
        )}
        {effectiveMenuIcon === 'colorful' && (
          <ListItemIcon sx={{ cursor: 'inherit' }}>{icon[1]}</ListItemIcon>
        )}
        <ListItemText
          sx={{
            textAlign: 'start',
          }}
          primary={children}
        />
      </ListItemButton>
    </ListItem>
  )
}
