# Windows 构建

## 环境

- Node.js 与 pnpm（版本约束见 `package.json`）。
- Rust MSVC 工具链，版本见 `rust-toolchain.toml`，以及 rustfmt、clippy。
- Visual Studio 2022 Build Tools，安装“使用 C++ 的桌面开发”和 Windows SDK。
- Git；提交检查依赖 `cargo-make`，安装命令为 `cargo install --locked cargo-make`。

Windows ARM64 构建还需要 LLVM/Clang。macOS 与 Linux 应使用对应平台的开发环境。

## 命令

```sh
pnpm install
pnpm build:fast
```

快速构建使用 `fast-release` 配置；正式本地构建使用 `pnpm build`。这两条命令都会先检查前端，再执行原生编译和 NSIS 打包。

构建脚本会补充当前用户的 Cargo 路径；首次缺少内核或服务资源时，调用原有资源准备脚本。资源下载需要网络。

## 安装与升级流程

- 首次安装：欢迎页 → 选择目录 → 安装 → 完成。使用系统匹配的安装语言，不额外弹出语言选择框；更新器传入的 `/LANG=` 仍有效。
- 已安装 Clash：欢迎页 → 覆盖安装 → 完成。同版本用于修复，更高版本用于升级，沿用注册的安装目录，不要求先卸载。卸载请使用 Windows“已安装的应用”。降级仍保留原有确认流程。
- 安装成功后直接显示完成页，由用户选择是否启动应用和创建桌面快捷方式。启动继续使用普通用户权限。
- 覆盖安装不重置 TCP 参数，不清除窗口位置与开机启动记录；订阅、配置和代理业务逻辑保持原样。
- Visual C++ 运行库下载或安装失败时终止安装，显示原因；返回 3010 时提示需要重启。
- 早期名称 Clash_mraz、Clash Verge 的独立安装不会被自动卸载或删除。它们可能使用相同配置和服务，迁移应单独处理，不能仅按显示名称清理。

## 安装包位置

对外使用的安装包统一复制到项目根目录下的一层目录：

```text
clash_mraz/
  releases/
    Clash_2.6.0_x64-setup.exe
```

文件名随版本与架构变化，以构建输出为准。Cargo 的中间产物仍在 `target/` 中，这是编译缓存；无需手动进入它寻找安装包。`releases/` 不提交到 Git。

只有本次构建成功，且找到唯一、非空的新安装包，才会复制并打开。复制使用临时文件后重命名，失败不会打开旧安装包。打开后由你操作安装向导，不执行静默安装。

```sh
pnpm build:fast --no-open
```

该选项只关闭自动打开安装向导，仍然生成和复制 EXE。CI、macOS、Linux 不自动打开 Windows 安装程序。`pnpm web:build` 仅构建前端，不生成安装包。

## GitHub Desktop 提交与推送

出现 `cargo: command not found` 时，确认 Cargo 已安装，并在用户级 `~/.config/husky/init.sh` 中为 GUI Git 客户端补充 Cargo、Node.js 和 pnpm 的路径，然后重试。不要通过删除检查来解决环境问题。

本地安装包不需要上游更新签名私钥。自有自动更新需另行配置自己的签名和发布地址，不能沿用上游私钥。

如果上一次安装向导仍在运行并锁定同名 EXE，新构建会在 `releases/` 中使用带时间戳的文件名，不强行关闭正在使用的安装程序。安装完成后，可自行清理不再需要的旧 EXE。

## 2.6.0 图标升级

安装目录包含带版本号的 `clash-brand-2.6.0.ico`。升级后，仅刷新目标为本次安装 EXE 的既有桌面与开始菜单快捷方式，保留快捷方式的参数。未选择创建快捷方式时不会额外创建；不删除系统图标缓存或重启 Explorer。

## 隔离页面验证

`tests/ui/fixture.mjs` 使用 Tauri 官方 mock 接口提供演示数据，仅由测试运行器注入，不进入正式应用入口，也不连接真实内核。启动 `pnpm web:dev` 后，可在提供 Playwright 的 Node 环境执行 `node tests/ui/run.mjs`。`UI_PLAYWRIGHT_ROOT` 可指定提供 Playwright 的 package.json，`UI_BROWSER` 可指定本机 Chromium/Edge 可执行文件。

验证覆盖浅色/深色、常规/800×600 窗口和页面交互；截图保存到 `target/ui-review/`。Windows 原生窗口、安装升级、真实重启与不同系统版本需另行实机验证，浏览器预览不替代这些测试。

## 2.6.0 验证记录（2026-09-20）

- TypeScript、ESLint、17 项前端测试、5 项构建/ICO 测试通过，包含过期 NotRunning 快照的代理开关回归。
- 隔离 UI 验证涵盖设置搜索、配色持久化、关闭图表、模式切换、诊断按需加载、网站出口空状态、节点切换成功/失败，以及快捷键避让；记录 8 页 × 2 主题 × 2 尺寸截图，另检查 200% DPI 与减少动态效果。
- `pnpm build:fast` 完成 Windows x64 NSIS 打包。安装包位于 `releases/Clash_2.6.0_x64-setup.exe`。
- `tests/windows-shortcut-icon.ps1` 在项目 `target/` 内执行安装器实际图标刷新宏；确认图标更新、参数与目标保留、无关链接不变、缺失链接不创建。本机升级后读取到应用版本 2.6.0，桌面和开始菜单快捷方式均指向 `clash-brand-2.6.0.ico`。
- 完整 Tauri 测试程序可以编译，但本机运行时出现 `0xc0000139 / STATUS_ENTRYPOINT_NOT_FOUND`，9 月 12 日留下的旧测试程序也复现相同加载错误。`tests/startup-gate.ps1` 直接引用原启动等待源码，以锁定版本 Tokio 独立执行：等待初始化、已完成立即返回、超时上限三项全部通过；这不代表完整 Tauri 测试套件通过。
- 未验证 Windows 10/11 全版本矩阵、开机冷启动、多显示器 DPI 切换与完整安装/卸载组合。原生窗口截图工具在本机返回不支持接口错误；页面截图来自浏览器隔离预览，不能代替原生窗口操作验收。
