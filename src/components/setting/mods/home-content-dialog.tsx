import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  DEFAULT_HOME_CARDS,
  type HomeCardsSettings,
} from '@/components/home/home-card-settings'
import { useDesktopText } from '@/hooks/use-desktop-text'
import { useVerge } from '@/hooks/use-verge'
import { showNotice } from '@/services/notice-service'

const fields = [
  ['network', 'network'],
  ['mode', 'proxyMode'],
  ['traffic', 'traffic'],
  ['proxy', 'currentProxy'],
  ['profile', 'profile'],
  ['test', 'tests'],
  ['ip', 'ip'],
  ['clashinfo', 'clashInfo'],
  ['systeminfo', 'systemInfo'],
] as const

export const HomeContentDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  const text = useDesktopText()
  const { verge, patchVerge } = useVerge()
  // Preserve the existing config keys and any unknown future flags.
  const [cards, setCards] = useState<HomeCardsSettings>(
    () =>
      (verge?.home_cards as HomeCardsSettings | undefined) ??
      DEFAULT_HOME_CARDS,
  )
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try {
      await patchVerge({ home_cards: cards })
      onClose()
    } catch (error) {
      showNotice.error(error)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="home-content-title"
      slotProps={{ paper: { sx: { borderRadius: '14px', maxWidth: 400 } } }}
    >
      <DialogTitle
        id="home-content-title"
        sx={{ fontSize: 16, px: 2.5, pt: 2.5, pb: 1 }}
      >
        {text('首页显示内容', 'Home content')}
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, pb: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 12, mb: 1.5 }}
        >
          {text(
            '勾选要显示的模块，保存后生效。',
            'Choose modules to show, then save.',
          )}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 0.25,
          }}
        >
          {fields.map(([key, label]) => (
            <FormControlLabel
              key={key}
              sx={{
                m: 0,
                minHeight: 36,
                '& .MuiFormControlLabel-label': { fontSize: 13 },
              }}
              control={
                <Checkbox
                  size="small"
                  disabled={saving}
                  checked={cards[key] ?? false}
                  onChange={(_, checked) =>
                    setCards((previous) => ({ ...previous, [key]: checked }))
                  }
                />
              }
              label={t(`home.page.settings.cards.${label}`)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, pt: 1 }}>
        <Button disabled={saving} onClick={onClose}>
          {t('shared.actions.cancel')}
        </Button>
        <Button loading={saving} variant="contained" onClick={save}>
          {t('shared.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
