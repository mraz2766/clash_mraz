param(
  [string]$Nsis = "$env:LOCALAPPDATA/tauri/NSIS/makensis.exe"
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$testDir = Join-Path $repo 'target/shortcut-icon-test'
$utils = Join-Path $repo 'target/fast-release/nsis/x64/utils.nsh'
if (!(Test-Path -LiteralPath $Nsis) -or !(Test-Path -LiteralPath $utils)) {
  throw 'Run a local NSIS build first, or supply the NSIS compiler path.'
}
New-Item -ItemType Directory -Path $testDir -Force | Out-Null
$template = Get-Content -LiteralPath (Join-Path $repo 'src-tauri/packages/windows/installer.nsi') -Raw
$macro = [regex]::Match($template, '(?s)!macro RefreshBrandShortcut shortcut.*?!macroend').Value
if (!$macro) { throw 'Shortcut refresh macro not found.' }
# Compile the actual production macro into a sandboxed, user-level test helper.
# All links and outputs stay under target; no desktop or registry changes.
$source = @"
Unicode true
RequestExecutionLevel user
SilentInstall silent
OutFile "$testDir\check.exe"
!include "LogicLib.nsh"
!include "Win\COM.nsh"
!include "$utils"
!define MAINBINARYNAME "fixture"
!define VERSION "test"
$macro
Section
  StrCpy `$INSTDIR "$testDir"
  CreateShortcut "$testDir\owned.lnk" "`$INSTDIR\fixture.exe" "--keep-argument" "`$INSTDIR\old.ico"
  CreateShortcut "$testDir\unrelated.lnk" "`$INSTDIR\other.exe" "--untouched" "`$INSTDIR\old.ico"
  !insertmacro RefreshBrandShortcut "$testDir\owned.lnk"
  !insertmacro RefreshBrandShortcut "$testDir\unrelated.lnk"
  !insertmacro RefreshBrandShortcut "$testDir\missing.lnk"
SectionEnd
"@
$sourcePath = Join-Path $testDir 'check.nsi'
Set-Content -LiteralPath $sourcePath -Value $source -Encoding utf8
Copy-Item -LiteralPath (Join-Path $repo 'src-tauri/icons/icon.ico') -Destination (Join-Path $testDir 'clash-brand-test.ico')
& $Nsis /V2 $sourcePath
if ($LASTEXITCODE -ne 0) { throw 'NSIS test compilation failed.' }
$check = Start-Process -FilePath (Join-Path $testDir 'check.exe') -WindowStyle Hidden -PassThru -Wait
if ($check.ExitCode -ne 0) { throw 'Shortcut test helper failed.' }
$shell = New-Object -ComObject WScript.Shell
try {
  $owned = $shell.CreateShortcut((Join-Path $testDir 'owned.lnk'))
  $unrelated = $shell.CreateShortcut((Join-Path $testDir 'unrelated.lnk'))
  if ($owned.IconLocation -notlike '*clash-brand-test.ico*') { throw "Icon not refreshed: $($owned.IconLocation)" }
  if ($owned.Arguments -ne '--keep-argument') { throw 'Shortcut arguments changed.' }
  if ($owned.TargetPath -ne (Join-Path $testDir 'fixture.exe')) { throw 'Shortcut target changed.' }
  if ($unrelated.IconLocation -notlike '*old.ico*') { throw 'Unrelated link was modified.' }
  if (Test-Path -LiteralPath (Join-Path $testDir 'missing.lnk')) { throw 'Missing shortcut was created.' }
  Write-Output 'PASS: icon refreshed; target and arguments preserved; unrelated/missing links untouched.'
} finally {
  [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($shell)
}
