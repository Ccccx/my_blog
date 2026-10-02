# F-SPILL 超长输出落盘

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/spill` 在工具输出超过策略阈值时把正文写到磁盘，模型只看到路径和摘要。

## code-harness

超过阈值的工具结果写入 `CODE_HARNESS_HOME/spill/`，日志里保留摘要和 spill id。读取工具可以按 id 取回。

## 差异

无。
