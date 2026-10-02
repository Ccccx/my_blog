# F-TOOL-ORDER 工具顺序

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版主循环可以把同一步返回的多个工具并行发出，再按各自完成情况写回结果。文档在 `packages/core/agent-loop`。

## code-harness

code-harness 按模型给出的顺序一个接一个执行。前一个工具的批准、失败或取消会挡住后一个开始。

## 差异

审查后改为按原版实现：只读工具并行，有副作用或需要批准的工具串行，结果按调用 id 写回日志。
