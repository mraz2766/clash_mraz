import assert from 'node:assert/strict'
import { mkdtemp, writeFile, utimes, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { buildOptions, freshInstaller } from './build.mjs'

test('local Windows builds bundle NSIS before forwarded Cargo arguments', () => {
  const result = buildOptions(['--', '--profile', 'fast-release'], 'win32', {})
  assert.equal(result.shouldOpen, true)
  assert.ok(result.args.indexOf('nsis') < result.args.indexOf('--'))
  assert.deepEqual(result.args.slice(-3), ['--', '--profile', 'fast-release'])
  assert.equal(
    JSON.parse(result.args[result.args.indexOf('--config') + 1]).bundle
      .createUpdaterArtifacts,
    false,
  )
})

test('CI, other platforms and explicit no-open do not launch installers', () => {
  for (const [platform, env] of [
    ['win32', { CI: 'true' }],
    ['darwin', {}],
    ['linux', {}],
  ]) {
    const result = buildOptions(['--verbose'], platform, env)
    assert.equal(result.shouldOpen, false)
    assert.deepEqual(result.args, ['build', '--verbose'])
  }
  assert.equal(buildOptions(['--ci'], 'win32', {}).shouldOpen, false)
  const manual = buildOptions(['--no-open'], 'win32', {})
  assert.equal(manual.shouldOpen, false)
  assert.ok(!manual.args.includes('--no-open'))
  assert.ok(manual.args.includes('nsis'))
  assert.ok(
    !buildOptions([], 'win32', {
      TAURI_SIGNING_PRIVATE_KEY: 'test',
    }).args.includes('--config'),
  )
  assert.throws(() => buildOptions(['--no-bundle'], 'win32', {}))
})

test('only one fresh non-empty installer can be launched; stale and ambiguous outputs fail closed', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'clash-build-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const startedAt = Date.now() - 1000
  const stale = path.join(directory, 'old.exe')
  await writeFile(stale, 'test fixture; not executable')
  await utimes(stale, new Date(0), new Date(0))
  await writeFile(path.join(directory, 'empty.exe'), '')
  await assert.rejects(freshInstaller(directory, startedAt), /found 0/)
  const fresh = path.join(directory, 'new.exe')
  await writeFile(fresh, 'test fixture; not executable')
  assert.equal(await freshInstaller(directory, startedAt), fresh)
  await writeFile(
    path.join(directory, 'other.exe'),
    'test fixture; not executable',
  )
  await assert.rejects(freshInstaller(directory, startedAt), /found 2/)
})
