import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { CharacterAppearance } from '../types'
import { appearanceKey } from '../data/character/look'
import { buildCharacter, type Pose3D, type Quality3D, type Rig } from './rig'
import { buildHero, loadHero } from './heroi'
import { bodyOf } from '../data/character/look'
import { createRenderer, createScene, fitDistance, FRAMES, type Framing } from './stage'

/*
 * PONTO DE ENTRADA 3D (carregado sob demanda, fora do pacote inicial)
 * - createViewer: personagem ao vivo, com rotação 360°, zoom e vistas.
 * - snapshot: imagem do MESMO modelo, para miniaturas (mapa, topo, cartões),
 *   usando um único renderizador compartilhado. Assim o jogo não abre dezenas
 *   de contextos WebGL.
 */

export type View = 'frente' | 'lado' | 'costas'

/** Fonte do modelo em uso: GLB (padrão) ou modelo procedural (só se o GLB falhar). */
export let modeloEmUso: 'glb' | 'procedural' = 'glb'

/** Monta o personagem: modelo GLB; se não for possível carregá-lo, o modelo procedural. */
export async function montar(a: CharacterAppearance, quality: Quality3D): Promise<Rig> {
  try {
    const gltf = await loadHero(bodyOf(a))
    const rig = buildHero(gltf, a, quality)
    await (rig as Rig & { ready?: Promise<void> }).ready
    modeloEmUso = 'glb'
    return rig
  } catch (e) {
    console.warn('Modelo GLB indisponível; usando o personagem procedural.', e)
    modeloEmUso = 'procedural'
    return buildCharacter(a, quality)
  }
}

export interface ViewerOptions {
  quality: Quality3D
  framing: Framing
  pose: Pose3D
  controls: boolean
  autoRotate: boolean
  reduced: boolean
  onReady?: () => void
}

export interface ViewerHandle {
  setAppearance(a: CharacterAppearance): void
  setPose(p: Pose3D): void
  setView(v: View): void
  zoom(factor: number): void
  setAutoRotate(on: boolean): void
  dispose(): void
}

export function createViewer(container: HTMLElement, appearance: CharacterAppearance, opts: ViewerOptions): ViewerHandle {
  const renderer = createRenderer(opts.quality)
  const canvas = renderer.domElement
  canvas.className = 'char3d-canvas'
  container.appendChild(canvas)
  const scene = createScene(renderer, opts.quality)
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 30)
  const frame = FRAMES[opts.framing]
  let rig: Rig | null = null
  let key = ''
  let pose = opts.pose
  let disposed = false

  let pedido = 0
  const setAppearance = (a: CharacterAppearance) => {
    const k = appearanceKey(a)
    if (k === key) return
    key = k
    const meu = ++pedido
    montar(a, opts.quality).then(async (next) => {
      if (disposed || meu !== pedido) return next.dispose()
      // compila os shaders sem travar a página (KHR_parallel_shader_compile quando disponível)
      const tmp = new THREE.Scene()
      tmp.environment = scene.environment
      tmp.add(next.root)
      if (renderer.extensions.has('KHR_parallel_shader_compile')) await renderer.compileAsync(tmp, camera).catch(() => undefined)
      tmp.remove(next.root)
      if (disposed || meu !== pedido) return next.dispose()
      if (rig) {
        scene.remove(rig.root)
        rig.dispose()
      }
      rig = next
      scene.add(rig.root)
      container.classList.remove('is-loading')
      opts.onReady?.()
    })
  }
  setAppearance(appearance)

  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(frame.target)
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = 1.75
  controls.enabled = opts.controls
  controls.enableZoom = opts.controls
  controls.autoRotate = opts.autoRotate && !opts.reduced
  controls.autoRotateSpeed = 1.6
  controls.addEventListener('start', () => (controls.autoRotate = false))
  // sem controles, o personagem não captura o toque (a página continua rolando);
  // com controles, o arrasto horizontal gira e o vertical rola a página
  canvas.style.touchAction = opts.controls ? 'pan-y' : 'auto'
  if (!opts.controls) canvas.style.pointerEvents = 'none'

  let baseDist = 0
  const resize = () => {
    const w = Math.max(1, container.clientWidth)
    const h = Math.max(1, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.quality === 'alta' ? 2 : 1.25))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const d = fitDistance(camera, frame.height)
    if (!baseDist) {
      camera.position.copy(frame.target).add(new THREE.Vector3(0.3, 0.06, 1).setLength(d))
    } else {
      const off = camera.position.clone().sub(controls.target)
      camera.position.copy(controls.target).add(off.setLength((off.length() * d) / baseDist))
    }
    baseDist = d
    controls.minDistance = d * 0.35
    controls.maxDistance = d * 1.6
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // animação apenas quando visível
  let visible = true
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting)
    loop()
  })
  io.observe(container)
  let last = performance.now()
  let t = 0
  let viewAnim: { from: number; to: number; start: number } | null = null
  const minFrame = opts.quality === 'leve' ? 1 / 30 : 0
  const tick = () => {
    const now = performance.now()
    const passou = (now - last) / 1000
    if (passou < minFrame) return
    const dt = Math.min(0.05, passou)
    last = now
    t += dt
    if (viewAnim) {
      const k = Math.min(1, (performance.now() - viewAnim.start) / 600)
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      const az = viewAnim.from + (viewAnim.to - viewAnim.from) * e
      const off = camera.position.clone().sub(controls.target)
      const sph = new THREE.Spherical().setFromVector3(off)
      sph.theta = az
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph))
      if (k >= 1) viewAnim = null
    }
    rig?.update(pose, t, dt, opts.reduced)
    controls.update(dt)
    renderer.render(scene, camera)
  }
  const loop = () => renderer.setAnimationLoop(!disposed && visible && document.visibilityState !== 'hidden' ? tick : null)
  const onVis = () => loop()
  document.addEventListener('visibilitychange', onVis)
  loop()
  renderer.render(scene, camera)

  return {
    setAppearance,
    setPose(p) {
      pose = p
    },
    setView(v) {
      controls.autoRotate = false
      const off = camera.position.clone().sub(controls.target)
      const sph = new THREE.Spherical().setFromVector3(off)
      let to = v === 'frente' ? 0 : v === 'lado' ? Math.PI / 2 : Math.PI
      // menor caminho
      while (to - sph.theta > Math.PI) to -= Math.PI * 2
      while (sph.theta - to > Math.PI) to += Math.PI * 2
      viewAnim = { from: sph.theta, to, start: performance.now() }
    },
    zoom(f) {
      const off = camera.position.clone().sub(controls.target)
      const d = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance)
      camera.position.copy(controls.target).add(off.setLength(d))
    },
    setAutoRotate(on) {
      controls.autoRotate = on && !opts.reduced
    },
    dispose() {
      disposed = true
      renderer.setAnimationLoop(null)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      io.disconnect()
      controls.dispose()
      rig?.dispose()
      scene.environment?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}

// ---------- miniaturas ----------

let shared: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; quality: Quality3D } | null = null
const images = new Map<string, string>()
const rigs = new Map<string, Rig>()
let queue: Promise<unknown> = Promise.resolve()

export interface SnapshotOptions {
  quality: Quality3D
  pose: Pose3D
  framing: Framing
  width: number
  height: number
  /** Instante da animação (para quadros de caminhada). */
  time?: number
  /** Ângulo da câmera em torno do personagem (0 = frente levemente de lado). */
  azimuth?: number
}

export function snapshotKey(a: CharacterAppearance, o: SnapshotOptions) {
  return `${appearanceKey(a)}|${o.quality}|${o.pose}|${o.framing}|${o.width}x${o.height}|${o.time ?? 0}|${o.azimuth ?? 0.3}`
}

export function cachedSnapshot(a: CharacterAppearance, o: SnapshotOptions) {
  return images.get(snapshotKey(a, o))
}

export function snapshot(a: CharacterAppearance, o: SnapshotOptions): Promise<string> {
  const k = snapshotKey(a, o)
  const hit = images.get(k)
  if (hit) return Promise.resolve(hit)
  const job = queue.then(
    () =>
      new Promise<string>((resolve) => {
        const run = async () => {
          const again = images.get(k)
          if (again) return resolve(again)
          if (!shared || shared.quality !== o.quality) {
            shared?.renderer.dispose()
            const renderer = createRenderer(o.quality, undefined, true)
            shared = { renderer, scene: createScene(renderer, o.quality), camera: new THREE.PerspectiveCamera(26, 1, 0.05, 30), quality: o.quality }
          }
          const { renderer, scene, camera } = shared
          const ak = `${appearanceKey(a)}|${o.quality}`
          let rig = rigs.get(ak)
          if (!rig) {
            rig = await montar(a, o.quality)
            rigs.set(ak, rig)
            if (rigs.size > 4) {
              const [oldK, old] = rigs.entries().next().value!
              old.dispose()
              rigs.delete(oldK)
            }
          }
          scene.add(rig.root)
          rig.update(o.pose, o.time ?? 0.6, 10)
          if (renderer.extensions.has('KHR_parallel_shader_compile')) await renderer.compileAsync(scene, camera).catch(() => undefined)
          const scale = Math.min(2, window.devicePixelRatio || 1)
          renderer.setPixelRatio(scale)
          renderer.setSize(o.width, o.height, false)
          camera.aspect = o.width / o.height
          camera.updateProjectionMatrix()
          const f = FRAMES[o.framing]
          const d = fitDistance(camera, f.height)
          const az = o.azimuth ?? 0.3
          camera.position.set(Math.sin(az) * d, f.target.y + d * 0.06, Math.cos(az) * d)
          camera.lookAt(f.target)
          renderer.render(scene, camera)
          const url = renderer.domElement.toDataURL('image/png')
          scene.remove(rig.root)
          images.set(k, url)
          if (images.size > 300) images.delete(images.keys().next().value!)
          resolve(url)
        }
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
        if (ric) ric(() => void run(), { timeout: 120 })
        else setTimeout(() => void run(), 0)
      }),
  )
  queue = job.catch(() => undefined)
  return job
}
