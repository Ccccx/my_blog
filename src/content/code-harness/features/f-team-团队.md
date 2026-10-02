# F-TEAM Agent Teams

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/experimental/agent-team`、`tool-agent-team`、`agent-team-profile` 和 `client-ui-agent-team` 是插件页上的实验功能，给一组会话一块共享任务板。

## code-harness

插件 id 是 `experimental.agent-team`，默认关闭。打开后提供 `team_create`、`team_task`、`team_list`。任务存在 SQLite。插件页实验区分组里有对应卡片。

## 差异

没有原版的独立团队侧栏。任务通过工具和插件开关使用。
