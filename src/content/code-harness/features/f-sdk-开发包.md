# F-SDK SDK

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/sdk`、`packages/bundle/sdk-app` 和 `packages/bundle/sdk-minimal` 让外部进程用 JSON-RPC 驱动同一套主循环。Python SDK 会拉起对应 profile。

## code-harness

不发布对等 SDK。命令行 `code-harness run` 只跑一轮任务，没有 JSON-RPC。

## 差异

见 compat C17。
