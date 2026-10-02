# F-SKILL 技能

矩阵行见 [feature-matrix.md](../feature-matrix.md)。

## 原版

`packages/skill` 从技能目录加载 SKILL.md。`packages/skill/tool-skill` 按名字把正文交给模型。Creator 模式额外挂上插件开发技能。

## code-harness

扫描内置技能、HOME/skills 和工作区 `.agents/skills`。skill 工具返回指定正文，并限制长度。

## 差异

超过 8192 字符时保留前 4000 与后 2000，中间标明截断长度。矩阵状态为 done。
