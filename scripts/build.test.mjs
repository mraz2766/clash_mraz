import assert from 'node:assert/strict'
import {
  mkdtemp,
  writeFile,
  readFile,
  readdir,
  utimes,
  rm,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { buildOptions, freshInstaller, publishInstaller } from './build.mjs'

test('every bundled ICO frame uses RGBA PNG encoding accepted by Tauri', async () => {
  const directory = new URL('../src-tauri/icons/', import.meta.url)
  const icons = (await readdir(directory))
    .filter((name) => name.endsWith('.ico'))
    .map((name) => new URL(name, directory))
  icons.push(new URL('../src/assets/image/logo.ico', import.meta.url))
  for (const icon of icons) {
    const data = await readFile(icon)
    assert.equal(data.readUInt16LE(2), 1, `${icon}: ICO type`)
    const count = data.readUInt16LE(4)
    assert.ok(count > 0, `${icon}: no frames`)
    for (let i = 0; i < count; i++) {
      const offset = data.readUInt32LE(6 + i * 16 + 12)
      assert.equal(
        data.subarray(offset, offset + 8).toString('hex'),
        '89504e470d0a1a0a',
        `${icon}: frame ${i} PNG signature`,
      )
      assert.equal(
        data[offset + 25],
        6,
        `${icon}: frame ${i} must be RGBA (PNG color type 6)`,
      )
    }
  }
})

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

test('publishing preserves the installer bytes and replaces the previous local copy', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'clash-publish-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const source = path.join(directory, 'Clash.exe')
  const output = path.join(directory, 'releases')
  await writeFile(source, 'first fixture')
  const result = await publishInstaller(source, output)
  assert.equal(path.dirname(result), output)
  await writeFile(source, 'second fixture')
  await publishInstaller(source, output)
  assert.equal(await readFile(result, 'utf8'), 'second fixture')
  await assert.rejects(
    publishInstaller(path.join(directory, 'missing.exe'), output),
  )
  assert.equal(await readFile(result, 'utf8'), 'second fixture')
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
