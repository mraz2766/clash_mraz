<p align="center"><img src="src/assets/image/mascot.png" width="104" alt="Clash 小白鲸 Logo" /></p>
<h1 align="center">Clash for Mac</h1>
<p align="center">保留白鲸品牌，为 macOS 定制的代理管理工具。</p>

**Mac 专用分支：`clash-mac` · 当前版本：2.7.1**

基于 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 二次开发，沿用本项目优化后的白鲸 Logo、圆角图标和代理管理能力。Windows 版本保留在 `main`，本分支只构建 macOS 应用。

## Mac 设计

- 原生红黄绿窗口按钮、融合标题栏、可拖动页头和系统窗口行为。
- 暖白与 Logo 蓝灰主题，深色模式采用石墨黑；玻璃侧栏与高对比导航，一体式网络控制区。
- 系统字体、紧凑导航、柔和的工作区层次，沿用现有白鲸 ICNS 和菜单栏图标。
- `⌘,` 打开设置、`⌘1–8` 切换页面、`⌘B` 折叠侧栏。
- 导航选中滑动、页面短淡入、控件轻压反馈；遵循减少动态效果与减少透明度偏好。
- 保留订阅、节点选择、系统代理、TUN、连接、规则、日志、备份与菜单栏功能。

## 安装与使用

将构建出的 **Clash.app** 放入 `/Applications`（应用程序），命名为 **Clash for Mac.app** 后启动。在“订阅”中导入自己的订阅或配置，再选择节点，按需启用系统代理或 TUN。项目不提供代理订阅。

本地构建使用临时签名（ad hoc），不包含 Apple Developer ID 公证。系统代理与 TUN 所需服务可能触发 macOS 自身的权限提示。

从 2.7.0 起使用独立 Bundle ID `io.github.mraz.clash.mac`，配置位于 `~/Library/Application Support/io.github.mraz.clash.mac/`。升级安装保留此目录。已有订阅可通过备份恢复或导入配置迁移；应用不会擅自覆盖已有配置。底层服务仍沿用上游服务协议，请退出其他代理客户端后使用。安装脚本保留已存在的 Clash.app 备份。

## 本地构建

需要 macOS、Xcode Command Line Tools、Node.js、pnpm 和 `rust-toolchain.toml` 指定的 Rust 工具链。当前安装包面向本机架构，Apple Silicon 在 ARM Mac 上构建，Intel 在 Intel Mac 上构建。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm build:install
```

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 桌面开发模式 |
| `pnpm web:build` | 类型检查与前端构建 |
| `pnpm lint` | 前端静态检查 |
| `pnpm test` | 单元测试与 Mac 构建参数检查 |
| `pnpm build` | 完整构建 .app 和带版本号的 ZIP |
| `pnpm build:fast` | 快速迭代构建 |
| `pnpm build:install` | 构建并安装到 /Applications/Clash for Mac.app |
| `pnpm release-version 2.7.2` | 同步下一次迭代版本号 |

输出：`target/release/bundle/macos/Clash.app` 与 `releases/Clash_Mac_2.7.1_arm64.zip`。快速构建位于 `target/fast-release/`，Intel 包文件名使用 `x64`。首次构建会下载 Mihomo、服务与地理数据资源。

每次交付必须更新版本号和 [Changelog](Changelog.md)，并重新构建、验证后安装。构建过程不会自动提交、发布 GitHub Release 或改变代理开关。

## 更新与文档

本分支采用本地构建和手动更新。已关闭上游静默更新初始化和前端自动检查，避免上游包覆盖 Mac 定制版；未配置独立签名更新服务。后续更新通过新的 `.app` 替换。

- [Mac 构建说明](docs/macos-build.md)
- [Mac 设计规范](docs/ui-design.md)
- [品牌与图标](docs/branding.md)
- [使用说明](docs/usage.md)

感谢 Clash Verge Rev、Clash Verge 与 Mihomo 的作者及贡献者。沿用 [GPL-3.0-only](LICENSE)，保留第三方版权与历史更新记录。旧版其他语言 README 和预览图属于上游/Windows 历史资料，以本文件的 Mac 说明为准。

## 常见问题

- 下载资源较慢：构建进程可设置 `HTTPS_PROXY` 和 `HTTP_PROXY`，使用 Node 24 的 `NODE_USE_ENV_PROXY=1` 让原生 fetch 使用代理。不会修改系统代理设置。
- 端口被占用或启动切回旧应用：先退出其他代理客户端，再启动 Clash。
- 修改代理配置：通过设置中的“打开配置目录”定位数据，或在订阅页面导入 YAML；不要直接编辑应用包内的文件。
