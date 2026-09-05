# Clash

<p align="center"><img src="src/assets/image/mascot.png" width="112" alt="Clash 小白鲸 Logo" /></p>

一个简洁、柔和、注重效率的桌面代理管理工具。基于 **Clash Verge Rev** 二次开发，使用 React、Material UI 与 Tauri，保留 Mihomo 内核和原有代理管理能力。

[下载安装](https://github.com/mraz2766/clash_mraz/releases) · [使用说明](docs/usage.md) · [Windows 构建](docs/windows-build.md) · [参与开发](CONTRIBUTING.md)

## 这一版有什么不同

- **适合桌面的 Material 风格**：柔和的浅色与深色主题、语义色彩、清晰的导航与设置分区。
- **高效的信息布局**：节点默认列表、连接与规则保留表格和虚拟滚动，避免密集的大卡片。
- **克制的交互反馈**：导航选中滑动、按钮轻压、页面淡入、弹窗与菜单短过渡；尊重系统“减少动态效果”。
- **统一品牌**：使用你提供的小白鲸形象，应用名称为 `Clash`。
- **方便的本地打包**：Windows 构建成功后将 EXE 复制到 `releases/`，并打开安装向导。

## 界面预览

![首页主要卡片，演示数据](docs/preview_home.jpg)

以下截图使用实际前端组件和演示数据生成，不包含私人订阅或真实连接信息。

| 浅色模式 | 深色模式 |
| --- | --- |
| ![浅色节点列表](docs/preview_light.jpg) | ![深色节点列表](docs/preview_dark.jpg) |

## 安装与使用

1. 从本仓库 Releases 下载与你的平台和架构匹配的安装包。尚未发布时可以自行构建。
2. Windows 双击 `Clash_*_x64-setup.exe`，按安装向导完成安装。
3. 在“订阅”中添加自己的订阅或本地配置，选择需要使用的订阅。
4. 在“代理”中选择节点，需要时执行延迟测试。
5. 按自己的使用需求开启系统代理或 TUN；连接、规则和日志页面用于查看当前状态。

项目不提供代理订阅。macOS 使用对应平台构建的应用；本次 Windows 构建并不代表已完成 macOS 实机验证。

## 本地开发

```sh
pnpm install
pnpm dev
```

前端预览：`pnpm web:dev`。桌面能力需要 Tauri 环境，普通浏览器不会启动代理核心。

```sh
pnpm typecheck
pnpm test
pnpm knip:check
pnpm build:fast
```

最后一条命令会生成 Windows EXE，并在成功后打开安装向导。对外可取用的文件位于根目录的 **`releases/`**，无需进入多层 `target` 目录。只想生成而不打开时运行 `pnpm build:fast --no-open`。

## 兼容与边界

本轮优化聚焦界面、交互、品牌和本地构建体验。保留代理核心、订阅解析、系统代理、TUN、测速、配置格式及窗口控制逻辑。为兼容已有安装，内部可执行文件名、服务标识、URL 协议和配置目录仍沿用原项目标识；这些并非界面品牌遗漏。

自动更新仍沿用原项目的更新配置与签名校验。自有签名发布流程尚未建立；使用本分支时，建议从本仓库 Releases 手动安装，避免自动更新覆盖定制界面。详见[开发与发布说明](CONTRIBUTING.md)。

## 文档

- [使用说明与常见问题](docs/usage.md)
- [Windows 构建与安装包位置](docs/windows-build.md)
- [视觉与交互规范](docs/ui-design.md)
- [品牌资源与生成说明](docs/branding.md)
- [翻译维护](docs/CONTRIBUTING_i18n.md)

## 致谢与许可

本项目基于 [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)，继承 [Clash Verge](https://github.com/zzzgydi/clash-verge) 的工作，并使用 [Mihomo](https://github.com/MetaCubeX/mihomo)。感谢原作者及贡献者。

交互设计参考 [Amicro](https://github.com/Subhan-code/Amicro--Micro-transitions-) 的短过渡思路；Logo 简化原则参考 [ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)，最终形象以用户提供的参考图为准。

代码继续使用 [GPL-3.0-only](LICENSE) 许可证。上游历史更新记录和第三方版权归属保留，不将原项目成果表述为本项目原创。
