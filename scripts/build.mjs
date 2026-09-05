import { spawn } from 'node:child_process'
import {
  access,
  readdir,
  stat,
  mkdir,
  copyFile,
  rename,
  rm,
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)

function run(command, args, env, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      shell: false,
      windowsHide: true,
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    })
    let output = ''
    child.stdout?.on('data', (chunk) => {
      output += chunk
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve(output)
      else
        reject(
          new Error(`${path.basename(command)} failed (${signal ?? code})`),
        )
    })
  })
}

export function buildOptions(args, platform, env) {
  const forwarded = args.filter((arg) => arg !== '--no-open')
  const localWindows = platform === 'win32' && !env.CI && !args.includes('--ci')
  const shouldOpen = localWindows && !args.includes('--no-open')
  const split = forwarded.indexOf('--')
  const tauriArgs = split === -1 ? forwarded : forwarded.slice(0, split)
  const cargoArgs = split === -1 ? [] : forwarded.slice(split)
  if (localWindows) {
    if (forwarded.includes('--no-bundle'))
      throw new Error('Local Windows builds must produce an installer.')
    tauriArgs.push('--bundles', 'nsis')
    // Local installers do not need the upstream private updater signing key.
    // Signed CI releases retain the original Tauri configuration.
    if (!env.TAURI_SIGNING_PRIVATE_KEY) {
      tauriArgs.push(
        '--config',
        JSON.stringify({ bundle: { createUpdaterArtifacts: false } }),
      )
    }
  }
  return {
    localWindows,
    shouldOpen,
    args: ['build', ...tauriArgs, ...cargoArgs],
  }
}

export async function freshInstaller(directory, startedAt) {
  const files = await readdir(directory)
  const candidates = []
  for (const name of files) {
    if (!name.toLowerCase().endsWith('.exe')) continue
    const file = path.join(directory, name)
    const info = await stat(file)
    if (info.isFile() && info.size > 0 && info.mtimeMs >= startedAt)
      candidates.push(file)
  }
  if (candidates.length !== 1) {
    throw new Error(
      `Expected one installer from this build in ${directory}; found ${candidates.length}. No installer was opened.`,
    )
  }
  return candidates[0]
}

// Publish atomically to one shallow, predictable directory before opening it.
export async function publishInstaller(source, directory) {
  await mkdir(directory, { recursive: true })
  const destination = path.join(directory, path.basename(source))
  const pending = destination + `.${process.pid}.pending`
  try {
    await copyFile(source, pending)
    try {
      await rename(pending, destination)
      return destination
    } catch (error) {
      // Windows can lock an EXE while its installer is open. Publish alongside
      // that file without terminating the user's installation.
      if (!['EACCES', 'EPERM', 'EBUSY'].includes(error.code)) throw error
      const available = path.join(
        directory,
        `${path.parse(source).name}-${Date.now()}.exe`,
      )
      await rename(pending, available)
      return available
    }
  } finally {
    await rm(pending, { force: true })
  }
}

export async function main(args = process.argv.slice(2)) {
  const env = {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=4096',
  }
  // Also supports a Rust installation made without modifying the system PATH.
  const pathKey =
    Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'PATH'
  const cargoBin = path.join(
    env.CARGO_HOME || path.join(homedir(), '.cargo'),
    'bin',
  )
  env[pathKey] = [cargoBin, env[pathKey]].filter(Boolean).join(path.delimiter)
  const options = buildOptions(args, process.platform, env)
  const getArg = (flag) => {
    const index = args.indexOf(flag)
    return index === -1
      ? args.find((arg) => arg.startsWith(flag + '='))?.slice(flag.length + 1)
      : args[index + 1]
  }
  const target = getArg('--target') || getArg('-t')
  const profile =
    getArg('--profile') ||
    (args.includes('--debug') || args.includes('-d') ? 'debug' : 'release')
  let bundleDirectory
  if (options.localWindows) {
    await run('cargo', ['--version'], env)
    const rustInfo = await run('rustc', ['-vV'], env, true)
    const host = target || rustInfo.match(/^host: (.+)$/m)?.[1]?.trim()
    if (!host?.endsWith('-windows-msvc'))
      throw new Error('A Windows MSVC target is required for an EXE installer.')
    const sidecar = path.join(
      root,
      'src-tauri/sidecar',
      `verge-mihomo-${host}.exe`,
    )
    try {
      await access(sidecar)
      await access(
        path.join(root, 'src-tauri/resources/clash-verge-service.exe'),
      )
    } catch {
      await run(
        process.execPath,
        [path.join(root, 'scripts/prebuild.mjs'), host],
        env,
      )
    }
    const metadata = JSON.parse(
      await run(
        'cargo',
        ['metadata', '--no-deps', '--format-version', '1'],
        env,
        true,
      ),
    )
    bundleDirectory = path.join(
      metadata.target_directory,
      ...(target ? [target] : []),
      profile,
      'bundle/nsis',
    )
  }
  const startedAt = Date.now()
  await run(
    process.execPath,
    [require.resolve('@tauri-apps/cli/tauri.js'), ...options.args],
    env,
  )
  if (options.localWindows) {
    const fresh = await freshInstaller(bundleDirectory, startedAt)
    const installer = await publishInstaller(fresh, path.join(root, 'releases'))
    console.log(`Installer: ${installer}`)
    if (options.shouldOpen) {
      // Pass the path as data, not interpolated PowerShell source. No silent install.
      await run(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          'Start-Process -FilePath $env:CLASH_BUILD_INSTALLER -ErrorAction Stop',
        ],
        { ...env, CLASH_BUILD_INSTALLER: installer },
      )
      console.log('Installer opened. Complete installation in its window.')
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
