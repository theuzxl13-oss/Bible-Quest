import * as THREE from 'three'
import type { CharacterAppearance } from '../types'
import { appearanceKey } from '../data/character/look'
import { montar } from './runtime'
import { soCores } from './heroi'
import { createRenderer } from './stage'
import type { Pose3D, Quality3D, Rig } from './rig'

/*
 * CENA 3D DO ACAMPAMENTO (central do jogo, v0.10)
 * - Tudo é geometria simples, gerada aqui (sem arquivos extras para baixar):
 *   céu, montanhas, cidade ao fundo, caminho, tendas, fogueira, baú, quadro de
 *   missões, mesa de estudos e os elementos que o jogador libera com o progresso.
 * - O personagem é o MESMO modelo 3D do criador (montar), no centro.
 * - Um único renderizador. Na qualidade "leve": sem sombras, 30 quadros por
 *   segundo e menos partículas. A animação para quando a cena não está visível.
 * - Os rótulos clicáveis são botões HTML posicionados sobre os objetos
 *   (acessíveis por teclado e leitores de tela); tocar no próprio objeto 3D
 *   tem o mesmo efeito.
 */

export type AlvoAcampamento = 'personagem' | 'tenda' | 'mesa' | 'quadro' | 'bau'

export interface CampOptions {
  quality: Quality3D
  reduced: boolean
  /** Elementos liberados (ver src/data/acampamento.ts). */
  elementos: string[]
  /** Há baú pronto para abrir no mapa: o baú do acampamento fica aberto e brilhando. */
  bauPronto: boolean
  /** Rótulos HTML que acompanham cada alvo. */
  rotulos: Map<AlvoAcampamento, HTMLElement>
  onSelect(alvo: AlvoAcampamento): void
  onReady?(): void
}

export interface CampHandle {
  setAppearance(a: CharacterAppearance): void
  /** Toca um gesto (comemoração, descoberta, aceno) e volta à espera. */
  gesto(p: Pose3D, segundos?: number): void
  dispose(): void
}

// ---------- materiais e utilidades ----------

const lerp = THREE.MathUtils.lerp

function criarMateriais(quality: Quality3D) {
  const cache = new Map<string, THREE.Material>()
  const std = (cor: string, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const k = cor + JSON.stringify(extra)
    let m = cache.get(k)
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0, flatShading: quality === 'alta', ...extra })
      cache.set(k, m)
    }
    return m
  }
  return { std, cache }
}

type Mats = ReturnType<typeof criarMateriais>

function malha(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/** Textura de tecido listrado (tendas e estandarte). */
function texturaListrada(base: string, listra: string, n = 6) {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = base
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = listra
  for (let i = 0; i < n; i++) g.fillRect((i * 128) / n, 0, 128 / n / 3, 128)
  // trama discreta
  g.globalAlpha = 0.08
  g.fillStyle = '#000'
  for (let y = 0; y < 128; y += 3) g.fillRect(0, y, 128, 1)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Mancha suave e redonda (fumaça, brilho, sombra). */
function texturaMancha(cor = '255,255,255') {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, `rgba(${cor},1)`)
  gr.addColorStop(1, `rgba(${cor},0)`)
  g.fillStyle = gr
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// ---------- paisagem ----------

function construirCeu() {
  const geo = new THREE.SphereGeometry(220, 24, 12)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { topo: { value: new THREE.Color('#3f74b8') }, meio: { value: new THREE.Color('#93bfe6') }, horizonte: { value: new THREE.Color('#f3e2c2') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader:
      'uniform vec3 topo; uniform vec3 meio; uniform vec3 horizonte; varying vec3 vP; void main(){ float h = clamp(vP.y, -0.1, 1.0); vec3 c = mix(horizonte, meio, smoothstep(0.0, 0.18, h)); c = mix(c, topo, smoothstep(0.18, 0.75, h)); gl_FragColor = vec4(c, 1.0); }',
  })
  const ceu = new THREE.Mesh(geo, mat)
  ceu.renderOrder = -1
  return ceu
}

function construirNuvens(m: Mats) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#fff4e2', emissiveIntensity: 0.35, fog: false, flatShading: true })
  m.cache.set('nuvem', mat)
  const geo = new THREE.IcosahedronGeometry(1, 1)
  const nuvens: [number, number, number, number][] = [
    [-60, 38, -150, 9],
    [-20, 46, -170, 7],
    [35, 42, -160, 10],
    [80, 36, -140, 8],
    [-95, 30, -120, 7],
  ]
  for (const [x, y, z, s] of nuvens) {
    const n = new THREE.Group()
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(geo, mat)
      b.position.set((i - 2) * s * 0.75, Math.sin(i * 1.7) * s * 0.25, Math.cos(i) * s * 0.3)
      b.scale.set(s * (1 - Math.abs(i - 2) * 0.18), s * 0.55, s * 0.6)
      n.add(b)
    }
    n.position.set(x, y, z)
    g.add(n)
  }
  return g
}

function alturaTerreno(x: number, z: number) {
  const d = Math.hypot(x, z)
  if (d < 9) return 0
  const k = Math.min(1, (d - 9) / 30)
  return k * k * (3 + 2.2 * Math.sin(x * 0.11) + 1.8 * Math.cos(z * 0.09 + x * 0.05))
}

function construirChao() {
  const geo = new THREE.PlaneGeometry(160, 160, 80, 80)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const cores: number[] = []
  const terra = new THREE.Color('#c7a06c')
  const caminho = new THREE.Color('#b48a5a')
  const grama = new THREE.Color('#86a24e')
  const gramaLonge = new THREE.Color('#5f8a43')
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    pos.setY(i, alturaTerreno(x, z))
    const d = Math.hypot(x, z * 1.2)
    const ruido = Math.sin(x * 1.3) * Math.cos(z * 1.1) * 0.5 + 0.5
    if (d < 4.2) c.copy(terra)
    else if (d < 7) c.copy(terra).lerp(grama, (d - 4.2) / 2.8)
    else c.copy(grama).lerp(gramaLonge, Math.min(1, (d - 7) / 25))
    // caminho para o fundo
    if (z < 0 && Math.abs(x + Math.sin(z * 0.25) * 1.2) < 1.1 + Math.max(0, -z) * 0.02) c.lerp(caminho, 0.85)
    c.offsetHSL(0, 0, (ruido - 0.5) * 0.05)
    cores.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3))
  geo.computeVertexNormals()
  const chao = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }))
  chao.receiveShadow = true
  return chao
}

function construirPedrasDoCaminho(m: Mats) {
  const g = new THREE.Group()
  const geo = new THREE.CylinderGeometry(1, 1, 0.06, 7)
  for (let i = 0; i < 26; i++) {
    const z = -1.6 - i * 0.62
    const x = -Math.sin(z * 0.25) * 1.2 + (i % 2 ? 0.35 : -0.35) + Math.sin(i * 7.3) * 0.12
    const p = malha(geo, m.std(i % 3 ? '#a59a8a' : '#968a78'), x, alturaTerreno(x, z) + 0.02, z)
    const s = 0.22 + (Math.sin(i * 3.1) * 0.5 + 0.5) * 0.14
    p.scale.set(s, 1, s * 0.8)
    p.rotation.y = i
    p.castShadow = false
    g.add(p)
  }
  return g
}

function construirMontanhas(m: Mats) {
  const g = new THREE.Group()
  const picos: [number, number, number, number][] = [
    [-95, -175, 40, 30],
    [-50, -190, 46, 38],
    [-5, -200, 40, 30],
    [45, -185, 50, 42],
    [100, -170, 36, 28],
    [-140, -150, 30, 22],
    [150, -140, 30, 24],
  ]
  picos.forEach(([x, z, r, h], i) => {
    const monte = malha(new THREE.ConeGeometry(r, h, 7), m.std(i % 2 ? '#8e8fae' : '#7f84a6'), x, h / 2 - 2, z)
    monte.rotation.y = i
    monte.castShadow = false
    g.add(monte)
    const neve = malha(new THREE.ConeGeometry(r * 0.32, h * 0.32, 7), m.std('#f2f0ec'), x, h - 2 - h * 0.16 + 0.2, z)
    neve.rotation.y = i
    neve.castShadow = false
    g.add(neve)
  })
  return g
}

function construirCidade(m: Mats, x0: number, z0: number, escala: number) {
  const g = new THREE.Group()
  const morro = malha(new THREE.SphereGeometry(9, 12, 8), m.std('#8a8a5a'), 0, -3.5, 0)
  morro.scale.set(1.4, 0.75, 1)
  morro.castShadow = false
  g.add(morro)
  const paredes = ['#e6d3ad', '#dcc49a', '#ead9b8', '#d2b98c']
  let k = 0
  for (let anel = 0; anel < 3; anel++) {
    const n = 8 - anel * 2
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 1.1 - 0.2 + anel * 0.3
      const r = 8 - anel * 3
      const x = Math.cos(a) * r * 1.2
      const z = Math.sin(a) * r * 0.6
      const w = 1.6 + ((k * 37) % 10) / 10
      const h = 1.4 + ((k * 53) % 10) / 6 + anel * 0.6
      const casa = malha(new THREE.BoxGeometry(w, h, w * 0.9), m.std(paredes[k % 4]), x, 0.8 + anel * 1.6 + h / 2, z)
      casa.castShadow = false
      g.add(casa)
      if (k % 4 === 0) {
        const cupula = malha(new THREE.SphereGeometry(w * 0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), m.std('#c9a46a'), x, 0.8 + anel * 1.6 + h, z)
        cupula.castShadow = false
        g.add(cupula)
      }
      k++
    }
  }
  const torre = malha(new THREE.BoxGeometry(1.6, 6, 1.6), m.std('#e2cfa6'), 0, 6, -1)
  torre.castShadow = false
  g.add(torre)
  g.position.set(x0, alturaTerreno(x0, z0) - 0.5, z0)
  g.scale.setScalar(escala)
  return g
}

function cipreste(m: Mats, x: number, z: number, s: number) {
  const g = new THREE.Group()
  g.add(malha(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 5), m.std('#5a3d24'), 0, 0.25, 0))
  const copa = malha(new THREE.ConeGeometry(0.5, 2.6, 7), m.std('#3f6a35'), 0, 1.6, 0)
  g.add(copa)
  g.position.set(x, alturaTerreno(x, z), z)
  g.scale.setScalar(s)
  return g
}

function arbusto(m: Mats, x: number, z: number, s: number, cor = '#5f8f3f') {
  const b = malha(new THREE.IcosahedronGeometry(0.4, 0), m.std(cor), x, 0.22 * s + alturaTerreno(x, z), z)
  b.scale.set(s, s * 0.7, s)
  return b
}

function pedra(m: Mats, x: number, z: number, s: number, rot = 0) {
  const p = malha(new THREE.DodecahedronGeometry(0.5, 0), m.std('#9c9283'), x, 0.18 * s, z)
  p.scale.set(s, s * 0.6, s * 0.85)
  p.rotation.set(rot, rot * 2, 0)
  return p
}

// ---------- objetos do acampamento ----------

function construirTenda(m: Mats, largura: number, fundo: number, altura: number, base: string, listra: string) {
  const g = new THREE.Group()
  const w = largura / 2
  const d = fundo / 2
  const h = altura
  // telhado em duas águas + parede do fundo
  const v = [
    // esquerda
    -w, 0, d, -w, 0, -d, 0, h, -d,
    -w, 0, d, 0, h, -d, 0, h, d,
    // direita
    w, 0, d, 0, h, d, 0, h, -d,
    w, 0, d, 0, h, -d, w, 0, -d,
    // fundo
    -w, 0, -d, w, 0, -d, 0, h, -d,
  ]
  const uv = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0.5, 1]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.computeVertexNormals()
  const tex = texturaListrada(base, listra)
  tex.repeat.set(2, 1)
  const tecido = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide })
  m.cache.set(`tenda-${base}-${listra}-${largura}`, tecido)
  g.add(malha(geo, tecido))
  // entrada escura e abas abertas
  const porta = new THREE.BufferGeometry()
  porta.setAttribute('position', new THREE.Float32BufferAttribute([-w * 0.55, 0, d - 0.02, w * 0.55, 0, d - 0.02, 0, h * 0.82, d - 0.02], 3))
  porta.computeVertexNormals()
  g.add(malha(porta, m.std('#2b1a10', { side: THREE.DoubleSide })))
  for (const lado of [-1, 1]) {
    const aba = new THREE.BufferGeometry()
    aba.setAttribute('position', new THREE.Float32BufferAttribute([0, h, d, lado * w * 0.62, 0, d, lado * w * 1.05, 0, d + 0.35], 3))
    aba.setAttribute('uv', new THREE.Float32BufferAttribute([0.5, 1, 0, 0, 1, 0], 2))
    aba.computeVertexNormals()
    g.add(malha(aba, tecido))
  }
  // mastros
  const mastro = new THREE.CylinderGeometry(0.035, 0.035, h + 0.35, 6)
  g.add(malha(mastro, m.std('#6b4a2b'), 0, (h + 0.35) / 2, d + 0.02))
  g.add(malha(mastro, m.std('#6b4a2b'), 0, (h + 0.35) / 2, -d - 0.02))
  return g
}

function construirFogueira(m: Mats, quality: Quality3D) {
  const g = new THREE.Group()
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    g.add(pedra(m, Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0.32, i))
  }
  const tora = new THREE.CylinderGeometry(0.06, 0.07, 0.75, 6)
  for (let i = 0; i < 3; i++) {
    const t = malha(tora, m.std('#5a3a20'), 0, 0.1, 0)
    t.rotation.set(Math.PI / 2 - 0.35, (i / 3) * Math.PI * 2, 0, 'YXZ')
    g.add(t)
  }
  const brasa = malha(new THREE.CircleGeometry(0.32, 10), new THREE.MeshBasicMaterial({ color: '#ff6a1c' }), 0, 0.02, 0)
  brasa.rotation.x = -Math.PI / 2
  g.add(brasa)
  const chamas: THREE.Mesh[] = []
  const cores = ['#ff7a1a', '#ffb02e', '#ffe08a']
  cores.forEach((cor, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.92 - i * 0.1, depthWrite: false })
    m.cache.set(`chama-${i}`, mat)
    for (let j = 0; j < (i === 2 ? 1 : 3); j++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.17 - i * 0.04, 0.65 - i * 0.15, 6), mat)
      const a = (j / 3) * Math.PI * 2 + i
      c.position.set(i === 2 ? 0 : Math.cos(a) * 0.08, 0.32 - i * 0.05, i === 2 ? 0 : Math.sin(a) * 0.08)
      c.userData.fase = i * 1.7 + j * 2.3
      chamas.push(c)
      g.add(c)
    }
  })
  const luz = new THREE.PointLight('#ff9a3c', quality === 'alta' ? 9 : 6, 7, 1.6)
  luz.position.set(0, 0.7, 0)
  g.add(luz)
  // fumaça e faíscas
  const fumacaTex = texturaMancha('200,190,180')
  const fumaca: THREE.Sprite[] = []
  for (let i = 0; i < (quality === 'alta' ? 6 : 3); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumacaTex, transparent: true, opacity: 0, depthWrite: false }))
    s.userData.fase = i / 6
    fumaca.push(s)
    g.add(s)
  }
  const nFaiscas = quality === 'alta' ? 36 : 14
  const fp = new Float32Array(nFaiscas * 3)
  const faiscas = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(fp, 3)), new THREE.PointsMaterial({ color: '#ffc06a', size: 0.04, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  g.add(faiscas)
  const animar = (t: number) => {
    for (const c of chamas) {
      const f = c.userData.fase as number
      c.scale.set(1 + Math.sin(t * 9 + f) * 0.12, 1 + Math.sin(t * 13 + f * 2) * 0.22, 1 + Math.cos(t * 8 + f) * 0.12)
      c.rotation.y = t * 0.6 + f
    }
    luz.intensity = (quality === 'alta' ? 9 : 6) * (0.85 + Math.sin(t * 17) * 0.08 + Math.sin(t * 7.3) * 0.07)
    for (const s of fumaca) {
      const k = (t * 0.12 + (s.userData.fase as number)) % 1
      s.position.set(Math.sin(k * 6 + (s.userData.fase as number) * 9) * 0.15, 0.8 + k * 2.2, 0)
      s.scale.setScalar(0.35 + k * 1.1)
      ;(s.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.22
    }
    for (let i = 0; i < nFaiscas; i++) {
      const k = (t * 0.35 + i / nFaiscas) % 1
      fp[i * 3] = Math.sin(i * 12.9 + k * 4) * 0.25 * k
      fp[i * 3 + 1] = 0.25 + k * 1.6
      fp[i * 3 + 2] = Math.cos(i * 7.7 + k * 3) * 0.25 * k
    }
    faiscas.geometry.attributes.position.needsUpdate = true
  }
  return { grupo: g, animar }
}

function construirBau(m: Mats, pronto: boolean) {
  const g = new THREE.Group()
  const madeira = m.std('#8a5a2b')
  const ouro = m.std('#e0b44c', { metalness: 0.6, roughness: 0.35, flatShading: false })
  // suporte
  g.add(malha(new THREE.BoxGeometry(0.95, 0.32, 0.62), m.std('#6b4a2b'), 0, 0.16, 0))
  const corpo = new THREE.Group()
  corpo.position.y = 0.32
  corpo.add(malha(new THREE.BoxGeometry(0.72, 0.38, 0.46), madeira, 0, 0.19, 0))
  for (const x of [-0.27, 0.27]) corpo.add(malha(new THREE.BoxGeometry(0.06, 0.4, 0.48), ouro, x, 0.19, 0))
  corpo.add(malha(new THREE.BoxGeometry(0.1, 0.12, 0.04), ouro, 0, 0.3, 0.24))
  // tampa com dobradiça atrás
  const tampa = new THREE.Group()
  tampa.position.set(0, 0.38, -0.23)
  const arco = malha(new THREE.CylinderGeometry(0.23, 0.23, 0.72, 12, 1, false, 0, Math.PI), madeira, 0, 0, 0.23)
  arco.rotation.z = Math.PI / 2
  tampa.add(arco)
  for (const x of [-0.27, 0.27]) {
    const fita = malha(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 12, 1, false, 0, Math.PI), ouro, x, 0, 0.23)
    fita.rotation.z = Math.PI / 2
    tampa.add(fita)
  }
  corpo.add(tampa)
  g.add(corpo)
  let animar = (_t: number) => {}
  if (pronto) {
    const brilho = new THREE.PointLight('#ffd166', 4, 2.5, 1.5)
    brilho.position.set(0, 0.85, 0)
    g.add(brilho)
    const luzInterna = malha(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshBasicMaterial({ color: '#ffe7a0' }), 0, 0.7, 0)
    luzInterna.rotation.x = -Math.PI / 2
    g.add(luzInterna)
    const tex = texturaMancha('255,214,120')
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }))
    aura.position.set(0, 0.95, 0)
    aura.scale.setScalar(1.4)
    g.add(aura)
    const estrela = new THREE.OctahedronGeometry(0.05)
    const brilhos = Array.from({ length: 6 }, (_, i) => {
      const b = new THREE.Mesh(estrela, new THREE.MeshBasicMaterial({ color: '#fff3c4' }))
      b.userData.fase = i
      g.add(b)
      return b
    })
    animar = (t) => {
      tampa.rotation.x = -0.95 + Math.sin(t * 2) * 0.05
      aura.material.opacity = 0.45 + Math.sin(t * 3) * 0.12
      for (const b of brilhos) {
        const k = (t * 0.4 + (b.userData.fase as number) / 6) % 1
        const a = (b.userData.fase as number) * 1.05
        b.position.set(Math.cos(a) * 0.3, 0.75 + k * 0.7, Math.sin(a) * 0.2)
        b.scale.setScalar(Math.sin(k * Math.PI))
        b.rotation.y = t * 3
      }
    }
  }
  return { grupo: g, animar }
}

function texturaQuadro() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 192
  const g = c.getContext('2d')!
  g.fillStyle = '#efe0bb'
  g.fillRect(0, 0, 256, 192)
  g.fillStyle = '#5c3d22'
  g.font = 'bold 30px Georgia, serif'
  g.textAlign = 'center'
  g.fillText('Missões', 128, 44)
  g.fillRect(40, 58, 176, 3)
  g.globalAlpha = 0.45
  for (let i = 0; i < 4; i++) g.fillRect(36, 84 + i * 24, 120 + ((i * 37) % 60), 6)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function construirQuadro(m: Mats) {
  const g = new THREE.Group()
  const madeira = m.std('#6b4a2b')
  for (const x of [-0.72, 0.72]) g.add(malha(new THREE.CylinderGeometry(0.05, 0.06, 2, 6), madeira, x, 1, 0))
  g.add(malha(new THREE.BoxGeometry(1.36, 1.0, 0.07), m.std('#7d5733'), 0, 1.35, 0))
  const papel = new THREE.MeshStandardMaterial({ map: texturaQuadro(), roughness: 1 })
  m.cache.set('quadro-papel', papel)
  g.add(malha(new THREE.PlaneGeometry(1.18, 0.86), papel, 0, 1.35, 0.04))
  const telhado = malha(new THREE.BoxGeometry(1.6, 0.06, 0.32), madeira, 0, 1.92, 0.04)
  telhado.rotation.x = 0.25
  g.add(telhado)
  return g
}

function construirMesa(m: Mats) {
  const g = new THREE.Group()
  const madeira = m.std('#7a5230')
  g.add(malha(new THREE.BoxGeometry(1.1, 0.06, 0.62), madeira, 0, 0.72, 0))
  for (const [x, z] of [[-0.48, -0.25], [0.48, -0.25], [-0.48, 0.25], [0.48, 0.25]]) g.add(malha(new THREE.BoxGeometry(0.06, 0.72, 0.06), madeira, x, 0.36, z))
  // livro aberto
  const pagina = m.std('#f3ead2')
  for (const lado of [-1, 1]) {
    const p = malha(new THREE.BoxGeometry(0.22, 0.02, 0.3), pagina, lado * 0.11, 0.77, 0.05)
    p.rotation.z = -lado * 0.12
    g.add(p)
  }
  g.add(malha(new THREE.BoxGeometry(0.47, 0.015, 0.32), m.std('#6e2b20'), 0, 0.755, 0.05))
  // pilha de livros
  const cores = ['#2f4766', '#8e3328', '#5c7046']
  cores.forEach((c, i) => {
    const l = malha(new THREE.BoxGeometry(0.26, 0.06, 0.2), m.std(c), 0.36, 0.78 + i * 0.06, -0.12)
    l.rotation.y = i * 0.25
    g.add(l)
  })
  // pergaminhos
  for (let i = 0; i < 2; i++) {
    const r = malha(new THREE.CylinderGeometry(0.04, 0.04, 0.36, 8), m.std('#e9d9b0'), -0.33, 0.79, -0.1 + i * 0.12)
    r.rotation.z = Math.PI / 2
    r.rotation.y = 0.3 * i
    g.add(r)
  }
  return g
}

function barril(m: Mats, x: number, z: number) {
  const g = new THREE.Group()
  g.add(malha(new THREE.CylinderGeometry(0.26, 0.24, 0.62, 10), m.std('#7d5230'), 0, 0.31, 0))
  for (const y of [0.12, 0.5]) g.add(malha(new THREE.TorusGeometry(0.262, 0.015, 4, 14), m.std('#3d2b1f'), 0, y, 0).rotateX(Math.PI / 2))
  g.position.set(x, 0, z)
  return g
}

// ---------- elementos liberados com o progresso ----------

function jarros(m: Mats) {
  const g = new THREE.Group()
  const perfil = [new THREE.Vector2(0, 0), new THREE.Vector2(0.12, 0.02), new THREE.Vector2(0.17, 0.15), new THREE.Vector2(0.14, 0.3), new THREE.Vector2(0.07, 0.38), new THREE.Vector2(0.08, 0.44)]
  const geo = new THREE.LatheGeometry(perfil, 10)
  ;[[0, 0, 1], [0.32, 0.1, 0.8], [0.15, -0.28, 0.9]].forEach(([x, z, s], i) => {
    const j = malha(geo, m.std(i % 2 ? '#b0623a' : '#c47a48'), x, 0, z)
    j.scale.setScalar(s)
    g.add(j)
  })
  return g
}

function palmeira(m: Mats, s: number) {
  const g = new THREE.Group()
  const tronco = m.std('#8a6a44')
  let y = 0
  let x = 0
  for (let i = 0; i < 7; i++) {
    const seg = malha(new THREE.CylinderGeometry(0.09 - i * 0.004, 0.11 - i * 0.004, 0.42, 6), tronco, x, y + 0.21, 0)
    seg.rotation.z = -0.06 * i
    g.add(seg)
    y += 0.4
    x += 0.03 * i
  }
  const folha = m.std('#4f8a3a', { side: THREE.DoubleSide })
  for (let i = 0; i < 7; i++) {
    const f = malha(new THREE.ConeGeometry(0.14, 1.3, 4), folha, x, y, 0)
    f.scale.set(1, 1, 0.25)
    f.geometry.translate(0, 0.65, 0)
    f.rotation.set(0, (i / 7) * Math.PI * 2, 1.15 + (i % 2) * 0.2, 'YXZ')
    g.add(f)
  }
  g.scale.setScalar(s)
  return g
}

function lanterna(m: Mats) {
  const g = new THREE.Group()
  g.add(malha(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 6), m.std('#5a3d24'), 0, 0.75, 0))
  g.add(malha(new THREE.BoxGeometry(0.28, 0.03, 0.03), m.std('#5a3d24'), 0.12, 1.48, 0))
  const lamp = malha(new THREE.BoxGeometry(0.12, 0.16, 0.12), new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 1.6 }), 0.24, 1.36, 0)
  m.cache.set(`lanterna-${Math.random()}`, lamp.material as THREE.Material)
  g.add(lamp)
  return g
}

function estandarte(m: Mats) {
  const g = new THREE.Group()
  g.add(malha(new THREE.CylinderGeometry(0.04, 0.045, 3, 6), m.std('#5a3d24'), 0, 1.5, 0))
  g.add(malha(new THREE.SphereGeometry(0.07, 8, 6), m.std('#e0b44c', { metalness: 0.6, roughness: 0.4 }), 0, 3.03, 0))
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 96
  const x = c.getContext('2d')!
  x.fillStyle = '#8e3328'
  x.fillRect(0, 0, 64, 96)
  x.fillStyle = '#e0b44c'
  x.fillRect(0, 8, 64, 4)
  x.fillRect(0, 84, 64, 4)
  // lamparina estilizada
  x.beginPath()
  x.ellipse(32, 52, 16, 8, 0, 0, Math.PI * 2)
  x.fill()
  x.beginPath()
  x.moveTo(32, 26)
  x.quadraticCurveTo(40, 36, 32, 44)
  x.quadraticCurveTo(24, 36, 32, 26)
  x.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const geo = new THREE.PlaneGeometry(0.62, 0.95, 8, 1)
  const pano = malha(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.95 }), 0.33, 2.45, 0)
  m.cache.set('estandarte', pano.material as THREE.Material)
  g.add(pano)
  const base = geo.attributes.position.array.slice() as Float32Array
  const animar = (t: number) => {
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3]
      p.setZ(i, Math.sin(t * 2.4 + bx * 6) * 0.06 * (bx + 0.31))
    }
    p.needsUpdate = true
  }
  return { grupo: g, animar }
}

function poco(m: Mats) {
  const g = new THREE.Group()
  g.add(malha(new THREE.CylinderGeometry(0.55, 0.6, 0.6, 12, 1, true), m.std('#a39784', { side: THREE.DoubleSide }), 0, 0.3, 0))
  g.add(malha(new THREE.TorusGeometry(0.56, 0.07, 5, 14), m.std('#958a78'), 0, 0.6, 0).rotateX(Math.PI / 2))
  const agua = malha(new THREE.CircleGeometry(0.5, 12), m.std('#3d6f8c', { roughness: 0.2 }), 0, 0.35, 0)
  agua.rotation.x = -Math.PI / 2
  g.add(agua)
  for (const x of [-0.55, 0.55]) g.add(malha(new THREE.BoxGeometry(0.07, 1.3, 0.07), m.std('#5a3d24'), x, 0.65, 0))
  g.add(malha(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), m.std('#5a3d24'), 0, 1.2, 0).rotateZ(Math.PI / 2))
  g.add(malha(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 8), m.std('#7d5230'), 0.2, 0.85, 0))
  return g
}

function ovelhas(m: Mats) {
  const g = new THREE.Group()
  const la = m.std('#f1ebdf')
  const escuro = m.std('#3a3029')
  const cabecas: THREE.Object3D[] = []
  ;[[0, 0, 0], [1.1, 0.5, 1.2], [-0.9, 0.7, -0.6]].forEach(([x, z, r], i) => {
    const o = new THREE.Group()
    const corpo = malha(new THREE.IcosahedronGeometry(0.32, 1), la, 0, 0.42, 0)
    corpo.scale.set(1.25, 0.9, 0.9)
    o.add(corpo)
    const cab = malha(new THREE.BoxGeometry(0.16, 0.18, 0.2), escuro, 0.42, 0.5, 0)
    cab.userData.fase = i * 1.3
    cabecas.push(cab)
    o.add(cab)
    for (const [lx, lz] of [[-0.2, -0.12], [-0.2, 0.12], [0.2, -0.12], [0.2, 0.12]]) o.add(malha(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 4), escuro, lx, 0.11, lz))
    o.position.set(x, 0, z)
    o.rotation.y = r
    g.add(o)
  })
  const animar = (t: number) => {
    for (const c of cabecas) c.position.y = 0.46 + Math.sin(t * 0.9 + (c.userData.fase as number)) * 0.06
  }
  return { grupo: g, animar }
}

function jardim(m: Mats) {
  const g = new THREE.Group()
  const caule = m.std('#4f7a35')
  const cores = ['#e8a1b5', '#f2d36b', '#f4f0e8', '#b98ad6']
  for (let i = 0; i < 26; i++) {
    const lado = i % 2 ? 1 : -1
    const z = -1.4 - (i >> 1) * 0.9
    const x = -Math.sin(z * 0.25) * 1.2 + lado * (1.25 + Math.sin(i * 5.1) * 0.2)
    g.add(malha(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 3), caule, x, 0.11, z))
    g.add(malha(new THREE.IcosahedronGeometry(0.05, 0), m.std(cores[i % 4]), x, 0.24, z))
    if (i % 3 === 0) g.add(arbusto(m, x + lado * 0.3, z + 0.2, 0.55, '#6b9a44'))
  }
  return g
}

// ---------- disposição (larga no computador, compacta no celular) ----------

/** [x, z] na tela larga e [x, z] na tela estreita. */
const POSICOES: Record<string, [number, number, number, number]> = {
  tenda: [-3.3, -2.3, -1.9, -3.1],
  fogueira: [-1.6, 0.25, -1.15, 0.35],
  mesa: [-3.05, -0.35, -1.75, -1.0],
  quadro: [1.7, -3.4, 1.65, -2.9],
  bau: [1.2, 1.45, 1.15, 0.55],
  barris: [-4.9, -1.9, -2.55, -2.2],
  jarros: [-2.2, -1.5, -2.2, -1.7],
  palmeiras: [5.2, -3.8, 3.0, -4.6],
  lanternas: [1.0, -1.6, 0.9, -1.9],
  'tenda-grande': [-6.4, -5.2, -3.9, -5.8],
  estandarte: [-1.0, -3.6, -0.8, -3.9],
  poco: [4.6, -1.2, 2.6, -1.6],
  ovelhas: [6.8, -7.0, 3.6, -7.8],
}

export function createCamp(container: HTMLElement, appearance: CharacterAppearance, opts: CampOptions): CampHandle {
  const { quality, reduced } = opts
  const renderer = createRenderer(quality)
  renderer.setClearColor('#93bfe6', 1)
  renderer.toneMappingExposure = 1.0
  const canvas = renderer.domElement
  canvas.className = 'camp-canvas'
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#dfe3e4', 30, 330)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400)
  const m = criarMateriais(quality)
  const animacoes: ((t: number) => void)[] = []

  // luz de fim de tarde
  const sol = new THREE.DirectionalLight('#ffe2b8', 2.6)
  sol.position.set(7, 9, 5)
  if (quality === 'alta') {
    sol.castShadow = true
    sol.shadow.mapSize.set(1024, 1024)
    Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 })
    sol.shadow.bias = -0.0005
    sol.shadow.normalBias = 0.03
  }
  // preenchimento vindo da câmera, para o rosto do personagem não ficar escuro
  const frente = new THREE.DirectionalLight('#fff0dc', 0.9)
  frente.position.set(-1, 3, 8)
  scene.add(sol, sol.target, frente, new THREE.HemisphereLight('#d6e6ff', '#7a5a3a', 1.35))

  scene.add(construirCeu(), construirNuvens(m), construirChao(), construirPedrasDoCaminho(m), construirMontanhas(m))
  scene.add(construirCidade(m, 26, -62, 1.25), construirCidade(m, -34, -78, 0.9))
  for (const [x, z, s] of [[-7, -6, 1.1], [-8.5, -3, 0.9], [7.5, -7, 1.2], [9, -4, 0.9], [-10, -9, 1.3], [11, -10, 1.1], [-5, -10, 1], [6, -12, 1.2], [-13, -6, 1], [13, -6, 1.2]]) scene.add(cipreste(m, x, z, s))
  for (const [x, z, s] of [[-5, 1.6, 0.9], [4.4, 1.8, 0.8], [-6.5, -1.2, 1.1], [6.4, -2.2, 1], [3.4, 2.6, 0.7]]) scene.add(arbusto(m, x, z, s))
  for (const [x, z, s] of [[3.7, 1.2, 0.8], [-4.4, 2.2, 0.7], [5.4, 0.2, 1.1], [-2.6, 2.6, 0.5]]) scene.add(pedra(m, x, z, s, x))

  // objetos com posição adaptável
  const posicionaveis = new Map<string, THREE.Object3D>()
  const colocar = (id: string, o: THREE.Object3D, rotY = 0) => {
    o.rotation.y = rotY
    posicionaveis.set(id, o)
    scene.add(o)
    return o
  }
  const tenda = colocar('tenda', construirTenda(m, 2.4, 2.6, 1.9, '#e9dcc0', '#b06a3a'), 0.45)
  const fogo = construirFogueira(m, quality)
  colocar('fogueira', fogo.grupo)
  if (!reduced) animacoes.push(fogo.animar)
  const mesa = colocar('mesa', construirMesa(m), 0.6)
  const quadro = colocar('quadro', construirQuadro(m), -0.45)
  const bau = construirBau(m, opts.bauPronto)
  colocar('bau', bau.grupo, -0.35)
  if (!reduced) animacoes.push(bau.animar)
  else bau.animar(0)
  const barris = new THREE.Group()
  barris.add(barril(m, 0, 0), barril(m, 0.55, 0.2), barril(m, 0.25, -0.45))
  colocar('barris', barris)

  const tem = new Set(opts.elementos)
  if (tem.has('jarros')) colocar('jarros', jarros(m))
  if (tem.has('palmeiras')) {
    const p = new THREE.Group()
    p.add(palmeira(m, 1.2), palmeira(m, 0.9).translateX(1.2).translateZ(0.8))
    colocar('palmeiras', p)
  }
  if (tem.has('lanternas')) {
    const l = new THREE.Group()
    l.add(lanterna(m), lanterna(m).translateX(-2.6).translateZ(-1.4))
    colocar('lanternas', l)
  }
  if (tem.has('tenda-grande')) colocar('tenda-grande', construirTenda(m, 3.2, 3.4, 2.5, '#d9c7a2', '#6e4426'), 0.6)
  if (tem.has('estandarte')) {
    const e = estandarte(m)
    colocar('estandarte', e.grupo)
    if (!reduced) animacoes.push(e.animar)
  }
  if (tem.has('poco')) colocar('poco', poco(m))
  if (tem.has('ovelhas')) {
    const o = ovelhas(m)
    colocar('ovelhas', o.grupo, -0.6)
    if (!reduced) animacoes.push(o.animar)
  }
  if (tem.has('jardim')) scene.add(jardim(m))

  // ---------- personagem ----------
  const sombra = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ map: texturaMancha('0,0,0'), transparent: true, opacity: 0.45, depthWrite: false }))
  sombra.rotation.x = -Math.PI / 2
  sombra.position.y = 0.01
  scene.add(sombra)
  let rig: Rig | null = null
  let chave = ''
  let ultima: CharacterAppearance | null = null
  let pedido = 0
  let disposed = false
  const setAppearance = (a: CharacterAppearance) => {
    const k = appearanceKey(a)
    if (k === chave) return
    chave = k
    if (rig?.recolorir && ultima && soCores(ultima, a)) {
      ultima = a
      rig.recolorir(a)
      return
    }
    ultima = a
    const meu = ++pedido
    montar(a, quality).then((novo) => {
      if (disposed || meu !== pedido) return novo.dispose()
      if (rig) {
        scene.remove(rig.root)
        rig.dispose()
      }
      rig = novo
      rig.root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = true
      })
      scene.add(rig.root)
      opts.onReady?.()
    })
  }
  setAppearance(appearance)

  // gestos: aceno ao chegar, depois espera com pequenos gestos de vez em quando
  let pose: Pose3D = reduced ? 'idle' : 'wave'
  let fimGesto = reduced ? 0 : 3.2
  let proximoGesto = 14
  const gesto = (p: Pose3D, s = 3) => {
    if (reduced) return
    pose = p
    fimGesto = t + s
  }
  if (opts.bauPronto && !reduced) proximoGesto = 5

  // ---------- alvos clicáveis ----------
  const alvos: { id: AlvoAcampamento; obj: THREE.Object3D; ancora: () => THREE.Vector3 }[] = [
    { id: 'tenda', obj: tenda, ancora: () => tenda.localToWorld(new THREE.Vector3(0, 2.25, 0)) },
    { id: 'mesa', obj: mesa, ancora: () => mesa.localToWorld(new THREE.Vector3(0, 1.15, 0)) },
    { id: 'quadro', obj: quadro, ancora: () => quadro.localToWorld(new THREE.Vector3(0, 2.2, 0)) },
    { id: 'bau', obj: bau.grupo, ancora: () => bau.grupo.localToWorld(new THREE.Vector3(0, 1.0, 0)) },
    { id: 'personagem', obj: sombra, ancora: () => new THREE.Vector3(0, 1.95, 0) },
  ]
  const raycaster = new THREE.Raycaster()
  const ponteiro = new THREE.Vector2()
  const alvoEm = (ev: PointerEvent): AlvoAcampamento | null => {
    const r = canvas.getBoundingClientRect()
    ponteiro.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ponteiro, camera)
    const objs = alvos.filter((a) => a.id !== 'personagem').map((a) => a.obj)
    if (rig) objs.push(rig.root)
    const hit = raycaster.intersectObjects(objs, true)[0]
    if (!hit) return null
    let o: THREE.Object3D | null = hit.object
    while (o) {
      if (rig && o === rig.root) return 'personagem'
      const a = alvos.find((x) => x.obj === o)
      if (a) return a.id
      o = o.parent
    }
    return null
  }
  let inicio: { x: number; y: number } | null = null
  const onDown = (ev: PointerEvent) => (inicio = { x: ev.clientX, y: ev.clientY })
  const onUp = (ev: PointerEvent) => {
    if (!inicio || Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) > 8) return
    inicio = null
    const a = alvoEm(ev)
    if (a) opts.onSelect(a)
  }
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return
    canvas.style.cursor = alvoEm(ev) ? 'pointer' : 'default'
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointermove', onMove)

  // ---------- câmera e disposição ----------
  let estreita = 0
  const alvoCamera = new THREE.Vector3()
  const posCamera = new THREE.Vector3()
  const resize = () => {
    const w = Math.max(1, container.clientWidth)
    const h = Math.max(1, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'alta' ? 1.75 : 1))
    renderer.setSize(w, h, false)
    const aspect = w / h
    camera.aspect = aspect
    estreita = THREE.MathUtils.clamp((1.25 - aspect) / 0.7, 0, 1)
    camera.fov = lerp(32, 44, estreita)
    camera.updateProjectionMatrix()
    for (const [id, o] of posicionaveis) {
      const p = POSICOES[id]
      if (p) o.position.set(lerp(p[0], p[2], estreita), 0, lerp(p[1], p[3], estreita))
    }
    alvoCamera.set(0, lerp(1.05, 1.25, estreita), lerp(-0.6, -0.8, estreita))
    posCamera.set(0, lerp(1.85, 2.3, estreita), lerp(7.6, 7.4, estreita))
    camera.position.copy(posCamera)
    camera.lookAt(alvoCamera)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // ---------- laço ----------
  let visivel = true
  const io = new IntersectionObserver((e) => {
    visivel = e.some((x) => x.isIntersecting)
    laco()
  })
  io.observe(container)
  let t = 0
  let ultimo = performance.now()
  const minimo = quality === 'leve' ? 1 / 30 : 0
  const v = new THREE.Vector3()
  const posicionarRotulos = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    for (const a of alvos) {
      const el = opts.rotulos.get(a.id)
      if (!el) continue
      v.copy(a.ancora()).project(camera)
      const dentro = v.z < 1 && Math.abs(v.x) < 0.98 && v.y < 0.98 && v.y > -0.98
      // o rótulo nunca sai da tela: fica preso às bordas
      const meia = el.offsetWidth / 2 + 6
      const x = Math.min(w - meia, Math.max(meia, ((v.x + 1) / 2) * w))
      el.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -100%)`
      el.dataset.visivel = dentro ? 'sim' : 'nao'
    }
  }
  const tick = () => {
    const agora = performance.now()
    const passou = (agora - ultimo) / 1000
    if (passou < minimo) return
    const dt = Math.min(0.05, passou)
    ultimo = agora
    t += dt
    if (fimGesto && t > fimGesto) {
      pose = 'idle'
      fimGesto = 0
      proximoGesto = t + 12 + Math.random() * 8
    }
    if (!reduced && !fimGesto && t > proximoGesto) gesto(opts.bauPronto && Math.random() < 0.5 ? 'celebrate' : 'react', 3)
    for (const f of animacoes) f(t)
    rig?.update(pose, t, dt, reduced)
    if (!reduced) {
      camera.position.set(posCamera.x + Math.sin(t * 0.15) * 0.12, posCamera.y + Math.sin(t * 0.21) * 0.04, posCamera.z)
      camera.lookAt(alvoCamera)
    }
    renderer.render(scene, camera)
    posicionarRotulos()
  }
  const laco = () => renderer.setAnimationLoop(!disposed && visivel && document.visibilityState !== 'hidden' ? tick : null)
  const onVis = () => laco()
  document.addEventListener('visibilitychange', onVis)
  if (reduced) animacoes.length = 0
  fogo.animar(0)
  laco()
  renderer.render(scene, camera)
  posicionarRotulos()

  return {
    setAppearance,
    gesto,
    dispose() {
      disposed = true
      renderer.setAnimationLoop(null)
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
      if (rig) {
        scene.remove(rig.root)
        rig.dispose()
      }
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
        for (const mt of mats) {
          for (const val of Object.values(mt)) if (val instanceof THREE.Texture) val.dispose()
          mt.dispose()
        }
      })
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
