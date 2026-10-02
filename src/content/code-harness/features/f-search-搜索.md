# F-SEARCH 搜索

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/fs/tool-fs-search` 用打包的 ripgrep 提供 glob 和 grep，并限制结果条数。

## code-harness

glob 用目录匹配，grep 用正则扫描文本文件，跳过 .git、node_modules 和缓存目录，结果有上限。

## 差异

不捆绑 ripgrep 二进制。按模式找文件、按正则找行，并跳过常见缓存目录。速度和忽略规则与 ripgrep 不完全相同，矩阵仍标 done，因为工具和界面路径已有用例。
