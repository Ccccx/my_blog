import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HarnessStatus } from '../components/HarnessStatus'
import {
  featurePath,
  groups,
  harnessStats,
  type FeatureStatus,
} from '../lib/codeHarness'

type StatusFilter = 'all' | FeatureStatus

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'done', label: 'done · 已落地' },
  { id: 'compromise', label: 'compromise · 有意差异' },
]

export function CodeHarnessHome() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        features: group.features.filter((feature) => {
          if (filter !== 'all' && feature.status !== filter) return false
          if (!needle) return true
          return (
            feature.id.toLowerCase().includes(needle) ||
            feature.name.toLowerCase().includes(needle) ||
            feature.summary.toLowerCase().includes(needle)
          )
        }),
      }))
      .filter((group) => group.features.length > 0)
  }, [filter, query])

  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.features.length, 0)

  return (
    <div className="harness">
      <section className="hero-banner card harness-hero">
        <p className="hero-kicker">专题 · code-harness</p>
        <h1>code-harness 功能文档</h1>
        <p className="hero-lead">
          code-harness 是{' '}
          <a href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">
            DeepSeek Harness
          </a>{' '}
          的独立重建：Python 3.12 与 uv 写成插件化后端，Vite 与 React 复刻浏览器界面。它在浏览器里做编码代理——插件化内核、与模型供应商无关的主循环、工作区里的文件和命令工具、会话与权限，以及左中右三栏界面。
        </p>
        <p className="harness-lead-extra">
          模型通过你自己的 PAI-EAS OpenAI 兼容接口接入，会话记在 SQLite。Electron、原生沙箱和 npm 插件运行时没有照搬；这些有意差异集中在差异说明里，功能页上标为 compromise。
        </p>
        <div className="hero-meta">
          <span>{harnessStats.total} 项功能</span>
          <span>{harnessStats.done} done</span>
          <span>{harnessStats.compromise} compromise</span>
        </div>
        <nav className="harness-doc-links" aria-label="专题文档">
          <Link to="/code-harness/architecture">架构</Link>
          <Link to="/code-harness/compat">差异说明</Link>
          <Link to="/code-harness/matrix">功能矩阵</Link>
        </nav>
      </section>

      <section className="harness-catalog">
        <div className="section-heading">
          <h2 className="section-title">功能总览</h2>
          <p>
            按功能区分组，点进独立页面。当前显示 {visibleCount} 项。
          </p>
        </div>
        <div className="harness-toolbar">
          <div className="filter-row" role="group" aria-label="按状态筛选">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={filter === item.id ? 'filter-chip is-active' : 'filter-chip'}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="harness-search">
            <span>搜索</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="编号、名称或说明"
              type="search"
            />
          </label>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="card not-found">
            <p>没有匹配的功能。</p>
          </div>
        ) : (
          visibleGroups.map((group) => (
            <section key={group.id} className="card harness-group" id={group.id}>
              <header className="harness-group-head">
                <h3>
                  {group.title}
                  <span>{group.features.length}</span>
                </h3>
                <p>{group.description}</p>
              </header>
              <div className="feature-list">
                {group.features.map((feature) => (
                  <Link key={feature.id} to={featurePath(feature.slug)} className="feature-row">
                    <span className="feature-id">{feature.id}</span>
                    <span className="feature-copy">
                      <strong>{feature.name}</strong>
                      <span className="feature-summary">{feature.summary}</span>
                    </span>
                    <span className="feature-meta">
                      <span className="priority">{feature.priority}</span>
                      <HarnessStatus status={feature.status} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  )
}
