<#
.SYNOPSIS
  一键构建 Clash 的 Windows 安装包，并打开安装向导。

.DESCRIPTION
  检查 Node.js、Rust 与 Visual Studio C++ 构建工具，准备 pnpm，安装依赖，
  构建安装包并输出到 releases\ 目录。缺少工具时会列出安装方法；加上
  -InstallTools 可通过 winget 自动安装。

.PARAMETER InstallTools
  缺少构建工具时，使用 winget 自动安装（会弹出安装程序与管理员授权）。

.PARAMETER NoLaunch
  只生成安装包，不打开安装向导。

.PARAMETER Install
  构建成功后覆盖安装并重启 Clash；保留配置与已有快捷方式。与 -NoLaunch 互斥。

.PARAMETER Release
  使用正式配置构建（pnpm build），耗时更长；默认使用快速配置（pnpm build:fast）。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\build-windows.ps1
#>
[CmdletBinding()]
param(
  [switch]$InstallTools,
  [switch]$NoLaunch,
  [switch]$Release,
  [switch]$Install
)

$ErrorActionPreference = 'Stop'
if ($Install -and $NoLaunch) { throw '-Install 与 -NoLaunch 不能同时使用。' }
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Step([string]$Message) {
  Write-Host ''
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Stop-Build([string]$Message) {
  Write-Host ''
  Write-Host "构建未完成：$Message" -ForegroundColor Red
  exit 1
}

# Native commands do not throw on failure; check the exit code explicitly.
function Invoke-Checked([string]$Command, [string[]]$Arguments) {
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    Stop-Build "$Command $($Arguments -join ' ') 退出码 $LASTEXITCODE"
  }
}

# Pick up tools installed earlier in this session or by winget just now.
function Update-SessionPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $cargo = Join-Path $env:USERPROFILE '.cargo\bin'
  $env:Path = (@($cargo, $env:Path, $user, $machine) | Where-Object { $_ }) -join ';'
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-MsvcTools {
  $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
  if (-not (Test-Path $vswhere)) { return $false }
  $path = & $vswhere -latest -products * `
    -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
    -property installationPath
  return [bool]$path
}

$tools = @(
  @{
    Name = 'Node.js'
    Test = { Test-Command 'node' }
    WingetId = 'OpenJS.NodeJS.LTS'
    Override = $null
    Url = 'https://nodejs.org/'
  },
  @{
    Name = 'Rust (MSVC)'
    Test = { Test-Command 'cargo' }
    WingetId = 'Rustlang.Rustup'
    Override = $null
    Url = 'https://rustup.rs/'
  },
  @{
    Name = 'Visual Studio C++ 构建工具'
    Test = { Test-MsvcTools }
    WingetId = 'Microsoft.VisualStudio.2022.BuildTools'
    Override = '--passive --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended'
    Url = 'https://visualstudio.microsoft.com/visual-cpp-build-tools/'
  }
)

Write-Step '检查构建工具'
Update-SessionPath
$missing = @($tools | Where-Object { -not (& $_.Test) })

if ($missing.Count -gt 0 -and $InstallTools) {
  if (-not (Test-Command 'winget')) {
    Stop-Build '未找到 winget，请按下方链接手动安装缺少的工具。'
  }
  foreach ($tool in $missing) {
    Write-Step "通过 winget 安装 $($tool.Name)"
    $wingetArgs = @(
      'install', '--id', $tool.WingetId, '--exact',
      '--accept-source-agreements', '--accept-package-agreements'
    )
    if ($tool.Override) { $wingetArgs += @('--override', $tool.Override) }
    Invoke-Checked 'winget' $wingetArgs
  }
  Update-SessionPath
  $missing = @($tools | Where-Object { -not (& $_.Test) })
}

if ($missing.Count -gt 0) {
  Write-Host ''
  Write-Host '缺少以下工具：' -ForegroundColor Yellow
  foreach ($tool in $missing) {
    Write-Host "  - $($tool.Name)：$($tool.Url)"
  }
  Write-Host ''
  Write-Host '可以加上 -InstallTools 让脚本通过 winget 自动安装，安装后请重新打开 PowerShell 再运行：'
  Write-Host '  powershell -ExecutionPolicy Bypass -File scripts\build-windows.ps1 -InstallTools'
  exit 1
}

$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) {
  Stop-Build "Node.js 版本过低（当前 v$nodeMajor），请安装 20 或更新的 LTS 版本。"
}
Write-Host "  Node.js $(& node --version)  ·  $(& cargo --version)  ·  C++ 构建工具已就绪"

# Newer rustup no longer installs the pinned toolchain implicitly.
$channel = (Select-String -Path (Join-Path $root 'rust-toolchain.toml') -Pattern 'channel\s*=\s*"([^"]+)"').Matches[0].Groups[1].Value
if ($channel -and (Test-Command 'rustup')) {
  $installed = @(& rustup toolchain list)
  if ($LASTEXITCODE -ne 0) { Stop-Build '无法读取 Rust 工具链。' }
  if (-not ($installed | Where-Object { $_ -match ('^' + [regex]::Escape($channel) + '(-|\s|$)') })) {
    Write-Step "准备 Rust $channel 工具链"
    Invoke-Checked 'rustup' @('toolchain', 'install', $channel, '--profile', 'minimal', '--component', 'rustfmt,clippy')
  }

}

Write-Step '准备 pnpm'
$env:COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
if (-not (Test-Command 'pnpm')) {
  if (Test-Command 'corepack') {
    # A per-user shim avoids writing into the Node.js install directory, which needs admin rights.
    $shimDir = Join-Path $env:LOCALAPPDATA 'clash-build\bin'
    New-Item -ItemType Directory -Force $shimDir | Out-Null
    Invoke-Checked 'corepack' @('enable', '--install-directory', $shimDir, 'pnpm')
    $env:Path = "$shimDir;$env:Path"
  } else {
    # Node.js 25+ no longer ships corepack; install the pinned pnpm per user instead.
    $pinned = (Get-Content (Join-Path $root 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).packageManager
    Invoke-Checked 'npm' @('install', '--global', $pinned)
    Update-SessionPath
    $env:Path = "$(Join-Path $env:APPDATA 'npm');$env:Path"
  }
}
if (-not (Test-Command 'pnpm')) { Stop-Build '无法准备 pnpm。' }
Write-Host "  pnpm $(& pnpm --version)"

Write-Step '安装依赖'
Invoke-Checked 'pnpm' @('install', '--frozen-lockfile')

$buildScript = if ($Release) { 'build' } else { 'build:fast' }
Write-Step "构建安装包（pnpm $buildScript，首次需要较长时间并联网下载内核资源）"
$buildArgs = @($buildScript)
if ($NoLaunch) { $buildArgs += '--no-open' }
if ($Install) { $buildArgs += '--install' }
# build.mjs identifies the exact fresh artifact, publishes it atomically, then opens
# or installs that same file. Never guess the newest EXE from releases/ again.
Invoke-Checked 'pnpm' $buildArgs
