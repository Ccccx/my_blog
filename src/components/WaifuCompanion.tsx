import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchDailyBrief,
  formatGeneratedAt,
  type BriefFeed,
  type BriefHeadline,
} from '../lib/dailyBrief'
import {
  adoptLive2d,
  loadLive2dWidget,
  setLive2dVisible,
  stashLive2d,
  waitForLive2dNode,
} from '../lib/live2dWidget'
import {
  clampPosition,
  defaultBottomRight,
  movementExceeded,
  nextDragPosition,
  readStoredPosition,
  writeStoredPosition,
  type Point,
  type Size,
} from '../lib/waifuPosition'
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

function viewport(): Size {
  return { width: window.innerWidth, height: window.innerHeight }
}

export function WaifuCompanion() {
  const shellRef = useRef<HTMLDivElement>(null)
  const live2dHostRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    start: Point
    origin: Point
    moved: boolean
  } | null>(null)
  const skipClickRef = useRef(false)
  const posRef = useRef<Point | null>(null)

  const [state, setState] = useState<CompanionState>(() =>
    typeof window === 'undefined' ? 'open' : readState(),
  )
  const [feed, setFeed] = useState<BriefFeed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState<Point | null>(null)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [live2dReady, setLive2dReady] = useState(false)

  const measure = useCallback((): Size => {
    const rect = shellRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) {
      return state === 'open' ? { width: 360, height: 320 } : { width: 88, height: 88 }
    }
    return { width: rect.width, height: rect.height }
  }, [state])

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
    if (state !== 'open' || !live2dReady) return
    let cancelled = false
    waitForLive2dNode().then((node) => {
      if (!cancelled && node && live2dHostRef.current) adoptLive2d(live2dHostRef.current)
    })
    return () => {
      cancelled = true
    }
  }, [state, live2dReady])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readStoredPosition()
      const size = measure()
      const next = stored
        ? clampPosition(stored, size, viewport())
        : defaultBottomRight(size, viewport())
      posRef.current = next
      setPos(next)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [state, live2dReady, measure])

  useEffect(() => {
    const onResize = () => {
      setPos((prev) => {
        if (!prev) return prev
        const next = clampPosition(prev, measure(), viewport())
        posRef.current = next
        return next
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  const headlines = feed?.headlines ?? []
  const current: BriefHeadline | undefined = headlines[index]

  useEffect(() => {
    if (state !== 'open' || paused || dragging || headlines.length < 2) return
    const delay = reducedMotion ? ROTATE_REDUCED_MS : ROTATE_MS
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length)
    }, delay)
    return () => window.clearInterval(timer)
  }, [state, paused, dragging, headlines.length, reducedMotion])

  const generatedLabel = useMemo(() => formatGeneratedAt(feed?.generatedAt), [feed])

  function persist(next: CompanionState) {
    if (next !== 'open') stashLive2d()
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement).closest('.waifu-actions')) return
    if (!pos) return
    const drag = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: pos,
      moved: false,
    }
    dragRef.current = drag
    skipClickRef.current = false

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return
      const now = { x: moveEvent.clientX, y: moveEvent.clientY }
      if (!drag.moved && !movementExceeded(drag.start, now)) return
      if (!drag.moved) {
        drag.moved = true
        skipClickRef.current = true
        setDragging(true)
        shellRef.current?.setPointerCapture(moveEvent.pointerId)
      }
      const next = nextDragPosition(drag.origin, drag.start, now, measure(), viewport())
      posRef.current = next
      setPos(next)
    }

    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== drag.pointerId) return
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      dragRef.current = null
      setDragging(false)
      if (drag.moved && posRef.current) writeStoredPosition(posRef.current)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!skipClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    skipClickRef.current = false
  }

  const placed = Boolean(pos)
  const shellClass = [
    state === 'open' ? 'waifu-dock' : state === 'min' ? 'waifu-mini' : 'waifu-restore',
    reducedMotion ? 'is-static' : '',
    live2dReady && state === 'open' ? 'has-live2d' : '',
    placed ? 'is-placed' : '',
    dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const shellStyle = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : undefined

  const shellProps = {
    ref: shellRef,
    className: shellClass,
    style: shellStyle,
    onPointerDown,
    onClickCapture,
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => {
      if (!dragging) setPaused(false)
    },
  }

  if (state === 'hidden') {
    return (
      <div
        {...shellProps}
        role="button"
        tabIndex={0}
        aria-label="显示看板娘"
        onClick={() => persist('open')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') persist('open')
        }}
      >
        看板娘
      </div>
    )
  }

  if (state === 'min') {
    return (
      <div
        {...shellProps}
        role="button"
        tabIndex={0}
        aria-label="展开看板娘"
        onClick={() => persist('open')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') persist('open')
        }}
      >
        <WaifuAvatar />
      </div>
    )
  }

  return (
    <div {...shellProps}>
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
      <div ref={live2dHostRef} className="waifu-live2d-host" aria-hidden="true" />
    </div>
  )
}
