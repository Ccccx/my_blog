export const PRIMARY_BRIEF_URL = 'https://news.learnprompt.pro/data/daily-brief.json'
export const FALLBACK_BRIEF_URL =
  'https://raw.githubusercontent.com/LearnPrompt/ai-news-radar/master/data/daily-brief.json'
export const DEV_BRIEF_PROXY = '/api/daily-brief'

export interface BriefHeadline {
  id: string
  title: string
  review?: string
  url: string
}

export interface BriefFeed {
  generatedAt?: string
  headlines: BriefHeadline[]
}

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function snippet(text: string, max = 72): string {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1)}…`
}

function chineseTitle(item: JsonRecord): string | undefined {
  const primary = isRecord(item.primary_item) ? item.primary_item : undefined
  const firstSource = Array.isArray(item.sources) && isRecord(item.sources[0]) ? item.sources[0] : undefined
  const nested = Array.isArray(item.items) && isRecord(item.items[0]) ? item.items[0] : undefined
  return (
    asString(primary?.title_zh) ||
    asString(firstSource?.title_zh) ||
    asString(nested?.title_zh) ||
    asString(item.title_zh) ||
    asString(item.title)
  )
}

export function headlineFromItem(item: unknown): BriefHeadline | null {
  if (!isRecord(item)) return null
  const url = asString(item.url) || asString(item.primary_url)
  const title = chineseTitle(item)
  if (!url || !title) return null
  const review = asString(item.persona_review)
  return {
    id: asString(item.story_id) || url,
    title,
    review: review ? snippet(review) : undefined,
    url,
  }
}

export function headlinesFromBrief(data: unknown): BriefFeed {
  if (!isRecord(data)) return { headlines: [] }
  const items = Array.isArray(data.items) ? data.items : []
  return {
    generatedAt: asString(data.generated_at),
    headlines: items.map(headlineFromItem).filter((item): item is BriefHeadline => item !== null),
  }
}

export function briefSources(isDev = false): string[] {
  const remote = [PRIMARY_BRIEF_URL, FALLBACK_BRIEF_URL]
  return isDev ? [DEV_BRIEF_PROXY, ...remote] : remote
}

export async function fetchDailyBrief(isDev = import.meta.env.DEV): Promise<BriefFeed> {
  let lastError: unknown
  for (const url of briefSources(isDev)) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        lastError = new Error(`${url} → ${response.status}`)
        continue
      }
      const feed = headlinesFromBrief(await response.json())
      if (feed.headlines.length > 0) return feed
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('daily brief unavailable')
}

export function formatGeneratedAt(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
