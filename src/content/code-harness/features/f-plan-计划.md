# F-PLAN 计划模式

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/plan/plan-mode` 在计划模式里禁止真正改仓库。模型用只读工具调查，然后调用 exit_plan_mode 提交以标题开头的 Markdown。用户批准后才离开计划模式。口头同意不算批准。

## code-harness

会话有 plan_mode 开关。开启时 schema 仍包含写文件和 shell，但执行前直接拒绝变更工具。exit_plan_mode 把计划交给界面，批准后关闭计划模式并保存正文。

## 差异

无额外妥协。拒绝发生在执行前，不把工具从 schema 里拿掉，以免和原版的缓存稳定性考虑相反。
