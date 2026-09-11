import { headlinesFromBrief, headlineFromItem, briefSources } from '../src/lib/dailyBrief.ts'

const item = {
  story_id: 's1',
  title: 'English only title',
  url: 'https://example.com/a',
  persona_review: '这是一段偏长的点评，用来确认摘要会被截断处理。',
  primary_item: { title_zh: '中文标题优先', title: 'ignored' },
}

const headline = headlineFromItem(item)
if (!headline) {
  console.error('FAIL: headlineFromItem returned null')
  process.exit(1)
}
if (headline.title !== '中文标题优先') {
  console.error('FAIL: should prefer primary_item.title_zh, got', headline.title)
  process.exit(1)
}
if (!headline.review?.includes('这是一段偏长的点评')) {
  console.error('FAIL: should include persona_review snippet')
  process.exit(1)
}
if (headline.url !== 'https://example.com/a') {
  console.error('FAIL: unexpected url', headline.url)
  process.exit(1)
}

const fallbackTitle = headlineFromItem({
  title: 'Fallback title',
  url: 'https://example.com/b',
  sources: [{ title_zh: '来源中文标题' }],
})
if (fallbackTitle?.title !== '来源中文标题') {
  console.error('FAIL: should use sources[0].title_zh', fallbackTitle)
  process.exit(1)
}

const brief = headlinesFromBrief({
  generated_at: '2026-09-11T09:42:06.729473Z',
  items: [item, { title: 'no url' }, { title: 'ok', url: 'https://example.com/c' }],
})
if (brief.generatedAt !== '2026-09-11T09:42:06.729473Z') {
  console.error('FAIL: generatedAt missing')
  process.exit(1)
}
if (brief.headlines.length !== 2) {
  console.error('FAIL: should skip items without url', brief.headlines.length)
  process.exit(1)
}

const sources = briefSources(false)
if (
  sources[0] !== 'https://news.learnprompt.pro/data/daily-brief.json' ||
  !sources.includes(
    'https://raw.githubusercontent.com/LearnPrompt/ai-news-radar/master/data/daily-brief.json',
  )
) {
  console.error('FAIL: production sources order', sources)
  process.exit(1)
}

const devSources = briefSources(true)
if (devSources[0] !== '/api/daily-brief') {
  console.error('FAIL: dev should prefer Vite proxy', devSources)
  process.exit(1)
}

console.log('OK: daily-brief headline parsing and source fallback')
