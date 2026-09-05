import type { Components, Theme } from '@mui/material'

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
  MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
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
    defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'right' } },
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
