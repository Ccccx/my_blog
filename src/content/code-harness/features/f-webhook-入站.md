# F-WEBHOOK Webhook

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/webhook/webhook` 按受信规则从外部请求创建工作区会话。

## code-harness

没有入站 webhook 路由。

## 差异

审查后改为提供一个 HTTP 端点，按规则创建会话并写入提示。
