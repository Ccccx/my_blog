# F-UI-RIGHT 右栏

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/client/ui-sidebar-right` 和 `ui-dockkit` 是按需打开的右侧停靠栏，里面按标签放文件、终端和其他面板。空首页不展示这栏。

## code-harness

空首页右栏关闭。对话工具条上的按钮打开它。标签条左侧滚动，默认是 Files、Terminal、Goal、Checkpoint、Jobs。Files 带文件夹图标。右侧固定加号、分栏和关闭。加号菜单用来切到另一个面板，并把它滚进可见区域。点文件会插入该文件的预览标签。`browser_open` 有结果之后多一个 Browser 标签。多出来的标签在条内横向滚动，不会把 Checkpoint 截成半个词。

## 差异

默认标签是文件、终端、目标、检查点和任务。Browser 标签在打开网页之后出现，用来显示这次打开的结果。
