import { Box, styled } from '@mui/material'

export const ProfileBox = styled(Box)(({ 'aria-selected': selected }) => ({
  position: 'relative',
  display: 'block',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '16px',
  boxSizing: 'border-box',
  width: '100%',
  backgroundColor: selected
    ? 'var(--md-primary-container)'
    : 'var(--md-surface)',
  border: '1px solid var(--md-outline)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--md-text-secondary)',
  transition: 'background-color var(--md-motion)',
  '&:hover': { borderColor: 'var(--md-primary)' },
  '& h2': {
    color: selected
      ? 'var(--md-on-primary-container)'
      : 'var(--md-text-primary)',
    fontWeight: 500,
  },
}))
