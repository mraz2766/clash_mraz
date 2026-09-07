import { spawn } from 'node:child_process'
import { access, mkdir, readFile, rename, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const env = {
  ...process.env,
  PATH: `${homedir()}/.cargo/bin:${process.env.PATH}`,
  NODE_OPTIONS: '--max-old-space-size=4096',
}
function run(command, args, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    })
    let output = ''
    child.stdout?.on('data', (chunk) => {
      output += chunk
    })
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve(output)
        : reject(new Error(`${command} exited ${code}`)),
    )
  })
}
export function buildOptions(args, platform) {
  if (platform !== 'darwin')
    throw new Error('clash-mac must be built on macOS.')
  if (args.includes('--no-bundle'))
    throw new Error('Mac builds must produce an app bundle.')
  if (args.some((arg) => /^(-t|--target|--debug|-d)(=|$)/.test(arg)))
    throw new Error(
      'Use a native macOS release build; cross-target and debug bundles are unsupported.',
    )
  return {
    install: args.includes('--install'),
    args: [
      'build',
      ...args.filter((arg) => arg !== '--install' && arg !== '--no-open'),
      '--bundles',
      'app',
    ],
  }
}
export async function main(args = process.argv.slice(2)) {
  const options = buildOptions(args, process.platform)
  const version = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8'),
  ).version
  const tauriVersion = JSON.parse(
    await readFile(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'),
  ).version
  const manifest = await readFile(
    path.join(root, 'src-tauri/Cargo.toml'),
    'utf8',
  )
  const rustVersion = manifest.match(/^version = "([^"]+)"/m)?.[1]
  if (version !== tauriVersion || version !== rustVersion)
    throw new Error(
      'Version mismatch: run pnpm release-version before building.',
    )
  const rustInfo = await run('rustc', ['-vV'], true)
  const host = rustInfo.match(/^host: (.+)$/m)?.[1]?.trim()
  if (!host?.endsWith('apple-darwin'))
    throw new Error('An Apple Rust toolchain is required.')
  await run(process.execPath, ['scripts/prebuild.mjs', host])
  await run(process.execPath, [
    require.resolve('@tauri-apps/cli/tauri.js'),
    ...options.args,
  ])
  const metadata = JSON.parse(
    await run(
      'cargo',
      ['metadata', '--no-deps', '--format-version', '1'],
      true,
    ),
  )
  const profileIndex = args.indexOf('--profile')
  const profile = profileIndex >= 0 ? args[profileIndex + 1] : 'release'
  const source = path.join(
    metadata.target_directory,
    profile,
    'bundle/macos/Clash.app',
  )
  await access(path.join(source, 'Contents/MacOS/clash-verge'))
  await run('codesign', ['--verify', '--deep', '--strict', source])
  const releases = path.join(root, 'releases')
  await mkdir(releases, { recursive: true })
  const archive = path.join(
    releases,
    `Clash_Mac_${version}_${process.arch}.zip`,
  )
  await run('ditto', [
    '-c',
    '-k',
    '--sequesterRsrc',
    '--keepParent',
    source,
    archive,
  ])
  console.log(`App: ${source}\nArchive: ${archive}`)
  if (options.install) {
    const destination = '/Applications/Clash for Mac.app'
    const pending = `/Applications/.Clash-${process.pid}.app`
    const backup = path.join(
      releases,
      `Clash-before-${version}-${Date.now()}.app`,
    )
    await run('ditto', [source, pending])
    await run('codesign', ['--verify', '--deep', '--strict', pending])
    let backedUp = false
    try {
      try {
        await access(destination)
        await rename(destination, backup)
        backedUp = true
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      await rename(pending, destination)
    } catch (error) {
      if (backedUp) await rename(backup, destination)
      throw error
    } finally {
      await rm(pending, { recursive: true, force: true })
    }
    console.log(`Installed: ${destination}`)
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
