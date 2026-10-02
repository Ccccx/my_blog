const PUNCTUATION =
  /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g

/** GitHub-style heading slug, so compat anchors such as `#c9-code-模式与-ptc` resolve. */
export function githubSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(PUNCTUATION, '')
    .replace(/\s+/g, '-')
}

export class Slugger {
  private counts = new Map<string, number>()

  slug(value: string): string {
    const base = githubSlug(value) || 'section'
    const seen = this.counts.get(base) ?? 0
    this.counts.set(base, seen + 1)
    return seen === 0 ? base : `${base}-${seen}`
  }
}
