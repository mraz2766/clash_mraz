import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'

import { SettingItem, SettingList } from './mods/setting-comp'
import { SettingsFilterContext } from './settings-filter'

const render = (query: string) =>
  renderToStaticMarkup(
    createElement(
      SettingsFilterContext,
      { value: { category: 'appearance', query } },
      createElement(SettingList, {
        title: 'Clash',
        // createElement requires the typed children prop for this component.
        // eslint-disable-next-line @eslint-react/jsx-no-children-prop
        children: [
          createElement(SettingItem, {
            key: 'theme',
            category: 'appearance',
            label: 'Theme mode',
          }),
          createElement(SettingItem, {
            key: 'dns',
            category: 'network',
            label: 'DNS override',
          }),
          createElement(
            'div',
            { key: 'dialog', 'data-dialog': 'preserved' },
            'Dialog host',
          ),
        ],
      }),
    ),
  )
it('keeps dialogs mounted while only matching settings remain visible', () => {
  const appearance = render('')
  expect(appearance).toContain('Theme mode')
  expect(appearance).not.toContain('DNS override')
  expect(appearance).toContain('Dialog host')
  const search = render('dns')
  expect(search).toContain('DNS override')
  expect(search).not.toContain('Theme mode')
  expect(search).toContain('Dialog host')
})
it('does not leave empty section headings when no setting matches', () => {
  expect(render('no matching setting')).toBe('')
})
