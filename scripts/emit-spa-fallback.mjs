import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const indexPath = join(distDir, 'index.html')
const postsSource = readFileSync(join(root, 'src/data/posts.ts'), 'utf8')
const slugs = [...postsSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])

if (slugs.length === 0) {
  console.error('FAIL: no post slugs found in src/data/posts.ts')
  process.exit(1)
}

const targets = []

function addRoute(relativePath) {
  targets.push(join(distDir, relativePath, 'index.html'))
  const encoded = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  if (encoded !== relativePath) {
    targets.push(join(distDir, encoded, 'index.html'))
  }
}

addRoute('about')
addRoute('code-harness')
addRoute('code-harness/architecture')
addRoute('code-harness/compat')
addRoute('code-harness/matrix')

for (const slug of slugs) {
  addRoute(`posts/${slug}`)
}

const featureDir = join(root, 'src/content/code-harness/features')
const featureSlugs = readdirSync(featureDir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -'.md'.length))

if (featureSlugs.length === 0) {
  console.error('FAIL: no code-harness feature docs in src/content/code-harness/features')
  process.exit(1)
}

for (const slug of featureSlugs) {
  addRoute(`code-harness/features/${slug}`)
}

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(indexPath, target)
}

console.log(`Emitted ${targets.length} nested SPA index.html files`)
