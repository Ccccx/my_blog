# F-UI-TERM 终端面板

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-sidebar-terminal` 和 `packages/terminal` 在右栏里开一个工作区 PTY。

## code-harness

右栏 Terminal 标签用 xterm 连接 `/api/terminal` 的 WebSocket，工作目录是当前工作区。Minimal 模式的持久 bash 仍由 F-MODE-MIN 覆盖。

## 差异

没有分屏和多标签终端。一个工作区一块终端。
