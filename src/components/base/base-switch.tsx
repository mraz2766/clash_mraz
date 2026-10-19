import { styled } from '@mui/material/styles'
import { default as MuiSwitch, SwitchProps } from '@mui/material/Switch'

// Windows 11 toggle: outlined track with a small dark thumb when off, accent
// track with a light thumb when on; the thumb grows slightly on hover.
export const Switch = styled((props: SwitchProps) => (
  <MuiSwitch
    focusVisibleClassName="Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 40,
  height: 20,
  padding: 0,
  marginRight: 1,
  overflow: 'visible',
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 4,
    color: 'var(--md-text-secondary)',
    transitionDuration: '180ms',
    '&:hover': { backgroundColor: 'transparent' },
    '&:hover .MuiSwitch-thumb': { transform: 'scale(1.17)' },
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: 'var(--md-on-primary)',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        opacity: 1,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.4,
      },
    },
    '&.Mui-focusVisible + .MuiSwitch-track': {
      outline: '2px solid var(--md-text-primary)',
      outlineOffset: 2,
    },
    '&.Mui-disabled': {
      color: 'var(--md-text-muted)',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.4,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    boxShadow: 'none',
    width: 12,
    height: 12,
    transition: 'transform var(--md-motion)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 10,
    border: '1px solid var(--md-text-secondary)',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border-color'], {
      duration: 180,
    }),
  },
}))
