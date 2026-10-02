# F-MODE-STD Standard 模式

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

原版 `packages/bundle/web-app/presets/standard.patch.yml` 声明 id 为 standard 的 preset。它挂上 persona、bash 或 pwsh、文件系统、搜索、技能、目标、计划、压缩、子代理、工作流、提问、待办、网页和展示。plugin_manager 默认禁用。

## code-harness

standard 模式暴露这些工具的对应实现：文件、搜索、bash、网页、计划、目标、待办、技能、子代理、工作流、日程、提问、展示、后台作业。不暴露 run_code、plugin_manager 和 inspect。

## 差异

工具是否真的注册还取决于插件启用位。原版把差异写在 preset 子树里，这里用模式过滤，见 F-COMPOSE。
