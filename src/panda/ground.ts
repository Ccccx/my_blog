export const ISLAND = {
  width: 8.8,
  depth: 6.6,
  radius: 0.92,
}

/** Top of the grass slab, in world units. */
export const GRASS_Y = 0.2

export const POND = {
  x: -0.2,
  z: -0.62,
  rx: 1.38,
  rz: 1.0,
}

export const PANDA_CAP = 12

export type PandaData = {
  id: number
  x: number
  z: number
  yaw: number
  scale: number
  bornAt: number
}

function faceCamera(x: number, z: number) {
  return Math.atan2(5.2 - x, 6.25 - z)
}

export const INITIAL_PANDAS: PandaData[] = [
  { id: 1, x: -0.35, z: 1.85, yaw: faceCamera(-0.35, 1.85), scale: 1.02, bornAt: 0 },
  { id: 2, x: 1.15, z: 1.05, yaw: faceCamera(1.15, 1.05), scale: 1, bornAt: 0 },
  { id: 3, x: 2.15, z: 0.35, yaw: faceCamera(2.15, 0.35), scale: 0.96, bornAt: 0 },
  { id: 4, x: 2.72, z: -0.35, yaw: faceCamera(2.72, -0.35), scale: 0.74, bornAt: 0 },
]

const PATH_CONTROLS = [
  { x: -2.05, z: 1.95 },
  { x: -0.45, z: 1.48 },
  { x: 1.05, z: 0.98 },
  { x: 2.25, z: 0.38 },
  { x: 3.2, z: -0.42 },
]

type V2 = { x: number; z: number }

function catmull(points: V2[], steps: number): V2[] {
  const out: V2[] = []
  const pts = [points[0], ...points, points[points.length - 1]]
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const p2 = pts[i + 2]
    const p3 = pts[i + 3]
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const t2 = t * t
      const t3 = t2 * t
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        z:
          0.5 *
          (2 * p1.z +
            (-p0.z + p2.z) * t +
            (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
            (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
      })
    }
  }
  out.push(points[points.length - 1])
  return out
}

export const PATH_SAMPLES = catmull(PATH_CONTROLS, 10)

const BLOCKS: { x: number; z: number; r: number }[] = [
  { x: -2.7, z: -2.02, r: 0.72 },
  { x: -1.2, z: -2.38, r: 0.52 },
  { x: -3.15, z: 1.15, r: 1.05 },
  { x: 3.25, z: -0.55, r: 0.46 },
  { x: 2.45, z: -1.9, r: 0.32 },
]

export function insideIsland(x: number, z: number, inset = 0) {
  const hw = ISLAND.width / 2 - inset
  const hd = ISLAND.depth / 2 - inset
  const r = Math.min(Math.max(0, ISLAND.radius - inset), hw, hd)
  const ax = Math.abs(x)
  const az = Math.abs(z)
  if (ax > hw || az > hd) return false
  if (ax <= hw - r || az <= hd - r) return true
  const dx = ax - (hw - r)
  const dz = az - (hd - r)
  return dx * dx + dz * dz <= r * r
}

export function insidePond(x: number, z: number, pad = 0) {
  const dx = (x - POND.x) / (POND.rx + pad)
  const dz = (z - POND.z) / (POND.rz + pad)
  return dx * dx + dz * dz < 1
}

export function distanceToPath(x: number, z: number) {
  let min = Infinity
  const pts = PATH_SAMPLES
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const abx = b.x - a.x
    const abz = b.z - a.z
    const len2 = abx * abx + abz * abz || 1
    const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / len2))
    const dx = x - (a.x + abx * t)
    const dz = z - (a.z + abz * t)
    const d = Math.hypot(dx, dz)
    if (d < min) min = d
  }
  return min
}

function blocked(x: number, z: number) {
  return BLOCKS.some((b) => Math.hypot(x - b.x, z - b.z) < b.r)
}

export function canPlacePanda(x: number, z: number) {
  return insideIsland(x, z, 0.42) && !insidePond(x, z, 0.22) && !blocked(x, z)
}

export function clampToGrass(x: number, z: number) {
  let px = x
  let pz = z
  if (insidePond(px, pz, 0.28)) {
    const dx = px - POND.x
    const dz = pz - POND.z
    const rx = POND.rx + 0.36
    const rz = POND.rz + 0.36
    const k = Math.hypot(dx / rx, dz / rz) || 0.0001
    const scale = 1 / k
    px = POND.x + dx * scale
    pz = POND.z + dz * scale
  }

  const hw = ISLAND.width / 2 - 0.48
  const hd = ISLAND.depth / 2 - 0.48
  const r = Math.min(ISLAND.radius - 0.1, hw, hd)
  px = Math.max(-hw, Math.min(hw, px))
  pz = Math.max(-hd, Math.min(hd, pz))
  const ax = Math.abs(px)
  const az = Math.abs(pz)
  const innerW = hw - r
  const innerD = hd - r
  if (ax > innerW && az > innerD) {
    const dx = ax - innerW
    const dz = az - innerD
    const len = Math.hypot(dx, dz) || 1
    px = Math.sign(px) * (innerW + (dx / len) * r)
    pz = Math.sign(pz) * (innerD + (dz / len) * r)
  }
  return { x: px, z: pz }
}

export function findSpawnSpot(
  x: number,
  z: number,
  others: { x: number; z: number }[],
) {
  let px = x
  let pz = z
  for (let iter = 0; iter < 6; iter++) {
    for (const other of others) {
      const dx = px - other.x
      const dz = pz - other.z
      const d = Math.hypot(dx, dz)
      if (d < 0.9) {
        if (d < 0.001) {
          px += 0.45
        } else {
          px += (dx / d) * (0.9 - d)
          pz += (dz / d) * (0.9 - d)
        }
      }
    }
    const clamped = clampToGrass(px, pz)
    px = clamped.x
    pz = clamped.z
    const clear = others.every((o) => Math.hypot(o.x - px, o.z - pz) >= 0.72)
    if (canPlacePanda(px, pz) && clear) return { x: px, z: pz }
  }
  return canPlacePanda(px, pz) ? { x: px, z: pz } : null
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function scatter(
  seed: number,
  count: number,
  accept: (x: number, z: number) => boolean,
) {
  const rand = mulberry32(seed)
  const pts: { x: number; z: number; r: number; r2: number }[] = []
  let guard = 0
  while (pts.length < count && guard < count * 40) {
    guard += 1
    const x = (rand() * 2 - 1) * (ISLAND.width / 2 - 0.35)
    const z = (rand() * 2 - 1) * (ISLAND.depth / 2 - 0.35)
    if (!accept(x, z)) continue
    pts.push({ x, z, r: rand(), r2: rand() })
  }
  return pts
}
