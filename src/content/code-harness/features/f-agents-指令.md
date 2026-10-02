# F-AGENTS 指令与环境上下文

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/context/agent-instructions` 读取工作区里的 `AGENTS.md` 和 `CLAUDE.md`。`time-context` 和 `tmux-context` 把当前时间和 tmux 会话放进系统提示。

## code-harness

每一轮把 UTC 时间、`tmux ls` 的结果（失败则省略），以及工作区或数据目录里的 `AGENTS.md` / `CLAUDE.md` 追加到系统提示。单文件最多 8000 字。

## 差异

时间只用 UTC。tmux 只列会话名，不注入窗格内容。
