import type { Components, Theme } from '@mui/material'

import { DesktopTransition } from '@/components/base/desktop-transition'
import { desktopMotion } from '@/lib/motion'

// Desktop component geometry; semantic colours come from the theme tokens.
export const materialComponents: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius-control)',
        minHeight: 32,
        paddingInline: 16,
        textTransform: 'none',
        fontWeight: 500,
        transition:
          'background-color var(--md-motion-fast), color var(--md-motion-fast), border-color var(--md-motion-fast), transform var(--md-motion-fast)',
        '&:active:not(.Mui-disabled)': { transform: 'scale(0.98)' },
      },
      outlined: ({ ownerState }) =>
        ownerState.color === 'primary'
          ? {
              backgroundColor: 'var(--md-primary-container)',
              color: 'var(--md-on-primary-container)',
              borderColor: 'transparent',
            }
          : {},
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius-control)',
        transition:
          'background-color var(--md-motion-fast), transform var(--md-motion-fast)',
        '&:active:not(.Mui-disabled)': { transform: 'scale(0.97)' },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      outlined: {
        borderColor: 'var(--md-outline-soft)',
        borderRadius: 'var(--radius-card)',
      },
    },
  },
  MuiCard: {
    defaultProps: { variant: 'outlined' },
    styleOverrides: { root: { borderRadius: 'var(--radius-card)' } },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--radius-control)',
        backgroundColor: 'var(--md-surface)',
      },
      notchedOutline: { borderColor: 'var(--md-outline)' },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        height: 24,
        borderRadius: 'var(--radius-control)',
        fontSize: 12,
        fontWeight: 500,
      },
      colorDefault: {
        backgroundColor: 'var(--md-surface-container)',
        color: 'var(--md-text-secondary)',
      },
    },
  },
  MuiDialog: {
    defaultProps: { slots: { transition: DesktopTransition } },
    styleOverrides: {
      paper: {
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--md-surface)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: { fontSize: 20, fontWeight: 600, padding: '24px 24px 16px' },
    },
  },
  MuiDialogActions: {
    styleOverrides: { root: { padding: '16px 24px', gap: 8 } },
  },
  MuiMenu: {
    defaultProps: {
      slots: { transition: DesktopTransition },
      transitionDuration: desktopMotion.fast,
    },
    styleOverrides: {
      paper: {
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--md-outline)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      },
    },
  },
  MuiMenuItem: { styleOverrides: { root: { fontSize: 14, minHeight: 36 } } },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      slots: { transition: DesktopTransition },
    },
  },
  MuiSnackbarContent: {
    styleOverrides: {
      root: { borderRadius: 'var(--radius-card)', fontSize: 14 },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: { fontSize: 13, borderColor: 'var(--md-outline)' },
      head: { backgroundColor: 'var(--md-surface-container)', fontWeight: 500 },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        transition: 'left var(--md-motion), width var(--md-motion)',
      },
    },
  },
  MuiTab: {
    styleOverrides: { root: { transition: 'color var(--md-motion)' } },
  },
  MuiCollapse: { defaultProps: { timeout: desktopMotion.standard } },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        transition: 'background-color 180ms cubic-bezier(0.2,0,0,1)',
        '&:hover': { backgroundColor: 'var(--md-hover)' },
        '&:active': { backgroundColor: 'var(--md-pressed)' },
        '&.Mui-selected, &.Mui-selected:hover': {
          backgroundColor: 'var(--md-primary-container)',
        },
        // Windows 11 selection pill; the nav draws its own on the moving indicator.
        '&.Mui-selected:not(.md-nav-item)::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          width: 3,
          height: 16,
          marginTop: -8,
          borderRadius: 2,
          backgroundColor: 'var(--md-primary)',
        },
      },
    },
  },
}
