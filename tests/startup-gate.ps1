# Run the unchanged startup gate's tests without loading Tauri's native DLLs.
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$testDir = Join-Path $repo 'target/startup-gate-regression'
$sourceDir = Join-Path $testDir 'src'
New-Item -ItemType Directory -Path $sourceDir -Force | Out-Null
$lock = Get-Content -LiteralPath (Join-Path $repo 'Cargo.lock') -Raw
$tokio = [regex]::Match($lock, 'name = "tokio"\r?\nversion = "([^"]+)"').Groups[1].Value
if (!$tokio) { throw 'Cannot resolve locked Tokio version.' }
$manifest = @"
[package]
name = "startup-gate-regression"
version = "0.0.0"
edition = "2021"
[workspace]
[dependencies]
tokio = { version = "=$tokio", features = ["macros", "rt", "time", "test-util"] }
"@
Set-Content -LiteralPath (Join-Path $testDir 'Cargo.toml') -Value $manifest -Encoding utf8
$gate = (Join-Path $repo 'src-tauri/src/utils/resolve/startup_gate.rs').Replace('\', '/')
Set-Content -LiteralPath (Join-Path $sourceDir 'lib.rs') -Encoding utf8 -Value @"
#[cfg(test)]
#[path = "$gate"]
mod startup_gate;
"@
& cargo test --offline --manifest-path (Join-Path $testDir 'Cargo.toml')
if ($LASTEXITCODE -ne 0) { throw 'Startup gate regression failed.' }
