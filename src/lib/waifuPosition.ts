export const POS_STORAGE_KEY = 'waifu-companion-pos'
export const DRAG_THRESHOLD = 6
export const VIEW_MARGIN = 8

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export function clampPosition(
  point: Point,
  size: Size,
  viewport: Size,
  margin = VIEW_MARGIN,
): Point {
  const maxX = viewport.width - size.width - margin
  const maxY = viewport.height - size.height - margin
  return {
    x: Math.min(Math.max(margin, point.x), Math.max(margin, maxX)),
    y: Math.min(Math.max(margin, point.y), Math.max(margin, maxY)),
  }
}

export function defaultBottomRight(size: Size, viewport: Size, margin = VIEW_MARGIN): Point {
  return clampPosition(
    {
      x: viewport.width - size.width - margin,
      y: viewport.height - size.height - margin,
    },
    size,
    viewport,
    margin,
  )
}

export function serializePosition(point: Point): string {
  return JSON.stringify({ x: Math.round(point.x), y: Math.round(point.y) })
}

export function parseStoredPosition(raw: string | null): Point | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<Point>
    if (typeof value.x !== 'number' || typeof value.y !== 'number') return null
    if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return null
    return { x: Math.round(value.x), y: Math.round(value.y) }
  } catch {
    return null
  }
}

export function readStoredPosition(): Point | null {
  try {
    return parseStoredPosition(localStorage.getItem(POS_STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeStoredPosition(point: Point) {
  try {
    localStorage.setItem(POS_STORAGE_KEY, serializePosition(point))
  } catch {
    /* ignore */
  }
}

export function movementExceeded(start: Point, current: Point, threshold = DRAG_THRESHOLD): boolean {
  const dx = current.x - start.x
  const dy = current.y - start.y
  return dx * dx + dy * dy >= threshold * threshold
}

export function nextDragPosition(
  origin: Point,
  pointerStart: Point,
  pointerNow: Point,
  size: Size,
  viewport: Size,
  margin = VIEW_MARGIN,
): Point {
  return clampPosition(
    {
      x: origin.x + (pointerNow.x - pointerStart.x),
      y: origin.y + (pointerNow.y - pointerStart.y),
    },
    size,
    viewport,
    margin,
  )
}
