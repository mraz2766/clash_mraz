import { expect, it } from 'vitest'

import { matchesSetting } from './settings-filter'

it('limits the category until a search spans all settings', () => {
  expect(matchesSetting('DNS 覆写', 'network', 'appearance', '')).toBe(false)
  expect(matchesSetting('主题模式', 'appearance', 'appearance', '')).toBe(true)
  expect(matchesSetting('DNS 覆写', 'network', 'appearance', ' dns ')).toBe(
    true,
  )
  expect(matchesSetting('主题模式', 'appearance', 'appearance', 'dns')).toBe(
    false,
  )
})
