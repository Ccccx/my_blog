# F-SCHED 调度

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/schedule/schedule` 用显式时区创建、列出、更新和删除日程。到点后在工作区里开一次会话。界面在 `packages/client/ui-schedule`，侧栏入口文案是 Automation tasks。

## code-harness

日程存在 SQLite，带 `tz` 列。间隔按秒计算。cron 交给 `croniter`，时区交给 `zoneinfo`。支持月份名字、范围和星期范围。下次触发时间换算成 UTC 再写入。后台任务每两秒检查一次到期项，并新建会话运行提示。日程页可以填写 cron 表达式和 IANA 时区名。

## 差异

先前把「只有 UTC、五段星号」记成妥协 C21。那条已经撤回。当前实现覆盖时区和完整 cron，矩阵状态是 done。
