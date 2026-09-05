# 参与开发

本仓库是 Clash Verge Rev 的个人二次开发版本，主要维护中文文档、桌面界面、品牌资源和本地构建体验。

## 环境与启动

1. 安装 Node.js、pnpm、Rust，以及 Tauri 对应平台的系统依赖。版本要求以 `package.json` 和 `rust-toolchain.toml` 为准。
2. Windows 使用 Visual Studio 2022 Build Tools 的 C++ 桌面开发工作负载和 MSVC 工具链。ARM64 还需 LLVM/Clang。
3. 运行 `pnpm install`，然后运行 `pnpm dev` 启动桌面开发环境。
4. 单独调试前端可用 `pnpm web:dev`；普通浏览器缺少原生能力，需要演示数据或 Tauri mock。

完整步骤见 [Windows 构建说明](docs/windows-build.md)。

## 修改范围

- 外观与交互优先复用 React、MUI、CSS 和现有状态管理。
- 色彩使用主题 Token，动效使用 `src/lib/motion.ts`，避免各组件任意定义时长。
- 保留原有操作入口、快捷键、排序、虚拟列表和窗口行为。
- 修改核心、订阅、系统代理、TUN 或配置格式必须作为独立功能变更说明，不能混入视觉调整。
- 应用显示名可调整；服务名、数据目录、协议和升级迁移标识不能全局搜索替换。

## 检查与提交

```sh
pnpm typecheck
pnpm test
pnpm knip:check
pnpm lint
```

提交前查看 `git diff`，只提交本次修改。Husky 会执行原有检查；缺少命令时修复工具路径，不删除 hook。国际化修改按照[翻译维护指南](docs/CONTRIBUTING_i18n.md)刷新类型。

UI 修改应检查浅色/深色、窄窗口、长文本、键盘焦点和减少动态效果。真实网络连接、系统代理、TUN 与安装升级验证需要桌面环境。

## 构建与发布

本地使用 `pnpm build:fast` 或 `pnpm build`；生成的 Windows EXE 可直接从 `releases/` 取用。安装向导自动打开，但不会静默安装。前端构建 `pnpm web:build` 不会递归触发原生编译。

现有自动更新端点和公钥属于上游。本轮未修改更新业务逻辑。正式启用自有自动更新前，需要建立自己的签名密钥、更新清单与发布流水线，并验证升级与回滚。不要把本地未签名 EXE 当作已经可用的自动更新产物。

原生内部标识保留意味着本分支与原版共享部分配置、服务和单实例行为。发布完全独立安装版本需要单独设计数据迁移。

## 版权

保留 GPL-3.0-only 许可证、原作者归属以及依赖许可。`Changelog.md` 与 `docs/Changelog.history.md` 中的原有记录属于上游历史，不作为本分支新功能清单。
