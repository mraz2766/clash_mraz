# 品牌与图标

显示名称统一为 **Clash**。Logo 为像素风「环流」：16×16 像素网格上一个开口的圆环，加一个停在缺口里的节点，表达“连接正在经过”。单色、无抗锯齿、无渐变与阴影。应用图标为强调色 `#005FB8` 底板配白色像素；托盘为白色底板配强调色像素。

## 设计规格

像素原稿与三个像素方案的对比在 `design/logo/pixel-concepts.html`，网格定义同时写在 `scripts/generate-icons.py` 的 `RING` 与 `NODES` 中。此前的矢量版「环流」（`clash-orbit.svg`、`concepts.html`）保留在同一目录供参考。

- 圆环按像素圆规则栅格化：外半径 6.2、内半径 4.0 格，右上 12°–78° 开口，占用第 2–13 行、列。
- 节点与圆环两端各留至少 1 格空隙：普通为 2×2，系统代理为 3×3 十字（像素化的圆），TUN 为 3×3 方块。
- 每个尺寸只用整数倍放大：一个设计像素对应 k×k 个屏幕像素并居中，k = ⌊尺寸 × 0.78 ÷ 12⌋。任何尺寸都不会出现模糊或粗细不一的像素；只有圆角底板做抗锯齿，圆角为边长的 22.17%。
- 侧栏以 32px 显示，并提供 32 / 48 / 64px 三张精确渲染（`srcset` 1x / 1.5x / 2x），在 100%、150%、200% 缩放下每个设计像素正好落在 2、3、4 个屏幕像素上。

## 生成

运行 `python scripts/generate-icons.py`（需要 Pillow）重建全部资源。ICO 的每一帧都是对应尺寸的独立渲染，而不是同一张大图缩放。

## 资源映射

| 用途 | 文件 |
| --- | --- |
| README 与文档 | `src/assets/image/logo.png`（1024px） |
| 侧栏品牌图 | `src/assets/image/brand-icon@1x.png`、`@1.5x`、`@2x`（32 / 48 / 64px） |
| 浏览器图标 | `src/assets/image/logo.ico` |
| Windows 应用、安装器与快捷方式 | `src-tauri/icons/icon.ico` |
| macOS 应用 | `src-tauri/icons/icon.icns` |
| 通用尺寸与 Windows 磁贴 | `src-tauri/icons/*.png` |
| 普通托盘 | `src-tauri/icons/tray-icon.ico`，蓝色 2×2 节点 |
| 系统代理托盘 | `src-tauri/icons/tray-icon-sys.ico`，绿色十字节点 |
| TUN 托盘 | `src-tauri/icons/tray-icon-tun.ico`，紫色方块节点 |
| macOS 单色托盘 | `tray-icon-*-mono*.ico`，黑色像素，节点形状同上 |

托盘的状态只由缺口里的节点表达：形状区分系统代理（十字）与 TUN（方块），颜色辅助辨认，圆环保持不变。彩色托盘带白色底板，在浅色与深色任务栏上都清晰。单色版本只在 macOS 使用。托盘 PNG 原稿在 `src/assets/image/tray-*.png`。用户自定义托盘图标的优先级保持原样。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错。

## 保留的内部名称

`clash-verge` 可执行文件、系统服务、应用标识、配置目录、协议和历史迁移字符串保留兼容性。原作者、第三方依赖和历史记录中的名称保留真实归属。

界面导航使用 32 / 48 / 64px 的 `brand-icon@*.png`，1024px 的 `logo.png` 只用于 README 与文档，避免导航加载大图。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。从 RGB 原稿转换时，先转为 RGBA 再写入 ICO。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错再次出现。

macOS 的产品名覆盖项同步为 Clash；DMG 使用系统默认背景。原生窗口初始标题、托盘提示、系统通知和界面文案也统一使用 Clash。

Windows 安装时使用带版本号的独立 ICO 刷新本应用的既有快捷方式图标，避免 Explorer 继续显示旧缓存；安装目录、EXE 名称和用户数据目录不变。
