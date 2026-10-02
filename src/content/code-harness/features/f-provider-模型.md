# F-PROVIDER PAI 模型插件

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版模型缝在 `packages/llm/llm`。DeepSeek 适配器在 `packages/llm/llm-deepseek` 与账号插件。主循环只看见统一的准备好的调用。

## code-harness

provider.pai 是普通插件。它向 OpenAI 兼容的 `/chat/completions` 发流式请求，并强制 `chat_template_kwargs.enable_thinking` 为 false。工具调用从 SSE 的 delta 里按 index 拼装。若整段响应没有 tool_calls，插件才尝试解析正文中的 JSON 工具信封。

## 差异

见 compat C12。主循环看不到这套解析。端点本身已支持原生流式 tool_calls，回退是保险，不是主路径。
