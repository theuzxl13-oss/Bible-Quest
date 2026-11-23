import * as THREE from 'three'

/* Funções numéricas e utilitários de geometria do personagem 3D. */

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
/** Gaussiana 2D, usada para "esculpir" saliências e reentrâncias. */
export const gauss = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) =>
  Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))

/** Gerador pseudoaleatório determinístico (o mesmo personagem sempre sai igual). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ruído de valor 3D suave (para cachos, couro e madeira). */
export function noise3(x: number, y: number, z: number) {
  const h = (i: number, j: number, k: number) => {
    const n = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453
    return n - Math.floor(n)
  }
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf)
  const c = (i: number, j: number, k: number) => h(xi + i, yi + j, zi + k)
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u), x10 = lerp(c(0, 1, 0), c(1, 1, 0), u)
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u), x11 = lerp(c(0, 1, 1), c(1, 1, 1), u)
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w)
}

/** Interpolação linear por tabela [x, y], com x crescente. */
export function table(points: [number, number][], x: number) {
  if (x <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i][0]) {
      const [x0, y0] = points[i - 1]
      const [x1, y1] = points[i]
      return lerp(y0, y1, (x - x0) / (x1 - x0))
    }
  }
  return points[points.length - 1][1]
}

/** Aplica uma deformação a cada vértice e recalcula as normais sem costuras. */
export function deform(geo: THREE.BufferGeometry, fn: (p: THREE.Vector3, i: number) => void) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    fn(v, i)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  smoothSeams(geo)
  return geo
}

/** Média das normais de vértices na mesma posição (costuras de esferas e tornos). */
export function smoothSeams(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const nor = geo.attributes.normal as THREE.BufferAttribute
  if (!nor) return
  const groups = new Map<string, number[]>()
  for (let i = 0; i < pos.count; i++) {
    const k = `${Math.round(pos.getX(i) * 1e5)},${Math.round(pos.getY(i) * 1e5)},${Math.round(pos.getZ(i) * 1e5)}`
    const g = groups.get(k)
    if (g) g.push(i)
    else groups.set(k, [i])
  }
  const n = new THREE.Vector3()
  for (const g of groups.values()) {
    if (g.length < 2) continue
    n.set(0, 0, 0)
    for (const i of g) n.x += nor.getX(i), n.y += nor.getY(i), n.z += nor.getZ(i)
    n.normalize()
    for (const i of g) nor.setXYZ(i, n.x, n.y, n.z)
  }
  nor.needsUpdate = true
}

/** Esfera com a costura nas costas (u = 0,5 fica de frente, em +Z). */
export function backSeamSphere(r: number, ws: number, hs: number) {
  return new THREE.SphereGeometry(r, ws, hs).rotateY(-Math.PI / 2)
}

export function hexShade(hex: string, l: number, s = 0) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, s, l)
  return `#${c.getHexString()}`
}

/*
 * Cache de geometrias determinísticas (cabeça, cabelo, túnica, manto...).
 * São compartilhadas entre personagens e nunca descartadas com eles.
 */
const geoCache = new Map<string, THREE.BufferGeometry>()
export function memoGeo(key: string, build: () => THREE.BufferGeometry) {
  let g = geoCache.get(key)
  if (!g) {
    g = build()
    g.userData.shared = true
    geoCache.set(key, g)
  }
  return g
}
