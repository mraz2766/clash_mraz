import { expect, it, vi } from 'vitest'

import { createTrafficPreferences } from './traffic-preferences'

it('shares changes and restores the saved color preference on the next launch', () => {
  const data = new Map<string, string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
  const preferences = createTrafficPreferences(storage)
  expect(preferences.getSnapshot()).toBe('soft')
  const listener = vi.fn()
  const unsubscribe = preferences.subscribe(listener)
  preferences.setMode('mono')
  expect(listener).toHaveBeenCalledOnce()
  expect(createTrafficPreferences(storage).getSnapshot()).toBe('mono')
  unsubscribe()
  preferences.setMode('soft')
  expect(listener).toHaveBeenCalledOnce()
})

it('keeps charts usable when storage is unavailable or invalid', () => {
  const broken = createTrafficPreferences({
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  })
  broken.setMode('mono')
  expect(broken.getSnapshot()).toBe('mono')
  expect(
    createTrafficPreferences({
      getItem: () => 'old-value',
      setItem: vi.fn(),
    }).getSnapshot(),
  ).toBe('soft')
})
