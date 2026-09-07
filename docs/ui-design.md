# Clash for Mac 视觉与交互

2.8.2 使用用户最终选定的整体米白色，深色模式为暖炭黑，保留白鲸形象。

| 语义 | 浅色 | 深色 |
| --- | --- | --- |
| 工作区 | #FAF9F5 | #242321 |
| 内容表面 | #FFFEFA | #2D2C28 |
| 主操作 | #6F685E | #D4CFC3 |
| 成功与连接 | #677953 | #B0C09B |
| 主要文字 | #37342F | #F4F1EA |

视觉主张：暖色纸面承载信息，浅米白层次与深暖灰建立操作层次，玻璃集中在导航与浮层。首页先显示两种连接开关与路由模式；流量指标、趋势图和当前节点并列为主工作区；订阅详情以横向信息行呈现。网站测试、IP 与系统信息收进默认折叠的诊断区，展开时才挂载请求组件。窄窗口自动改为单列。

交互主张：导航指示器连续位移，页面短距离进入，按钮轻压反馈。动画服务于状态变化，不添加持续旋转的装饰或额外 WebGL 负担。减少动态效果时关闭位移；减少透明度时使用实色表面。原生红黄绿按钮保留系统行为。

参考 [BoardUI](https://www.boardui.com/) 的工作区层次、[beUI](https://beui.dev/) 的控件反馈、[Fluid Functionalism](https://www.fluidfunctionalism.com/) 的功能动效，以及 [HeroUI Pro](https://heroui.pro/) 的表面组织。也考察了 [ThreeUI](https://threeui.com/) 与 [Watermelon UI](https://ui.watermelon.sh/)，采用克制的材质与状态反馈，不复制商业组件源码。

`src/pages/_theme.tsx` 管理语义色；`src/assets/styles/macos.scss` 管理 Mac 材质与导航；`src-tauri/src/utils/resolve/window.rs` 管理原生窗口。
