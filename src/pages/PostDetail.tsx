import { Link, useParams } from 'react-router-dom'
import { Markdown } from '../components/Markdown'
import { Tag } from '../components/Tag'
import { getPostBySlug } from '../data/posts'

export function PostDetail() {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const slug = decodeURIComponent(rawSlug ?? '')
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="card not-found">
        <h1>文章未找到</h1>
        <p>没有找到 slug 为「{slug}」的文章。</p>
        <Link to="/" className="btn">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <article className="post-detail card">
      <header className="post-detail-header">
        <Link to="/" className="back-link">
          ← 返回首页
        </Link>
        <time dateTime={post.date}>{post.date}</time>
        <h1>{post.title}</h1>
        <p className="post-detail-summary">{post.summary}</p>
        <div className="post-card-tags">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </header>
      <Markdown content={post.body} />
    </article>
  )
}
