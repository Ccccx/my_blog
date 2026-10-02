# F-SESSION 会话

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版会话是 append-only 事件日志，`packages/core/session` 负责内存存储，`packages/api/session-controller` 负责创建、恢复、发消息和跟随历史。列表不打开冷日志正文。

## code-harness

SQLite 保存会话头和事件。接口支持新建、按工作区列表、切换、读取历史、删除。提交消息后后台跑 turn，SSE 和 WebSocket 推送增量。刷新页面后从事件表恢复，不依赖内存。

## 差异

事件名对齐 `user/message`、`assistant/message`、`tool/call`、`tool/result`、`turn/start`、`turn/end`。物理格式见 F-STORE。
