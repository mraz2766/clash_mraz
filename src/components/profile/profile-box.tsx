import { Box, styled } from '@mui/material'

export const ProfileBox = styled(Box)(({ 'aria-selected': selected }) => ({
  position: 'relative',
  display: 'block',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '16px',
  boxSizing: 'border-box',
  width: '100%',
  backgroundColor: 'var(--md-surface)',
  border: '1px solid',
  borderColor: selected ? 'var(--md-primary)' : 'var(--md-outline)',
  // Doubles the accent border without shifting layout.
  boxShadow: selected ? 'inset 0 0 0 1px var(--md-primary)' : 'none',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--md-text-secondary)',
  transition: 'border-color var(--md-motion), box-shadow var(--md-motion)',
  '&:hover': {
    borderColor: selected ? 'var(--md-primary)' : 'var(--md-text-muted)',
  },
  '& h2': {
    color: 'var(--md-text-primary)',
    fontWeight: 600,
  },
}))
