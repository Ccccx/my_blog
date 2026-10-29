import { createContext } from 'react'
import type * as THREE from 'three'

export type ColliderRegistry = {
  register: (mesh: THREE.Mesh) => void
  unregister: (mesh: THREE.Mesh) => void
}

export const ColliderContext = createContext<ColliderRegistry>({
  register: () => {},
  unregister: () => {},
})
