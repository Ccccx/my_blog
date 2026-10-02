# F-UI-FILES 文件栏

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-sidebar-files` 浏览工作区。`packages/api/workspace-files` 提供列表和读取。

## code-harness

右栏 Files 标签下列出工作区。目录默认收起，点开后能看到里面的文件。文件和文件夹都有图标。点文件会在标签条上打开该文件自己的预览标签，文本、HTML 和 PDF 在标签里显示，Office 文件提供下载。隐藏目录和依赖目录被跳过。标签放不下时在条内横向滚动。

## 差异

不预览二进制、Office 和 PDF，见 F-PREVIEW。
