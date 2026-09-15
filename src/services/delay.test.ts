import {
  delayGroup,
  delayProxyByName,
  getGroupByName,
} from 'tauri-plugin-mihomo-api'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('tauri-plugin-mihomo-api', () => ({
  delayGroup: vi.fn(async () => ({ fast: 72 })),
  delayProxyByName: vi.fn(async () => ({ delay: 120 })),
  getGroupByName: vi.fn(async () => ({ now: 'fast' })),
  healthcheckNodeInProvider: vi.fn(async () => ({ delay: 120 })),
}))

import type { ResolvedProxyMember } from '@/types/proxy-view'

import delayManager from './delay'

const node = (name: string) =>
  ({
    kind: 'node',
    ref: { kind: 'node', name, recordId: `r:${name}` },
    node: {
      recordId: `r:${name}`,
      name,
      history: [],
      source: { kind: 'core', proxyName: name },
    },
  }) as unknown as ResolvedProxyMember

const automaticGroup = (name: string) =>
  ({
    kind: 'group',
    ref: { kind: 'group', name },
    group: {
      name,
      type: 'URLTest',
      now: 'dead',
      history: [],
      members: [],
    },
  }) as unknown as ResolvedProxyMember

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

let settles = 0
let unsubscribe: () => void

beforeEach(() => {
  vi.clearAllMocks()
  settles = 0
  unsubscribe = delayManager.addGroupListener('g', () => {
    settles += 1
  })
})

afterEach(() => unsubscribe())

describe('group delay completion', () => {
  test('notifies once after a batch settles', async () => {
    const proxies = Array.from({ length: 6 }, (_, index) => node(`n${index}`))

    await delayManager.checkListDelay(proxies as never, 'g', 5000, 2)
    await flush()

    expect(settles).toBe(1)
  })

  test('notifies only listeners for the completed group', async () => {
    let other = 0
    const stop = delayManager.addGroupListener('other', () => {
      other += 1
    })

    await delayManager.checkDelay(node('a') as never, 'g', 5000)
    await flush()

    expect(settles).toBe(1)
    expect(other).toBe(0)
    stop()
  })

  test('rechecks an automatic group before reporting its selected path', async () => {
    const result = await delayManager.checkDelay(
      automaticGroup('automatic') as never,
      'g',
      5000,
    )

    expect(result.delay).toBe(72)
    expect(delayGroup).toHaveBeenCalledWith(
      'automatic',
      'http://1.1.1.1/generate_204',
      5000,
      true,
    )
    expect(getGroupByName).toHaveBeenCalledWith('automatic')
  })

  test('does not overlap automatic group checks with ordinary node checks', async () => {
    const events: string[] = []
    vi.mocked(delayProxyByName).mockImplementationOnce(async () => {
      events.push('node:start')
      await new Promise((resolve) => setTimeout(resolve, 10))
      events.push('node:end')
      return { delay: 80 }
    })
    vi.mocked(delayGroup).mockImplementationOnce(async () => {
      events.push('group:start')
      return { fast: 72 }
    })

    await delayManager.checkListDelay(
      [automaticGroup('automatic'), node('fast')] as never,
      'g',
      5000,
      2,
    )

    expect(events).toEqual(['node:start', 'node:end', 'group:start'])
  })
})
