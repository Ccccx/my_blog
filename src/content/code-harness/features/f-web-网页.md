# F-WEB 网页工具

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/web/tool-web` 提供搜索和抓取，超时可配置。搜索后端由部署配置。

## code-harness

web_search 查询 DuckDuckGo。web_fetch 下载 URL，去掉标记并截断。两者都受步数和输出长度限制。

## 差异

见 compat C11。
