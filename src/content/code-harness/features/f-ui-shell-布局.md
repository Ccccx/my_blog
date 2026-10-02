# F-UI-SHELL 界面布局

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版入口 `apps/web/src/main.ts` 启动 React 壳。`packages/client/ui-layout` 是三栏：左栏约 280px，中栏是对话，右栏是停靠面板。窄屏时左栏折成轨道。面板切换不是 react-router 的 URL 表。

## code-harness

frontend 使用 Vite、React 18 和 TypeScript。同样是左栏、中栏、右栏。左栏切换对话、插件、日程和设置。不引入另一套路由库。

## 差异

不实现 macOS 交通灯避让和 Windows 标题栏。那是桌面壳的一部分。
