import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const ModeControl = ({
  value,
  onChange,
  disabled = false,
}: {
  value?: string
  onChange: (mode: 'rule' | 'global' | 'direct') => void
  disabled?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <ToggleButtonGroup
      className="workspace-segmented"
      exclusive
      size="small"
      value={value ?? null}
      disabled={disabled}
      aria-label={t('home.page.settings.cards.proxyMode')}
      onChange={(_, next) => {
        if (next) onChange(next)
      }}
    >
      {(['rule', 'global', 'direct'] as const).map((mode) => (
        <ToggleButton value={mode} key={mode}>
          {t(`proxies.page.modes.${mode}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
