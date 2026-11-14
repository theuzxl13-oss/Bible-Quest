import * as THREE from 'three'
import type { BeardStyle, HairStyle } from '../types'
import { HEAD_H, headShape } from './anatomy'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
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

/** Espessura da casca (em unidades de HEAD_H) e máscara da linha do cabelo numa direção da cabeça. */
function shellAt(u: THREE.Vector3, style: HairStyle, thickMul: number) {
  const spec = SPECS[style]
  const a = Math.abs(Math.atan2(u.x, u.z))
  // linha do cabelo levemente irregular, como na natureza
  const lineY = table(spec.line, a) + 0.05 * (noise3(u.x * 9 + 1, u.y * 9, u.z * 9) - 0.5)
  const m = smoothstep(lineY - 0.03, lineY + 0.16, u.y)
  const lon = Math.atan2(u.x, u.z)
  let t = spec.thick + 0.035 * smoothstep(0.2, 1, u.y) * (style === 'raspado' ? 0 : 1)
  if (style === 'curto' || style === 'raspado') t *= 0.55 + 0.45 * smoothstep(-0.1, 0.75, u.y)
  if (spec.ridges) t *= 1 + spec.ridges * Math.sin(lon * 34 + u.y * 5) * smoothstep(-0.6, 0.6, u.y + 0.3)
  if (spec.lumpy) t *= 0.78 + 0.45 * noise3(u.x * 6 + 3, u.y * 6, u.z * 6)
  if (style === 'ondulado' || style === 'longo') t += 0.04 * gauss(u.x, u.y, 0.2, 0.66, 0.35, 0.12) * smoothstep(0, 0.6, u.z)
  return { m, t: t * thickMul }
}

export function buildHair(style: HairStyle, female: boolean, mat: THREE.Material, opts: { covered: boolean; lockMat?: THREE.Material; mantle?: boolean }) {
  const g = new THREE.Group()
  g.name = 'cabelo'
  const thickMul = opts.covered ? 0.5 : 1
  const geo = memoGeo(`cabelo|${style}|${female}|${opts.covered}`, () => {
    const geo = backSeamSphere(1, 96, 72)
    const u = new THREE.Vector3()
    const base = new THREE.Vector3()
    return deform(geo, (p) => {
      u.copy(p).normalize()
      headShape(u, female, base)
      const { m, t } = shellAt(u, style, thickMul)
      if (m < 0.01) {
        p.copy(base).multiplyScalar(0.95)
        return
      }
      // perto da linha do cabelo a casca mergulha sob a pele: borda limpa, sem cintilação
      const dip = 0.95 + 0.05 * smoothstep(0, 0.35, m)
      p.copy(base).multiplyScalar(dip).add(base.clone().normalize().multiplyScalar(t * m * HEAD_H))
    })
  })
  g.add(new THREE.Mesh(geo, mat))
  if (!opts.covered && style !== 'raspado' && style !== 'cacheado') {
    g.add(new THREE.Mesh(memoGeo(`mechas|${style}|${female}`, () => capLocks(style, female)), opts.lockMat ?? mat))
  }
  if (!opts.covered && (style === 'longo' || style === 'ondulado')) {
    // com manto, o cabelo longo fica por dentro dele (só aparece até os ombros)
    const len = opts.mantle ? 0.42 : 1
    g.add(hairCurtain(style, mat, len))
    g.add(new THREE.Mesh(memoGeo(`mechas-cortina|${style}|${len}`, () => curtainLocks(style, len)), opts.lockMat ?? mat))
  }
  if (!opts.covered && style === 'tranca') g.add(braid(mat))
  if (style === 'coque') g.add(bun(female, mat, opts.covered))
  if (style === 'cacheado' && !opts.covered) g.add(curls(female, mat))
  return g
}

/** Tubo afinando até a ponta (uma mecha). */
function lockTube(points: THREE.Vector3[], r0: number, r1: number, segs = 14) {
  const curve = new THREE.CatmullRomCurve3(points)
  const radial = 5
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, false)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    const ring = Math.floor(i / (radial + 1))
    const c = curve.getPointAt(Math.min(1, ring / segs))
    const k = ring / segs
    const r = r0 + (r1 - r0) * k
    v.fromBufferAttribute(pos, i).sub(c).multiplyScalar(r).add(c)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

/** Mechas sobre a casca: saem do redemoinho (ou da risca) e descem até a linha do cabelo. */
function capLocks(style: HairStyle, female: boolean) {
  const r = rng(style.length * 97 + (female ? 7 : 3))
  const geos: THREE.BufferGeometry[] = []
  const back = style === 'tranca' || style === 'coque'
  const long = style === 'longo' || style === 'ondulado'
  const n = long ? 220 : back ? 170 : 210
  const crown = new THREE.Vector3(0, 0.82, -0.55).normalize()
  const knot = new THREE.Vector3(0, 0.35, -0.94).normalize()
  const dir = new THREE.Vector3()
  const pos = new THREE.Vector3()
  let made = 0
  let guard = 0
  while (made < n && guard++ < n * 30) {
    // ponto final perto da linha do cabelo (franja, têmporas, nuca)
    const e = new THREE.Vector3(r() * 2 - 1, r() * 1.6 - 0.6, r() * 2 - 1)
    if (e.lengthSq() < 0.05) continue
    e.normalize()
    const sh = shellAt(e, style, 1)
    if (sh.m < 0.25 || sh.m > 0.97) continue
    let start: THREE.Vector3
    if (back) start = e.clone()
    else if (long) start = new THREE.Vector3(Math.sign(e.x || 1) * 0.07, 0.99, 0.12).normalize()
    else start = crown.clone().add(new THREE.Vector3((r() - 0.5) * 0.15, 0, (r() - 0.5) * 0.15)).normalize()
    const end = back ? knot.clone() : e
    const pts: THREE.Vector3[] = []
    const steps = 10
    const over = back ? 1 : 1.02 + r() * 0.04
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * over
      dir.copy(start).lerp(end, s).normalize()
      const base = headShape(dir, female)
      const here = shellAt(dir, style, 1)
      const arch = 0.35 * Math.sin(Math.PI * Math.min(1, s)) * here.t
      const off = Math.max(0.12 * HEAD_H, (here.t * here.m * 0.92 + arch) * HEAD_H)
      pos.copy(base).add(base.clone().normalize().multiplyScalar(off))
      pts.push(pos.clone())
    }
    const w = (long ? 0.0036 : 0.0032) * (0.7 + r() * 0.5)
    geos.push(lockTube(pts, w, w * 0.25))
    made++
  }
  return mergeGeometries(geos)!
}

function curtainPoint(style: HairStyle, s: number, t: number, out = new THREE.Vector3()) {
  const end = style === 'longo' ? -0.5 : -0.4
  const yEnd = end - 0.05 * (1 - s * s)
  const y = t * yEnd
  const k = smoothstep(-0.12, -0.21, y)
  const rx = THREE.MathUtils.lerp(0.098, 0.205, k)
  const rz = THREE.MathUtils.lerp(0.118, 0.17, k)
  const span = THREE.MathUtils.lerp(1.72, 1.12, smoothstep(-0.08, -0.2, y))
  const phi = Math.PI + s * span
  let r = 1 + 0.035 * Math.sin(s * 24) * t
  if (style === 'ondulado') r += 0.06 * Math.sin(y * 48 + s * 2) * smoothstep(0, -0.15, y)
  return out.set(Math.sin(phi) * rx * r, y, Math.cos(phi) * rz * r - 0.005)
}

/** Cortina de cabelo que cai sobre as costas, sem atravessar ombros e costas. */
function hairCurtain(style: HairStyle, mat: THREE.Material, len: number) {
  const geo = memoGeo(`cortina|${style}|${len}`, () => {
    const S = 40, T = 26
    const pos: number[] = []
    const uv: number[] = []
    const idx: number[] = []
    const p = new THREE.Vector3()
    for (let j = 0; j <= T; j++) {
      for (let i = 0; i <= S; i++) {
        curtainPoint(style, (i / S) * 2 - 1, (j / T) * len, p)
        pos.push(p.x, p.y, p.z)
        uv.push((i / S) * 3, 1 - j / T)
      }
    }
    for (let j = 0; j < T; j++) {
      for (let i = 0; i < S; i++) {
        const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1
        idx.push(a, c, b, b, c, d)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  })
  const m = new THREE.Mesh(geo, mat)
  m.name = 'cabelo-longo'
  return m
}

/** Mechas soltas por fora da cortina, com pontas desfiadas. */
function curtainLocks(style: HairStyle, len: number) {
  const r = rng(77)
  const geos: THREE.BufferGeometry[] = []
  const p = new THREE.Vector3()
  for (let k = 0; k < 150; k++) {
    const s = r() * 2 - 1.0
    const t0 = r() * 0.15
    const t1 = (0.75 + r() * 0.3) * len
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 10; i++) {
      const t = t0 + ((t1 - t0) * i) / 10
      curtainPoint(style, s + Math.sin(t * 6 + k) * 0.02, t, p)
      const out = new THREE.Vector3(p.x, 0, p.z + 0.005).normalize().multiplyScalar(0.004 + 0.003 * Math.sin(t * 9 + k))
      pts.push(p.clone().add(out))
    }
    const w = 0.0034 * (0.7 + r() * 0.6)
    geos.push(lockTube(pts, w, w * 0.2, 12))
  }
  return mergeGeometries(geos)!
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
  const n = 620
  // cachos como pequenas espirais (anéis torcidos), não esferas
  const geo = new THREE.TorusGeometry(0.0062, 0.0031, 6, 14)
  geo.scale(1, 1, 1.4)
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
    const p = base.clone().add(base.clone().normalize().multiplyScalar(t * HEAD_H * (0.9 + r() * 0.12)))
    q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3))
    const s = 0.75 + r() * 0.6
    m4.compose(p, q, new THREE.Vector3(s, s, s))
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
    // borda superior suave e irregular (sem linha reta no rosto)
    const yTop = (a > 1.05 ? (full ? 0.02 : -0.08) : full ? -0.2 - 0.06 * Math.cos(a * 2.2) : -0.26) + 0.05 * (noise3(u.x * 11, u.y * 11, u.z * 11) - 0.5)
    let m = smoothstep(yTop + 0.08, yTop - 0.14, u.y) * smoothstep(1.55, 1.3, a) * smoothstep(-0.3, 0.05, u.z)
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
  if (!full) return mesh
  const g = new THREE.Group()
  g.add(mesh, new THREE.Mesh(memoGeo(`barba-mechas|${female}`, () => beardLocks(female)), mat))
  return g
}

/** Mechas da barba cheia: descem acompanhando o rosto e terminam no queixo. */
function beardLocks(female: boolean) {
  const r = rng(55)
  const geos: THREE.BufferGeometry[] = []
  const u = new THREE.Vector3()
  let k = 0
  let guard = 0
  while (k < 150 && guard++ < 6000) {
    u.set(r() * 1.7 - 0.85, -0.25 - r() * 0.7, 1).normalize()
    if (Math.abs(u.x) < 0.16 && u.y > -0.5 && u.y < -0.36) continue
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 6; i++) {
      const d = u.clone().add(new THREE.Vector3(-u.x * 0.06 * i, -0.06 * i, 0)).normalize()
      const base = headShape(d, female)
      const t = (0.13 + 0.05 * smoothstep(-0.55, -0.95, d.y)) * HEAD_H
      const pt = base.clone().add(base.clone().normalize().multiplyScalar(t))
      pt.y -= 0.004 * i * smoothstep(-0.6, -1, d.y)
      pts.push(pt)
    }
    geos.push(lockTube(pts, 0.0032, 0.0008, 10))
    k++
  }
  return mergeGeometries(geos)!
}
