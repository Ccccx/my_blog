# code-harness 功能架构

本文描述 code-harness 的目标架构。它是 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的独立重建：用 Python 3.12 实现插件化编码代理，用 Vite + React 复刻 Web 界面。标识符和代码用英文，文档用中文。

和原版的逐项差异见 [compat.md](compat.md)，覆盖与优先级见 [feature-matrix.md](feature-matrix.md)。

## 原版在做什么

DeepSeek Harness（命令 `dsh`）把产品的每一块都做成 Cordis 插件：模型适配器、工具、会话日志、代理主循环、Web 服务器都挂在同一棵插件树上。启动时按 profile 叠 bundle，再用 `cordis.patch.yml` 覆盖。一次用户消息展开成一个 turn，turn 里有零步或多步 step。每一步向模型发一次请求，执行它返回的工具调用，再决定要不要继续。会话日志是模型上下文的来源。Web 客户端不直接打模型，而是通过 `/api` 上的 Remote RPC，以及 `/api/remote.mux` 上的多路 WebSocket，跟本机 Host 通信。

code-harness 保留这条产品主线：插件化内核、与供应商无关的主循环、工作区里的编码工具、会话、权限、模式，以及浏览器里的三栏界面。不复制 Electron、原生沙箱和 npm 插件运行时。

## 仓库布局

```text
docs/                 架构、功能说明、矩阵、妥协清单
backend/              Python 3.12，uv，FastAPI + uvicorn
frontend/             Vite + React 18 + TypeScript
e2e/                  Playwright
examples/             可安装的示例插件
```

本地数据放在 `CODE_HARNESS_HOME`（默认 `~/.code-harness`）：SQLite 存会话、事件、工作区登记、插件配置和日程；用户项目文件留在工作区目录里，不进数据库。

## 逻辑分层

```text
浏览器 React 壳
  侧栏（工作区、会话、插件、设置）
  中栏对话
  右栏（文件、计划、目标、待办）
        │  REST + SSE / WebSocket
        ▼
FastAPI 宿主
  路由只做协议适配，不写业务
        ▼
Harness
  主循环（不认识具体模型）
  工具执行、权限、计划模式守卫
        ▼
Kernel（Cordis 风格）
  Context、服务、事件、waterfall、插件 apply/dispose
        ▼
插件
  filesystem、shell、search、provider.pai、plugin-manager、…
        ▼
SQLite + 工作区文件系统
```

主循环只依赖一个窄接口：给定消息和工具 schema，返回文本和工具调用。它不读取 `PAI_*`，不解析厂商 JSON，也不分支模型名称。换模型只换 provider 插件。

## 内核

内核对应原版 Cordis 的最小子集，实现落在 `backend/src/code_harness/kernel.py`。

- **Context** 持有服务表、事件总线和工具注册表。
- **服务注入**：插件在 `apply` 期间 `provide(name, value)`，`dispose` 时按注册的逆序撤掉。
- **事件**：`emit` 是同步通知。`waterfall` 要求监听者调用 `next` 才会继续；不调用就短路。这和 Cordis waterfall 的语义一致。
- **插件生命周期**：每条插件有 id、配置、启用位和一块 EffectScope。启用时 `apply`，停用或改配置时先 `dispose` 再按新配置 `apply`。热插拔发生在当前进程里，不重启服务。
- **配置**：内置插件和已安装插件的启用位、配置对象写在 SQLite。配置在 `apply` 前按插件声明的 schema 做校验，缺必填字段就拒绝加载并在插件列表里显示错误。
- **内置功能都是插件**，包括 PAI provider。没有写死在主循环里的工具。

原版还有 bundle 分层、`!!js` 条件、HMR 监视 YAML、以及按 Agent preset 隔离的子 Context。code-harness 用「进程级插件 + 会话模式过滤工具目录」代替 per-agent 的 Cordis 子树。见 [compat.md](compat.md)。

## 主循环

一次 turn 的顺序：

1. 写入 `turn/start` 和 `user/message`。
2. 若文本以 `/` 开头，走人类命令（不请求模型）。
3. 否则循环 step，直到没有工具调用、达到步数上限或被取消：
   - 从会话日志投影出消息，并在 compaction 插件启用时裁剪过长的工具结果。
   - 按会话模式收集当前可见工具的 schema。计划模式仍把变更工具留在 schema 里。
   - `tools/pre-execute` 之前先调用 provider。
   - 流式增量只更新界面上的临时文本；落盘的是完整的 `assistant/message`。
   - 对每个工具调用跑权限、计划守卫和 `tools/pre-execute` → 执行 → `tools/post-execute`，写入 `tool/result`。
4. 写入 `turn/end`。

同一步里，连续的只读工具并行执行；会改动文件、需要批准或有副作用的工具串行执行。每条工具日志都带调用 id。子代理是另一个会话上的同一种循环，深度有上限。

Provider 返回的结构只有 `content` 和 `tool_calls`。若 PAI 没有给出原生 `tool_calls`，JSON 回退发生在 PAI 插件内部，主循环看到的仍然是工具调用。

## 模式

模式对应原版 Web profile 的四份 preset，源文件在 `packages/bundle/web-app/presets/`。

| 模式 | 原版 id | 暴露的工具 |
|---|---|---|
| Standard | `standard` | 文件、搜索、bash、网页、计划、目标、待办、技能、子代理、工作流、日程、提问、展示 |
| Code | `ptc` | Standard 的集合，另加 `run_code`，工作流默认不强调 |
| Minimal | `minimal` | 只有 bash（以及该会话记住的工作目录） |
| Creator | `cordis` | Standard 的集合，另加 `plugin_manager` 和 `inspect` |

用户安装的插件工具在除 Minimal 以外的模式里可见。原版是每个 preset 挂一套子插件；这里是同一套已启用插件，由模式做目录过滤。

## 模型插件

`provider.pai` 是普通插件。它读取环境变量，环境变量优先于设置文件：

- `PAI_BASE_URL`，默认 `<你的 PAI-EAS 地址>`
- `PAI_API_KEY`，只来自环境变量，不写入仓库和数据库
- `PAI_MODEL`，默认 `Qwen3.8-Flash-Next`

每条 chat completion 都带 `"chat_template_kwargs": {"enable_thinking": false}`。请求使用流式 SSE。已在该端点上确认：非流式和流式都能返回 OpenAI 风格的 `tool_calls`。

回退协议只存在于这个插件里。当响应没有 `tool_calls`、正文却是下面两种 JSON 之一时，插件把它变成工具调用再交给主循环：

```json
{"tool": "write", "arguments": {"path": "a.txt", "content": "hi"}}
```

```json
{"tool_calls": [{"name": "write", "arguments": {"path": "a.txt", "content": "hi"}}]}
```

密钥不会出现在日志、错误文本或设置接口里。设置接口只返回「是否已配置」。

## 持久化

SQLite 表：

- `workspaces`：id、名称、绝对路径
- `sessions`：所属工作区、模式、权限、计划模式、标题、父子关系
- `events`：append-only 的会话事件，seq 单调递增
- `plugins`：启用位和 JSON 配置
- `schedules`：cron 或间隔、下一次运行时间
- `jobs`：后台命令的状态和输出尾部

工作区路径指向真实目录。读、写、编辑、搜索都作用在这个目录上。

## 与浏览器的协议

原版业务调用是 Typert Remote：一元调用走 `POST /api`，流走 `WS /api/remote.mux`。code-harness 无法携带那套生成器和多路复用帧，因此在同一 `/api` 前缀下提供资源式接口，事件名字与原版会话事件对齐。细节和取舍写在 [features/f-protocol-协议.md](features/f-protocol-协议.md)。

界面需要的主路径：

- `GET/POST /api/workspaces`，`DELETE /api/workspaces/{id}`
- `GET/POST /api/sessions`，`GET/PATCH/DELETE /api/sessions/{id}`
- `POST /api/sessions/{id}/messages` 提交用户消息，立即返回
- `GET /api/sessions/{id}/events` 用 SSE 推送本轮增量
- `WS /api/sessions/{id}/stream` 推送同一类事件
- `POST /api/sessions/{id}/approval` 与 `/answer` 回应权限和提问
- `GET/POST /api/plugins` 以及启用、停用、配置、安装
- `GET/PUT /api/settings` 不回传密钥

静态文件由 FastAPI 托管 `frontend/dist`。开发时 Vite 把 `/api` 和 WebSocket 代理到后端。

## Web 界面

原版 Web 壳是 React 18，入口在 `apps/web`，布局插件是 `packages/client/ui-layout`：左栏、中栏、右栏。没有独立的 URL 路由库，面板切换靠布局服务。code-harness 使用同一套技术（Vite、React 18、TypeScript），页面结构对应为：

- 左栏：品牌、新对话、工作区、会话列表、插件、日程、设置
- 中栏：对话记录、模式、权限、计划开关、输入框、批准条
- 右栏：文件树与预览、计划、目标、待办

文案走中文。交互覆盖验收路径：打开页面、新建对话、建立工作区、让代理改文件并运行、管理插件。

## 进程与命令

```text
uv run --directory backend code-harness web
```

默认绑定 `127.0.0.1:3080`。`code-harness run --workspace <path> "<task>"` 是无界面的单次任务，对应原版 headless 的一个子集。
