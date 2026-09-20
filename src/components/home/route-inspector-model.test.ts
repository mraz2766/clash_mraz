import { describe, expect, it } from 'vitest'

import { matchesHost, normalizeHost } from './route-inspector-model'

describe('observed website route matching', () => {
  it('normalizes URLs without sending their paths or credentials', () => {
    expect(normalizeHost('https://GitHub.com/user/repo?q=test')).toBe(
      'github.com',
    )
    expect(normalizeHost(' github.com. ')).toBe('github.com')
    expect(normalizeHost('https://user:secret@github.com')).toBeNull()
    expect(normalizeHost('file:///etc/hosts')).toBeNull()
    expect(normalizeHost('')).toBeNull()
  })
  it('matches real subdomains but not similar attacker-controlled names', () => {
    expect(matchesHost('api.github.com', 'github.com')).toBe(true)
    expect(matchesHost('GITHUB.COM.', 'github.com')).toBe(true)
    expect(matchesHost('notgithub.com', 'github.com')).toBe(false)
    expect(matchesHost('github.com.example.org', 'github.com')).toBe(false)
  })
})
