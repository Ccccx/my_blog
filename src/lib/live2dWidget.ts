const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js'
const MODEL_SRC = 'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json'
const WIDGET_ID = 'live2d-widget'

declare global {
  interface Window {
    L2Dwidget?: {
      init: (config: Record<string, unknown>) => void
    }
  }
}

let loadPromise: Promise<boolean> | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export function loadLive2dWidget(): Promise<boolean> {
  if (loadPromise) return loadPromise
  loadPromise = loadScript(SCRIPT_SRC)
    .then(() => {
      if (!window.L2Dwidget) return false
      window.L2Dwidget.init({
        model: { jsonPath: MODEL_SRC, scale: 1 },
        display: {
          superSample: 1,
          width: 150,
          height: 260,
          position: 'right',
          hOffset: 8,
          vOffset: 8,
        },
        mobile: { show: true, scale: 0.55 },
        react: { opacity: 1 },
        dialog: { enable: false },
      })
      return true
    })
    .catch(() => false)
  return loadPromise
}

export function setLive2dVisible(visible: boolean) {
  const node = document.getElementById(WIDGET_ID)
  if (node) node.style.display = visible ? 'block' : 'none'
}

export function waitForLive2dNode(timeoutMs = 8000): Promise<HTMLElement | null> {
  const existing = document.getElementById(WIDGET_ID)
  if (existing) return Promise.resolve(existing)
  return new Promise((resolve) => {
    const started = Date.now()
    const timer = window.setInterval(() => {
      const node = document.getElementById(WIDGET_ID)
      if (node || Date.now() - started > timeoutMs) {
        window.clearInterval(timer)
        resolve(node)
      }
    }, 80)
  })
}

export function adoptLive2d(host: HTMLElement): boolean {
  const node = document.getElementById(WIDGET_ID)
  if (!node) return false
  if (node.parentElement !== host) host.appendChild(node)
  node.style.position = 'relative'
  node.style.left = 'auto'
  node.style.right = 'auto'
  node.style.top = 'auto'
  node.style.bottom = 'auto'
  node.style.margin = '0'
  node.style.zIndex = '1'
  node.style.pointerEvents = 'none'
  node.style.display = 'block'
  return true
}

export function stashLive2d() {
  const node = document.getElementById(WIDGET_ID)
  if (!node) return
  node.style.display = 'none'
  if (node.parentElement !== document.body) document.body.appendChild(node)
}
