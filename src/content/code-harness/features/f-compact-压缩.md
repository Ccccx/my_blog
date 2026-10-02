# F-COMPACT 上下文压缩

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/compaction/compaction-basic` 在上下文变长时压缩历史。Standard preset 还把超长工具结果裁成头尾。`/compact` 一类命令由对应 command 插件提供。

## code-harness

compaction 插件启用时，投影阶段把过长工具结果裁成头尾，仍超限则丢掉最旧的非系统消息，保留系统提示和最近几条。`/compact` 立即改写已存的超长工具结果。

## 差异

不用模型做摘要。投影阶段把过长工具结果裁成头尾；仍超预算则丢掉最旧的非系统消息。`/compact` 改写已存的超长工具结果。
