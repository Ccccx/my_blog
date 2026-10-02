# F-SETTINGS-PAGES 设置子页

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

设置里有 general、agent-loop、shell、subagent、web-search、session-log、plugins、plugin-inventory 这些子页。

## code-harness

设置页用同样的八个标签。通用页保留语言、外观、Base URL 和模型。其余页分别保存最大步数、命令超时、子代理深度、搜索提供商、会话日志开关，以及插件清单。

## 差异

网页搜索提供商固定为 DuckDuckGo，页面只读展示。子代理深度会保存，嵌套生成仍然拒绝。
