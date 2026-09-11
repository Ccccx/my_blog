import { Link } from 'react-router-dom'
import type { Post } from '../types'
import { Tag } from './Tag'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <Link to={`/posts/${encodeURIComponent(post.slug)}`} className="post-card-link">
        <div className="post-card-meta">
          <time dateTime={post.date}>{post.date}</time>
        </div>
        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-summary">{post.summary}</p>
      </Link>
      <div className="post-card-tags">
        {post.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </article>
  )
}
