import * as THREE from 'three'
import { GRASS_Y, ISLAND, PATH_SAMPLES } from './ground'

export function roundedRectShape(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape()
  const w = width / 2
  const d = depth / 2
  const r = Math.min(radius, w, d)
  shape.moveTo(-w + r, -d)
  shape.lineTo(w - r, -d)
  shape.absarc(w - r, -d + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(w, d - r)
  shape.absarc(w - r, d - r, r, 0, Math.PI / 2, false)
  shape.lineTo(-w + r, d)
  shape.absarc(-w + r, d - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(-w, -d + r)
  shape.absarc(-w + r, -d + r, r, Math.PI, Math.PI * 1.5, false)
  return shape
}

function paintSlab(
  geo: THREE.BufferGeometry,
  top: string,
  bottom: string,
  grassy: boolean,
) {
  const pos = geo.getAttribute('position')
  geo.computeBoundingBox()
  const box = geo.boundingBox
  if (!box) return
  const minY = box.min.y
  const maxY = box.max.y
  const span = maxY - minY || 1
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  const a = new THREE.Color(bottom)
  const b = new THREE.Color(top)
  const light = new THREE.Color(grassy ? '#c6ee9a' : '#c98455')
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y - minY) / span
    c.copy(a).lerp(b, Math.pow(t, 0.8))
    if (!grassy) {
      const band = 0.5 + 0.5 * Math.sin(y * 26 + pos.getX(i) * 0.4)
      c.multiplyScalar(0.94 + band * 0.08)
    }
    if (t > 0.9) {
      const n =
        0.5 +
        0.5 * Math.sin(pos.getX(i) * 1.6 + pos.getZ(i) * 0.8) * Math.cos(pos.getZ(i) * 1.9)
      c.lerp(light, n * (grassy ? 0.45 : 0.12))
    }
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

export function createSlab(opts: {
  width: number
  depth: number
  radius: number
  height: number
  bevel: number
  top: string
  bottom: string
  grassy?: boolean
}) {
  const geo = new THREE.ExtrudeGeometry(
    roundedRectShape(opts.width, opts.depth, opts.radius),
    {
      depth: opts.height,
      bevelEnabled: true,
      bevelThickness: opts.bevel,
      bevelSize: opts.bevel,
      bevelSegments: 3,
      curveSegments: 10,
    },
  )
  geo.rotateX(-Math.PI / 2)
  geo.computeBoundingBox()
  const maxY = geo.boundingBox?.max.y ?? 0
  geo.translate(0, -maxY, 0)
  paintSlab(geo, opts.top, opts.bottom, opts.grassy === true)
  geo.computeVertexNormals()
  return geo
}

export function createPathGeometry(width = 0.46) {
  const pts = PATH_SAMPLES
  const positions: number[] = []
  const indices: number[] = []
  const y = GRASS_Y + 0.03
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(pts.length - 1, i + 1)]
    let tx = next.x - prev.x
    let tz = next.z - prev.z
    const len = Math.hypot(tx, tz) || 1
    tx /= len
    tz /= len
    const sx = -tz
    const sz = tx
    const taper = 0.72 + 0.28 * Math.sin((i / (pts.length - 1)) * Math.PI)
    const w = width * taper
    positions.push(pts[i].x + sx * w, y, pts[i].z + sz * w)
    positions.push(pts[i].x - sx * w, y, pts[i].z - sz * w)
  }
  const segments = pts.length - 1
  for (let i = 0; i < segments; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export const SOIL_SIZE = {
  width: ISLAND.width,
  depth: ISLAND.depth,
  radius: ISLAND.radius,
}

export const GRASS_SIZE = {
  width: ISLAND.width - 0.12,
  depth: ISLAND.depth - 0.12,
  radius: ISLAND.radius - 0.06,
}
