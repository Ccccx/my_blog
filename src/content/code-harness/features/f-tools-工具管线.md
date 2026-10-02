# F-TOOLS 工具管线

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/core/tools` 维护作用域内的工具表。执行经过 `tools/pre-execute`、真正执行和 `tools/post-execute`。注册通过 effect 完成，插件卸载时撤销。

## code-harness

每个插件在 apply 时向 Context 登记 ToolSpec，dispose 时移除。执行前跑 waterfall，监听者不调用 next 就短路。工具的 mutates 标记交给权限和计划守卫。

## 差异

无产品级差异。管线是内核的一部分，但工具行为本身按各功能文档实现。
