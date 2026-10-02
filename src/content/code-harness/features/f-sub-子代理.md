# F-SUB 子代理

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/subagent` 定义子代理提供者。工具可以 spawn、fork、列出、发消息和打断。fork 复制到某个 turn 边界。子代理可以后台继续。

## code-harness

spawn 新建子会话并等待或后台运行。fork 复制父会话已有事件再继续。list_agents、send_message、interrupt_agent 只作用于当前会话的子代理。深度超过 2 会拒绝。

## 差异

没有外部产品提供者，那是 F-SUB-EXT。子代理工具集去掉再次 spawn、插件管理和日程写入，避免递归。
