import { createContext } from 'react'

export type SettingsCategory =
  | 'general'
  | 'appearance'
  | 'network'
  | 'backup'
  | 'advanced'
export const SettingsFilterContext = createContext<{
  category: SettingsCategory
  query: string
} | null>(null)
export const matchesSetting = (
  label: string,
  itemCategory: SettingsCategory,
  category: SettingsCategory,
  query: string,
) => {
  const normalized = query.trim().toLocaleLowerCase()
  return normalized
    ? label.toLocaleLowerCase().includes(normalized)
    : itemCategory === category
}
