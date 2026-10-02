# F-ASK 向用户提问

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/interaction/tool-ask-user` 暂停回合，等用户回答。界面在 `packages/client/ui-user-questions`。计划模式要求不要用它来请求实现许可。

## code-harness

ask_user_question 创建待回答项。界面提交答案后工具才返回。取消或超时返回错误文本，模型可以改口。

## 差异

问题按列表逐个等待回答。不实现原版多问题表单的全部字段类型，但一次调用可以带多个文本问题。
