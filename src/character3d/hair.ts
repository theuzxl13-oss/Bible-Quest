import * as THREE from 'three'
import type { BeardStyle, HairStyle } from '../types'
import { HEAD_H, headShape } from './anatomy'
import { backSeamSphere, deform, gauss, memoGeo, noise3, rng, smoothstep, table } from './math'

/*
 * CABELO E BARBA
 * A base é uma "casca" gerada a partir da forma da cabeça: dentro da linha
 * do cabelo ela ganha espessura (com sulcos que sugerem mechas); fora dela
 * fica escondida dentro da cabeça. Cada estilo acrescenta volume próprio:
 * cortina de fios, trança, coque ou cachos.
 */

const HAIRLINE_SHORT: [number, number][] = [[0, 0.6], [0.5, 0.54], [0.95, 0.3], [1.2, 0.02], [1.33, -0.12], [1.45, 0.2], [1.8, 0.2], [2.15, -0.25], [2.6, -0.5], [Math.PI, -0.58]]
const HAIRLINE_LONG: [number, number][] = [[0, 0.6], [0.5, 0.54], [0.95, 0.26], [1.2, -0.1], [1.5, -0.55], [Math.PI, -0.62]]
const HAIRLINE_BACK: [number, number][] = [[0, 0.62], [0.5, 0.55], [0.95, 0.32], [1.2, 0.05], [1.33, -0.06], [1.45, 0.22], [1.8, 0.22], [2.15, -0.25], [2.6, -0.5], [Math.PI, -0.58]]

interface StyleSpec {
  line: [number, number][]
  thick: number
  ridges: number
  lumpy?: boolean
}

const SPECS: Record<HairStyle, StyleSpec> = {
  raspado: { line: HAIRLINE_SHORT, thick: 0.018, ridges: 0 },
  curto: { line: HAIRLINE_SHORT, thick: 0.1, ridges: 0.12 },
  ondulado: { line: HAIRLINE_LONG, thick: 0.13, ridges: 0.15 },
  longo: { line: HAIRLINE_LONG, thick: 0.11, ridges: 0.12 },
  tranca: { line: HAIRLINE_BACK, thick: 0.065, ridges: 0.3 },
  coque: { line: HAIRLINE_BACK, thick: 0.065, ridges: 0.3 },
  cacheado: { line: HAIRLINE_SHORT, thick: 0.3, ridges: 0, lumpy: true },
}

export function buildHair(style: HairStyle, female: boolean, mat: THREE.Material, opts: { covered: boolean }) {
  const g = new THREE.Group()
  g.name = 'cabelo'
  const spec = SPECS[style]
  const thickMul = opts.covered ? 0.5 : 1
  const geo = memoGeo(`cabelo|${style}|${female}|${opts.covered}`, () => {
  const geo = backSeamSphere(1, 96, 72)
  const u = new THREE.Vector3()
  const base = new THREE.Vector3()
  return deform(geo, (p) => {
    u.copy(p).normalize()
    headShape(u, female, base)
    const a = Math.abs(Math.atan2(u.x, u.z))
    const lineY = table(spec.line, a)
    const m = smoothstep(lineY - 0.03, lineY + 0.16, u.y)
    if (m < 0.01) {
      p.copy(base).multiplyScalar(0.95)
      return
    }
    const lon = Math.atan2(u.x, u.z)
    let t = spec.thick + 0.035 * smoothstep(0.2, 1, u.y) * (style === 'raspado' ? 0 : 1)
    if (style === 'curto' || style === 'raspado') t *= 0.55 + 0.45 * smoothstep(-0.1, 0.75, u.y)
    if (spec.ridges) t *= 1 + spec.ridges * Math.sin(lon * 34 + u.y * 5) * smoothstep(-0.6, 0.6, u.y + 0.3)
    if (spec.lumpy) t *= 0.78 + 0.45 * noise3(u.x * 6 + 3, u.y * 6, u.z * 6)
    // franja levemente caída na frente
    if (style === 'ondulado' || style === 'longo') t += 0.04 * gauss(u.x, u.y, 0.2, 0.66, 0.35, 0.12) * smoothstep(0, 0.6, u.z)
    t *= thickMul
    // perto da linha do cabelo a casca mergulha sob a pele: borda limpa, sem cintilação
    const dip = 0.95 + 0.05 * smoothstep(0, 0.35, m)
    p.copy(base).multiplyScalar(dip).add(base.clone().normalize().multiplyScalar(t * m * HEAD_H))
  })
  })
  const cap = new THREE.Mesh(geo, mat)
  g.add(cap)

  if (!opts.covered && (style === 'longo' || style === 'ondulado')) g.add(hairCurtain(style, mat))
  if (!opts.covered && style === 'tranca') g.add(braid(mat))
  if (style === 'coque') g.add(bun(female, mat, opts.covered))
  if (style === 'cacheado' && !opts.covered) g.add(curls(female, mat))
  return g
}

/** Cortina de cabelo que cai sobre as costas, sem atravessar ombros e costas. */
function hairCurtain(style: HairStyle, mat: THREE.Material) {
  const S = 40, T = 26
  const end = style === 'longo' ? -0.5 : -0.4
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let j = 0; j <= T; j++) {
    const t = j / T
    for (let i = 0; i <= S; i++) {
      const s = (i / S) * 2 - 1
      const yEnd = end - 0.05 * (1 - s * s)
      const y = t * yEnd
      const k = smoothstep(-0.12, -0.21, y)
      const rx = THREE.MathUtils.lerp(0.098, 0.205, k)
      const rz = THREE.MathUtils.lerp(0.118, 0.17, k)
      const span = THREE.MathUtils.lerp(1.72, 1.12, smoothstep(-0.08, -0.2, y))
      const phi = Math.PI + s * span
      let r = 1 + 0.035 * Math.sin(s * 24) * t
      if (style === 'ondulado') r += 0.06 * Math.sin(y * 48 + s * 2) * smoothstep(0, -0.15, y)
      const x = Math.sin(phi) * rx * r
      const z = Math.cos(phi) * rz * r - 0.005
      pos.push(x, y, z)
      uv.push((i / S) * 3, 1 - t)
    }
  }
  for (let j = 0; j < T; j++) {
    for (let i = 0; i < S; i++) {
      const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  const m = new THREE.Mesh(memoGeo(`cortina|${style}`, () => geo), mat)
  m.name = 'cabelo-longo'
  return m
}

function braid(mat: THREE.Material) {
  const g = new THREE.Group()
  for (let i = 0; i < 11; i++) {
    const r = 0.024 - i * 0.0008
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat)
    seg.scale.set(1.1, 1.5, 0.85)
    const y = -0.1 - i * 0.034
    const z = i < 2 ? -0.105 - i * 0.02 : -0.155 - Math.min(i, 5) * 0.004
    seg.position.set((i % 2 ? 0.006 : -0.006), y, z)
    seg.rotation.z = i % 2 ? 0.55 : -0.55
    g.add(seg)
  }
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 16), mat)
  tie.rotation.x = Math.PI / 2
  tie.position.set(0, -0.48, -0.175)
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.06, 14), mat)
  tuft.rotation.x = Math.PI
  tuft.position.set(0, -0.515, -0.177)
  g.add(tie, tuft)
  g.name = 'tranca'
  return g
}

function bun(female: boolean, mat: THREE.Material, covered: boolean) {
  const g = new THREE.Group()
  const p = headShape(new THREE.Vector3(0, 0.42, -0.9).normalize(), female)
  const b = new THREE.Mesh(new THREE.SphereGeometry(covered ? 0.04 : 0.046, 24, 18), mat)
  b.position.copy(p).add(new THREE.Vector3(0, 0.012, -0.03))
  b.scale.set(1, 0.9, 0.85)
  const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 24), mat)
  wrap.position.copy(b.position).add(new THREE.Vector3(0, -0.006, 0.012))
  wrap.rotation.x = 0.4
  g.add(b, wrap)
  g.name = 'coque'
  return g
}

function curls(female: boolean, mat: THREE.Material) {
  const r = rng(21)
  const n = 260
  const geo = new THREE.SphereGeometry(0.013, 10, 8)
  const inst = new THREE.InstancedMesh(geo, mat, n)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const u = new THREE.Vector3()
  let k = 0
  while (k < n) {
    u.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1)
    if (u.lengthSq() > 1 || u.lengthSq() < 0.01) continue
    u.normalize()
    const a = Math.abs(Math.atan2(u.x, u.z))
    if (u.y < table(HAIRLINE_SHORT, a) + 0.12) continue
    const base = headShape(u, female)
    const t = 0.3 * (0.78 + 0.45 * noise3(u.x * 6 + 3, u.y * 6, u.z * 6)) + 0.035 * smoothstep(0.2, 1, u.y)
    const p = base.clone().add(base.clone().normalize().multiplyScalar(t * HEAD_H * 0.97))
    q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3))
    const s = 0.8 + r() * 0.6
    m4.compose(p, q, new THREE.Vector3(s, s * 0.8, s))
    inst.setMatrixAt(k++, m4)
  }
  inst.name = 'cachos'
  return inst
}

export function buildBeard(style: BeardStyle, female: boolean, mat: THREE.Material) {
  if (style === 'nenhuma') return null
  const full = style === 'cheia'
  const geo = memoGeo(`barba|${style}|${female}`, () => {
  const geo = backSeamSphere(1, 96, 72)
  const u = new THREE.Vector3()
  const base = new THREE.Vector3()
  return deform(geo, (p) => {
    u.copy(p).normalize()
    headShape(u, female, base)
    const a = Math.abs(Math.atan2(u.x, u.z))
    const yTop = a > 1.05 ? (full ? 0.02 : -0.08) : full ? -0.2 : -0.26
    let m = smoothstep(yTop + 0.05, yTop - 0.1, u.y) * smoothstep(1.55, 1.3, a) * smoothstep(-0.3, 0.05, u.z)
    const lips = gauss(u.x, u.y, 0, -0.43, full ? 0.15 : 0.19, full ? 0.035 : 0.07)
    m *= 1 - Math.min(1, lips * 1.6)
    let t = full ? 0.12 : 0.022
    if (full) {
      const stache = gauss(u.x, u.y, 0, -0.33, 0.2, 0.05)
      m = Math.max(m, stache * 0.95 * (1 - Math.min(1, lips * 2)))
      t += 0.06 * smoothstep(-0.55, -0.95, u.y)
      t *= 0.85 + 0.3 * noise3(u.x * 9, u.y * 9, u.z * 9)
    }
    if (m < 0.02) {
      p.copy(base).multiplyScalar(0.965)
      return
    }
    p.copy(base).add(base.clone().normalize().multiplyScalar(t * m * HEAD_H))
    if (full) p.y -= 0.025 * m * smoothstep(-0.6, -1, u.y)
  })
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.name = 'barba'
  return mesh
}
