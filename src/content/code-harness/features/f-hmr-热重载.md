# F-HMR 热重载

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

Web profile 打开 HMR，监视配置并在写入后重载模块。headless 等 profile 可以关掉它。

## code-harness

插件管理 API 在处理完启用、停用、配置和安装后立刻重载该插件。不监视外部文件。

## 差异

审查后改为监视配置文件。用 watchfiles，变更后对该插件 dispose 再 apply。
