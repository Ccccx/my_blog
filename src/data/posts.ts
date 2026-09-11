import type { Post } from '../types'
import featuredBody from '../content/20260911GitHub日榜分析.md?raw'
import grokBotBody from '../content/认识Grok-Bot.md?raw'

export const posts: Post[] = [
  {
    slug: '认识Grok-Bot',
    title: '认识 Grok Bot：能真正干活的 AI 队友',
    date: '2026-09-11',
    tags: ['Grok Bot', 'AI Agent', 'Cursor', '上手指南'],
    summary:
      '面向新人的 Grok Bot 系统介绍：它是什么、核心能力、从安装到第一次交付，以及销售/工程/运营/文创等真实场景，附界面截图操作附录。',
    body: grokBotBody,
  },
  {
    slug: '20260911GitHub日榜分析',
    title: '20260911GitHub日榜分析',
    date: '2026-09-11',
    tags: ['GitHub', '日榜', '开源', 'Agent'],
    summary:
      '2026-09-11 GitHub 日榜深度解读：16 个热门仓库，主轴是 Agent Skills 与编码 Agent 基础设施，并覆盖多模型网关、本地推理与垂直应用。',
    body: featuredBody,
  },
  {
    slug: 'vite-react-typescript-入门',
    title: 'Vite + React + TypeScript 入门笔记',
    date: '2026-09-05',
    tags: ['Vite', 'React', 'TypeScript'],
    summary:
      '从零搭建 Vite React TS 项目的实用清单：脚手架、路由、Markdown 渲染与部署到 GitHub Pages 的关键步骤。',
    body: `# Vite + React + TypeScript 入门笔记

Vite 提供极快的开发体验，配合 React 与 TypeScript 非常适合写技术博客或文档站。

## 为什么选 Vite

- 冷启动快，HMR 几乎瞬时
- 原生 ESM，配置面小
- 官方有 \`react-ts\` 模板，开箱即用

## 最小步骤

\`\`\`bash
npm create vite@latest my_blog -- --template react-ts
cd my_blog
npm install
npm install react-router-dom react-markdown
npm run dev
\`\`\`

## 部署提示

把 \`vite.config.ts\` 的 \`base\` 设成仓库名（例如 \`/my_blog/\`），再用 GitHub Actions 把 \`dist\` 推到 Pages。SPA 记得准备 \`404.html\` 回退。
`,
  },
  {
    slug: 'soft-ui-设计小记',
    title: 'Soft UI 设计小记',
    date: '2026-09-01',
    tags: ['UI', '设计', '前端'],
    summary:
      '用浅灰背景、白卡片、柔和阴影与轻量悬停抬升，快速做出干净可读的博客界面。',
    body: `# Soft UI 设计小记

Soft UI 不是夸张拟态，而是「干净、轻、可读」。

## 配色建议

| 角色 | 色值 |
|---|---|
| 背景 | \`#F7F8FA\` |
| 卡片 | \`#FFFFFF\` |
| 主色 | \`#3B82F6\` |
| 正文 | \`#374151\` |

## 交互

- 卡片圆角约 \`16px\`
- 默认柔和阴影，悬停时略抬升（\`translateY(-2px)\`）并加深阴影
- 标签用胶囊（pill）样式，浅色底 + 主色文字

保持留白与行高，比堆叠装饰更重要。
`,
  },
  {
    slug: 'react-router-中文路由',
    title: 'React Router 与中文 slug',
    date: '2026-08-28',
    tags: ['React', '路由', '实践'],
    summary:
      '中文路径在链接里用 encodeURIComponent，在路由参数里 decodeURIComponent，避免匹配失败。',
    body: `# React Router 与中文 slug

当文章 slug 含中文时，浏览器地址栏会显示百分号编码。关键是 **写链接时编码、读参数时解码**。

## 链接

\`\`\`tsx
<Link to={\`/posts/\${encodeURIComponent(post.slug)}\`}>
  {post.title}
</Link>
\`\`\`

## 路由读取

\`\`\`tsx
const { slug: raw } = useParams()
const slug = decodeURIComponent(raw ?? '')
\`\`\`

这样 \`posts\` 数据里可以继续用人类可读的中文 slug，不必事先编码进数据源。
`,
  },
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))
}
