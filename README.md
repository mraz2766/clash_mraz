<p align="center">
  <img src="src/assets/image/mascot.png" width="96" alt="Clash" />
</p>

<h1 align="center">Clash</h1>

<p align="center">一个安静、清晰的 Windows 桌面代理客户端</p>

<p align="center">
  <a href="https://github.com/mraz2766/clash_mraz/releases">下载</a> ·
  <a href="docs/usage.md">使用说明</a> ·
  <a href="docs/windows-build.md">构建</a> ·
  <a href="docs/ui-design.md">设计规范</a>
</p>

<br />

| 浅色 | 深色 |
| --- | --- |
| ![浅色首页](docs/preview_light.jpg) | ![深色首页](docs/preview_dark.jpg) |

基于 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 二次开发，内核为 [Mihomo](https://github.com/MetaCubeX/mihomo)。保留原有的代理能力，重新整理了界面与安装体验。

## 特点

- **贴近 Windows 11**：系统默认强调色，4px 控件与 8px 卡片圆角，统一的开关与分段控件，浅色和深色同样自然。
- **首页即工作台**：系统代理、TUN 与代理模式放在最上方，实时速度、关注的代理组和流量趋势一屏可见，诊断信息按需展开。
- **状态一目了然**：选中的节点和页面带强调色竖条，切换中、延迟和失败都有明确反馈。
- **轻量常驻**：窗口隐藏到托盘时暂停界面刷新，页面按需加载，规则等大数据只在用到时读取。
- **键盘友好**：`Ctrl+,` 打开设置，`Ctrl+1–8` 切换页面，`Ctrl+B` 折叠侧栏；输入框和弹窗内不会被抢占。

<details>
<summary>更多截图</summary>
<br />

![设置](docs/preview_settings.jpg)

![网站出口查看](docs/preview_dialog.jpg)

</details>

## 开始使用

1. 从 [Releases](https://github.com/mraz2766/clash_mraz/releases) 下载安装包，没有对应版本时可以自行构建。
2. 运行安装程序，按向导完成安装。
3. 在「订阅」中导入订阅或本地配置，再到「代理」选择节点。
4. 按需开启系统代理或 TUN，在「连接」「规则」「日志」查看运行状态。

支持 Windows 10 / 11。本项目不提供代理订阅。

## 本地构建

需要 Node.js、pnpm、Rust MSVC 工具链和 Visual Studio C++ 桌面构建环境，版本以 `package.json` 与 `rust-toolchain.toml` 为准。

```sh
pnpm install
pnpm dev
```

| 命令 | 作用 |
| --- | --- |
| `pnpm build:fast` | 快速构建安装包并打开安装向导 |
| `pnpm build` | 以正式配置构建安装包 |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` | 类型检查、代码检查、单元测试 |

安装包输出到 `releases/`，例如 `Clash_2.6.0_x64-setup.exe`。加上 `--no-open` 只生成、不打开向导。完整步骤见 [Windows 构建说明](docs/windows-build.md)。

`pnpm web:dev` 只启动前端，普通浏览器里没有 Tauri 原生能力，也不会运行代理内核。

## 须知

- **发布**：本地构建、手动发布。GitHub 工作流只保留手动触发，日常提交不会触发云端打包。
- **更新**：应用内自动更新仍指向上游。请从本仓库手动安装新版本，避免定制界面被覆盖。
- **兼容**：为沿用已有配置和服务，内部的可执行文件名、服务标识、数据目录与 URL 协议保留原项目名称。
- **共存**：与上游版本共用内部标识，不能同时运行。
- **macOS**：在独立的 `clash-mac` 分支维护。

## 文档

- [使用说明与常见问题](docs/usage.md)
- [Windows 构建与安装](docs/windows-build.md)
- [视觉与交互规范](docs/ui-design.md)
- [Logo 与图标资源](docs/branding.md)
- [参与开发](CONTRIBUTING.md) · [更新日志](Changelog.md)

## 致谢

感谢 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)、[Clash Verge](https://github.com/zzzgydi/clash-verge) 与 [Mihomo](https://github.com/MetaCubeX/mihomo) 的作者和贡献者。交互动效参考 [Amicro](https://github.com/Subhan-code/Amicro--Micro-transitions-)，Logo 整理参考 [ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)。

以 [GPL-3.0-only](LICENSE) 许可发布，保留上游版权与第三方归属。
