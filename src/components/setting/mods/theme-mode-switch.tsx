import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

type ThemeValue = IVergeConfig['theme_mode']

interface Props {
  value?: ThemeValue
  onChange?: (value: ThemeValue) => void
}

// Same segmented control as the proxy mode selector on the home page.
export const ThemeModeSwitch = (props: Props) => {
  const { value, onChange } = props
  const { t } = useTranslation()

  const modes = ['light', 'dark', 'system'] as const

  return (
    <ToggleButtonGroup
      className="workspace-segmented"
      exclusive
      size="small"
      value={value ?? null}
      sx={{ my: '4px' }}
      onChange={(_, next: ThemeValue | null) => {
        if (next) onChange?.(next)
      }}
    >
      {modes.map((mode) => (
        <ToggleButton value={mode} key={mode}>
          {t(`settings.sections.appearance.${mode}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
