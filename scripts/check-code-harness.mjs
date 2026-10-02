import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { features, groups, harnessStats, overviewDocs } from '../src/lib/codeHarness.ts'
import { githubSlug } from '../src/lib/slug.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'src/content/code-harness')
let failed = false

function fail(message) {
  console.error(`FAIL: ${message}`)
  failed = true
}

if (features.length !== 86) fail(`expected 86 features, got ${features.length}`)
if (harnessStats.done !== 64) fail(`expected 64 done, got ${harnessStats.done}`)
if (harnessStats.compromise !== 22) fail(`expected 22 compromise, got ${harnessStats.compromise}`)
if (harnessStats.partial !== 0 || harnessStats.notDone !== 0) {
  fail(`unexpected partial/not done: ${harnessStats.partial}/${harnessStats.notDone}`)
}

const seen = new Set()
let grouped = 0
for (const group of groups) {
  for (const feature of group.features) {
    grouped += 1
    if (seen.has(feature.id)) fail(`duplicate group member ${feature.id}`)
    seen.add(feature.id)
    if (feature.groupId !== group.id) fail(`${feature.id} group mismatch`)
  }
}
if (grouped !== 86) fail(`grouped ${grouped} features`)
for (const feature of features) {
  if (!seen.has(feature.id)) fail(`ungrouped ${feature.id}`)
  if (!feature.body.trim()) fail(`empty body ${feature.id}`)
  if (!feature.name || feature.name === feature.id) fail(`missing display name ${feature.id}`)
}

function headingIds(markdown) {
  const ids = new Set()
  const counts = new Map()
  for (const match of markdown.matchAll(/^#{1,6} +(.+)$/gm)) {
    const base = githubSlug(match[1]) || 'section'
    const seenCount = counts.get(base) ?? 0
    counts.set(base, seenCount + 1)
    ids.add(seenCount === 0 ? base : `${base}-${seenCount}`)
  }
  return ids
}

const compatIds = headingIds(overviewDocs.compat.body)
const pages = [
  ...features.map((feature) => ({ label: feature.id, body: `${feature.compromise}\n${feature.body}` })),
  ...Object.values(overviewDocs).map((doc) => ({ label: doc.slug, body: doc.body })),
]

const hrefPattern = /\[[^\]]*\]\(([^)\s]+)\)/g
for (const page of pages) {
  for (const match of page.body.matchAll(hrefPattern)) {
    const href = match[1]
    if (/pai-eas\.aliyuncs\.com/i.test(href)) fail(`${page.label} still links a PAI-EAS host`)
    if (/github\.com\/Ccccx\/code-harness/i.test(href)) fail(`${page.label} links the private repo`)
    if (href.includes('../') || /\.md($|#)/.test(href) || href.startsWith('features/')) {
      fail(`${page.label} has an unresolved relative link ${href}`)
    }
    if (href.startsWith('/code-harness/features/')) {
      const slug = decodeURIComponent(href.slice('/code-harness/features/'.length).split('#')[0])
      if (!features.some((feature) => feature.slug === slug)) fail(`${page.label} feature link missing ${href}`)
    }
    if (href.startsWith('/code-harness/compat#')) {
      const id = decodeURIComponent(href.split('#')[1])
      if (!compatIds.has(id)) fail(`${page.label} compat anchor missing #${id}`)
    }
  }
}

if (!overviewDocs.architecture.body.includes('/code-harness/features/f-proto-协议')) {
  fail('architecture protocol link was not rewritten to F-PROTO')
}
if (!features.some((feature) => feature.slug === 'f-proto-协议')) fail('missing f-proto-协议')

const forbidden = [
  /pai-eas\.aliyuncs\.com/i,
  /github\.com\/Ccccx\/code-harness/i,
  /1985134404020864/,
  /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/,
  /\bsk-[A-Za-z0-9]{16,}\b/,
]

function walk(dir) {
  const files = []
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name)
    if (name.isDirectory()) files.push(...walk(path))
    else if (name.name.endsWith('.md')) files.push(path)
  }
  return files
}

for (const path of walk(contentDir)) {
  const text = readFileSync(path, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(text)) fail(`${path} matches ${pattern}`)
  }
}

const samples = ['c1-内核语言', 'c9-code-模式与-ptc', 'c18-powershell', 'c19-office-预览', 'c20-系统应用打开文件']
for (const id of samples) {
  if (!compatIds.has(id)) fail(`compat heading slug missing ${id}`)
}

if (failed) process.exit(1)
console.log(
  `OK: code-harness topic has ${features.length} features (${harnessStats.done} done, ${harnessStats.compromise} compromise)`,
)
