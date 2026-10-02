import architectureRaw from '../content/code-harness/architecture.md?raw'
import compatRaw from '../content/code-harness/compat.md?raw'
import matrixRaw from '../content/code-harness/feature-matrix.md?raw'

export type FeatureStatus = 'done' | 'partial' | 'compromise' | 'not done'

export interface FeatureEntry {
  id: string
  slug: string
  title: string
  name: string
  summary: string
  priority: string
  status: FeatureStatus
  compromise: string
  body: string
  groupId: string
}

export interface FeatureGroup {
  id: string
  title: string
  description: string
  features: FeatureEntry[]
}

export interface OverviewDoc {
  slug: 'architecture' | 'compat' | 'matrix'
  title: string
  lede: string
  body: string
}

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  done: '已落地',
  compromise: '有意差异',
  partial: '部分完成',
  'not done': '未完成',
}

const GROUP_DEFS: { id: string; title: string; description: string; ids: string[] }[] = [
  {
    id: 'kernel',
    title: '内核与主循环',
    description: '插件内核、一轮对话如何步进、提示与工具如何组装，以及协议和本地存储。',
    ids: [
      'F-KERNEL',
      'F-LOOP',
      'F-PROMPT',
      'F-TOOLS',
      'F-TOOL-ORDER',
      'F-COMPOSE',
      'F-COMPACT',
      'F-SPILL',
      'F-GUARD',
      'F-HMR',
      'F-PROTO',
      'F-STORE',
    ],
  },
  {
    id: 'modes',
    title: '模式',
    description: 'Standard、Code、Minimal、Creator 四套工具目录，以及计划模式。',
    ids: ['F-MODE-STD', 'F-MODE-CODE', 'F-MODE-MIN', 'F-MODE-CREATOR', 'F-PLAN'],
  },
  {
    id: 'session',
    title: '会话与上下文',
    description: '会话生命周期、标题、检索、检查点、引用、附件和斜杠命令。',
    ids: [
      'F-SESSION',
      'F-TITLE',
      'F-QUERY',
      'F-CHECKPOINT',
      'F-OUTLINE',
      'F-STATS',
      'F-AGENTS',
      'F-REF',
      'F-ATTACH',
      'F-CMD',
      'F-FEEDBACK',
    ],
  },
  {
    id: 'tools',
    title: '工具',
    description: '文件、命令、搜索、子代理、网页、日程，以及交付和提问。',
    ids: [
      'F-FS',
      'F-SHELL',
      'F-SEARCH',
      'F-DIFF',
      'F-WEB',
      'F-PWSH',
      'F-SUB',
      'F-SUB-EXT',
      'F-FLOW',
      'F-JOB',
      'F-SCHED',
      'F-ASK',
      'F-PRESENT',
      'F-SKILL',
      'F-GOAL',
      'F-TODO',
      'F-MCP',
      'F-LSP',
      'F-BU',
      'F-CU',
      'F-SSH',
      'F-WEBHOOK',
    ],
  },
  {
    id: 'ui',
    title: '界面',
    description: '三栏布局、对话、文件、终端、设置、预览，以及浏览器里打不开的桌面能力。',
    ids: [
      'F-UI-SHELL',
      'F-UI-SESSION',
      'F-UI-CHAT',
      'F-UI-FILES',
      'F-UI-RIGHT',
      'F-UI-TERM',
      'F-UI-PLUGIN',
      'F-UI-SETTINGS',
      'F-UI-APPROVAL',
      'F-UI-SCHED',
      'F-SETTINGS-PAGES',
      'F-SHORTCUT',
      'F-PICKER',
      'F-PREVIEW',
      'F-OPENAPP',
      'F-OFFICE',
      'F-VOICE',
      'F-DESKTOP',
    ],
  },
  {
    id: 'plugins',
    title: '插件与扩展',
    description: '插件的安装与启停、前端扩展、钩子、凭证、团队和自动审查。',
    ids: ['F-PLUGIN', 'F-EXT', 'F-KV', 'F-HOOKS', 'F-CRED', 'F-TEAM', 'F-INSPECT', 'F-AUTOREVIEW'],
  },
  {
    id: 'infra',
    title: '基础设施',
    description: '模型供应商、鉴权、权限、工作区、命令行，以及明确不移植的产品表面。',
    ids: [
      'F-PROVIDER',
      'F-ACCOUNT',
      'F-AUTH',
      'F-PERM',
      'F-SANDBOX',
      'F-WORKSPACE',
      'F-CLI',
      'F-ACP',
      'F-SDK',
      'F-TELEMETRY',
    ],
  },
]

/** Filenames in the source docs that do not match the feature slug. */
const SLUG_ALIASES: Record<string, string> = {
  'f-protocol-协议': 'f-proto-协议',
}

interface MatrixRow {
  id: string
  summary: string
  priority: string
  status: FeatureStatus
  compromise: string
  order: number
}

const featureModules = import.meta.glob('../content/code-harness/features/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function asRaw(mod: unknown, label: string): string {
  if (typeof mod === 'string') return mod
  throw new Error(`${label} 不是 Markdown 原文`)
}

function fileSlug(path: string): string {
  const name = path.split('/').pop() ?? path
  return decodeURIComponent(name.replace(/\.md(?:\?.*)?$/, ''))
}

function splitTitle(markdown: string): { title: string; body: string } {
  const match = markdown.match(/^#\s+(.+)\r?\n/)
  if (!match || match.index === undefined) {
    return { title: '', body: markdown.trim() }
  }
  return {
    title: match[1].trim(),
    body: markdown.slice(match.index + match[0].length).replace(/^\n/, ''),
  }
}

function displayName(id: string, title: string): string {
  const prefix = `${id} `
  if (title.startsWith(prefix)) return title.slice(prefix.length).trim()
  return title.trim() || id
}

function parseMatrix(markdown: string): MatrixRow[] {
  const rows: MatrixRow[] = []
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith('| F-')) continue
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 6) continue
    const status = cells[4]
    if (status !== 'done' && status !== 'partial' && status !== 'compromise' && status !== 'not done') {
      throw new Error(`功能矩阵状态无法识别：${cells[0]} → ${status}`)
    }
    rows.push({
      id: cells[0],
      summary: cells[1],
      priority: cells[3],
      status,
      compromise: cells[5],
      order: rows.length,
    })
  }
  return rows
}

function matchFeatureId(slug: string, ids: string[]): string | undefined {
  const ranked = [...ids].sort((a, b) => b.length - a.length)
  for (const id of ranked) {
    const prefix = id.toLowerCase()
    if (slug === prefix || slug.startsWith(`${prefix}-`)) return id
  }
  return undefined
}

function resolveHref(raw: string, featureSlugs: Set<string>): string | null {
  if (raw.startsWith('#')) return raw
  if (raw.startsWith('/')) return raw

  const hashAt = raw.indexOf('#')
  const path = hashAt >= 0 ? raw.slice(0, hashAt) : raw
  const hash = hashAt >= 0 ? raw.slice(hashAt) : ''

  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    if (/github\.com\/Ccccx\/code-harness/i.test(path)) return null
    return raw
  }

  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '')
  if (normalized === '' && hash) return hash
  if (normalized === 'features' || normalized === 'features/') return `/code-harness${hash}`

  const base = normalized.split('/').pop() ?? normalized
  const stem = decodeURIComponent(base.replace(/\.md$/i, ''))
  if (stem === 'architecture') return `/code-harness/architecture${hash}`
  if (stem === 'compat') return `/code-harness/compat${hash}`
  if (stem === 'feature-matrix') return `/code-harness/matrix${hash}`
  if (stem === 'index') return `/code-harness${hash}`

  const featureStem = SLUG_ALIASES[stem] ?? stem
  if (featureSlugs.has(featureStem)) return `/code-harness/features/${featureStem}${hash}`
  return null
}

function linkLabel(text: string, href: string, names: Map<string, string>): string {
  const looksLikePath = /(?:^|\/)[^)\s]+\.md$/.test(text) || text === 'features/' || text.endsWith('/features/')
  if (!looksLikePath) return text
  if (href === '/code-harness' || href.startsWith('/code-harness#')) return '功能总览'
  if (href.startsWith('/code-harness/architecture')) return '架构'
  if (href.startsWith('/code-harness/compat')) return '差异说明'
  if (href.startsWith('/code-harness/matrix')) return '功能矩阵'
  if (href.startsWith('/code-harness/features/')) {
    const slug = href.slice('/code-harness/features/'.length).split('#')[0]
    return names.get(slug) ?? text
  }
  return text
}

export function rewriteHarnessMarkdown(
  markdown: string,
  featureSlugs: Set<string>,
  names: Map<string, string>,
): string {
  const rewriteLinks = (text: string) =>
    text.replace(/(^|[^!])\[([^\]]*)\]\(([^)\s]+)\)/g, (...args: string[]) => {
      const prefix = args[1] ?? ''
      const label = args[2] ?? ''
      const href = args[3] ?? ''
      const next = resolveHref(href, featureSlugs)
      if (!next) return `${prefix}${label}`
      return `${prefix}[${linkLabel(label, next, names)}](${next})`
    })

  const rewriteProse = (text: string) =>
    text
      .split(/(`[^`\n]*`)/g)
      .map((part, index) => (index % 2 === 1 ? part : rewriteLinks(part)))
      .join('')

  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) => (index % 2 === 1 ? part : rewriteProse(part)))
    .join('')
}

function linkMatrixIds(markdown: string, slugById: Map<string, string>): string {
  return markdown.replace(/^\| (F-[A-Z0-9-]+) \|/gm, (line, id: string) => {
    const slug = slugById.get(id)
    if (!slug) return line
    return line.replace(`| ${id} |`, `| [${id}](/code-harness/features/${slug}) |`)
  })
}

function loadFeatures(): { features: FeatureEntry[]; groups: FeatureGroup[] } {
  const matrix = parseMatrix(asRaw(matrixRaw, 'feature-matrix.md'))
  const ids = matrix.map((row) => row.id)
  const byId = new Map(matrix.map((row) => [row.id, row]))

  const files = Object.entries(featureModules).map(([path, mod]) => ({
    slug: fileSlug(path),
    raw: asRaw(mod, path),
  }))

  if (files.length !== matrix.length) {
    throw new Error(`功能文档 ${files.length} 份，矩阵 ${matrix.length} 行，数量不一致`)
  }

  const slugById = new Map<string, string>()
  for (const file of files) {
    const id = matchFeatureId(file.slug, ids)
    if (!id) throw new Error(`功能文档无法对应矩阵编号：${file.slug}`)
    if (slugById.has(id)) throw new Error(`功能编号重复：${id}`)
    slugById.set(id, file.slug)
  }
  for (const id of ids) {
    if (!slugById.has(id)) throw new Error(`矩阵编号没有功能页：${id}`)
  }

  const featureSlugs = new Set(files.map((file) => file.slug))
  const names = new Map<string, string>()
  for (const file of files) {
    const id = matchFeatureId(file.slug, ids)
    if (!id) continue
    const { title } = splitTitle(file.raw)
    names.set(file.slug, displayName(id, title))
  }

  const groupOf = new Map<string, string>()
  for (const group of GROUP_DEFS) {
    for (const id of group.ids) {
      if (!byId.has(id)) throw new Error(`分组引用了不存在的功能：${id}`)
      if (groupOf.has(id)) throw new Error(`功能被分到多个组：${id}`)
      groupOf.set(id, group.id)
    }
  }
  for (const id of ids) {
    if (!groupOf.has(id)) throw new Error(`功能未分组：${id}`)
  }

  const fileBySlug = new Map(files.map((file) => [file.slug, file.raw]))
  const features = matrix.map((row) => {
    const slug = slugById.get(row.id)
    if (!slug) throw new Error(`缺少功能页：${row.id}`)
    const raw = fileBySlug.get(slug)
    if (raw === undefined) throw new Error(`缺少功能正文：${slug}`)
    const rewritten = rewriteHarnessMarkdown(raw, featureSlugs, names)
    const { title, body } = splitTitle(rewritten)
    return {
      id: row.id,
      slug,
      title,
      name: names.get(slug) ?? row.id,
      summary: row.summary,
      priority: row.priority,
      status: row.status,
      compromise: rewriteHarnessMarkdown(row.compromise, featureSlugs, names),
      body,
      groupId: groupOf.get(row.id) ?? '',
    }
  })

  const featuresById = new Map(features.map((feature) => [feature.id, feature]))
  const groups = GROUP_DEFS.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    features: [...group.ids]
      .sort((a, b) => (byId.get(a)?.order ?? 0) - (byId.get(b)?.order ?? 0))
      .map((id) => featuresById.get(id))
      .filter((feature): feature is FeatureEntry => Boolean(feature)),
  }))

  return { features, groups }
}

const loaded = loadFeatures()

export const features: FeatureEntry[] = loaded.features
export const groups: FeatureGroup[] = loaded.groups

const featureSlugs = new Set(features.map((feature) => feature.slug))
const featureNames = new Map(features.map((feature) => [feature.slug, feature.name]))
const slugById = new Map(features.map((feature) => [feature.id, feature.slug]))

function overview(slug: OverviewDoc['slug'], lede: string, raw: string): OverviewDoc {
  const rewritten = rewriteHarnessMarkdown(asRaw(raw, slug), featureSlugs, featureNames)
  const withLinks = slug === 'matrix' ? linkMatrixIds(rewritten, slugById) : rewritten
  const { title, body } = splitTitle(withLinks)
  return { slug, title, lede, body }
}

export const overviewDocs: Record<OverviewDoc['slug'], OverviewDoc> = {
  architecture: overview(
    'architecture',
    '插件化内核、主循环、模式、模型和浏览器协议的目标结构。',
    architectureRaw,
  ),
  compat: overview(
    'compat',
    '和 DeepSeek Harness 有意不一致的地方：原因，以及 code-harness 的替代做法。',
    compatRaw,
  ),
  matrix: overview(
    'matrix',
    '86 项功能的优先级、done / compromise 状态，以及对应的差异说明。',
    matrixRaw,
  ),
}

export function getFeature(slug: string): FeatureEntry | undefined {
  return features.find((feature) => feature.slug === slug)
}

export function featureNeighbors(slug: string): { prev?: FeatureEntry; next?: FeatureEntry } {
  const index = features.findIndex((feature) => feature.slug === slug)
  if (index < 0) return {}
  return {
    prev: features[index - 1],
    next: features[index + 1],
  }
}

export function featurePath(slug: string): string {
  return `/code-harness/features/${encodeURIComponent(slug)}`
}

export const harnessStats = {
  total: features.length,
  done: features.filter((feature) => feature.status === 'done').length,
  compromise: features.filter((feature) => feature.status === 'compromise').length,
  partial: features.filter((feature) => feature.status === 'partial').length,
  notDone: features.filter((feature) => feature.status === 'not done').length,
}
