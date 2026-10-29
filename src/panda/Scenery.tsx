import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Sparkles } from '@react-three/drei'
import {
  GRASS_Y,
  POND,
  distanceToPath,
  insideIsland,
  insidePond,
  mulberry32,
  scatter,
} from './ground'
import { GRASS_SIZE, SOIL_SIZE, createPathGeometry, createSlab, roundedRectShape } from './geometry'
import { islandShadowTexture, toonGradient } from './materials'

const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Toon({
  color = '#ffffff',
  vertexColors = false,
}: {
  color?: string
  vertexColors?: boolean
}) {
  return <meshToonMaterial color={color} vertexColors={vertexColors} gradientMap={toonGradient()} />
}

function Island({ grassRef }: { grassRef: RefObject<THREE.Mesh | null> }) {
  const soil = useMemo(
    () =>
      createSlab({
        ...SOIL_SIZE,
        height: 0.72,
        bevel: 0.1,
        top: '#c07a48',
        bottom: '#6a412c',
        grassy: false,
      }),
    [],
  )
  const grass = useMemo(
    () =>
      createSlab({
        ...GRASS_SIZE,
        height: 0.18,
        bevel: 0.045,
        top: '#8ed56a',
        bottom: '#5ea246',
        grassy: true,
      }),
    [],
  )
  const pick = useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(GRASS_SIZE.width, GRASS_SIZE.depth, GRASS_SIZE.radius)),
    [],
  )

  return (
    <group>
      <mesh geometry={soil} position={[0, GRASS_Y - 0.16, 0]} receiveShadow castShadow>
        <Toon vertexColors />
      </mesh>
      <mesh geometry={grass} position={[0, GRASS_Y, 0]} receiveShadow>
        <Toon vertexColors />
      </mesh>
      <mesh
        ref={grassRef}
        geometry={pick}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GRASS_Y + 0.02, 0]}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Meadow() {
  const tufts = useMemo(
    () =>
      scatter(4, 170, (x, z) => insideIsland(x, z, 0.18) && !insidePond(x, z, 0.05) && distanceToPath(x, z) > 0.34),
    [],
  )
  const flowers = useMemo(
    () =>
      scatter(
        11,
        54,
        (x, z) => insideIsland(x, z, 0.28) && !insidePond(x, z, 0.12) && distanceToPath(x, z) > 0.4,
      ),
    [],
  )
  const tuftGeo = useMemo(() => new THREE.ConeGeometry(0.05, 0.18, 5), [])
  const flowerGeo = useMemo(() => new THREE.SphereGeometry(0.035, 8, 6), [])
  const tuftMat = useMemo(() => new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient() }), [])
  const flowerMat = useMemo(() => new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient() }), [])
  const tuftRef = useRef<THREE.InstancedMesh>(null)
  const flowerRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = tuftRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    tufts.forEach((t, i) => {
      dummy.position.set(t.x, GRASS_Y + 0.02, t.z)
      dummy.rotation.set((t.r - 0.5) * 0.25, t.r2 * 6, (t.r2 - 0.5) * 0.25)
      const s = 0.65 + t.r * 0.9
      dummy.scale.set(s, 0.55 + t.r2 * 1.05, s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(t.r > 0.55 ? '#6fbf4e' : '#94d96c')
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [tufts])

  useLayoutEffect(() => {
    const mesh = flowerRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const palette = ['#fffaf2', '#f7c3d4', '#f2d56a', '#f7f4ef', '#f3b7c8']
    flowers.forEach((t, i) => {
      dummy.position.set(t.x, GRASS_Y + 0.05, t.z)
      dummy.scale.setScalar(0.7 + t.r * 0.8)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(palette[Math.floor(t.r2 * palette.length) % palette.length])
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [flowers])

  return (
    <group>
      <instancedMesh ref={tuftRef} args={[tuftGeo, tuftMat, tufts.length]} />
      <instancedMesh ref={flowerRef} args={[flowerGeo, flowerMat, flowers.length]} />
    </group>
  )
}

function Pond() {
  const stones = useMemo(() => {
    const rand = mulberry32(21)
    return Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.15
      return {
        x: Math.cos(a) * (POND.rx + 0.08),
        z: Math.sin(a) * (POND.rz + 0.06),
        s: 0.07 + rand() * 0.06,
        c: rand() > 0.5 ? '#cbb59a' : '#b7a48c',
      }
    })
  }, [])
  const reeds = useMemo(() => {
    const rand = mulberry32(8)
    return Array.from({ length: 9 }, () => {
      const a = -0.4 + rand() * 2.2
      return {
        x: Math.cos(a) * (POND.rx * 0.82),
        z: Math.sin(a) * (POND.rz * 0.78),
        h: 0.35 + rand() * 0.45,
        lean: (rand() - 0.5) * 0.5,
      }
    })
  }, [])

  return (
    <group position={[POND.x, GRASS_Y + 0.035, POND.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} scale={[POND.rx + 0.28, POND.rz + 0.24, 1]}>
        <circleGeometry args={[1, 40]} />
        <Toon color="#d7c091" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[POND.rx, POND.rz, 1]} receiveShadow>
        <circleGeometry args={[1, 40]} />
        <Toon color="#67c0d8" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, 0.008, -0.02]} scale={[POND.rx * 0.72, POND.rz * 0.7, 1]}>
        <circleGeometry args={[1, 32]} />
        <Toon color="#8fd4e8" />
      </mesh>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, 0.02, s.z]} scale={[s.s, s.s * 0.7, s.s]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <Toon color={s.c} />
        </mesh>
      ))}
      <Lily position={[-0.35, 0.02, 0.12]} scale={0.22} />
      <Lily position={[0.28, 0.02, -0.18]} scale={0.16} />
      <Lily position={[0.05, 0.02, 0.32]} scale={0.13} />
      <Lotus position={[-0.05, 0.03, -0.08]} />
      {reeds.map((r, i) => (
        <group key={i} position={[r.x, 0, r.z]} rotation={[r.lean, 0, r.lean * 0.4]}>
          <mesh position={[0, r.h / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.018, r.h, 5]} />
            <Toon color="#6a8f4a" />
          </mesh>
          <mesh position={[0.02, r.h * 0.72, 0]} rotation={[0, 0, 0.8]} scale={[0.35, 1, 0.2]}>
            <sphereGeometry args={[0.08, 6, 5]} />
            <Toon color="#7eaa58" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Lily({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0.4]} scale={[scale, scale * 0.82, 1]}>
      <circleGeometry args={[1, 10]} />
      <Toon color="#7dce67" />
    </mesh>
  )
}

function Lotus({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.07, 0.04, Math.sin(a) * 0.055]}
            rotation={[0.7, -a, 0]}
            scale={[0.55, 1.15, 0.35]}
          >
            <sphereGeometry args={[0.07, 8, 6]} />
            <Toon color={i % 2 ? '#f7b4c8' : '#fde4ee'} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <Toon color="#f3d15e" />
      </mesh>
    </group>
  )
}

function Cherry({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.84, 8]} />
        <Toon color="#8d5a3c" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.48, 18, 14]} />
        <Toon color="#f6b4c6" />
      </mesh>
      <mesh position={[0.32, 0.9, 0.08]} castShadow>
        <sphereGeometry args={[0.32, 14, 12]} />
        <Toon color="#f8c6d4" />
      </mesh>
      <mesh position={[-0.28, 0.86, -0.02]} castShadow>
        <sphereGeometry args={[0.3, 14, 12]} />
        <Toon color="#f3a4ba" />
      </mesh>
      <mesh position={[0.02, 1.32, -0.04]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <Toon color="#f7c3d2" />
      </mesh>
      <mesh position={[0.12, 0.78, 0.28]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <Toon color="#fff0f4" />
      </mesh>
      <mesh position={[-0.16, 1.12, 0.22]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <Toon color="#ffe4ee" />
      </mesh>
    </group>
  )
}

function BambooGrove() {
  const stalks = useMemo(() => {
    const rand = mulberry32(7)
    const list: { x: number; z: number; h: number; lean: number; yaw: number; thick: number }[] = []
    for (let i = 0; i < 18; i++) {
      const x = -3.2 + (rand() - 0.5) * 1.45
      const z = 1.15 + (rand() - 0.45) * 1.85
      if (!insideIsland(x, z, 0.2)) continue
      list.push({
        x,
        z,
        h: 0.9 + rand() * 1.25,
        lean: (rand() - 0.5) * 0.16,
        yaw: rand() * Math.PI * 2,
        thick: 0.03 + rand() * 0.02,
      })
    }
    return list
  }, [])

  return (
    <group>
      {stalks.map((s, i) => (
        <group key={i} position={[s.x, GRASS_Y, s.z]} rotation={[s.lean, s.yaw, s.lean]}>
          <mesh position={[0, s.h / 2, 0]} castShadow>
            <cylinderGeometry args={[s.thick * 0.85, s.thick, s.h, 6]} />
            <Toon color="#7db85a" />
          </mesh>
          {[0.35, 0.62, 0.86].map((t) => (
            <mesh key={t} position={[0, s.h * t, 0]}>
              <cylinderGeometry args={[s.thick * 1.15, s.thick * 1.15, 0.025, 6]} />
              <Toon color="#3f7a3a" />
            </mesh>
          ))}
          <mesh position={[0.12, s.h - 0.05, 0]} rotation={[0.3, 0, 0.9]} scale={[0.55, 1.1, 0.22]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <Toon color="#8dcf68" />
          </mesh>
          <mesh position={[-0.1, s.h - 0.16, 0.04]} rotation={[0.2, 1, -0.8]} scale={[0.5, 0.95, 0.2]}>
            <sphereGeometry args={[0.14, 8, 6]} />
            <Toon color="#6eaf4c" />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.15, GRASS_Y + 0.04, 1.55]} rotation={[0.2, 0.4, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.55, 6]} />
        <Toon color="#8fbf62" />
      </mesh>
    </group>
  )
}

function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 10]} />
        <Toon color="#6fbf55" />
      </mesh>
      <mesh position={[0.16, 0.12, 0.06]} castShadow>
        <sphereGeometry args={[0.16, 10, 8]} />
        <Toon color="#8ed56c" />
      </mesh>
      <mesh position={[-0.14, 0.1, 0.02]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <Toon color="#5eaa48" />
      </mesh>
    </group>
  )
}

function Mushroom({
  position,
  scale = 1,
  cap = '#e25d4c',
}: {
  position: [number, number, number]
  scale?: number
  cap?: string
}) {
  return (
    <group position={[position[0], GRASS_Y, position[2]]} scale={scale}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.1, 7]} />
        <Toon color="#f4e6d0" />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <sphereGeometry args={[0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={cap} />
      </mesh>
      <mesh position={[0.03, 0.15, 0.02]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <Toon color="#fffaf4" />
      </mesh>
      <mesh position={[-0.025, 0.145, 0.02]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <Toon color="#fffaf4" />
      </mesh>
    </group>
  )
}

function Sign() {
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null)
  useEffect(() => {
    let alive = true
    const url = `${import.meta.env.BASE_URL}fonts/noto-sans-sc-panda.ttf`
    const face = new FontFace('PandaSign', `url(${url})`, { weight: '700' })
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded)
        if (!alive) return
        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 280
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.fillStyle = '#e7b56a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        roundRect(ctx, 16, 16, 608, 248, 48)
        ctx.fillStyle = '#f0c27a'
        ctx.fill()
        ctx.lineWidth = 18
        ctx.strokeStyle = '#9a6232'
        ctx.stroke()
        ctx.fillStyle = '#6a3d1e'
        ctx.font = '700 108px PandaSign'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('熊猫乐园', 320, 148)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        tex.needsUpdate = true
        setMap(tex)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <group position={[3.28, GRASS_Y, -0.55]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.56, 8]} />
        <Toon color="#a56a38" />
      </mesh>
      <mesh position={[0, 0.66, -0.01]} castShadow>
        <boxGeometry args={[1.08, 0.5, 0.06]} />
        <Toon color="#c4843e" />
      </mesh>
      <mesh position={[0, 0.66, 0.08]}>
        <planeGeometry args={[0.96, 0.42]} />
        {map ? (
          <meshBasicMaterial map={map} color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial color="#e7b56a" side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  )
}

function Basket() {
  return (
    <group position={[1.42, GRASS_Y, 1.18]} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.18, 12, 1, true]} />
        <meshToonMaterial color="#d08a45" gradientMap={toonGradient()} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.155, 0.02, 6, 16]} />
        <Toon color="#b87434" />
      </mesh>
      {[
        [0, 0.16, 0],
        [-0.05, 0.15, 0.04],
        [0.05, 0.17, 0.02],
        [0.02, 0.18, -0.04],
        [-0.03, 0.2, -0.01],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0.2, i, 0.1]}>
          <capsuleGeometry args={[0.025, 0.08, 4, 6]} />
          <Toon color={i % 2 ? '#e6c84a' : '#d7b43a'} />
        </mesh>
      ))}
    </group>
  )
}

function Stump() {
  return (
    <group position={[2.45, GRASS_Y, -1.9]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.24, 10]} />
        <Toon color="#a56b42" />
      </mesh>
      <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 10]} />
        <Toon color="#e0b07a" />
      </mesh>
    </group>
  )
}

function Fence() {
  return (
    <group position={[1.15, GRASS_Y, -2.55]} rotation={[0, 0.35, 0]}>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.32, 6]} />
          <Toon color="#a8743e" />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.7, 0.045, 0.04]} />
        <Toon color="#c48a4e" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.035]} />
        <Toon color="#d7a15f" />
      </mesh>
    </group>
  )
}

function PathMarks() {
  const spots = [
    [-1.15, 1.62],
    [0.15, 1.2],
    [1.55, 0.72],
    [2.55, 0.12],
  ]
  return (
    <group>
      {spots.map(([x, z], i) => (
        <mesh key={i} position={[x, GRASS_Y + 0.06, z]} castShadow>
          <coneGeometry args={[0.045, 0.12, 6]} />
          <Toon color="#f0a04a" />
        </mesh>
      ))}
    </group>
  )
}

function Cloud({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const drift = REDUCE_MOTION ? 0 : 1
    g.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.12 + position[2]) * 0.28 * drift
    g.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2 + position[0]) * 0.06 * drift
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.42, 16, 12]} />
        <Toon color="#ffffff" />
      </mesh>
      <mesh position={[0.36, -0.06, 0.04]}>
        <sphereGeometry args={[0.3, 14, 10]} />
        <Toon color="#fffdfb" />
      </mesh>
      <mesh position={[-0.32, -0.05, 0.02]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <Toon color="#f7f4ef" />
      </mesh>
      <mesh position={[0.06, 0.16, -0.02]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <Toon color="#ffffff" />
      </mesh>
    </group>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function Scenery({ grassRef }: { grassRef: RefObject<THREE.Mesh | null> }) {
  const path = useMemo(() => createPathGeometry(), [])
  const shadow = useMemo(() => islandShadowTexture(), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} scale={[10.5, 8.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <Island grassRef={grassRef} />
      <mesh geometry={path} receiveShadow>
        <Toon color="#e6d2a4" />
      </mesh>
      <Pond />
      <BambooGrove />
      <Cherry position={[-2.7, GRASS_Y, -2.02]} scale={1.12} />
      <Cherry position={[-1.2, GRASS_Y, -2.38]} scale={0.72} />
      <Bush position={[-3.55, GRASS_Y, -1.15]} scale={0.85} />
      <Bush position={[3.35, GRASS_Y, 1.35]} scale={0.95} />
      <Bush position={[3.15, GRASS_Y, -1.55]} scale={0.7} />
      <Bush position={[-0.2, GRASS_Y, 2.35]} scale={0.55} />
      <Mushroom position={[-1.7, 0, 0.35]} />
      <Mushroom position={[0.95, 0, -1.7]} scale={0.8} cap="#d85748" />
      <Mushroom position={[-3.4, 0, -0.35]} scale={0.7} cap="#ef7a45" />
      <Mushroom position={[1.85, 0, 1.7]} scale={0.65} />
      <Sign />
      <Basket />
      <Stump />
      <Fence />
      <PathMarks />
      <mesh position={[-3.25, GRASS_Y + 0.08, -1.15]} castShadow>
        <sphereGeometry args={[0.09, 12, 10]} />
        <Toon color="#f0a03a" />
      </mesh>
      <Meadow />
      <Cloud position={[-4.3, 2.55, -1.2]} scale={1} />
      <Cloud position={[3.8, 2.85, -2.1]} scale={0.9} />
      <Cloud position={[5.1, 1.9, 1.4]} scale={0.62} />
      <Cloud position={[-1.2, 3.15, 2.6]} scale={0.5} />
      <Sparkles
        count={36}
        scale={[7.6, 1.1, 5.6]}
        size={2.4}
        speed={0.28}
        opacity={0.45}
        color="#fffaf0"
        position={[0, GRASS_Y + 0.45, 0]}
      />
    </group>
  )
}
