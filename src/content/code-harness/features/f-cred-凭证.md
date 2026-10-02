# F-CRED 凭证

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/credentials` 保存插件密钥和授权记录。本地提供者把它们放在 Harness home，而不是会话日志。

## code-harness

SQLite 里单独的 credentials 表，按插件 id 和名字存秘密。设置接口和日志都不回显秘密。插件通过内核服务读取。

## 差异

无。
