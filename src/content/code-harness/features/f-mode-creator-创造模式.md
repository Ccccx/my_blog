# F-MODE-CREATOR Creator 模式

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 preset id 是 cordis，文件 `packages/bundle/web-app/presets/cordis.patch.yml`。它在 standard 的能力上打开 cordis 检查工具、插件开发技能，以及 plugin_manager 工具。

## code-harness

creator 模式在 standard 工具集上增加 plugin_manager 和 inspect。内置技能 plugin-authoring 说明怎样写 plugin.json。

## 差异

检查工具只列出本进程的服务和工具，不查询 Cordis Loader 的包目录。
