# F-AUTH 本地鉴权

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/connection` 用启动 token 换 cookie，并检查 Host、Origin 和 sec-fetch-site，用来挡住 DNS rebinding 和跨站请求。

## code-harness

服务默认绑定 127.0.0.1。没有 token，也没有 cookie。

## 差异

审查后改为实现启动 token：`?token=` 换 HttpOnly cookie。只绑定 127.0.0.1 不能代替这一层。
