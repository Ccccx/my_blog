# F-PLUGIN 插件管理

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/boot/plugin-manager` 列出 bundle 和插件行，改 `cordis.patch.yml` 的 disabled，或用 pnpm 安装 bundle。Web 页面在 `packages/client/ui-plugin-manager`。Creator 模式才默认把管理工具交给模型。

## code-harness

页面和 HTTP 可以列出、启用、停用、改 JSON 配置、从本地目录安装和移除。安装复制目录到 HOME/installed。模型在 Creator 模式通过 plugin_manager 工具做同样的事。

## 差异

见 compat C5。不访问 npm，不处理安装脚本批准和版本豁免。
