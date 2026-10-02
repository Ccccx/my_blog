# F-SANDBOX 沙箱

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/sandbox/sandbox` 和 `packages/sandbox/sandbox-local` 在启动进程前施加 Landlock、Seatbelt 或 Windows ACL。文件系统和 shell 共享这个执行世界。

## code-harness

工具在解析路径时要求目标位于工作区根之内，除非会话权限是 full。符号链接写出会被拒绝。shell 没有系统调用过滤。

## 差异

见 compat C8。
