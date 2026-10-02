# F-ATTACH 附件

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/attachment` 与 `packages/client/file-upload` 把图片和文件放进用户消息，并在提示时消费上传回执。

## code-harness

消息正文只有文本。

## 差异

审查后改为支持文本、代码和图片。PAI 已接受 image_url，图片不另作妥协。
