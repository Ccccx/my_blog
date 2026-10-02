# F-MCP MCP

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/mcp` 把外部 MCP 服务器的工具和资源接进工具表。

## code-harness

不连接 MCP 服务器，也不提供 list/read resource 工具。

## 差异

审查后改为实现。使用官方 Python mcp SDK，支持 stdio 与 HTTP，把外部工具登记进工具目录。
