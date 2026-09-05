import type { Components, Theme } from '@mui/material'

import { DesktopTransition } from '@/components/base/desktop-transition'
import { desktopMotion } from '@/lib/motion'

// Desktop component geometry; semantic colours come from the theme tokens.
export const materialComponents: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 20,
        minHeight: 36,
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
        borderRadius: 8,
        transition:
          'background-color var(--md-motion-fast), transform var(--md-motion-fast)',
        '&:active:not(.Mui-disabled)': { transform: 'scale(0.97)' },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      outlined: { borderColor: 'var(--md-outline)', borderRadius: 12 },
    },
  },
  MuiCard: {
    defaultProps: { variant: 'outlined' },
    styleOverrides: { root: { borderRadius: 16 } },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: 10, backgroundColor: 'var(--md-surface)' },
      notchedOutline: { borderColor: 'var(--md-outline)' },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { height: 26, borderRadius: 6, fontSize: 12, fontWeight: 500 },
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
        borderRadius: 22,
        backgroundColor: 'var(--md-surface)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: { fontSize: 20, fontWeight: 500, padding: '24px 24px 16px' },
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
        borderRadius: 12,
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
    styleOverrides: { root: { borderRadius: 10, fontSize: 14 } },
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
        '&.Mui-selected, &.Mui-selected:hover': {
          backgroundColor: 'var(--md-primary-container)',
        },
      },
    },
  },
}
