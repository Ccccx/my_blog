# F-TODO 待办

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/todo/tool-todo` 的 todo_write 替换当前待办列表，并可允许多个进行中项。计划模式的提示要求不要用它来记录计划本身。

## code-harness

todo_write 用调用里的列表替换会话待办。右栏显示状态。计划模式的系统提示同样禁止用待办代替 exit_plan_mode。

## 差异

无额外妥协。
