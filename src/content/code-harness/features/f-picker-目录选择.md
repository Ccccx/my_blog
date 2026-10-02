# F-PICKER 目录选择

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-directory-picker-browse` 和 `packages/host/directory-picker-browse` 在创建工作区时浏览本机目录。桌面壳另有原生对话框。

## code-harness

添加工作区时可以浏览目录。`GET /api/browse` 只列出非隐藏子目录。选中的路径传给创建工作区接口。

## 差异

没有操作系统原生文件对话框。那属于桌面壳，见 F-DESKTOP。
