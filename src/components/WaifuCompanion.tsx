import { useEffect, useMemo, useState } from 'react'
import {
  fetchDailyBrief,
  formatGeneratedAt,
  type BriefFeed,
  type BriefHeadline,
} from '../lib/dailyBrief'
import { loadLive2dWidget, setLive2dVisible } from '../lib/live2dWidget'
import { WaifuAvatar } from './WaifuAvatar'

const STORAGE_KEY = 'waifu-companion-state'
const ROTATE_MS = 6500
const ROTATE_REDUCED_MS = 12000

type CompanionState = 'open' | 'min' | 'hidden'

function readState(): CompanionState {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'min' || value === 'hidden' || value === 'open') return value
  } catch {
    /* ignore */
  }
  return 'open'
}

export function WaifuCompanion() {
  const [state, setState] = useState<CompanionState>(() =>
    typeof window === 'undefined' ? 'open' : readState(),
  )
  const [feed, setFeed] = useState<BriefFeed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [live2dReady, setLive2dReady] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchDailyBrief()
      .then((next) => {
        if (!cancelled) setFeed(next)
      })
      .catch(() => {
        if (!cancelled) setError('雷达暂时连不上，稍后再试～')
      })
    loadLive2dWidget().then((ok) => {
      if (!cancelled) setLive2dReady(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setLive2dVisible(state === 'open' && live2dReady)
  }, [state, live2dReady])

  const headlines = feed?.headlines ?? []
  const current: BriefHeadline | undefined = headlines[index]

  useEffect(() => {
    if (state !== 'open' || paused || headlines.length < 2) return
    const delay = reducedMotion ? ROTATE_REDUCED_MS : ROTATE_MS
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length)
    }, delay)
    return () => window.clearInterval(timer)
  }, [state, paused, headlines.length, reducedMotion])

  const generatedLabel = useMemo(() => formatGeneratedAt(feed?.generatedAt), [feed])

  function persist(next: CompanionState) {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  if (state === 'hidden') {
    return (
      <button
        type="button"
        className="waifu-restore"
        onClick={() => persist('open')}
        aria-label="显示看板娘"
      >
        看板娘
      </button>
    )
  }

  if (state === 'min') {
    return (
      <button
        type="button"
        className="waifu-mini"
        onClick={() => persist('open')}
        aria-label="展开看板娘"
      >
        <WaifuAvatar />
      </button>
    )
  }

  return (
    <aside
      className={`waifu-dock${reducedMotion ? ' is-static' : ''}${live2dReady ? ' has-live2d' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="waifu-panel">
        <div className="waifu-toolbar">
          <span className="waifu-kicker">AI News Radar</span>
          <div className="waifu-actions">
            <button type="button" onClick={() => persist('min')} aria-label="最小化看板娘">
              –
            </button>
            <button type="button" onClick={() => persist('hidden')} aria-label="关闭看板娘">
              ×
            </button>
          </div>
        </div>
        <div className="waifu-body">
          <div className="waifu-avatar-wrap" aria-hidden="true">
            <WaifuAvatar />
          </div>
          <div className="waifu-bubble">
            {current ? (
              <a href={current.url} target="_blank" rel="noreferrer" className="waifu-headline">
                <strong>{current.title}</strong>
                {current.review ? <span>{current.review}</span> : null}
              </a>
            ) : (
              <p className="waifu-status">{error ?? '正在收听今日雷达…'}</p>
            )}
            <p className="waifu-meta">
              {generatedLabel ? `简报 ${generatedLabel}` : 'LearnPrompt 日更'}
              {headlines.length > 0 ? ` · ${index + 1}/${headlines.length}` : ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
