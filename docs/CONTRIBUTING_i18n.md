# 翻译维护

Clash 继续使用原项目的多语言架构，当前维护文档以中文为准。

## 前端

语言文件位于 `src/locales/<语言>/`。命名空间与 `src/locales/en/` 保持一致，中文位于 `src/locales/zh/`。共用文案放在 `shared.json`，功能专用文案放在对应页面文件。

修改文案时保留键名、插值参数与数量形式，不通过直接重命名翻译键来改变行为。

```sh
pnpm i18n:check
pnpm i18n:format
pnpm i18n:types
pnpm typecheck
```

`i18n:format` 会修改语言文件，运行后检查 diff；生成类型位于 `src/types/generated/`，不要手工修改生成结果。

## 后端

原生翻译位于 `crates/clash-verge-i18n/locales/<语言>.yml`，与前端 JSON 分开维护。系统服务名称等技术标识需按实际对象描述，不能为了品牌统一而误称服务。

## 预览

使用 `pnpm dev` 验证桌面界面，检查长文字、窄窗口、按钮宽度和弹窗。文档中的演示截图不代表所有语言均已完成实机验证。
