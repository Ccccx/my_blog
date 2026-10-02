# F-CHECKPOINT 检查点

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/session/session-checkpoint-policy` 在轮次边界保留可回退的位置。

## code-harness

用户可以把当前 seq 标成检查点。回退会把会话事件截到该 seq，并保留被撤下的事件副本以便查看。工作区文件不自动还原。

## 差异

文件回滚不在这条里。检查点只覆盖会话日志。若原版同时回滚文件，实现时再决定是否升成妥协。
