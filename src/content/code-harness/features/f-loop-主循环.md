# F-LOOP 代理主循环

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版主循环在 `packages/core/agent-loop`。一个 turn 从认领输入开始，每一步组装提示和工具 schema，流式请求模型，执行工具，再决定是否进入下一步。`agent/pre-step`、`agent/request` 和 `tools/*` 是 waterfall。durable 事件写入会话日志，界面增量来自 `agent/assistant-stream`。

## code-harness

code-harness 的主循环只调用 provider 接口，不读取 PAI 环境变量，也不解析厂商报文。一轮里顺序执行 step：投影消息、收集当前模式的工具 schema、请求模型、按顺序执行工具、把结果写回日志。取消发生在步与步、工具与工具之间。

## 差异

结构对齐。同一步工具改为顺序执行，见 F-TOOL-ORDER。JSON 工具回退不在主循环里。
