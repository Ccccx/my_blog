# F-PROMPT 系统提示

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/core/system-prompt` 把 persona、运行时上下文和工具 schema 收成模型可见的提示。提示变化会记入会话，以便从日志重建请求。

## code-harness

每次 step 生成一条系统消息：模式说明、工作区路径、模型名、计划模式段落、技能名单、用户插件工具名单，以及工作区里的 AGENTS.md 摘录。工具 schema 单独放在请求的 tools 字段。

## 差异

系统提示每次按当前状态重绘，不把系统节点的增量历史全部写入会话日志。这是实现上的简化，不单列妥协。矩阵状态为 done。
