# F-COMPOSE 插件组合

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/boot/app-boot` 按 profile 顺序叠 bundle，再应用各级 patch。`packages/preset/agent-preset` 把一个 Agent 的子插件声明成 YAML。Web 的四份 preset 在 `packages/bundle/web-app/presets`。

## code-harness

没有 bundle 文件。内置插件有默认启用表。会话模式决定哪些已注册工具进入模型请求。

## 差异

见 compat C2。不能用原版 patch 文件替换某一行配置。配置热重载单独是 F-HMR。
