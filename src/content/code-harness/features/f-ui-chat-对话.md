# F-UI-CHAT 对话页

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-conversation` 和 `packages/client/ui-chat` 渲染历史、流式助手文本、工具卡片和输入框。提交后本地先显示用户消息，再等待宿主事件对齐。

## code-harness

中栏渲染事件日志和当前轮的 live 文本。工具调用显示名称、参数和结果。输入框可以选择模式、权限和计划开关。发送后立刻出现用户气泡。

## 差异

不渲染原版的轨迹视图和消息反馈按钮。反馈属于未单列的 P2 省略，若验收需要再补矩阵行。
