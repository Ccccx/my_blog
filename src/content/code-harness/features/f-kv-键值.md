# F-KV 插件键值存储

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/storage` 给插件一块按域隔离的 KV。SQLite 实现在 `storage-sqlite`。

## code-harness

内核服务 `kv` 按插件 id 读写字符串。数据在 SQLite，插件卸载不自动删除，除非调用删除。

## 差异

无。
