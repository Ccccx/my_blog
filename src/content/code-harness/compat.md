# 与 DeepSeek Harness 的差异

每条都写明原因和替代做法。功能矩阵里标成 compromise 的行都指向这里的编号。状态会随实现更新；本文记录的是产品决定，不随「还没写完」改变。

## C1 内核语言

原因：目标运行时是 Python 3.12，不嵌入 Node 和 Cordis。

替代：自写内核，提供 Context、服务注入、同步事件、必须调用 `next` 的 waterfall、插件 `apply`/`dispose`、配置 schema 和进程内热插拔。源码位置 `backend/src/code_harness/kernel.py`。原版位置 `vendor/` 中的 Cordis，以及 `docs/cordis-primer.md`。

## C2 组合方式

原因：原版 profile、bundle、`cordis.patch.yml` 和 `!!js` 表达式绑在 Cordis Loader 上。按会话隔离一整棵子插件树，成本高于当前 Web 产品需要的模式切换。

替代：内置插件在进程内启用或停用。会话模式（standard / code / minimal / creator）只过滤工具目录。用户插件的工具在除 minimal 以外的模式中可见。不解析 `!!js`。配置文件热重载是 F-HMR，不在这条妥协里。

## C3 浏览器协议

原因：原版一元调用和流是 Typert 生成的 Remote RPC。Host 侧在 `packages/api/gateway`，浏览器侧在 `packages/client/connection`。描述符、查找、二进制 multipart、`/api/remote.mux` 多路复用和 `$events` 代际恢复都依赖这套管线。把它移植到 Python 等于再写一套代码生成器。

替代：保持 `/api` 前缀。资源用 REST。一轮对话的增量用 SSE `GET /api/sessions/{id}/events`，并用 WebSocket `WS /api/sessions/{id}/stream` 送同一类事件。事件类型沿用 `turn/start`、`user/message`、`assistant/message`、`tool/call`、`tool/result`、`turn/end`。不实现 Typert、附件字节通道和代际游标修复。

## C4 浏览器启动令牌

已撤回，并且已经按原版语义实现。`code-harness web` 打印带 `?token=` 的地址，`GET /api/auth/launch` 换成 HttpOnly cookie `ch_token`。矩阵里 F-AUTH 为 done。

## C5 插件包格式

原因：架构师要求 npm 生态改为 Python 插件，同时保留清单、配置和启用语义。

替代：插件目录包含 `plugin.json`（`id`、`name`、`version`、`description`、`entry`、`configSchema`）和 `entry` 指向的 Python 文件，文件导出 `register(api)`。安装是把目录复制进 `CODE_HARNESS_HOME/installed/<id>`。启用、停用、改配置会立刻 `dispose` 再 `apply`。不调用 pnpm，不访问 npm registry，不批准依赖安装脚本，不做 DSH 版本配套豁免。

## C6 持久化格式

原因：架构师指定 SQLite 加文件系统工作区。原版是分代 JSONL（`session.vN.jsonl`，可 zstd）和相邻迁移链，实现在 `packages/core/session` 与 `packages/session`。

替代：`harness.sqlite` 里用 append-only 的 `events` 表，`seq` 单调递增。不保留历史代文件，不实现 vN 到 vN+1 的迁移包，不压缩日志。工作区文件仍在磁盘上。

## C7 桌面与原生模块

原因：架构师明确不复制 Electron、Tauri 和 native addon。原版桌面在 `apps/desktop`，原生绑定在 `native/`。

替代：只有浏览器。选择工作区时输入或创建路径，不用系统文件夹对话框（原版对话框在 `packages/host/directory-picker-*`）。没有 macOS 隐藏标题栏和 Windows 标题栏。用系统应用打开文件见 [C20](#c20-系统应用打开文件)。

## C8 进程沙箱

原因：原版 `packages/sandbox` 使用 Landlock、Seatbelt 或 Windows ACL，并和 shell、LSP 共用执行世界。这些是原生模块。

替代：路径检查。`workspace` 与 `ask` 权限下，读写必须落在工作区根目录内，拒绝 `..` 逃逸。`full` 允许工作区外的绝对路径。Shell 的工作目录是工作区，但不过滤系统调用。不提供 Landlock。

## C9 Code 模式与 PTC

原因：原版 `ptc` preset 把工具呈现为可编程调用，运行时在 `packages/ptc-runtime`。那是一套受控的 Node 执行器。

替代：Code 模式多一个 `run_code` 工具。它在本进程里执行 Python，通过 `tools.<name>(...)` 回调已经注册的工具。没有单独的隔离进程，也没有原版的 PTC 工作流运行时。嵌套 `run_code` 会被拒绝。

## C10 Minimal 模式的持久终端

已撤回，并且已经实现。Linux 上按工作区保持一个 pty，断开后进程还在，重连能看到缓冲。前端用 xterm.js。PowerShell 仍见 [C18](#c18-powershell)。矩阵里 F-MODE-MIN 为 done。

## C11 网页搜索

原因：原版 `packages/web/tool-web` 的搜索后端跟产品配置和供应商走。本项目只配置 PAI 对话接口。

替代：`web_search` 使用 DuckDuckGo 的公开接口，`web_fetch` 用 HTTP 客户端抓取正文并截断。没有原版的搜索超时配置面板所对应的供应商密钥。

## C12 模型供应商

原因：产品指定阿里云 PAI-EAS 的 OpenAI 兼容接口，而不是 DeepSeek 账号或 API key 插件（`packages/llm/llm-deepseek*`）。

替代：`provider.pai` 插件发送 chat completions。每条请求包含 `chat_template_kwargs.enable_thinking = false`。该端点已确认支持非流式和流式 `tool_calls`。若某次响应没有 `tool_calls`，插件按提示词里的 JSON 工具协议解析；主循环不参与解析，也不出现厂商分支。密钥只存在于 `PAI_API_KEY` 环境变量。

## C13 工具调用的执行顺序

已撤回，并且已经实现。只读工具并行，有副作用或需要批准的工具串行，日志按调用 id 对齐。矩阵里 F-TOOL-ORDER 为 done。

## C14 子代理的外部产品

原因：原版可把子代理交给 Codex 或 Claude Code 的官方适配器（preset 里默认禁用的 `subagent_codex` 与 `subagent_claude_code`）。

替代：只实现进程内 spawn 和 fork。深度上限为 2。不启动外部 CLI。

## C15 会话标题

已撤回，并且已经实现。一轮结束后若标题仍是空或「新对话」，再请求一次模型生成标题。矩阵里 F-TITLE 为 done。

## C16 热重载文件监视

已撤回，并且已经实现。watchfiles 监视配置文件，变更后对该插件 dispose 再 apply。矩阵里 F-HMR 为 done。

## C17 不实现的产品表面

下列表面不移植。原因是它们依赖被排除的桌面壳、原生沙箱、外部产品登录，或 DeepSeek 账号体系。替代做法是 Web 产品里不提供入口。MCP、hooks、webhook、附件、PDF/HTML 预览和基础 Browser Use 已实现，不在本表。

| 表面 | 原版位置 |
|---|---|
| Electron 桌面 | `apps/desktop` |
| ACP 服务器 | `packages/acp/acp` |
| 完整 JSON-RPC SDK 与 sdk-minimal profile | `packages/sdk`、`packages/bundle/sdk-app`、`packages/bundle/sdk-minimal` |
| 语言服务器 | `packages/lsp/lsp` |
| Computer Use | `packages/computer-use/computer-use` |
| SSH 执行与远程沙箱 | `packages/ssh/ssh` |
| 语音输入 | `packages/experimental` 中的 speech / voice bundle |
| 产品遥测 | `packages/host/product-telemetry-otel` |
| DeepSeek 账号登录 | `packages/llm/llm-deepseek-account` |
| Codex / Claude Code 子代理 | preset 中的 `tool-subagent-codex` 与 `tool-subagent-claude-code` |
| 原生 Landlock / Seatbelt / Windows ACL | `packages/sandbox/sandbox` |

## C18 PowerShell

原因：Minimal 与 Standard 在 Windows 上使用 pwsh。本仓库的运行与验收环境是 Linux。

替代：bash 与 pty bash。不实现 `packages/shell` 里的 pwsh 工具。

## C19 Office 预览

原因：Word、Excel、PowerPoint 的版式渲染需要专门的解析器和界面，超出浏览器 iframe 能稳定完成的范围。

替代：这些文件提供下载。PDF 与 HTML 用 iframe 预览，不在这条妥协里。

## C20 系统应用打开文件

原因：页面跑在浏览器里，不能代替用户启动系统文件关联或文件管理器。`xdg-open` 也不在验收环境里作为产品能力暴露。

替代：右栏预览文本、PDF 和 HTML。Office 文件走下载。不再注册 `open_in_app`。

## C21 日程时区

已撤回，并且已经实现。`next_cron` 用 `zoneinfo` 解析 IANA 时区名，用 `croniter` 解析完整 cron（月份名字、范围、星期范围），再把下次触发时间换成 UTC 写入 SQLite。矩阵里 F-SCHED 为 done。
