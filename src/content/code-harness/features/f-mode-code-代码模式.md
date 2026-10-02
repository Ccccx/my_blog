# F-MODE-CODE Code 模式

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 ptc preset 与 standard 接近，但工具呈现走 PTC，运行时在 `packages/ptc-runtime`。工作流工具在该 preset 里默认禁用。

## code-harness

code 模式增加 run_code。模型写 Python，调用 tools.write、tools.bash 等同步包装。包装把调用送回主循环的工具执行器，因此权限仍然生效。

## 差异

见 compat C9。没有隔离进程。
