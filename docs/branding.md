> Mac 分支 2.9.7：统一使用黑色线稿白鲸与浅蓝水花。Mac 应用不打包 Windows 安装器。

# 品牌资源

## 名称与形象

显示名称统一为 **Clash**。Logo 直接采用用户提供的白鲸原图：中性黑线勾勒圆润鲸身，浅蓝水花作为唯一彩色点缀，近白背景与 Mac 双白界面协调。

用户提供的 1254×1254 原图原样保存在 `src/assets/image/mascot-source.png`。最终展示图位于 `src/assets/image/mascot.png`：生成脚本只检测主体边界、裁去大块近白留白并等比放大，不重绘白鲸，也不改变线条与配色；随后再派生 ICO、ICNS 和各尺寸 PNG。

最终 `mascot.png` 使用透明圆角，半径为边长的 22%。运行 `python scripts/round-icons.py`（需要 Pillow）可重建界面 PNG、通用尺寸 PNG、ICO、ICNS、彩色托盘图标与 macOS 单色模板图标。脚本只负责裁切和格式派生。

## 资源映射

| 用途 | 文件 |
| --- | --- |
| 界面与 README 原稿 | `src/assets/image/mascot.png` |
| 浏览器图标 | `src/assets/image/logo.ico` |
| macOS 应用 | `src-tauri/icons/icon.icns` |
| 通用尺寸 | `src-tauri/icons/32x32.png`、`64x64.png`、`128x128.png`、`128x128@2x.png` 与 `icon.png` |
| 普通托盘 | `src-tauri/icons/tray-icon.ico` |
| 系统代理托盘 | `src-tauri/icons/tray-icon-sys.ico`，蓝色圆形标记 |
| TUN 托盘 | `src-tauri/icons/tray-icon-tun.ico`，绿色方形标记 |
| macOS 单色托盘 | 对应 `tray-icon-*-mono*.ico`，圆环与方形区分状态 |

托盘 PNG 原稿在 `src/assets/image/tray-*.png`。所有 ICO 都包含多个尺寸；这些转换只调整文件规格，不改变代理状态判定。用户自定义托盘图标优先级保持原样。

旧 Apple Icon Composer 的 `Assets.car` 已停止引用，macOS 使用更新后的标准 ICNS，避免旧猫形象覆盖新图标。

## 图像处理记录

本版未使用图像生成工具、外部 API 或下载字体，最终形象直接以用户提供的参考图为准。脚本按近白背景与主体的色差计算裁切边界，保留 10% 安全边距后放大为正方形，再生成圆角资源。

菜单栏模板图标使用同一白鲸轮廓生成透明背景剪影：普通状态无标记，系统代理增加右上圆环，TUN 增加右上方形标记。彩色版本分别使用蓝色圆形和绿色方形。

## 保留的内部名称

`clash-verge` 可执行文件、系统服务、应用标识、配置目录、协议和历史迁移字符串保留兼容性。原作者、第三方依赖和历史记录中的名称保留真实归属。

界面导航使用 `src/assets/image/brand-icon.png`（128×128），高清 `mascot.png` 仅用于文档和图标原稿，避免导航加载完整原图。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。从 RGB 原稿转换时，先转为 RGBA 再写入 ICO。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错再次出现。

macOS 的产品名覆盖项同步为 Clash；DMG 使用系统默认背景，不再显示旧项目的猫图标与名称。原生窗口初始标题、托盘提示、系统通知和界面文案也统一使用 Clash。
