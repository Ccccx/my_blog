# F-GUARD 工具守卫

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/guard/timeout-policy` 限制工具时长。`packages/guard/repeat-tool-reminder` 在重复调用时提醒模型。

## code-harness

每个工具有超时。相同名字和参数在短窗口内重复出现时，结果前附加提醒，不阻断调用。

## 差异

无。
