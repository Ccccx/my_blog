# F-STATS 用量

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/session/session-stats` 汇总 token 和工具次数。

## code-harness

provider 若返回 usage，就记在助手事件上。会话页汇总 prompt、completion 和工具次数。

## 差异

无。供应商不返回 usage 时该轮记为零，并在界面标明缺失。
