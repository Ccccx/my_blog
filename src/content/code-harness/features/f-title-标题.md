# F-TITLE 会话标题

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版可以注册唯一的 sessionTitle 提供者，在一轮之后用模型生成短标题。

## code-harness

第一条用户消息写入后，标题设为该消息首行的前 48 个字符。用户可以在界面里改标题。

## 差异

审查后改为用 PAI 再请求一次生成标题。模型失败时才退回首行截断，这只是失败后备。
