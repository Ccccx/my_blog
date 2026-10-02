# F-PERM 权限

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/interaction/permission-presets` 区分只读、工作区写入和完全访问等策略。危险操作走询问。界面在 `packages/client/ui-permission-presets` 和 `packages/client/ui-approval`。

## code-harness

三种权限：ask（变更都要批准）、workspace（工作区内的写和编辑自动通过，shell 仍要批准）、full（自动通过）。拒绝和超时都不会执行工具。

## 差异

没有原版更细的沙箱预设档位。路径限制见 F-SANDBOX。
