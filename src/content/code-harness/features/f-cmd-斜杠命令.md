# F-CMD 斜杠命令

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/interaction/commands` 和 `packages/client/ui-commands` 在输入框里提供 `/` 菜单。`command-compact`、`command-goal`、`command-feedback` 分别压缩工具结果、设置会话目标、给上一轮点赞或点踩。

## code-harness

输入以 `/` 开头时弹出命令菜单。`/compact`、`/goal`、`/feedback up|down`、`/help` 在主循环调用模型之前执行。用户消息仍按原文保存。

## 差异

命令集是这四条。原版命令插件还可以继续注册别的名字，这里没有动态命令注册表。
