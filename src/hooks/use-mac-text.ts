import { useTranslation } from 'react-i18next'

export const useMacText = () => {
  const { i18n } = useTranslation()
  const chinese = (i18n.resolvedLanguage ?? i18n.language).startsWith('zh')
  return (zh: string, en: string) => (chinese ? zh : en)
}
