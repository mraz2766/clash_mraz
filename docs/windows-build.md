# Windows local builds

- Run **pnpm build** for an optimized release installer.
- Run **pnpm build:fast** for a faster development installer with the same UI.
- Both commands produce an NSIS .exe, then open that newly generated installer.
  Installation remains interactive; no silent installation is performed.
- Run **pnpm build --no-open** to package without opening the installer.
- **pnpm web:build** only checks and compiles web assets, including when called
  inside the native build. It does not recursively start another native build.

Install the Rust version pinned in rust-toolchain.toml and Visual Studio 2022
Build Tools with the Desktop development with C++ workload and a Windows SDK.
The wrapper also finds Rust in the current user's .cargo/bin directory.
When bundled sidecars are missing it runs the existing prebuild resource script.

Installer paths are printed after success. Standard output locations are:

- target/release/bundle/nsis/ for pnpm build
- target/fast-release/bundle/nsis/ for pnpm build:fast

The actual Cargo target directory and explicit target triple are respected.
A failed build, stale installer, empty file or ambiguous output never launches
an installer. CI and other operating systems retain their existing build flow
without opening a Windows installer.

Local builds without TAURI_SIGNING_PRIVATE_KEY omit signed updater artifacts
through a temporary CLI configuration override. This does not change the app's
updater configuration. CI/signing-key builds preserve signed updater artifacts.

Test the build wrapper with: node --test scripts/build.test.mjs
