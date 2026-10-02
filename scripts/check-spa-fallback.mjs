import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const indexPath = join(distDir, 'index.html')

if (!existsSync(indexPath)) {
  console.error('FAIL: dist/index.html missing — run build first')
  process.exit(1)
}

const index = readFileSync(indexPath, 'utf8')
const featuredSlug = '20260911GitHub日榜分析'
const featuredEncoded = encodeURIComponent(featuredSlug)

const requiredFiles = [
  ['404.html', 'SPA 404 redirect'],
  [`posts/${featuredSlug}/index.html`, 'unicode article path'],
  [`posts/${featuredEncoded}/index.html`, 'percent-encoded article path'],
  ['about/index.html', 'about route'],
]

let failed = false

for (const [rel, label] of requiredFiles) {
  const path = join(distDir, rel)
  if (!existsSync(path)) {
    console.error(`FAIL: ${label} — missing dist/${rel}`)
    failed = true
    continue
  }
  const body = readFileSync(path, 'utf8')
  if (rel === '404.html') {
    if (!body.includes('pathSegmentsToKeep') || !body.includes('/?/')) {
      console.error('FAIL: dist/404.html is not the project-pages redirect trick')
      failed = true
    }
    if (body.includes('id="root"')) {
      console.error('FAIL: dist/404.html was overwritten with index.html')
      failed = true
    }
  } else if (!body.includes('id="root"') || body !== index) {
    console.error(`FAIL: ${label} is not a copy of dist/index.html`)
    failed = true
  }
}

const featureDir = join(root, 'src/content/code-harness/features')
const featureSlugs = readdirSync(featureDir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -3))

if (featureSlugs.length !== 86) {
  console.error(`FAIL: expected 86 feature docs, found ${featureSlugs.length}`)
  failed = true
}

const harnessRoutes = [
  'code-harness',
  'code-harness/architecture',
  'code-harness/compat',
  'code-harness/matrix',
  ...featureSlugs.flatMap((slug) => {
    const plain = `code-harness/features/${slug}`
    const encoded = plain
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return encoded === plain ? [plain] : [plain, encoded]
  }),
]

for (const rel of harnessRoutes) {
  const path = join(distDir, rel, 'index.html')
  if (!existsSync(path)) {
    console.error(`FAIL: code-harness route missing dist/${rel}/index.html`)
    failed = true
    continue
  }
  const body = readFileSync(path, 'utf8')
  if (!body.includes('id="root"') || body !== index) {
    console.error(`FAIL: dist/${rel}/index.html is not a copy of dist/index.html`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('OK: SPA fallback files exist for nested GitHub Pages routes')
