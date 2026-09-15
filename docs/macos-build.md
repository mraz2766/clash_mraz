# Clash for Mac 构建与迭代

本分支固定为 `clash-mac`，不生成 EXE、MSI 或 Linux 包。

1. 安装 Xcode 开发工具、Node.js、pnpm 和 Rust。Rust 版本按根目录 `rust-toolchain.toml`。
2. 执行 `pnpm install --frozen-lockfile`。
3. 退出正在运行的 Clash for Mac，然后执行 `pnpm build:install`。脚本预取本机架构的核心、服务、地理数据和 DNS 脚本，再构建前端与 Rust。
4. 构建结果为 `target/release/bundle/macos/Clash.app`。通过代码签名完整性验证后，在 `releases` 生成带版本号与架构的 ZIP。
5. 安装前复制到隐藏的临时应用目录并验证，将已有应用移动到 临时备份路径，安装后验证并归档为 `releases/Clash-before-<版本>-<时间>.app.zip`，移除可启动的备份应用，再替换 `/Applications/Clash for Mac.app`。配置不随应用替换而删除。

## 版本规范

首个 Mac 版为 2.6.0，当前修订为 2.9.7。每次用户可见迭代递增 patch；功能版本递增 minor。用 `pnpm release-version 2.9.7` 同步 package.json、Tauri 与 Rust 包版本，随后更新 Changelog。Cargo 构建会同步锁文件中的应用版本。

## 验证

运行 `pnpm web:build`、`pnpm test`、`pnpm lint`。检查 `.app` 的 Info.plist 版本、arm64/x86_64 架构与 `codesign --verify --deep --strict`，从 Applications 启动检查菜单栏、窗口、浅深主题、导航与设置。真实代理连通性测试需要有效订阅。

## 发布范围

本地应用为 ad hoc 签名，尚未使用 Developer ID 和 Apple 公证。不要把本地签名包描述成已公证应用。Mac TUN 和服务安装继续沿用系统权限流程。本分支没有 GitHub Actions 工作流，仅本地构建和手动上传文件。

## 从旧版恢复配置

2.9.7 配置目录为 `~/Library/Application Support/io.github.mraz.clash.mac/`。旧版目录为 `~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/`。迁移前退出应用并备份两边目录；复制 `verge.yaml`、`profiles.yaml` 和整个 `profiles/`，可选复制窗口状态。不要覆盖目标目录中更新的配置，不要复制进程锁、套接字或运行时临时配置。重启后检查订阅、选中配置及主题保存。

本次本机恢复的原始备份保存在 `~/Library/Application Support/Clash Mac Backups/2.6.0-preinstall/`，不随 Git 提交。迁移使用独立副本，不是符号链接。

## GitHub Desktop 推送

Git hooks 自行补充 `~/.cargo/bin`，不依赖 GUI 应用加载 shell 配置，也不在提交或推送时安装 cargo-make。首次发布分支沿用原有策略，跳过无上游可比较的差异检查；后续推送按上游差异运行 Rust clippy 或前端类型与未使用文件检查。
