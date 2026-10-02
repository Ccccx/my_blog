# F-UI-APPROVAL 批准

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-approval` 在对话里呈现待批准的工具调用，用户允许或拒绝。计划审查使用同类通道。

## code-harness

当权限需要询问时，中栏出现工具名和参数，以及允许、拒绝。计划批准单独显示 Markdown。

## 差异

一次处理队列中的第一项，不实现批量策略编辑器。
