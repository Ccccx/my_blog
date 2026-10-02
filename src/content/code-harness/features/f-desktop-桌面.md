# F-DESKTOP 桌面应用

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

Electron 应用在 `apps/desktop`，宿主在 `apps/desktop-host`。它打包同一套 Web 资源，并用 IPC 传递启动注入。

## code-harness

不构建桌面安装包，也不嵌入 Electron。

## 差异

见 compat C7。
