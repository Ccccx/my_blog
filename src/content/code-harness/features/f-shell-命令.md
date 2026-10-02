# F-SHELL Shell

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 Standard 模式使用一次性 bash（Windows 上是 pwsh），包在 `packages/shell/tool-bash`。命令在会话工作目录启动，输出有长度上限。

## code-harness

bash 工具在工作区 cwd 下执行命令，带超时，截断过长输出。可以后台运行并交给 F-JOB。

## 差异

不提供 pwsh。Minimal 模式的持久终端见 F-MODE-MIN，不属于这条一次性 bash。
