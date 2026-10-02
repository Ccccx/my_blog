import { Link } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { SITE_DESCRIPTION, SITE_NAME } from '../config'
import { getAllPosts } from '../data/posts'
import { harnessStats } from '../lib/codeHarness'

export function Home() {
  const posts = getAllPosts()

  return (
    <div className="home">
      <section className="hero-banner card">
        <p className="hero-kicker">Tech Notes · Soft UI</p>
        <h1>{SITE_NAME}</h1>
        <p className="hero-lead">{SITE_DESCRIPTION}</p>
        <div className="hero-meta">
          <span>{posts.length} 篇笔记</span>
          <span>GitHub 日榜观察</span>
          <span>Agent / 开源</span>
        </div>
      </section>
      <section className="topic-entry card">
        <p className="hero-kicker">专题</p>
        <h2>code-harness 功能文档</h2>
        <p>
          DeepSeek Harness 的 Python + Vite 重建。{harnessStats.total} 项功能各自一页，并标出 done 与
          compromise，不进入下面的文章列表。
        </p>
        <Link to="/code-harness" className="btn">
          进入专题
        </Link>
      </section>
      <section className="post-list">
        <div className="section-heading">
          <h2 className="section-title">最新文章</h2>
          <p>按日期倒序，点进卡片阅读全文。</p>
        </div>
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
