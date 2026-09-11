import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from '../src/components/Markdown.tsx'

const featuredBody = readFileSync(
  new URL('../src/content/20260911GitHub日榜分析.md', import.meta.url),
  'utf8',
)

const html = renderToStaticMarkup(createElement(Markdown, { content: featuredBody }))

const required = [
  ['<table', 'GFM 表格应渲染为 <table>'],
  ['ayghri/i-have-adhd', '榜首仓库'],
  ['vastsa/PI-Desktop', '第 16 个仓库'],
  ['3882', 'i-have-adhd 日增星'],
]

let failed = false
for (const [needle, label] of required) {
  if (!html.includes(needle)) {
    console.error(`FAIL: ${label} — 未找到 ${needle}`)
    failed = true
  }
}

if (failed) {
  console.error('rendered prefix:', html.slice(0, 400))
  process.exit(1)
}

console.log('OK: markdown tables and 16-repo analysis content render')
