# F-FLOW 工作流

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/workflow` 运行命名工作流。Standard 与 Creator 挂了 workflow 工具，PTC preset 里工作流默认禁用。

## code-harness

工作流是 YAML：按顺序执行 shell、tool 或 prompt 步骤。prompt 步骤走子代理。工具可以列出、保存和运行。文件放在 HOME/workflows 或工作区 `.code-harness/workflows`。

## 差异

不是原版 workflow-ptc 引擎。Code 模式默认不把工作流放进主提示，但插件仍可启用。
