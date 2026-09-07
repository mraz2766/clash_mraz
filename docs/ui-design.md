# Clash for Mac 视觉与交互

2.7.1 使用用户最终选定的暖白与 Logo 蓝灰，深色模式为石墨黑，保留白鲸形象。

| 语义 | 浅色 | 深色 |
| --- | --- | --- |
| 工作区 | #F7F5F2 | #1D1F21 |
| 内容表面 | #FFFDFC | #272A2D |
| 主操作 | #526B80 | #AAC2D4 |
| 成功与连接 | #318575 | #89C8B7 |
| 主要文字 | #28343D | #EFF2F4 |

视觉主张：暖色纸面承载信息，蓝灰建立操作层次，玻璃集中在导航与浮层。内容顺序为网络控制、订阅与节点、流量趋势、辅助诊断。网络控制合并为连续区域，其他模块弱化边框和阴影。

交互主张：导航指示器连续位移，页面短距离进入，按钮轻压反馈。动画服务于状态变化，不添加持续旋转的装饰或额外 WebGL 负担。减少动态效果时关闭位移；减少透明度时使用实色表面。原生红黄绿按钮保留系统行为。

参考 [BoardUI](https://www.boardui.com/) 的工作区层次、[beUI](https://beui.dev/) 的控件反馈、[Fluid Functionalism](https://www.fluidfunctionalism.com/) 的功能动效，以及 [HeroUI Pro](https://heroui.pro/) 的表面组织。也考察了 [ThreeUI](https://threeui.com/) 与 [Watermelon UI](https://ui.watermelon.sh/)，采用克制的材质与状态反馈，不复制商业组件源码。

`src/pages/_theme.tsx` 管理语义色；`src/assets/styles/macos.scss` 管理 Mac 材质与导航；`src-tauri/src/utils/resolve/window.rs` 管理原生窗口。
