# F-KERNEL 内核

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

Cordis 把服务、事件和可撤销 effect 放进共享 Context。文档在 `docs/cordis-primer.md` 和 `docs/architecture.md`。插件卸载时 effect 逆序释放。waterfall 不调用 next 就会短路。

## code-harness

Python 内核提供同样四个概念：Context、服务表、事件总线、EffectScope。配置在 apply 前按 schema 校验。启用、停用和改配置都不重启进程。

## 差异

见 compat C1。没有 Cordis 的 group、isolate realm 和声明合并的类型事件图。
