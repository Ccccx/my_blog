# F-MODE-MIN Minimal 模式

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

minimal preset 几乎只保留持久 shell，说明在 `packages/bundle/web-app/presets/minimal.patch.yml`。终端实现依赖 PTY。

## code-harness

minimal 只把 bash 和作业工具放进目录。会话记录 shell_cwd，每次命令先进入该目录，结束后用 pwd 更新。

## 差异

审查后不再把持久终端标成妥协。Linux 上用 pty，前端用 xterm.js。PowerShell 仍是 F-PWSH / compat C18。
