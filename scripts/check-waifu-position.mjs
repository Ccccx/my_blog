import {
  DRAG_THRESHOLD,
  clampPosition,
  defaultBottomRight,
  movementExceeded,
  nextDragPosition,
  parseStoredPosition,
  serializePosition,
} from '../src/lib/waifuPosition.ts'

const clamped = clampPosition({ x: -40, y: 9000 }, { width: 200, height: 100 }, { width: 1000, height: 800 }, 8)
if (clamped.x !== 8 || clamped.y !== 692) {
  console.error('FAIL: clampPosition', clamped)
  process.exit(1)
}

const home = defaultBottomRight({ width: 360, height: 300 }, { width: 1280, height: 800 }, 8)
if (home.x !== 912 || home.y !== 492) {
  console.error('FAIL: defaultBottomRight', home)
  process.exit(1)
}

if (parseStoredPosition('nope') !== null || parseStoredPosition('{"x":10}') !== null) {
  console.error('FAIL: parseStoredPosition should reject junk')
  process.exit(1)
}
const stored = parseStoredPosition(serializePosition({ x: 44.2, y: 80 }))
if (!stored || stored.x !== 44 || stored.y !== 80) {
  console.error('FAIL: serialize/parse roundtrip', stored)
  process.exit(1)
}

if (movementExceeded({ x: 10, y: 10 }, { x: 12, y: 13 }, DRAG_THRESHOLD)) {
  console.error('FAIL: small movement should not count as drag')
  process.exit(1)
}
if (!movementExceeded({ x: 10, y: 10 }, { x: 20, y: 10 }, DRAG_THRESHOLD)) {
  console.error('FAIL: 10px movement should count as drag')
  process.exit(1)
}

const dragged = nextDragPosition(
  { x: 100, y: 80 },
  { x: 120, y: 90 },
  { x: 200, y: 130 },
  { width: 200, height: 100 },
  { width: 1000, height: 800 },
)
if (dragged.x !== 180 || dragged.y !== 120) {
  console.error('FAIL: nextDragPosition', dragged)
  process.exit(1)
}

console.log('OK: waifu position clamp, persist, and drag threshold')
