import { PostCard } from '../components/PostCard'
import { SITE_DESCRIPTION, SITE_NAME } from '../config'
import { getAllPosts } from '../data/posts'

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
