import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { HarnessStatus } from '../components/HarnessStatus'
import { Markdown } from '../components/Markdown'
import {
  featureNeighbors,
  featurePath,
  getFeature,
  overviewDocs,
  type FeatureEntry,
  type OverviewDoc,
} from '../lib/codeHarness'

const DOC_LINKS: { slug: OverviewDoc['slug']; label: string }[] = [
  { slug: 'architecture', label: '架构' },
  { slug: 'compat', label: '差异说明' },
  { slug: 'matrix', label: '功能矩阵' },
]

function useDocTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · code-harness · 技术笔记`
    return () => {
      document.title = previous
    }
  }, [title])
}

function useHashScroll(token: string) {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [token])
}

function DocLinks({ current }: { current?: OverviewDoc['slug'] }) {
  return (
    <nav className="harness-doc-links" aria-label="专题文档">
      <Link to="/code-harness">功能总览</Link>
      {DOC_LINKS.map((item) =>
        item.slug === current ? (
          <span key={item.slug} className="is-current">
            {item.label}
          </span>
        ) : (
          <Link key={item.slug} to={`/code-harness/${item.slug}`}>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}

function FeaturePager({ feature }: { feature: FeatureEntry }) {
  const { prev, next } = featureNeighbors(feature.slug)
  return (
    <nav className="doc-pager" aria-label="上一篇和下一篇">
      {prev ? (
        <Link to={featurePath(prev.slug)}>
          <small>上一篇</small>
          {prev.name}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={featurePath(next.slug)} className="doc-pager-next">
          <small>下一篇</small>
          {next.name}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export function CodeHarnessOverview() {
  const { page } = useParams<{ page: string }>()
  const location = useLocation()
  const doc =
    page === 'architecture' || page === 'compat' || page === 'matrix' ? overviewDocs[page] : undefined

  useDocTitle(doc?.title ?? '文档未找到')
  useHashScroll(`${page ?? ''}${location.hash}`)

  if (!doc) {
    return (
      <div className="card not-found">
        <h1>文档未找到</h1>
        <p>专题里没有这一页。</p>
        <Link to="/code-harness" className="btn">
          返回专题
        </Link>
      </div>
    )
  }

  return (
    <article className="post-detail card harness-doc">
      <header className="post-detail-header">
        <Link to="/code-harness" className="back-link">
          ← 返回专题
        </Link>
        <DocLinks current={doc.slug} />
        <h1>{doc.title}</h1>
        <p className="post-detail-summary">{doc.lede}</p>
      </header>
      <Markdown content={doc.body} linkMode="app" />
    </article>
  )
}

export function CodeHarnessFeature() {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const slug = decodeURIComponent(rawSlug ?? '')
  const feature = getFeature(slug)
  const location = useLocation()

  useDocTitle(feature ? `${feature.id} ${feature.name}` : '功能未找到')
  useHashScroll(`${slug}${location.hash}`)

  if (!feature) {
    return (
      <div className="card not-found">
        <h1>功能未找到</h1>
        <p>没有找到「{slug}」。</p>
        <Link to="/code-harness" className="btn">
          返回专题
        </Link>
      </div>
    )
  }

  return (
    <article className="post-detail card harness-doc">
      <header className="post-detail-header">
        <Link to="/code-harness" className="back-link">
          ← 返回专题
        </Link>
        <div className="feature-page-meta">
          <span className="feature-id">{feature.id}</span>
          <span className="priority">{feature.priority}</span>
          <HarnessStatus status={feature.status} />
        </div>
        <h1>{feature.name}</h1>
        <p className="post-detail-summary">{feature.summary}</p>
        {feature.status === 'compromise' && feature.compromise && feature.compromise !== '无' ? (
          <div className="compromise-note">
            <strong>差异说明</strong>
            <Markdown content={feature.compromise} linkMode="app" />
          </div>
        ) : null}
      </header>
      <FeaturePager feature={feature} />
      <Markdown content={feature.body} linkMode="app" />
      <FeaturePager feature={feature} />
    </article>
  )
}
