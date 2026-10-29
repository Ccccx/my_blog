export type Point2 = { x: number; y: number }

export type CircleHit = { x: number; y: number; radius: number }

const MIN_POINTS = 8
const MIN_RADIUS = 28
const MAX_RADIUS = 360

/**
 * A hand-drawn loop in screen pixels. World-space points are an ellipse under
 * the tilted camera, so the gesture is judged in the view the person actually drew.
 */
export function detectCircle(points: Point2[]): CircleHit | null {
  if (points.length < MIN_POINTS) return null

  let length = 0
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let sx = 0
  let sy = 0
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    sx += p.x
    sy += p.y
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
    if (i > 0) {
      length += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y)
    }
  }

  const width = maxX - minX
  const height = maxY - minY
  if (width < 36 || height < 36) return null
  const aspect = width > height ? width / height : height / width
  if (aspect > 1.7) return null

  const cx = sx / points.length
  const cy = sy / points.length
  let mean = 0
  const radii = new Array<number>(points.length)
  for (let i = 0; i < points.length; i++) {
    const r = Math.hypot(points[i].x - cx, points[i].y - cy)
    radii[i] = r
    mean += r
  }
  mean /= points.length
  if (mean < MIN_RADIUS || mean > MAX_RADIUS) return null

  let variance = 0
  for (const r of radii) variance += (r - mean) * (r - mean)
  const std = Math.sqrt(variance / radii.length)
  if (std / mean > 0.4) return null

  const start = points[0]
  const end = points[points.length - 1]
  const gap = Math.hypot(start.x - end.x, start.y - end.y)
  if (gap > mean * 0.72) return null

  const circ = Math.PI * 2 * mean
  if (length < circ * 0.62 || length > circ * 2.45) return null

  let angle = 0
  for (let i = 1; i < points.length; i++) {
    const a1 = Math.atan2(points[i - 1].y - cy, points[i - 1].x - cx)
    const a2 = Math.atan2(points[i].y - cy, points[i].x - cx)
    let d = a2 - a1
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    angle += d
  }
  if (Math.abs(angle) < Math.PI * 1.15) return null

  return { x: cx, y: cy, radius: mean }
}
