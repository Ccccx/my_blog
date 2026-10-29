import * as THREE from 'three'

let gradient: THREE.CanvasTexture | null = null
let shadowMap: THREE.CanvasTexture | null = null

export function toonGradient() {
  if (gradient) return gradient
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d unavailable')
  const ramp = ctx.createLinearGradient(0, 0, 256, 0)
  ramp.addColorStop(0, '#7f7f7f')
  ramp.addColorStop(0.38, '#cfcfcf')
  ramp.addColorStop(0.72, '#f3f3f3')
  ramp.addColorStop(1, '#ffffff')
  ctx.fillStyle = ramp
  ctx.fillRect(0, 0, 256, 1)
  gradient = new THREE.CanvasTexture(canvas)
  gradient.colorSpace = THREE.NoColorSpace
  gradient.magFilter = THREE.LinearFilter
  gradient.minFilter = THREE.LinearFilter
  gradient.generateMipmaps = false
  return gradient
}

export function islandShadowTexture() {
  if (shadowMap) return shadowMap
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d unavailable')
  const ramp = ctx.createRadialGradient(128, 128, 28, 128, 128, 124)
  ramp.addColorStop(0, 'rgba(92, 64, 42, 0.38)')
  ramp.addColorStop(0.55, 'rgba(92, 64, 42, 0.16)')
  ramp.addColorStop(1, 'rgba(92, 64, 42, 0)')
  ctx.fillStyle = ramp
  ctx.fillRect(0, 0, 256, 256)
  shadowMap = new THREE.CanvasTexture(canvas)
  shadowMap.colorSpace = THREE.SRGBColorSpace
  return shadowMap
}
