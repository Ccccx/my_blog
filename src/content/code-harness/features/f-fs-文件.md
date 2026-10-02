# F-FS 文件读写编辑

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/fs/tool-fs` 提供 read、write、edit，`packages/fs/tool-str-replace-editor` 提供按原文片段替换。读文件可以带行号和范围。写文件会创建父目录。

## code-harness

read 按行号返回片段。write 覆盖或创建文件。edit 要求 old_string 在文件中恰好出现一次，除非显式要求全部替换。路径默认限制在工作区内。

## 差异

无额外妥协。越界规则属于 F-SANDBOX。
