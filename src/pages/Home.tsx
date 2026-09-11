import { PostCard } from '../components/PostCard'
import { SITE_DESCRIPTION, SITE_NAME } from '../config'
import { getAllPosts } from '../data/posts'

export function Home() {
  const posts = getAllPosts()

  return (
    <div className="home">
      <section className="hero-banner card">
        <h1>{SITE_NAME}</h1>
        <p>{SITE_DESCRIPTION}</p>
      </section>
      <section className="post-list">
        <h2 className="section-title">最新文章</h2>
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
