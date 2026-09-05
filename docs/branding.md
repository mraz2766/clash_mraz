# 品牌资源

## 名称与形象

显示名称统一为 **Clash**。Logo 采用用户提供的奶油白小白鲸、灰蓝背景，保留圆润额头、短吻、微笑和简化鳍部。

原稿位于 `src/assets/image/mascot.png`，1254×1254 像素。由内置 imagegen 根据用户参考图重绘整理，再通过 Tauri 图标工具生成 ICO、ICNS 和各尺寸 PNG。没有将低分辨率截图直接放大后当作高清资源。

## 资源映射

| 用途 | 文件 |
| --- | --- |
| 界面与 README 原稿 | `src/assets/image/mascot.png` |
| 浏览器图标 | `src/assets/image/logo.ico` |
| Windows 应用与安装程序 | `src-tauri/icons/icon.ico` |
| macOS 应用 | `src-tauri/icons/icon.icns` |
| Linux / 通用图标 | `src-tauri/icons/*Logo.png` 与尺寸 PNG |
| 普通托盘 | `src-tauri/icons/tray-icon.ico` |
| 系统代理托盘 | `src-tauri/icons/tray-icon-sys.ico`，蓝色圆形标记 |
| TUN 托盘 | `src-tauri/icons/tray-icon-tun.ico`，绿色方形标记 |
| macOS 单色托盘 | 对应 `tray-icon-*-mono*.ico`，圆环与方形区分状态 |

托盘 PNG 原稿在 `src/assets/image/tray-*.png`。所有 ICO 都包含多个尺寸；这些转换只调整文件规格，不改变代理状态判定。用户自定义托盘图标优先级保持原样。

旧 Apple Icon Composer 的 `Assets.car` 已停止引用，macOS 使用更新后的标准 ICNS，避免旧猫形象覆盖新图标。

## 生成提示词记录

使用内置 imagegen，未使用外部 API 或下载字体。主提示词含义：忠实重绘用户参考中的奶油白小白鲸，朝右、圆润额头与短吻、微笑、左下方简化鳍，灰蓝背景；去除截图外框，输出不透明方形高清 PNG，无文字和多余装饰。

托盘提示词：使用同一白鲸轮廓生成透明背景黑色剪影；普通状态无标记，系统代理增加右上圆环，TUN 增加右上方形标记。彩色版本分别使用蓝色圆形和绿色方形。

图形简化思路参考 [ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)。最终形象以用户选定的参考图为准，未采用此前探索的企鹅方向。

## 保留的内部名称

`clash-verge` 可执行文件、系统服务、应用标识、配置目录、协议和历史迁移字符串保留兼容性。原作者、第三方依赖和历史记录中的名称保留真实归属。

界面导航使用 `src/assets/image/brand-icon.png`（128×128，约 14 KB），高清 `mascot.png` 仅用于文档和图标原稿，避免导航加载约 1 MB 的原图。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。从 RGB 原稿转换时，先转为 RGBA 再写入 ICO。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错再次出现。

macOS 的产品名覆盖项同步为 Clash；DMG 使用系统默认背景，不再显示旧项目的猫图标与名称。原生窗口初始标题、托盘提示、系统通知和界面文案也统一使用 Clash。
