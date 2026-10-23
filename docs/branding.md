# 品牌与图标

显示名称统一为 **Clash**。Logo 为「环流」：一个开口的圆环，加一个停在缺口里的节点，表达“连接正在经过”。单色几何线条、圆头描边、无渐变与阴影，以 Windows 11 默认强调色 `#005FB8` 绘制在白色圆角底板上。

## 设计规格

矢量原稿位于 `design/logo/`：`clash-orbit.svg` 为带底板的应用图标，`clash-orbit-mark.svg` 为不带底板、继承 `currentColor` 的图形；`concepts.html` 保留三个候选方案的对比。

以画布边长为 1 计：

| 版本 | 圆环半径 | 描边 | 缺口（逆时针，自 3 点钟方向） | 节点半径 | 用于 |
| --- | --- | --- | --- | --- | --- |
| 标准 | 0.286 | 0.073 | 20°–70° | 0.054 | 48px 及以上、README、侧栏 |
| 小尺寸 | 0.29 | 0.10 | 5°–85° | 0.10 | 32px 及以下 |
| 托盘 | 0.30 | 0.11 | 5°–85° | 0.10 | 托盘 |

底板为全幅圆角方形，圆角为边长的 22.17%，48px 及以上带 `#E3E3E1` 细描边，在白色背景上仍有边界。小尺寸加宽缺口、放大节点，16px 下节点不会与圆环端点粘连。

## 生成

运行 `python scripts/generate-icons.py`（需要 Pillow）重建全部资源。脚本按上表几何直接绘制，每个尺寸单独以 4 倍超采样渲染后缩小，ICO 的每一帧都是对应尺寸的独立渲染，而不是同一张大图缩放。

## 资源映射

| 用途 | 文件 |
| --- | --- |
| README 与文档 | `src/assets/image/logo.png`（1024px） |
| 侧栏品牌图 | `src/assets/image/brand-icon.png`（128px） |
| 浏览器图标 | `src/assets/image/logo.ico` |
| Windows 应用、安装器与快捷方式 | `src-tauri/icons/icon.ico` |
| macOS 应用 | `src-tauri/icons/icon.icns` |
| 通用尺寸与 Windows 磁贴 | `src-tauri/icons/*.png` |
| 普通托盘 | `src-tauri/icons/tray-icon.ico`，蓝色节点 |
| 系统代理托盘 | `src-tauri/icons/tray-icon-sys.ico`，绿色圆形节点 |
| TUN 托盘 | `src-tauri/icons/tray-icon-tun.ico`，紫色方形节点 |
| macOS 单色托盘 | `tray-icon-*-mono*.ico`，黑色图形；系统代理为空心圆、TUN 为空心方形 |

托盘的状态只由缺口里的节点表达：形状区分系统代理（圆）与 TUN（方），颜色辅助辨认，圆环保持不变。彩色托盘带白色底板，在浅色与深色任务栏上都清晰。单色版本只在 macOS 使用。托盘 PNG 原稿在 `src/assets/image/tray-*.png`。用户自定义托盘图标的优先级保持原样。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错。

## 保留的内部名称

`clash-verge` 可执行文件、系统服务、应用标识、配置目录、协议和历史迁移字符串保留兼容性。原作者、第三方依赖和历史记录中的名称保留真实归属。

界面导航使用 `src/assets/image/brand-icon.png`（128×128），1024px 的 `logo.png` 只用于 README 与文档，避免导航加载大图。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。从 RGB 原稿转换时，先转为 RGBA 再写入 ICO。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错再次出现。

macOS 的产品名覆盖项同步为 Clash；DMG 使用系统默认背景。原生窗口初始标题、托盘提示、系统通知和界面文案也统一使用 Clash。

Windows 安装时使用带版本号的独立 ICO 刷新本应用的既有快捷方式图标，避免 Explorer 继续显示旧缓存；安装目录、EXE 名称和用户数据目录不变。
