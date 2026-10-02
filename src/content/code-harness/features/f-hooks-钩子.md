# F-HOOKS 外部 hooks

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/hooks` 把 Claude Code 和 Codex 的 hooks.json 接到工具前后的拦截点上。

## code-harness

不读取这些 hooks 文件。插件可以注册内核 waterfall 来拦截工具。

## 差异

审查后改为读取 hooks.json，把 pre/post tool 映射到内核 waterfall。
