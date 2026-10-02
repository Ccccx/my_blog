# F-DIFF 差异

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/deliverables/workspace-changes` 在一轮结束时给出改动文件，界面可以看有边界的 diff。

## code-harness

每个 turn 开始时记录工作区内文本文件的哈希。turn 结束后对变化文件生成统一 diff，放进会话事件，右栏能打开。

## 差异

只覆盖工作区内的文本文件，不跟踪工作区外或二进制差异。
