# F-JOB 后台作业

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/jobs/jobs` 和 `packages/jobs/tool-jobs` 跟踪后台进程，提供列出和终止。Web 有 `packages/client/ui-jobs`。

## code-harness

bash 可以带 background 启动。job_list、job_output、job_kill 读取或结束这些进程。输出只保留尾部。

## 差异

作业跟本机进程，不跟远程沙箱。
