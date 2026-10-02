import { createContext, useContext, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Slugger } from '../lib/slug'

interface MarkdownProps {
  content: string
  /** 站内路径用路由链接，避免落到仓库根路径。 */
  linkMode?: 'default' | 'app'
}

const SluggerContext = createContext<Slugger | null>(null)

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (typeof node === 'object' && 'props' in node) {
    const element = node as { props?: { children?: ReactNode } }
    return nodeText(element.props?.children)
  }
  return ''
}

function MarkdownH1({ children }: { children?: ReactNode }) {
  const slugger = useContext(SluggerContext)
  return <h1 id={slugger?.slug(nodeText(children))}>{children}</h1>
}

function MarkdownH2({ children }: { children?: ReactNode }) {
  const slugger = useContext(SluggerContext)
  return <h2 id={slugger?.slug(nodeText(children))}>{children}</h2>
}

function MarkdownH3({ children }: { children?: ReactNode }) {
  const slugger = useContext(SluggerContext)
  return <h3 id={slugger?.slug(nodeText(children))}>{children}</h3>
}

function AppLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (!href) return <>{children}</>
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>
  if (href.startsWith('#')) return <a href={href}>{children}</a>
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export function Markdown({ content, linkMode = 'default' }: MarkdownProps) {
  const slugger = new Slugger()
  return (
    <SluggerContext.Provider value={slugger}>
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: MarkdownH1,
            h2: MarkdownH2,
            h3: MarkdownH3,
            ...(linkMode === 'app' ? { a: AppLink } : {}),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </SluggerContext.Provider>
  )
}
