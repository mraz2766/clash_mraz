import { ChevronRightRounded } from '@mui/icons-material'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import React, { ReactNode, useState, use } from 'react'

import isAsyncFunction from '@/utils/is-async-function'

import {
  SettingsFilterContext,
  matchesSetting,
  type SettingsCategory,
} from '../settings-filter'

interface ItemProps {
  category?: SettingsCategory
  label: ReactNode
  extra?: ReactNode
  children?: ReactNode
  secondary?: ReactNode
  onClick?: () => void | Promise<any>
}

export const SettingItem: React.FC<ItemProps> = ({
  label,
  extra,
  children,
  secondary,
  onClick,
}) => {
  const clickable = !!onClick

  const primary = (
    <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
      <span>
        {typeof label === 'string' ? label.replaceAll('Verge', 'Clash') : label}
      </span>
      {extra ? extra : null}
    </Box>
  )

  const [isLoading, setIsLoading] = useState(false)
  const handleClick = () => {
    if (onClick) {
      if (isAsyncFunction(onClick)) {
        setIsLoading(true)
        onClick()!.finally(() => setIsLoading(false))
      } else {
        onClick()
      }
    }
  }

  return clickable ? (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick} disabled={isLoading}>
        <ListItemText primary={primary} secondary={secondary} />
        {isLoading ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <ChevronRightRounded />
        )}
      </ListItemButton>
    </ListItem>
  ) : (
    <ListItem sx={{ pt: '5px', pb: '5px' }}>
      <ListItemText primary={primary} secondary={secondary} />
      {children}
    </ListItem>
  )
}

export const SettingList: React.FC<{
  title: string
  children: ReactNode
  category?: SettingsCategory
}> = ({ title, children, category = 'general' }) => {
  const filter = use(SettingsFilterContext)
  // These four setting sections expose labeled direct children; preserve their keys and mounted dialogs.
  // eslint-disable-next-line @eslint-react/no-children-to-array
  const items = React.Children.toArray(children)
  const matches = (child: ReactNode) => {
    if (
      !React.isValidElement<{ label?: ReactNode; category?: SettingsCategory }>(
        child,
      ) ||
      child.props.label === undefined
    )
      return false
    return (
      !filter ||
      matchesSetting(
        String(child.props.label),
        child.props.category ?? category,
        filter.category,
        filter.query,
      )
    )
  }
  if (!items.some(matches)) return null
  return (
    <SettingsFilterContext value={null}>
      <List
        sx={{
          py: 0,
          '& > .MuiListItem-root + .MuiListItem-root': {
            borderTop: '1px solid var(--md-outline-soft)',
          },
          '& .MuiListItem-root': { minHeight: 52 },
          '& .MuiListItemButton-root': { minHeight: 52 },
        }}
      >
        <ListSubheader
          sx={[
            {
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 650,
            },
            ({ palette }) => {
              return {
                color: palette.text.primary,
              }
            },
          ]}
          disableSticky
        >
          {title.replaceAll('Verge', 'Clash')}
        </ListSubheader>

        {items.filter(
          (child) =>
            !React.isValidElement<{ label?: ReactNode }>(child) ||
            child.props.label === undefined ||
            matches(child),
        )}
      </List>
    </SettingsFilterContext>
  )
}
