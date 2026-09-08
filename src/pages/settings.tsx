import { SearchRounded } from '@mui/icons-material'
import {
  Box,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BasePage } from '@/components/base'
import SettingClash from '@/components/setting/setting-clash'
import SettingSystem from '@/components/setting/setting-system'
import SettingVergeAdvanced from '@/components/setting/setting-verge-advanced'
import SettingVergeBasic from '@/components/setting/setting-verge-basic'
import {
  SettingsFilterContext,
  type SettingsCategory,
} from '@/components/setting/settings-filter'
import { useMacText } from '@/hooks/use-mac-text'
import { showNotice } from '@/services/notice-service'

const SettingPage = () => {
  const { t } = useTranslation()
  const text = useMacText()
  const [category, setCategory] = useState<SettingsCategory>('general')
  const [query, setQuery] = useState('')
  const filter = useMemo(() => ({ category, query }), [category, query])
  const tabs = [
    ['general', text('通用', 'General')],
    ['appearance', text('外观', 'Appearance')],
    ['network', text('网络', 'Network')],
    ['backup', text('备份', 'Backup')],
    ['advanced', text('高级', 'Advanced')],
  ] as const
  const onError = (error: Error) => showNotice.error(error)
  return (
    <BasePage
      title={t('settings.page.title')}
      contentStyle={{ maxWidth: 1000 }}
    >
      <Box className="settings-toolbar">
        <TextField
          size="small"
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text('搜索所有设置…', 'Search all settings…')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: {
              'aria-label': text('搜索所有设置', 'Search all settings'),
            },
          }}
        />
        <Tabs
          value={category}
          onChange={(_, next) => {
            setCategory(next)
            setQuery('')
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={text('设置分类', 'Settings categories')}
        >
          {tabs.map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              label={label}
              id={`settings-${value}`}
              aria-controls="settings-panel"
            />
          ))}
        </Tabs>
      </Box>
      <SettingsFilterContext value={filter}>
        <Box
          className="settings-results"
          id="settings-panel"
          role="tabpanel"
          aria-labelledby={`settings-${category}`}
        >
          <SettingSystem onError={onError} />
          <SettingVergeBasic onError={onError} />
          <SettingClash onError={onError} />
          <SettingVergeAdvanced onError={onError} />
          <Typography
            className="settings-empty"
            role="status"
            color="text.secondary"
          >
            {text(
              '没有找到匹配设置，请尝试其他关键词。',
              'No matching settings. Try another keyword.',
            )}
          </Typography>
        </Box>
      </SettingsFilterContext>
    </BasePage>
  )
}
export default SettingPage
