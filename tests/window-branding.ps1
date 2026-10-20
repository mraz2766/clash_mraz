# Verify native caption icon changes in an isolated hidden Win32 window, without Tauri DLLs.
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$testDir = Join-Path $repo 'target/window-branding-regression'
$sourceDir = Join-Path $testDir 'src'
New-Item -ItemType Directory -Path $sourceDir -Force | Out-Null
Set-Content -LiteralPath (Join-Path $testDir 'Cargo.toml') -Encoding utf8 -Value @'
[package]
name = "window-branding-regression"
version = "0.0.0"
edition = "2021"
[workspace]
[dependencies]
windows-sys = { version = "=0.61.2", features = ["Win32_Foundation", "Win32_UI_WindowsAndMessaging"] }
'@
$source = (Join-Path $repo 'src-tauri/src/utils/window_branding.rs').Replace('\', '/')
Set-Content -LiteralPath (Join-Path $sourceDir 'lib.rs') -Encoding utf8 -Value @"
#[cfg(test)]
#[path = "$source"]
mod window_branding;
"@
& cargo test --offline --manifest-path (Join-Path $testDir 'Cargo.toml')
if ($LASTEXITCODE -ne 0) { throw 'Window branding regression failed.' }
