# F-AUTOREVIEW 自动授权审查

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/experimental/auto-review` 在插件页实验区。打开后，变更类工具不必每次弹批准条，由审查规则决定放行或拒绝。

## code-harness

插件 id 是 `experimental.auto-review`，默认关闭。权限芯片增加 `auto`。插件开启且权限为 auto 时，参数里出现 `rm -rf`、`rm -fr`、`mkfs` 或 fork bomb 片段的变更工具直接拒绝。其余变更工具不再询问。插件关闭时，auto 退回询问。

## 差异

审查规则是固定的危险片段，不是再调一次模型。
