import { useTranslation } from 'react-i18next'

import { SegmentedControl } from '@/components/base/segmented-control'

const MODES = ['rule', 'global', 'direct'] as const

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
    <SegmentedControl
      value={MODES.find((mode) => mode === value)}
      disabled={disabled}
      ariaLabel={t('home.page.settings.cards.proxyMode')}
      options={MODES.map((mode) => ({
        value: mode,
        label: t(`proxies.page.modes.${mode}`),
      }))}
      onChange={onChange}
    />
  )
}
