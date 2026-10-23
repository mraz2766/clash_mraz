import { useTranslation } from 'react-i18next'

import { SegmentedControl } from '@/components/base/segmented-control'

type ThemeValue = IVergeConfig['theme_mode']

interface Props {
  value?: ThemeValue
  onChange?: (value: ThemeValue) => void
}

const MODES = ['light', 'dark', 'system'] as const

// Same segmented control as the proxy mode selector on the home page.
export const ThemeModeSwitch = (props: Props) => {
  const { value, onChange } = props
  const { t } = useTranslation()

  return (
    <SegmentedControl
      value={MODES.find((mode) => mode === value)}
      sx={{ my: '4px' }}
      options={MODES.map((mode) => ({
        value: mode,
        label: t(`settings.sections.appearance.${mode}`),
      }))}
      onChange={(next) => onChange?.(next)}
    />
  )
}
