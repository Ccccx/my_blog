# F-WORKSPACE 工作区

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/workspace/workspace` 登记工作区实体。Web 在选定工作区之前不能发送消息。`packages/api/workspace-controller` 提供创建和列表。新的 Web 会话没有默认工作区，需要用户添加启动 `dsh` 时的目录。

## code-harness

用户输入路径并命名。目录不存在时可以按请求创建。会话必须绑定一个工作区，否则输入框不可用。删除登记不会删除磁盘上的项目文件。

## 差异

不用操作系统的目录选择器，见 F-DESKTOP。
