import { styled, Box, Typography } from '@mui/material'
import { Rule } from 'tauri-plugin-mihomo-api'

const Item = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '8px 24px',
  alignItems: 'center',
  '&:hover': { backgroundColor: 'var(--md-hover)' },
  color: theme.palette.text.primary,
}))

interface Props {
  value: Rule & { lineNo: number }
}

const parseColor = (text: string) => {
  if (text === 'REJECT' || text === 'REJECT-DROP') return 'error.main'
  if (text === 'DIRECT') return 'text.primary'

  return 'text.secondary'
}

const RuleItem = (props: Props) => {
  const { value } = props

  return (
    <Item sx={{ borderBottom: '1px solid var(--divider-color)' }}>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ lineHeight: 2, minWidth: 30, mr: 2.25, textAlign: 'center' }}
      >
        {value.lineNo}
      </Typography>

      <Box
        sx={{
          userSelect: 'text',
          minWidth: 0,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          component="span"
          variant="body2"
          color="text.primary"
          title={value.payload || '-'}
          sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {value.payload || '-'}
        </Typography>

        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          sx={{
            width: 132,
            flexShrink: 0,
            fontSize: 12,
            px: 1,
            py: 0.25,
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--md-surface-container)',
          }}
        >
          {typeof value.type === 'string' ? value.type : value.type.Unknown}
        </Typography>

        <Typography
          component="span"
          variant="body2"
          color={parseColor(value.proxy)}
          sx={{ width: 120, flexShrink: 0, overflowWrap: 'anywhere' }}
        >
          {value.proxy}
        </Typography>
      </Box>
    </Item>
  )
}

export default RuleItem
