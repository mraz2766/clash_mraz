<p align="center"><img src="src/assets/image/mascot.png" width="104" alt="Clash 小白鲸 Logo" /></p>
<h1 align="center">Clash</h1>
<p align="center">柔和、清晰、专注效率的桌面代理管理工具</p>
<p align="center"><a href="#界面预览">界面预览</a> · <a href="#开始使用">开始使用</a> · <a href="#本地构建">本地构建</a> · <a href="docs/usage.md">使用说明</a></p>

基于 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 二次开发，保留 Mihomo 与既有代理管理能力，重点改善桌面界面的排版、交互和 Windows 安装体验。

## 最近的改进

2026 年 9 月 5—6 日的调整主要集中在以下方面：

| 方面 | 更新内容 |
| --- | --- |
| 整体视觉 | 参考 Material 3、Google Workspace 的柔和色彩和 Apple 的克制层级，统一浅色、深色主题与语义颜色。 |
| 页面层次 | 侧栏、标题和内容区使用连续背景，减少灰白割裂；弱化卡片轮廓，移除重复分割线，以留白区分内容。 |
| 首页 | 统一卡片间距和标题对齐；订阅、代理跳转使用文字按钮，说明文字去掉重复底框，测速结果以语义色数字呈现。 |
| 导航与列表 | 侧栏使用柔和的选中背景；节点采用列表布局，连接与规则保留高密度表格及虚拟滚动。 |
| 设置与控件 | 设置按分区和行组织，统一按钮、选择框、开关、弹窗和 Snackbar，移除应用中的项目帮助、Telegram、GitHub 导航入口。 |
| 交互反馈 | 导航选中移动、按钮轻压、页面淡入、菜单与弹窗短过渡；支持减少动态效果，不延迟业务操作。 |
| 名称与图标 | 显示名称统一为 Clash，白鲸 Logo 采用透明圆角，统一应用、安装包、文档与彩色托盘图标；修复 ICO 非 RGBA 导致的解码错误。 |
| 安装体验 | 取消重复语言选择；重装和升级覆盖原目录；保留窗口位置与开机启动记录，不再重置 TCP 参数；运行库失败时明确中止。 |
| 构建方式 | 本地生成安装包，EXE 集中在一层 releases/ 目录；关闭 GitHub 自动触发的构建与检查。 |

这些改动不改变订阅格式、节点测速、系统代理、TUN 或 Mihomo 配置逻辑。旧名称安装的清理属于本机维护，当前安装包不会自动卸载其他旧版本。

## 界面预览

### 浅色与深色首页

| 浅色模式 | 深色模式 |
| --- | --- |
| ![浅色首页](docs/preview_light.jpg) | ![深色首页](docs/preview_dark.jpg) |

<details>
<summary>查看设置与弹窗</summary>

![设置页](docs/preview_settings.jpg)

![深色弹窗](docs/preview_dialog.jpg)

</details>

浅色、深色首页为当前应用截图；设置与弹窗为实际组件搭配演示数据的预览。截图早于本次图标圆角更新。替换截图只需覆盖 `docs/` 中的 `preview_light.jpg`、`preview_dark.jpg`、`preview_settings.jpg`、`preview_dialog.jpg`，无需修改链接。`preview_home.jpg` 保留为视觉规范文档中的早期首页演示。上传前请遮挡订阅地址、令牌和私人连接信息。

## 开始使用

1. 从[本仓库 Releases](https://github.com/mraz2766/clash_mraz/releases) 选择已手动发布的安装包；没有对应包时可自行构建。
2. Windows 双击安装 EXE，按向导完成安装。
3. 在“订阅”中导入自己的订阅或本地配置，然后在“代理”中选择节点。
4. 按需开启系统代理或 TUN；通过“连接”“规则”和“日志”查看运行状态。

项目不提供代理订阅。Windows 10 / 11 保留原生窗口控制与桌面交互；macOS 使用对应平台构建，尚未完成本轮改动的 macOS 实机验证。

## 本地构建

准备 Node.js、pnpm、Rust MSVC 工具链及 Visual Studio C++ 桌面构建环境。版本约束以 `package.json` 和 `rust-toolchain.toml` 为准，完整步骤见 [Windows 构建说明](docs/windows-build.md)。

```sh
pnpm install
pnpm dev
```

| 命令 | 用途 |
| --- | --- |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | 前端代码检查 |
| `pnpm test` | 现有单元测试与安装包脚本检查 |
| `pnpm knip:check` | 未使用代码检查 |
| `pnpm build:fast` | 快速构建 Windows 安装包并打开安装向导 |
| `pnpm build` | 正式配置构建安装包并打开安装向导 |
| `pnpm build:fast --no-open` | 生成安装包但不打开 |

安装包位置：**`releases/Clash_2.5.4_x64-setup.exe`**。版本号随项目版本变化；旧安装包正在使用时，新包使用时间戳后缀。打开向导不会自动完成安装。

`pnpm web:dev` 只启动前端，普通浏览器缺少 Tauri 原生能力，不会运行代理核心。

## GitHub 工作流与应用更新

本仓库采用本地构建、手动发布。工作流已移除定时、推送和 PR 自动触发，仅保留手动或复用入口；日常提交不需要云端打包。历史失败邮件对应已经执行过的任务，关闭工作流不会撤回旧邮件。

**GitHub 构建与应用内自动更新是两套机制。** 应用更新端点和签名校验仍沿用上游，自有签名更新流程尚未建立。使用定制版时，建议从本仓库手动安装，避免上游更新覆盖定制界面。

为兼容已有配置，内部可执行文件名、服务标识、数据目录与 URL 协议仍保留原项目标识。它们不是漏改的界面名称。

## 文档与致谢

- [使用说明与常见问题](docs/usage.md)
- [Windows 构建与安装流程](docs/windows-build.md)
- [视觉与交互规范](docs/ui-design.md)
- [Logo 与平台图标资源](docs/branding.md)
- [参与开发](CONTRIBUTING.md)

感谢 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)、[Clash Verge](https://github.com/zzzgydi/clash-verge) 和 [Mihomo](https://github.com/MetaCubeX/mihomo) 的作者及贡献者。交互参考 [Amicro](https://github.com/Subhan-code/Amicro--Micro-transitions-)，Logo 整理参考 [ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)，最终白鲸形象以用户提供的参考为基础。

沿用 [GPL-3.0-only](LICENSE) 许可证，保留上游版权、第三方归属与历史更新记录。
