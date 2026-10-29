import { useContext, useLayoutEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRASS_Y } from './ground'
import { toonGradient } from './materials'
import { ColliderContext } from './colliders'

function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function Part({
  position,
  scale,
  color,
  radius = 1,
  children,
  shadow = false,
}: {
  position: [number, number, number]
  scale?: [number, number, number]
  color: string
  radius?: number
  children?: ReactNode
  shadow?: boolean
}) {
  return (
    <mesh position={position} scale={scale} castShadow={shadow}>
      <sphereGeometry args={[radius, 18, 14]} />
      <meshToonMaterial color={color} gradientMap={toonGradient()} />
      {children}
    </mesh>
  )
}

export function Panda({
  id,
  x,
  z,
  yaw,
  scale,
  bornAt,
  dragRef,
}: {
  id: number
  x: number
  z: number
  yaw: number
  scale: number
  bornAt: number
  dragRef: RefObject<number | null>
}) {
  const group = useRef<THREE.Group>(null)
  const collider = useRef<THREE.Mesh>(null)
  const eyes = useRef<THREE.Group>(null)
  const registry = useContext(ColliderContext)

  useLayoutEffect(() => {
    const mesh = collider.current
    if (!mesh) return
    mesh.userData.pandaId = id
    registry.register(mesh)
    return () => registry.unregister(mesh)
  }, [id, registry])

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const dragging = dragRef.current === id
    const age = bornAt <= 0 ? 1 : (performance.now() - bornAt) / 520
    const pop = age >= 1 ? 1 : easeOutBack(Math.max(0, Math.min(1, age)))
    const bob = dragging ? 0 : Math.sin(state.clock.elapsedTime * 2.1 + id) * 0.015
    const lift = dragging ? 0.1 : 0
    g.position.set(x, GRASS_Y + bob + lift, z)
    g.rotation.y = yaw
    g.scale.setScalar(Math.max(0.001, scale * pop))
    if (eyes.current) {
      const blink = Math.sin(state.clock.elapsedTime * 1.7 + id * 2.2)
      eyes.current.scale.y = blink > 0.985 ? 0.12 : 1
    }
  })

  return (
    <group ref={group} position={[x, GRASS_Y, z]} rotation={[0, yaw, 0]} scale={scale}>
      <mesh ref={collider} position={[0, 0.48, 0]} userData={{ pandaId: id }}>
        <sphereGeometry args={[0.52, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Part position={[0, 0.32, 0]} scale={[1.16, 0.88, 1]} radius={0.32} color="#fbfbfb" shadow />
      <Part position={[0, 0.66, 0.02]} radius={0.27} color="#fbfbfb" shadow />
      <Part position={[-0.15, 0.9, -0.02]} radius={0.085} color="#2b2b2b" />
      <Part position={[0.15, 0.9, -0.02]} radius={0.085} color="#2b2b2b" />
      <Part position={[-0.09, 0.68, 0.22]} scale={[1.15, 1.05, 0.9]} radius={0.095} color="#2b2b2b" />
      <Part position={[0.09, 0.68, 0.22]} scale={[1.15, 1.05, 0.9]} radius={0.095} color="#2b2b2b" />
      <group ref={eyes} position={[0, 0.69, 0.31]}>
        <Part position={[-0.09, 0, 0]} radius={0.046} color="#f7f7f7" />
        <Part position={[0.09, 0, 0]} radius={0.046} color="#f7f7f7" />
        <Part position={[-0.09, -0.006, 0.03]} radius={0.022} color="#1c1c1c" />
        <Part position={[0.09, -0.006, 0.03]} radius={0.022} color="#1c1c1c" />
      </group>
      <Part position={[0, 0.58, 0.3]} scale={[1.2, 0.75, 0.8]} radius={0.045} color="#2b2b2b" />
      <Part position={[-0.15, 0.6, 0.18]} scale={[1.05, 0.65, 0.4]} radius={0.042} color="#f6b7c6" />
      <Part position={[0.15, 0.6, 0.18]} scale={[1.05, 0.65, 0.4]} radius={0.042} color="#f6b7c6" />
      <Part position={[-0.3, 0.3, 0.1]} scale={[0.85, 1.1, 0.85]} radius={0.1} color="#2b2b2b" />
      <Part position={[0.3, 0.3, 0.1]} scale={[0.85, 1.1, 0.85]} radius={0.1} color="#2b2b2b" />
      <Part position={[-0.13, 0.11, 0.12]} scale={[1.05, 0.72, 1.05]} radius={0.11} color="#2b2b2b" />
      <Part position={[0.13, 0.11, 0.12]} scale={[1.05, 0.72, 1.05]} radius={0.11} color="#2b2b2b" />
      <Part position={[0, 0.26, -0.26]} radius={0.06} color="#2b2b2b" />
    </group>
  )
}
