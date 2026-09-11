# 技术笔记

Vite + React + TypeScript 技术博客，部署于 GitHub Pages。

仓库：[`Ccccx/my_blog`](https://github.com/Ccccx/my_blog)  
站点路径：`https://ccccx.github.io/my_blog/`

## 本地开发

```bash
npm install
npm run dev
```

开发服务器默认地址：`http://localhost:5173/my_blog/`（注意 `base` 为 `/my_blog/`）。

## 构建

```bash
npm run build
npm run preview
```

产物在 `dist/`。

## 技术栈

- Vite + React + TypeScript
- react-router-dom（路由）
- react-markdown（文章 Markdown 渲染）

## 目录说明

- `src/config.ts` — 站点名称等配置
- `src/data/posts.ts` — 文章列表与正文
- `src/content/` — 长文 Markdown 源文件
- `src/components/` — Layout / PostCard / Tag / Markdown
- `src/pages/` — 首页、文章详情、关于
- `.github/workflows/pages.yml` — GitHub Pages 自动部署
- `public/404.html` — SPA 深链回退（配合 workflow 中 `cp dist/index.html dist/404.html`）

## 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit: 技术笔记 blog"
git branch -M main
git remote add origin git@github.com:Ccccx/my_blog.git
git push -u origin main
```

在仓库 **Settings → Pages** 中选择 **GitHub Actions** 作为部署源。首次 push 到 `main` 后 workflow 会构建并发布。

## UI

Soft UI Evolution：背景 `#F7F8FA`、白卡片 `16px` 圆角、主色 `#3B82F6`、正文 `#374151`、柔和阴影与悬停抬升、标签胶囊样式。
