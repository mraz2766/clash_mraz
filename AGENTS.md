# Clash for Mac

- 当前分支 `clash-mac` 专用于 macOS。不要将 Windows 界面、安装器或发布流程重新加回本分支；Windows 版本在 main。
- 保留用户优化后的白鲸 Logo、圆角图标和品牌资源；Mac 界面采用系统字体、原生窗口按钮、暖白与 Logo 蓝灰、深色石墨黑、克制的玻璃质感，并验证浅色和深色模式。
- 每次交付迭代必须递增版本号，同步 package.json、src-tauri/tauri.conf.json、src-tauri/Cargo.toml 和 Cargo.lock，更新 Changelog 与受影响文档。
- 完成版本后生成可运行的 .app，按用户要求安装到 /Applications/Clash for Mac.app。保留已有应用备份和用户配置。
- 运行合适的检查并实机验证后再报告完成。本地 ad hoc 签名不等于 Apple Developer ID 公证。
- 不启用上游自动更新覆盖 Mac 定制版。

- Mac 版独立标识与配置目录为 io.github.mraz.clash.mac；不得改回旧版共享目录，不覆盖已有订阅与设置。
