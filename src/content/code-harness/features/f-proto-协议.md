# F-PROTO 宿主协议

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

浏览器经 `packages/client/connection` 把一元 RPC 发到 `/api`。流由 `packages/api/gateway` 在 `/api/remote.mux` 上多路复用，帧定义在 `packages/api/gateway/src/stream-protocol.ts`。HTTP 服务器本身在 `packages/host/webserver`，只做路由表。

## code-harness

FastAPI 提供 REST 资源，以及同一会话事件的 SSE 和 WebSocket。事件类型使用会话日志的名字。静态页面由后端托管 frontend/dist。

## 差异

见 compat C3。没有 Typert 描述符、二进制附件和代际重连修复。
