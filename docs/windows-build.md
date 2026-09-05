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
    Clash_2.5.4_x64-setup.exe
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
