# F-STORE 存储

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版会话日志按代保存为 JSONL，可选用 zstd。打开时选择最高代并沿迁移链升到当前逻辑格式。SQLite 只用于部分其他存储的 schema 版本。

## code-harness

一个 SQLite 文件保存工作区、会话、事件、插件配置、日程和作业尾部。事件只追加。工作区文件不入库。

## 差异

见 compat C6。没有分代文件，也没有迁移包。
