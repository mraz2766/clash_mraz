import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildOptions } from './build.mjs'
test('Mac builds reject unsupported hosts and missing bundles', () => {
  assert.throws(() => buildOptions([], 'win32'), /macOS/)
  assert.throws(() => buildOptions(['--no-bundle'], 'darwin'), /bundle/)
})
test('install is explicit and not forwarded to Tauri', () => {
  assert.equal(buildOptions([], 'darwin').install, false)
  assert.deepEqual(
    buildOptions(['--install', '--profile', 'fast-release'], 'darwin'),
    {
      install: true,
      args: ['build', '--profile', 'fast-release', '--bundles', 'app'],
    },
  )
})

test('reject cross-target or debug output that cannot be installed as the native release', () => {
  assert.throws(
    () => buildOptions(['--target=x86_64-apple-darwin'], 'darwin'),
    /unsupported/,
  )
  assert.throws(() => buildOptions(['--debug'], 'darwin'), /unsupported/)
})
