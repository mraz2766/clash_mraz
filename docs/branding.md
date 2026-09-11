> Mac 分支 2.9.1：统一使用蓝白绒毛海豚的上半身特写。Mac 应用不打包 Windows 安装器。

# 品牌资源

## 名称与形象

显示名称统一为 **Clash**。Logo 采用用户提供的蓝白绒毛海豚：深蓝身体、奶白腹部、黑色眼睛与红色笑嘴，保留圆润额头、短吻、背鳍和双侧胸鳍。

未裁圆角的高清原稿位于 `src/assets/image/mascot-source.png`，最终展示图位于 `src/assets/image/mascot.png`，均为 1254×1254 像素。内置 imagegen 仅按用户要求将参考图重构为上半身近景，保留原有材质与配色；随后由仓库脚本派生 ICO、ICNS 和各尺寸 PNG。

最终 `mascot.png` 使用透明圆角，半径为边长的 22%。运行 `python scripts/round-icons.py`（需要 Pillow）可重建界面 PNG、通用尺寸 PNG、ICO、ICNS、彩色托盘图标与 macOS 单色模板图标。脚本只负责裁切和格式派生，不重绘海豚。

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

## 生成提示词记录

使用内置 imagegen，未使用外部 API 或下载字体。主提示词含义：严格参考用户提供的蓝白绒毛海豚，保留绒面纤维、奶白腹部、黑眼睛、红色嘴部和友好表情；将海豚放大为头部与上半身特写，允许裁去下半身和尾部，方形近白背景，无文字和多余装饰。

托盘提示词：使用同一白鲸轮廓生成透明背景黑色剪影；普通状态无标记，系统代理增加右上圆环，TUN 增加右上方形标记。彩色版本分别使用蓝色圆形和绿色方形。

最终形象直接以用户选定的参考图为准，不采用扁平化 IP Logo 方案。

## 保留的内部名称

`clash-verge` 可执行文件、系统服务、应用标识、配置目录、协议和历史迁移字符串保留兼容性。原作者、第三方依赖和历史记录中的名称保留真实归属。

界面导航使用 `src/assets/image/brand-icon.png`（128×128），高清 `mascot.png` 仅用于文档和图标原稿，避免导航加载完整原图。

ICO 编码要求：内嵌 PNG 必须使用 RGBA（PNG color type 6）。从 RGB 原稿转换时，先转为 RGBA 再写入 ICO。`pnpm test` 会检查全部应用与托盘 ICO 的每个图像帧，防止 Tauri 解码报错再次出现。

macOS 的产品名覆盖项同步为 Clash；DMG 使用系统默认背景，不再显示旧项目的猫图标与名称。原生窗口初始标题、托盘提示、系统通知和界面文案也统一使用 Clash。
