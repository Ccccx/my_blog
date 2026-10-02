# F-UI-PLUGIN 插件页

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-plugin-manager` 是侧栏里的插件页：bundle 列表、启用开关、安装进度和配置。设置里的插件清单是只读的。

## code-harness

插件页列出内置和已安装插件，显示启用状态、错误和当前工具名。可以切换、编辑 JSON 配置、填写本地路径安装。

## 差异

没有 registry 选择、pnpm 日志流和依赖脚本批准对话框。
