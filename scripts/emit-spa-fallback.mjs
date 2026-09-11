import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
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

const targets = [join(distDir, 'about', 'index.html')]

for (const slug of slugs) {
  targets.push(join(distDir, 'posts', slug, 'index.html'))
  const encoded = encodeURIComponent(slug)
  if (encoded !== slug) {
    targets.push(join(distDir, 'posts', encoded, 'index.html'))
  }
}

for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(indexPath, target)
}

console.log(`Emitted ${targets.length} nested SPA index.html files`)
