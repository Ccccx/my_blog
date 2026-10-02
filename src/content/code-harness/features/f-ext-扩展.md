# F-EXT 插件扩展到前端

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/extensions` 让插件同时跑在宿主和客户端。`cordis-host-runner` 与 `cordis-client-runner` 加载插件代码，`ui-cordis` 把插件贡献的界面挂进槽位。这属于插件验收范围。

## code-harness

插件除了 `register(api)` 注册工具，还可以在 `plugin.json` 里声明 `ui.slot`、`ui.html` 和 `ui.script`。前端槽位注册表把已启用插件挂到对应槽位，并动态加载 `/api/plugins/<id>/ui.js` 的 `mount(root)`。停用插件时卸掉这段界面。示例是 `examples/note-plugin` 的右栏笔记面板。

## 差异

无。客户端插件用浏览器里的普通脚本，不跑 Cordis 的客户端 Loader。
