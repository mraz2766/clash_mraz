import { Box, styled } from '@mui/material'

export const ProfileBox = styled(Box)(({ 'aria-selected': selected }) => ({
  position: 'relative',
  display: 'block',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '12px 14px',
  boxSizing: 'border-box',
  width: '100%',
  background: 'var(--surface-card-bg)',
  border: '1px solid',
  borderColor: selected
    ? 'color-mix(in srgb, var(--md-primary) 30%, var(--surface-card-border))'
    : 'var(--surface-card-border)',
  boxShadow: 'var(--surface-card-shadow)',
  borderRadius: 'var(--radius-card)',
  color: 'var(--md-text-secondary)',
  transition: 'border-color var(--md-motion), box-shadow var(--md-motion)',
  '&:hover': {
    boxShadow: 'var(--surface-card-shadow-hover)',
    borderColor: selected
      ? 'color-mix(in srgb, var(--md-primary) 45%, var(--surface-card-border))'
      : 'var(--md-outline)',
  },
  '& h2': {
    color: 'var(--md-text-primary)',
    fontWeight: 500,
  },
}))
