import { InboxOutlined } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { TranslationKey } from '@/types/generated/i18n-keys'

interface Props {
  text?: ReactNode
  textKey?: TranslationKey
  extra?: ReactNode
}

// Quiet, centred empty state: a small outlined glyph and one line of secondary text.
export const BaseEmpty = ({
  text,
  textKey = 'shared.statuses.empty',
  extra,
}: Props) => {
  const { t } = useTranslation()

  const resolvedText: ReactNode = text !== undefined ? text : t(textKey)

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary',
      }}
    >
      <InboxOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
      <Typography sx={{ fontSize: 13 }}>{resolvedText}</Typography>
      {extra}
    </Box>
  )
}
