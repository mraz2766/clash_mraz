import { ExpandMoreRounded } from '@mui/icons-material'
import { Box, Button, Collapse } from '@mui/material'
import { type ReactNode, useId, useState } from 'react'

import { desktopMotion } from '@/lib/motion'

export const MacDisclosure = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <Box sx={{ borderTop: '1px solid var(--md-outline-soft)', mt: 2 }}>
      <Button
        fullWidth
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        sx={{
          justifyContent: 'space-between',
          py: 1.5,
          color: 'text.secondary',
        }}
        endIcon={
          <ExpandMoreRounded
            sx={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--md-motion)',
            }}
          />
        }
      >
        {title}
      </Button>
      <Collapse in={open} timeout={desktopMotion.standard}>
        <Box id={id} sx={{ pb: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}
