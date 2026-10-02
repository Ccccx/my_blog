# F-REF 引用

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/context/file-reference`、`file-reference-local`、`session-reference` 和 `packages/client/ui-reference` 让输入框用 `@` 引用工作区文件和已有会话。

## code-harness

输入末尾的 `@` 弹出文件和会话菜单。发给模型的投影会展开 `@相对路径` 和 `@session:<id>`。路径必须留在工作区内。存进事件表的用户原文不改。

## 差异

不支持原版的更多引用类型，例如符号或网页。
