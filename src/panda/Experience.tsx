import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { detectCircle } from './circle'
import { ColliderContext } from './colliders'
import type { ColliderRegistry } from './colliders'
import { GRASS_Y, clampToGrass, insideIsland } from './ground'
import type { PandaData } from './ground'
import { Panda } from './Panda'
import { Scenery } from './Scenery'

type StrokePoint = { sx: number; sy: number; x: number; z: number }

function Stroke({ points }: { points: StrokePoint[] }) {
  const geo = useMemo(() => {
    if (points.length < 2) return null
    const vectors = points.map((p) => new THREE.Vector3(p.x, GRASS_Y + 0.05, p.z))
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.15)
    return new THREE.TubeGeometry(curve, Math.min(96, points.length * 2), 0.03, 5, false)
  }, [points])

  useEffect(() => {
    return () => geo?.dispose()
  }, [geo])

  if (!geo) return null
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#fffef8" />
    </mesh>
  )
}

function Playfield({
  grassRef,
  colliders,
  pandas,
  resetSignal,
  onMove,
  onCircle,
  onIntent,
  dragRef,
}: {
  grassRef: RefObject<THREE.Mesh | null>
  colliders: RefObject<THREE.Mesh[]>
  pandas: PandaData[]
  resetSignal: number
  onMove: (id: number, x: number, z: number, yaw?: number) => void
  onCircle: (x: number, z: number) => void
  onIntent: (index: number) => void
  dragRef: RefObject<number | null>
}) {
  const { camera, gl, size } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.35, 0), [])
  const spherical = useRef(new THREE.Spherical())
  const home = useRef<{ theta: number; phi: number; radius: number } | null>(null)
  const anim = useRef<{
    t0: number
    from: THREE.Spherical
    to: { theta: number; phi: number; radius: number }
  } | null>(null)
  const mode = useRef<
    | { type: 'idle' }
    | { type: 'orbit'; pointerId: number; x: number; y: number }
    | { type: 'draw'; pointerId: number; points: StrokePoint[] }
    | { type: 'drag'; pointerId: number; id: number; x: number; z: number }
  >({ type: 'idle' })
  const onMoveRef = useRef(onMove)
  const onCircleRef = useRef(onCircle)
  const onIntentRef = useRef(onIntent)
  useEffect(() => {
    onMoveRef.current = onMove
    onCircleRef.current = onCircle
    onIntentRef.current = onIntent
  }, [onMove, onCircle, onIntent])
  const [stroke, setStroke] = useState<StrokePoint[]>([])
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const apply = useCallback(() => {
    const s = spherical.current
    camera.position.setFromSpherical(s).add(target)
    camera.lookAt(target)
  }, [camera, target])

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const offset =
      aspect < 0.9 ? new THREE.Vector3(0.6, 8.6, 9.4) : new THREE.Vector3(5.2, 5.05, 6.25)
    spherical.current.setFromVector3(offset)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = aspect < 0.9 ? 36 : 32
      camera.updateProjectionMatrix()
    }
    home.current = {
      theta: spherical.current.theta,
      phi: spherical.current.phi,
      radius: spherical.current.radius,
    }
    apply()
  }, [apply, camera, size.height, size.width])

  useEffect(() => {
    if (!home.current || resetSignal === 0) return
    anim.current = {
      t0: performance.now(),
      from: spherical.current.clone(),
      to: home.current,
    }
  }, [resetSignal])

  useFrame(() => {
    const a = anim.current
    if (!a) return
    const t = Math.min(1, (performance.now() - a.t0) / 680)
    const k = 1 - (1 - t) ** 3
    const s = spherical.current
    s.radius = THREE.MathUtils.lerp(a.from.radius, a.to.radius, k)
    s.phi = THREE.MathUtils.lerp(a.from.phi, a.to.phi, k)
    let dTheta = a.to.theta - a.from.theta
    if (dTheta > Math.PI) dTheta -= Math.PI * 2
    if (dTheta < -Math.PI) dTheta += Math.PI * 2
    s.theta = a.from.theta + dTheta * k
    apply()
    if (t >= 1) anim.current = null
  })

  useEffect(() => {
    const el = gl.domElement
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GRASS_Y)
    const hit = new THREE.Vector3()

    const project = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      return raycaster.ray.intersectPlane(plane, hit) ? hit.clone() : null
    }

    const onDown = (ev: PointerEvent) => {
      if (mode.current.type !== 'idle') return
      if (ev.pointerType === 'mouse' && ev.button !== 0) return
      anim.current = null
      const rect = el.getBoundingClientRect()
      ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)

      const pandaHit = raycaster.intersectObjects(colliders.current ?? [], false)[0]
      const grassHit = grassRef.current
        ? raycaster.intersectObject(grassRef.current, false).length > 0
        : false
      if (pandaHit) {
        const id = pandaHit.object.userData.pandaId as number
        const ground = project(ev.clientX, ev.clientY)
        mode.current = {
          type: 'drag',
          pointerId: ev.pointerId,
          id,
          x: ground?.x ?? 0,
          z: ground?.z ?? 0,
        }
        setDraggingId(id)
        dragRef.current = id
        onIntentRef.current(2)
        el.setPointerCapture(ev.pointerId)
        el.style.cursor = 'grabbing'
        return
      }

      const grass = grassRef.current
      if (grass && grassHit) {
        const ground = project(ev.clientX, ev.clientY)
        const points = ground
          ? [{ sx: ev.clientX, sy: ev.clientY, x: ground.x, z: ground.z }]
          : []
        mode.current = { type: 'draw', pointerId: ev.pointerId, points }
        setStroke(points)
        onIntentRef.current(1)
        el.setPointerCapture(ev.pointerId)
        el.style.cursor = 'crosshair'
        return
      }

      mode.current = { type: 'orbit', pointerId: ev.pointerId, x: ev.clientX, y: ev.clientY }
      onIntentRef.current(0)
      el.setPointerCapture(ev.pointerId)
      el.style.cursor = 'grabbing'
    }

    const onMove = (ev: PointerEvent) => {
      const current = mode.current
      if (current.type === 'idle' || current.pointerId !== ev.pointerId) {
        if (current.type !== 'idle') return
        const rect = el.getBoundingClientRect()
        ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
        ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(ndc, camera)
        if (raycaster.intersectObjects(colliders.current ?? [], false).length > 0) {
          el.style.cursor = 'grab'
        } else if (grassRef.current && raycaster.intersectObject(grassRef.current, false).length > 0) {
          el.style.cursor = 'crosshair'
        } else {
          el.style.cursor = 'grab'
        }
        return
      }

      if (current.type === 'orbit') {
        const dx = ev.clientX - current.x
        const dy = ev.clientY - current.y
        current.x = ev.clientX
        current.y = ev.clientY
        spherical.current.theta -= dx * 0.0072
        spherical.current.phi = THREE.MathUtils.clamp(
          spherical.current.phi + dy * 0.0042,
          0.46,
          1.22,
        )
        apply()
        return
      }

      if (current.type === 'draw') {
        const ground = project(ev.clientX, ev.clientY)
        if (!ground) return
        const pts = current.points
        const last = pts[pts.length - 1]
        if (last && Math.hypot(last.x - ground.x, last.z - ground.z) < 0.035) return
        if (!insideIsland(ground.x, ground.z, -0.35)) return
        pts.push({ sx: ev.clientX, sy: ev.clientY, x: ground.x, z: ground.z })
        setStroke(pts.slice())
        return
      }

      const ground = project(ev.clientX, ev.clientY)
      if (!ground) return
      const dx = ground.x - current.x
      const dz = ground.z - current.z
      const yaw = Math.hypot(dx, dz) > 0.02 ? Math.atan2(dx, dz) : undefined
      current.x = ground.x
      current.z = ground.z
      const spot = clampToGrass(ground.x, ground.z)
      onMoveRef.current(current.id, spot.x, spot.z, yaw)
    }

    const finish = (ev: PointerEvent) => {
      const current = mode.current
      if (current.type === 'idle' || current.pointerId !== ev.pointerId) return
      if (current.type === 'draw') {
        const circle = detectCircle(current.points.map((p) => ({ x: p.sx, y: p.sy })))
        const onGrass =
          current.points.filter((p) => insideIsland(p.x, p.z, 0)).length >=
          Math.max(4, current.points.length * 0.62)
        if (circle && onGrass) {
          const center = project(circle.x, circle.y)
          if (center) onCircleRef.current(center.x, center.z)
        }
        setStroke([])
      }
      if (current.type === 'drag') {
        dragRef.current = null
        setDraggingId(null)
      }
      mode.current = { type: 'idle' }
      el.style.cursor = 'grab'
    }

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault()
      spherical.current.radius = THREE.MathUtils.clamp(
        spherical.current.radius + ev.deltaY * 0.003,
        6.4,
        13.8,
      )
      anim.current = null
      apply()
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', finish)
    el.addEventListener('pointercancel', finish)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.style.cursor = 'grab'
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', finish)
      el.removeEventListener('pointercancel', finish)
      el.removeEventListener('wheel', onWheel)
    }
  }, [apply, camera, colliders, dragRef, gl, grassRef])

  const dragging = pandas.find((p) => p.id === draggingId)

  return (
    <>
      <Stroke points={stroke} />
      {dragging ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[dragging.x, GRASS_Y + 0.045, dragging.z]}>
          <ringGeometry args={[0.36, 0.46, 28]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.92} depthWrite={false} />
        </mesh>
      ) : null}
    </>
  )
}

export function Experience({
  pandas,
  resetSignal,
  onMove,
  onCircle,
  onIntent,
}: {
  pandas: PandaData[]
  resetSignal: number
  onMove: (id: number, x: number, z: number, yaw?: number) => void
  onCircle: (x: number, z: number) => void
  onIntent: (index: number) => void
}) {
  const grassRef = useRef<THREE.Mesh>(null)
  const colliders = useRef<THREE.Mesh[]>([])
  const dragRef = useRef<number | null>(null)
  const registry = useMemo<ColliderRegistry>(
    () => ({
      register(mesh) {
        colliders.current.push(mesh)
      },
      unregister(mesh) {
        colliders.current = colliders.current.filter((item) => item !== mesh)
      },
    }),
    [],
  )

  return (
    <ColliderContext.Provider value={registry}>
      <hemisphereLight args={['#fff8ee', '#8fbf72', 0.72]} />
      <ambientLight intensity={0.32} color="#fff4e6" />
      <directionalLight
        position={[7.5, 11, 4.5]}
        intensity={1.45}
        color="#fff6ea"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={2}
        shadow-camera-far={24}
        shadow-bias={-0.00035}
        shadow-normalBias={0.025}
      />
      <directionalLight position={[-5, 4, 6]} intensity={0.42} color="#ffe9d4" />
      <Scenery grassRef={grassRef} />
      {pandas.map((panda) => (
        <Panda key={panda.id} {...panda} dragRef={dragRef} />
      ))}
      <Playfield
        grassRef={grassRef}
        colliders={colliders}
        pandas={pandas}
        resetSignal={resetSignal}
        onMove={onMove}
        onCircle={onCircle}
        onIntent={onIntent}
        dragRef={dragRef}
      />
    </ColliderContext.Provider>
  )
}
