# F-INSPECT 运行时检查

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

Creator preset 挂 `@deepseek-ai/dsh-tool-cordis`，模型可以列出和查询 Loader 里的插件与配置，但不远程调用方法。

## code-harness

inspect 返回当前 Context 的服务名、工具名和模式列表。它是只读的。

## 差异

看不到 npm 包目录和 Cordis 配置行的 YAML。
