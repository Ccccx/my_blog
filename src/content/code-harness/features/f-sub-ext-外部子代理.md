# F-SUB-EXT 外部子代理

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

standard 与 cordis preset 声明了 subagent_codex 和 subagent_claude_code，默认 disabled。启用后会把任务交给对应官方适配器。

## code-harness

工具目录里没有这两项，也不能通过配置指向本机的 codex 或 claude 可执行文件。

## 差异

见 compat C14。
