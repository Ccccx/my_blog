import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Experience } from '../panda/Experience'
import {
  INITIAL_PANDAS,
  PANDA_CAP,
  findSpawnSpot,
} from '../panda/ground'
import type { PandaData } from '../panda/ground'
import './PandaParadise.css'

const HINTS = [
  {
    zh: '拖动空白处，转动整个地台',
    en: 'Drag empty space to turn the diorama',
  },
  {
    zh: '在草地上画个圈，长出一只熊猫宝宝',
    en: 'Draw a circle on the grass to grow a panda cub',
  },
  {
    zh: '拖动熊猫，换个地方',
    en: 'Drag a panda to a new spot',
  },
]

const INSPIRATION = 'https://x.com/EianLu/status/2115624666161418709'

type BoundaryState = { failed: boolean }

class PandaBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="panda-loading">
          这个浏览器打不开立体场景，可以换一个现代浏览器再来。
        </div>
      )
    }
    return this.props.children
  }
}

export function PandaParadise() {
  const stageRef = useRef<HTMLDivElement>(null)
  const pandasRef = useRef<PandaData[]>(INITIAL_PANDAS)
  const nextId = useRef(INITIAL_PANDAS.length + 1)
  const [pandas, setPandas] = useState<PandaData[]>(INITIAL_PANDAS)
  const [hint, setHint] = useState(0)
  const [hintEpoch, setHintEpoch] = useState(0)
  const [resetSignal, setResetSignal] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    pandasRef.current = pandas
  }, [pandas])

  useEffect(() => {
    const previous = document.title
    document.title = '熊猫乐园'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setHint((index) => (index + 1) % HINTS.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [hintEpoch])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 2400)
    return () => window.clearTimeout(id)
  }, [notice])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const showHint = useCallback((index: number) => {
    setHint(index)
    setHintEpoch((epoch) => epoch + 1)
  }, [])

  const movePanda = useCallback((id: number, x: number, z: number, yaw?: number) => {
    setPandas((prev) =>
      prev.map((panda) =>
        panda.id === id ? { ...panda, x, z, yaw: yaw ?? panda.yaw } : panda,
      ),
    )
  }, [])

  const growPanda = useCallback((x: number, z: number) => {
    const prev = pandasRef.current
    if (prev.length >= PANDA_CAP) {
      setNotice('乐园里已经有 12 只熊猫宝宝啦')
      return
    }
    const spot = findSpawnSpot(x, z, prev)
    if (!spot) {
      setNotice('换一块空草地再画个圈吧')
      return
    }
    const id = nextId.current
    nextId.current += 1
    const yaw = Math.atan2(5.2 - spot.x, 6.25 - spot.z)
    const cub: PandaData = {
      id,
      x: spot.x,
      z: spot.z,
      yaw,
      scale: 0.84 + Math.random() * 0.22,
      bornAt: performance.now(),
    }
    const next = [...prev, cub]
    pandasRef.current = next
    setPandas(next)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current
    if (!stage) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await stage.requestFullscreen()
    } catch {
      setNotice('这个浏览器暂时不能全屏')
    }
  }, [])

  const tip = HINTS[hint]

  return (
    <div className="panda-stage" ref={stageRef} data-pandas={pandas.length} data-hint={hint}>
      <PandaBoundary>
        <div className="panda-canvas">
          <Canvas
            shadows
            dpr={[1, 1.6]}
            camera={{ position: [5.2, 5.05, 6.25], fov: 32, near: 0.1, far: 60 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor('#f4efe6')
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.05
            }}
          >
            <Suspense fallback={null}>
              <Experience
                pandas={pandas}
                resetSignal={resetSignal}
                onMove={movePanda}
                onCircle={growPanda}
                onIntent={showHint}
              />
            </Suspense>
          </Canvas>
        </div>
      </PandaBoundary>
      <div className="panda-toolbar">
        <button type="button" onClick={() => setResetSignal((n) => n + 1)}>
          复位
        </button>
        <button type="button" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? '退出全屏' : '全屏'}>
          {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>
      {notice ? <p className="panda-notice">{notice}</p> : null}
      <div className="panda-hint" aria-live="polite">
        <p>{tip.zh}</p>
        <p>{tip.en}</p>
      </div>
      <p className="panda-credit">
        灵感来自{' '}
        <a href={INSPIRATION} target="_blank" rel="noreferrer">
          Eian 的熊猫乐园
        </a>
      </p>
    </div>
  )
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
