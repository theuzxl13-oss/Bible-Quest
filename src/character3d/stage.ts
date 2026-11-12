import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Quality3D } from './rig'
import { contactShadow } from './textures'

/*
 * PALCO DO PERSONAGEM: iluminação de três pontos (principal quente, contraluz
 * fria e preenchimento), ambiente para reflexos suaves, sombra de contato e
 * câmera enquadrada no corpo inteiro ou no retrato.
 */

export type Framing = 'corpo' | 'retrato' | 'busto'

export const FRAMES: Record<Framing, { target: THREE.Vector3; height: number }> = {
  corpo: { target: new THREE.Vector3(0, 0.9, 0), height: 1.98 },
  busto: { target: new THREE.Vector3(0, 1.38, 0), height: 0.95 },
  retrato: { target: new THREE.Vector3(0, 1.6, 0), height: 0.42 },
}

export function createRenderer(quality: Quality3D, canvas?: HTMLCanvasElement, preserve = false) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: preserve, powerPreference: quality === 'alta' ? 'high-performance' : 'low-power' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.setClearColor(0x000000, 0)
  if (quality === 'alta') {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
  }
  return renderer
}

const ambientes = new WeakMap<THREE.WebGLRenderer, THREE.Texture>()

export function createScene(renderer: THREE.WebGLRenderer, quality: Quality3D) {
  const scene = new THREE.Scene()
  // ambiente de reflexos: gerado uma vez por renderizador (é caro em aparelhos simples)
  let env = ambientes.get(renderer)
  if (!env) {
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    env = pmrem.fromScene(room, 0.04).texture
    pmrem.dispose()
    room.dispose()
    ambientes.set(renderer, env)
  }
  scene.environment = env
  scene.environmentIntensity = 0.45

  const key = new THREE.DirectionalLight('#fff0db', 2.0)
  key.position.set(2.3, 2.7, 1.9)
  if (quality === 'alta') {
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -1
    key.shadow.camera.right = 1
    key.shadow.camera.top = 2.2
    key.shadow.camera.bottom = -0.2
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.02
    key.shadow.radius = 6
  }
  const rim = new THREE.DirectionalLight('#a9c6ff', 2.3)
  rim.position.set(-2.2, 2.4, -2.4)
  const fill = new THREE.HemisphereLight('#fff6e8', '#4a3524', 0.8)
  scene.add(key, key.target, rim, fill)

  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshBasicMaterial({ map: contactShadow(), transparent: true, depthWrite: false }))
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.002
  scene.add(contact)
  if (quality === 'alta') {
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.ShadowMaterial({ opacity: 0.28 }))
    catcher.rotation.x = -Math.PI / 2
    catcher.receiveShadow = true
    scene.add(catcher)
  }
  return scene
}

/** Distância da câmera para caber a altura desejada. */
export function fitDistance(camera: THREE.PerspectiveCamera, height: number) {
  const fov = THREE.MathUtils.degToRad(camera.fov)
  const byH = height / 2 / Math.tan(fov / 2)
  const byW = height * 0.5 / 2 / (Math.tan(fov / 2) * camera.aspect)
  return Math.max(byH, byW) * 1.06
}
