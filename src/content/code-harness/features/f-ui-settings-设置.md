# F-UI-SETTINGS 设置页

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-settings` 组织设置卡片。模型卡在 `packages/client/ui-settings-models`，用来填写供应商和密钥。

## code-harness

设置页显示生效的 base URL 和模型名，以及它们来自环境变量还是文件。密钥只显示是否已设置，接口不返回明文。可以改默认权限和未设置环境变量时的模型名。

## 差异

不提供 DeepSeek 账号卡。密钥不能通过界面写入仓库。
