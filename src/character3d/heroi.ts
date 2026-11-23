import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { CharacterAppearance } from '../types'
import { bodyOf, resolveLook } from '../data/character/look'
import { hexShade } from './math'
import type { Pose3D, Quality3D, Rig } from './rig'

/*
 * PERSONAGEM 3D A PARTIR DO MODELO GLB (tools/personagem → public/models/personagem)
 * Malha humana MakeHuman (CC0) com esqueleto de 163 ossos, roupas drapeadas por
 * simulação de tecido no Blender, animações e expressões. Cada variante (cabelo,
 * túnica, manto, cinto, calçado, acessório) é uma malha com nome próprio; a
 * aparência do jogador decide o que fica visível e as cores.
 */

const BASE = (import.meta.env?.BASE_URL ?? './') + 'models/personagem/'
const cache = new Map<string, Promise<GLTF>>()

/**
 * Personagens (bases) que já têm modelo estilizado próprio em `heroi-<base>.glb`.
 * As outras usam o modelo do corpo (`heroi-masculino.glb` ou `heroi-feminino.glb`).
 * O Viajante usa `heroi-masculino.glb`, que já é o modelo estilizado dele.
 */
export const MODELOS_POR_BASE: readonly string[] = []

/** Arquivo do modelo de uma aparência: o da base, se existir e o corpo for o da base; senão, o do corpo. */
export function modeloDe(a: CharacterAppearance): string {
  const body = bodyOf(a)
  const doCorpo = bodyOf({ ...a, body: undefined }) === body
  return MODELOS_POR_BASE.includes(a.base) && doCorpo ? a.base : body
}

/**
 * Entre duas aparências, só mudam cores no modelo estilizado? (mesmo arquivo de modelo e
 * mesmos acessórios: cabelo, túnica, manto, cinto e calçado mudam apenas a cor nele).
 */
export function soCores(a: CharacterAppearance, b: CharacterAppearance) {
  return modeloDe(a) === modeloDe(b) && a.equipped.acessorios.join(',') === b.equipped.acessorios.join(',')
}

export function heroUrl(modelo: string) {
  return `${BASE}heroi-${modelo}.glb`
}

export function loadHero(modelo: string): Promise<GLTF> {
  let p = cache.get(modelo)
  if (!p) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    p = loader.loadAsync(heroUrl(modelo))
    p.catch(() => cache.delete(modelo))
    cache.set(modelo, p)
  }
  return p
}

const peles = new Map<string, Promise<THREE.Texture>>()
function pele(nome: string) {
  let p = peles.get(nome)
  if (!p) {
    p = new THREE.TextureLoader().loadAsync(`${BASE}${nome}.webp`).then((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.flipY = false
      return t
    })
    peles.set(nome, p)
  }
  return p
}

/** Correspondência dos estilos do jogo com as malhas do modelo. */
const CABELO: Record<string, string> = {
  curto: 'Cabelo_curto', raspado: 'Cabelo_raspado', longo: 'Cabelo_longo', ondulado: 'Cabelo_ondulado',
  cacheado: 'Cabelo_cacheado', coque: 'Cabelo_coque', tranca: 'Cabelo_tranca',
}
const MANTO: Record<string, string[]> = { manto: ['Manto'], longo: ['Manto_longo'], xale: ['Xale'], capuz: ['Manto', 'Capuz'] }
const CINTO: Record<string, string> = { couro: 'Cinto_couro', corda: 'Cinto_corda', faixa: 'Cinto_faixa' }
const CALCADO: Record<string, string> = { simples: 'Sandalia_simples', tiras: 'Sandalia_tiras', botas: 'Botas' }
const ACESSORIO: Record<string, string> = {
  cajado: 'Acessorio_cajado', pergaminho: 'Acessorio_pergaminho', lamparina: 'Acessorio_lamparina', cesto: 'Acessorio_cesto',
  bolsa: 'Bolsa', odre: 'Odre', lenco: 'Lenco', colar: 'Colar', louros: 'Acessorio_louros',
}
const CLIPE: Record<Pose3D, string> = { idle: 'Idle', walk: 'Walk', celebrate: 'Victory', react: 'Discovery', wave: 'Greeting', still: 'Idle' }
/** Expressão de repouso escolhida pelo jogador (v0.8): morph targets de cada uma. */
const EXPRESSAO_BASE: Record<string, Record<string, number>> = {
  neutra: {},
  sorriso: { Sorriso: 0.8 },
  alegria: { Alegria: 0.85 },
  surpresa: { Surpresa: 0.7 },
}
const EXPRESSAO: Partial<Record<Pose3D, Record<string, number>>> = {
  celebrate: { Alegria: 1 },
  react: { Surpresa: 0.85 },
  wave: { Sorriso: 0.9 },
  walk: { Sorriso: 0.35 },
}

/** Tinge a textura pela luminância (cabelo, barba, sobrancelhas): mantém os fios e troca a cor. */
function tingirPorLuminancia(m: THREE.MeshStandardMaterial, cor: string, ganho = 1.9) {
  m.color.set(cor)
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <map_fragment>',
      `#ifdef USE_MAP
        vec4 texelColor = texture2D( map, vMapUv );
        float lum = dot( texelColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
        diffuseColor.rgb *= vec3( clamp( lum * ${ganho.toFixed(2)}, 0.0, 1.6 ) );
        diffuseColor.a *= texelColor.a;
      #endif`,
    )
  }
  m.customProgramCacheKey = () => `lum-${ganho}`
}

/**
 * Modelo estilizado (v0.8): troca a cor de uma região da textura pintada.
 * Só os texels com cor parecida com a de base mudam (olhos, bordados e sobrancelhas ficam).
 */
function tingirRegiao(m: THREE.MeshStandardMaterial, base: string, alvo: string, saturacao = 1) {
  const u = { uBase: { value: new THREE.Color(base) }, uAlvo: { value: new THREE.Color(alvo) }, uSat: { value: saturacao }, uExp: { value: 0.5 } }
  // guardado no material: a cor muda ao vivo (recolorir), sem recompilar o shader nem remontar o personagem
  m.userData.regiao = u
  m.color.set('#ffffff')
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBase; uniform vec3 uAlvo; uniform float uSat; uniform float uExp;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
        vec4 texelColor = texture2D( map, vMapUv );
        vec3 c = texelColor.rgb;
        const vec3 LUM = vec3( 0.2126, 0.7152, 0.0722 );
        vec3 cn = c / max( dot( c, LUM ), 0.004 );
        vec3 bn = uBase / max( dot( uBase, LUM ), 0.004 );
        float w = 1.0 - smoothstep( 0.35, 0.8, length( cn - bn ) );
        // a cor nova recebe o claro-escuro da textura (relação de luminância com a cor de base)
        // a diferença de claridade entre alvo e base é suavizada (expoente uExp: 0,5 na pele, para os tons claros
        // não estourarem; 0,9 nas outras regiões, para um cabelo escuro poder virar loiro, por exemplo)
        float lb = max( dot( uBase, LUM ), 0.004 );
        float r = max( dot( uAlvo, LUM ), 0.002 ) / lb;
        float k = dot( c, LUM ) / lb * pow( r, uExp ) / r;
        vec3 tinto = uAlvo * k;
        // pele: um pouco mais de saturação, porque a luz do palco e o tone mapping acinzentam os tons claros
        tinto = min( mix( vec3( dot( tinto, LUM ) ), tinto, uSat ), vec3( 1.0 ) );
        diffuseColor *= vec4( mix( c, tinto, w ), texelColor.a );
      #endif`,
      )
  }
  m.customProgramCacheKey = () => 'regiao'
}

interface Faixas { listra?: string; barra?: string; bainha: number; bordas?: boolean }

/** Tecido com listras e barra bordada desenhadas no shader (pela posição de repouso). */
function tecidoComFaixas(m: THREE.MeshStandardMaterial, f: Faixas) {
  const u = {
    uListra: { value: new THREE.Color(f.listra ?? '#000') },
    uListraOn: { value: f.listra ? 1 : 0 },
    uBarra: { value: new THREE.Color(f.barra ?? '#000') },
    uBarraOn: { value: f.barra ? 1 : 0 },
    uBainha: { value: f.bainha },
    uBordas: { value: f.bordas ? 1 : 0 },
  }
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRepouso;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRepouso = position;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRepouso;\nuniform vec3 uListra; uniform float uListraOn; uniform vec3 uBarra; uniform float uBarraOn; uniform float uBainha; uniform float uBordas;')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float ang = atan( vRepouso.x, vRepouso.z );
        if ( uListraOn > 0.5 ) {
          float s = fract( ang * 3.8197 );
          if ( s < 0.12 || ( s > 0.2 && s < 0.24 ) ) diffuseColor.rgb = uListra * ( diffuseColor.rgb / max( vec3(0.001), diffuseColor.rgb ) ) * 0.95;
        }
        if ( uBarraOn > 0.5 ) {
          float h = vRepouso.y - uBainha;
          bool barra = h > 0.012 && h < 0.05;
          #ifdef USE_MAP
          if ( uBordas > 0.5 && ( vMapUv.x < 0.035 || vMapUv.x > 1.965 ) ) barra = true;
          #endif
          if ( barra ) diffuseColor.rgb = uBarra * 0.95;
        }`,
      )
  }
  m.customProgramCacheKey = () => `faixas-${f.listra ? 1 : 0}${f.barra ? 1 : 0}${f.bordas ? 1 : 0}`
}

/**
 * Copia o material do GLB (Physical, por causa das extensões ior/specular) para
 * MeshStandardMaterial: shader menor e compilação bem mais rápida em celulares.
 */
function paraStandard(src: THREE.Material): THREE.MeshStandardMaterial {
  const m = src as THREE.MeshStandardMaterial
  const out = new THREE.MeshStandardMaterial({
    name: m.name, color: m.color?.clone(), map: m.map ?? null, normalMap: m.normalMap ?? null,
    roughness: m.roughness ?? 0.8, metalness: m.metalness ?? 0, transparent: m.transparent, alphaTest: m.alphaTest,
    side: m.side, vertexColors: m.vertexColors, depthWrite: m.depthWrite, opacity: m.opacity,
  })
  if (m.normalScale) out.normalScale.copy(m.normalScale)
  out.userData = { ...m.userData }
  return out
}

/** Nome da peça (variante) a partir do material "<tipo>__<peça>" gravado pelo construtor. */
export function pecaDe(m: THREE.Mesh) {
  const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material
  const parts = mat?.name?.split('__')
  return parts && parts.length > 1 ? parts[1].replace(/\.\d+$/, '') : m.name
}

const BAINHA: Record<string, number> = { Tunica_saia: 0.07, Tunica_saia_curta: 0.38, Manto: 0.32, Manto_longo: 0.12, Xale: 0.92 }

/**
 * Peças do modelo que ficam visíveis para uma aparência (regra única, testada).
 * O corpo, os olhos, os dentes, a língua, as sobrancelhas e os cílios estão sempre visíveis.
 */
export function pecasVisiveis(a: CharacterAppearance): string[] {
  const look = resolveLook(a)
  const acess = look.accessories.map((x) => x.kind)
  const out: string[] = ['Tunica_cima', look.tunic.short ? 'Tunica_saia_curta' : 'Tunica_saia']
  if (!acess.includes('lenco')) out.push(CABELO[look.hairStyle] ?? 'Cabelo_curto')
  if (look.mantle) out.push(...(MANTO[look.mantle.style] ?? ['Manto']))
  if (look.belt) out.push(CINTO[look.belt.style] ?? 'Cinto_couro')
  out.push(CALCADO[look.foot.style] ?? 'Sandalia_simples')
  if (look.beard !== 'nenhuma') out.push(look.beard === 'cheia' ? 'Barba_cheia' : 'Barba_curta')
  for (const k of acess) out.push(ACESSORIO[k])
  return out
}

/** Todas as peças opcionais que o modelo GLB precisa conter. */
export const PECAS_DO_MODELO = [
  ...Object.values(CABELO), 'Tunica_cima', 'Tunica_saia', 'Tunica_saia_curta', 'Manto', 'Manto_longo', 'Xale', 'Capuz',
  ...Object.values(CINTO), ...Object.values(CALCADO), 'Barba_curta', 'Barba_cheia', ...Object.values(ACESSORIO),
]

/**
 * Saturação extra da pele no modelo estilizado: só os tons claros ganham (a luz azulada do
 * palco e o tone mapping os acinzentam); os tons médios e escuros ficam como estão.
 */
export function saturacaoPele(hex?: string) {
  if (!hex) return 1
  const c = new THREE.Color(hex)
  const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  return 1 + 0.8 * Math.min(1, Math.max(0, (l - 0.25) / 0.4))
}

/** Regiões do modelo estilizado (v0.8), em que a aparência troca a cor. */
export const REGIOES_ESTILIZADO = ['Pele', 'Cabelo', 'Tunica', 'Manto', 'Faixa', 'Couro'] as const

/** O GLB é o modelo estilizado (gerado de imagem, peça única com regiões de cor)? */
export function ehEstilizado(gltf: { scene: { userData: Record<string, unknown> } }) {
  return gltf.scene.userData?.estilo === 'animacao'
}

/** Cor de cada região do modelo estilizado para uma aparência (sem item: a cor original, `undefined`). */
export function coresEstilizado(a: CharacterAppearance): Record<(typeof REGIOES_ESTILIZADO)[number], string | undefined> {
  const look = resolveLook(a)
  return {
    Pele: look.skin,
    Cabelo: look.hair,
    Tunica: look.tunic.color,
    Manto: look.mantle?.color,
    Faixa: look.belt?.color,
    Couro: look.foot.color,
  }
}

export interface HeroRig extends Rig {
  ready: Promise<void>
}

/** Monta um personagem a partir do GLB carregado e da aparência salva. */
export function buildHero(gltf: GLTF, a: CharacterAppearance, quality: Quality3D): Rig {
  const look = resolveLook(a)
  const root = cloneSkinned(gltf.scene) as THREE.Group
  root.name = 'personagem'
  const meshes = new Map<string, THREE.Mesh[]>()
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh) {
      const k = pecaDe(m)
      m.userData.peca = k
      meshes.set(k, [...(meshes.get(k) ?? []), m])
      m.castShadow = quality === 'alta'
      m.frustumCulled = false
      // cada personagem tem seus próprios materiais (cores independentes)
      m.material = Array.isArray(m.material) ? m.material.map(paraStandard) : paraStandard(m.material as THREE.Material)
    }
  })
  const mostrar = (nome: string, v: boolean) => meshes.get(nome)?.forEach((m) => (m.visible = v))
  const todos = [...meshes.keys()]
  for (const n of todos) {
    if (/^(Cabelo_|Tunica_saia|Manto|Xale|Capuz|Cinto_|Sandalia_|Botas|Barba_|Acessorio_|Bolsa|Odre|Lenco|Colar)/.test(n)) mostrar(n, false)
  }

  const acess = look.accessories.map((x) => x.kind)
  for (const n of pecasVisiveis(a)) mostrar(n, true)
  const estilizado = ehEstilizado(gltf)
  if (estilizado) {
    // corpo, cabelo e roupa são uma peça só: aparecem sempre; a aparência troca as cores
    const alvo = coresEstilizado(a)
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const m = mesh.material as THREE.MeshStandardMaterial
      const [tipo] = m.name.split('__')
      const base = (m.userData as { base?: string }).base
      if (base && tipo in alvo) {
        mesh.visible = true
        tingirRegiao(m, base, alvo[tipo as keyof typeof alvo] ?? base, tipo === 'Pele' ? saturacaoPele(alvo.Pele) : 1)
        ;(m.userData.regiao as { uExp: { value: number } }).uExp.value = tipo === 'Pele' ? 0.5 : 0.9
        m.roughness = tipo === 'Pele' ? 0.6 : 0.85
        if (quality === 'leve') m.envMapIntensity = 0.8
      }
    })
  }

  // materiais e cores (modelo v0.7)
  const hairHex = look.hair
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh || estilizado) return
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[]
    for (const m of mats) {
      const n = m.name.split('__')[0]
      if (n.startsWith('Cabelo')) {
        tingirPorLuminancia(m, hairHex, 1.12)
        m.transparent = true
        m.depthWrite = true
        m.alphaTest = 0.05
        m.side = THREE.DoubleSide
      } else if (n === 'Sobrancelhas') {
        tingirPorLuminancia(m, hexShade(hairHex, look.face === 'marcante' ? -0.12 : -0.04), look.face === 'marcante' ? 0.75 : 0.95)
      } else if (n === 'Barba') {
        tingirPorLuminancia(m, hairHex, 1.1)
        m.vertexColors = true
        m.transparent = true
        m.depthWrite = false
      } else if (n === 'Cilios') {
        m.color.set('#1a120d')
      } else if (n === 'Tunica') {
        m.color.set(look.tunic.color)
        const nome = mesh.userData.peca as string
        tecidoComFaixas(m, { listra: look.tunic.stripes, barra: look.tunic.trim, bainha: BAINHA[nome] ?? -1 })
      } else if (n === 'Manto' && look.mantle) {
        m.color.set(look.mantle.color)
        const nome = mesh.userData.peca as string
        tecidoComFaixas(m, { listra: look.mantle.stripes, barra: look.mantle.trim, bainha: BAINHA[nome] ?? -1, bordas: true })
      } else if (n === 'Couro') {
        const peca = mesh.userData.peca as string
        m.color.set(look.belt && peca.startsWith('Cinto') ? look.belt.color : look.foot.color)
        if (peca === 'Bolsa' || peca === 'Odre') m.color.set('#6b4423')
      } else if (n === 'Corda' && look.belt) {
        m.color.set(look.belt.color)
      } else if (n === 'Faixa' && look.belt) {
        m.color.set(look.belt.color)
      } else if (n === 'Lenco') {
        m.color.set(look.accessories.find((x) => x.kind === 'lenco')?.color ?? '#d9c7a0')
      } else if (n === 'Pele') {
        m.roughness = 0.55
        if ('sheen' in m) Object.assign(m, { sheen: 0.25 })
      }
      if (quality === 'leve') m.envMapIntensity = 0.8
    }
  })

  // pele: textura conforme o tom (clara, média ou escura) e ajuste fino de cor
  const tom = a.skin
  const arquivo = `pele-${look.body === 'feminino' ? 'f' : 'm'}-${tom <= 1 ? 'clara' : tom <= 3 ? 'media' : 'escura'}`
  const ajuste = ['#ffffff', '#f1d9c4', '#ffffff', '#e7c6a8', '#ffffff', '#d9b9a2'][tom] ?? '#ffffff'
  const peleMats: THREE.MeshStandardMaterial[] = []
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh && !estilizado && (mesh.material as THREE.Material).name.startsWith('Pele')) peleMats.push(mesh.material as THREE.MeshStandardMaterial)
  })
  if (!estilizado) peleMats.forEach((m) => m.color.set(ajuste))
  const ready = estilizado || arquivo.endsWith('clara')
    ? Promise.resolve()
    : pele(arquivo).then((t) => peleMats.forEach((m) => {
        m.map = t
        m.needsUpdate = true
      })).catch(() => undefined)

  // animação
  const mixer = new THREE.AnimationMixer(root)
  const clipes = new Map(gltf.animations.map((c) => [c.name, c]))
  let atual: THREE.AnimationAction | null = null
  let poseAtual: Pose3D | null = null
  const morphMeshes: THREE.Mesh[] = []
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && m.morphTargetDictionary) morphMeshes.push(m)
  })
  let expressaoBase: string = look.expressao
  const expr: Record<string, number> = { Piscar: 0, Sorriso: 0, Surpresa: 0, Alegria: 0 }
  const alvo: Record<string, number> = { ...expr }
  const dedosR: THREE.Bone[] = []
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone && /^finger[2-5]-[1-3]R$|^finger[2-5]-[1-3]\.R$/.test(o.name)) dedosR.push(o as THREE.Bone)
  })
  const segura = acess.some((k) => ['cajado', 'pergaminho', 'lamparina', 'cesto'].includes(k))
  let piscarEm = 2
  const tocar = (pose: Pose3D) => {
    if (pose === poseAtual) return
    poseAtual = pose
    const clip = clipes.get(CLIPE[pose])
    if (!clip) return
    const nova = mixer.clipAction(clip)
    nova.reset()
    nova.enabled = true
    nova.setEffectiveWeight(1)
    nova.play()
    if (pose === 'still') nova.paused = true
    if (atual && atual !== nova) atual.crossFadeTo(nova, 0.35, false)
    atual = nova
    for (const k of Object.keys(alvo)) alvo[k] = 0
    Object.assign(alvo, EXPRESSAO[pose] ?? EXPRESSAO_BASE[expressaoBase] ?? {})
  }

  function update(pose: Pose3D, t: number, dt: number, reduced = false) {
    const p = reduced && pose !== 'still' ? 'still' : pose
    tocar(p)
    mixer.update(p === 'still' ? 0 : Math.min(dt, 0.1))
    if (dt >= 1) {
      // quadro isolado (miniaturas): vai direto ao instante pedido
      if (atual && p !== 'still') atual.time = t % (atual.getClip().duration || 1)
      mixer.update(0)
      for (const k of Object.keys(expr)) expr[k] = alvo[k]
    }
    // expressão suave + piscar
    const k = Math.min(1, dt * 6)
    for (const n of Object.keys(expr)) expr[n] += (alvo[n] - expr[n]) * k
    let pisca = 0
    if (!reduced && p !== 'still') {
      if (t > piscarEm + 0.16) piscarEm = t + 2.5 + ((t * 7.31) % 1) * 3
      if (t > piscarEm) pisca = Math.sin(((t - piscarEm) / 0.16) * Math.PI)
    }
    for (const m of morphMeshes) {
      const d = m.morphTargetDictionary!
      const inf = m.morphTargetInfluences!
      for (const n of Object.keys(expr)) if (n in d) inf[d[n]] = expr[n]
      if ('Piscar' in d) inf[d.Piscar] = pisca
    }
    // mão direita fechada quando segura um objeto
    if (segura) for (const b of dedosR) b.rotation.x += 0.9
  }

  update('still', 0, 1)
  const alvo0 = alvo

  /** Modelo estilizado: troca só as cores (uniforms), sem remontar. */
  const recolorir = estilizado
    ? (b: CharacterAppearance) => {
        // expressão de repouso: vale na próxima troca de pose ou já, se estiver parado
        expressaoBase = resolveLook(b).expressao
        if (poseAtual && !EXPRESSAO[poseAtual]) {
          for (const k of Object.keys(alvo0)) alvo0[k] = 0
          Object.assign(alvo0, EXPRESSAO_BASE[expressaoBase] ?? {})
        }
        const alvo = coresEstilizado(b)
        root.traverse((o) => {
          const mesh = o as THREE.Mesh
          if (!mesh.isMesh) return
          const m = mesh.material as THREE.MeshStandardMaterial
          const u = m.userData.regiao as { uBase: { value: THREE.Color }; uAlvo: { value: THREE.Color }; uSat: { value: number } } | undefined
          if (!u) return
          const tipo = m.name.split('__')[0] as keyof typeof alvo
          const hex = alvo[tipo]
          if (hex) u.uAlvo.value.set(hex)
          else u.uAlvo.value.copy(u.uBase.value)
          u.uSat.value = tipo === 'Pele' ? saturacaoPele(alvo.Pele) : 1
        })
      }
    : undefined

  return Object.assign(
    {
      root,
      update,
      dispose() {
        mixer.stopAllAction()
        root.traverse((o) => {
          const m = o as THREE.Mesh
          if (m.isMesh) {
            const mats = Array.isArray(m.material) ? m.material : [m.material]
            mats.forEach((x) => x.dispose())
          }
        })
      },
    },
    { ready, recolorir },
  )
}
