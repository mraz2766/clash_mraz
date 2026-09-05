import { styled } from '@mui/material/styles'
import { default as MuiSwitch, SwitchProps } from '@mui/material/Switch'

export const Switch = styled((props: SwitchProps) => (
  <MuiSwitch
    focusVisibleClassName="Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 44,
  height: 28,
  padding: 0,
  marginRight: 1,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    transitionDuration: '180ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: 'var(--md-on-primary)',
      '& .MuiSwitch-thumb': { transform: 'scale(1)' },
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      outline: '2px solid var(--md-primary)',
      outlineOffset: 3,
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    transform: 'scale(0.7)',
    transition: 'transform var(--md-motion)',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 14,
    border: '2px solid var(--md-text-muted)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--md-outline)',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 180,
    }),
  },
}))
