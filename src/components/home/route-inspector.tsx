import { SearchRounded } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import { useConnectionData } from '@/hooks/use-connection-data'
import { useDesktopText } from '@/hooks/use-desktop-text'

import { normalizeHost, matchesHost } from './route-inspector-model'

export const RouteInspector = () => {
  const text = useDesktopText()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [host, setHost] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  const {
    response: { data },
  } = useConnectionData({ enabled: open })
  const records = host
    ? [...data.activeConnections, ...data.closedConnections]
        .filter((item) => matchesHost(item.metadata.host ?? '', host))
        .slice(0, 8)
    : []
  return (
    <>
      <Button
        size="small"
        startIcon={<SearchRounded />}
        onClick={() => setOpen(true)}
        sx={{ mt: 1.5 }}
      >
        {text('检查网站出口', 'Inspect website route')}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {text('网站实际出口', 'Actual website routes')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {text(
              '查看经过 Clash 的活动与近期连接。请先在浏览器中访问目标网站；这里不会主动发送请求或修改规则。',
              'Inspect active and recent connections through Clash. Visit the website first; this tool does not send requests or change rules.',
            )}
          </Typography>
          <Box
            component="form"
            sx={{ display: 'flex', gap: 1 }}
            onSubmit={(event) => {
              event.preventDefault()
              const next = normalizeHost(input)
              setInvalid(!next)
              setHost(next)
            }}
          >
            <TextField
              autoFocus
              size="small"
              fullWidth
              label={text('网站域名', 'Website domain')}
              placeholder="github.com"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              error={invalid}
              helperText={
                invalid
                  ? text(
                      '请输入有效域名或 HTTPS 地址',
                      'Enter a valid domain or HTTPS URL',
                    )
                  : undefined
              }
            />
            <Button type="submit" variant="contained">
              {text('查看', 'Inspect')}
            </Button>
          </Box>
          <Box aria-live="polite" sx={{ mt: 2 }}>
            {host && !records.length && (
              <Typography color="text.secondary" variant="body2">
                {text(
                  '尚未捕获该网站的连接。请访问网站后保持此窗口打开；没有记录不代表直连。',
                  'No connections captured yet. Visit the website and keep this window open. No record does not mean direct routing.',
                )}
              </Typography>
            )}
            {records.map((item) => (
              <Box
                key={item.id}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid var(--md-outline-soft)',
                  overflowWrap: 'anywhere',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.metadata.host}
                </Typography>
                <Typography variant="body2">
                  {[...item.chains].reverse().join(' → ')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {text('匹配规则', 'Matched rule')}: {item.rule}{' '}
                  {item.rulePayload}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {text('关闭', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
