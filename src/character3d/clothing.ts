import * as THREE from 'three'
import type { BeltItem, FootwearItem, MantleItem } from '../data/character/items'
import { deform, gauss, lerp, memoGeo, rng, smoothstep, table } from './math'

/*
 * VESTIMENTAS
 * Túnica e manto são superfícies de revolução/paramétricas com dobras
 * (deslocamentos senoidais que crescem em direção à barra), cintura
 * franzida e caimento. Coordenadas no espaço do corpo, com os pés em y = 0.
 */

export const TUNIC_X = 1.18
export const TUNIC_Z = 0.8

const PROFILE_M: [number, number][] = [[0.22, 0.235], [0.35, 0.222], [0.55, 0.2], [0.8, 0.175], [0.95, 0.158], [1.05, 0.142], [1.12, 0.15], [1.25, 0.165], [1.36, 0.166], [1.405, 0.15], [1.44, 0.12], [1.47, 0.09], [1.49, 0.07]]
const PROFILE_F: [number, number][] = [[0.22, 0.24], [0.35, 0.228], [0.55, 0.208], [0.8, 0.186], [0.95, 0.172], [1.05, 0.13], [1.12, 0.138], [1.25, 0.158], [1.36, 0.156], [1.405, 0.14], [1.44, 0.11], [1.465, 0.082], [1.485, 0.064]]

/** Raio da túnica (antes da escala elíptica) na altura y. */
export function tunicRadius(y: number, female: boolean) {
  return table(female ? PROFILE_F : PROFILE_M, y)
}

export function buildTunic(female: boolean, short: boolean, mat: THREE.Material) {
  const m = new THREE.Mesh(memoGeo(`tunica|${female}|${short}`, () => tunicGeometry(female, short)), mat)
  m.name = 'tunica'
  return m
}

function tunicGeometry(female: boolean, short: boolean) {
  const prof = (female ? PROFILE_F : PROFILE_M).filter(([y]) => !short || y >= 0.5)
  if (short) prof.unshift([0.48, tunicRadius(0.55, female) + 0.012])
  const hem = prof[0][0]
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 60; i++) {
    const y = lerp(hem, female ? 1.485 : 1.49, i / 60)
    pts.push(new THREE.Vector2(tunicRadius(y, female), y))
  }
  const geo = new THREE.LatheGeometry(pts, 96, Math.PI)
  deform(geo, (p) => {
    const phi = Math.atan2(p.x, p.z)
    const r0 = Math.hypot(p.x, p.z)
    let r = r0
    const below = smoothstep(1.02, hem, p.y)
    r += 0.013 * below * Math.sin(phi * 9 + 0.7) + 0.006 * below * Math.sin(phi * 17 + 2.1)
    r += 0.004 * gauss(p.y, 0, 1.09, 0, 0.035, 1) * Math.sin(phi * 18)
    // barra levemente irregular
    const yy = p.y + (p.y < hem + 0.01 ? 0.012 * Math.sin(phi * 5) : 0)
    let z = Math.cos(phi) * r * TUNIC_Z
    if (female && z > 0) z += 0.028 * gauss(p.y, Math.abs(Math.sin(phi)), 1.24, 0.38, 0.07, 0.3)
    p.set(Math.sin(phi) * r * TUNIC_X, yy, z)
  })
  // sombra nas reentrâncias das dobras e sob o cinto (oclusão ambiente simples)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const col: number[] = []
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const phi = Math.atan2(x / TUNIC_X, z / TUNIC_Z)
    const below = smoothstep(1.02, hem, y)
    const fold = 0.013 * below * Math.sin(phi * 9 + 0.7) + 0.006 * below * Math.sin(phi * 17 + 2.1)
    let c = 1 - 0.32 * Math.max(0, Math.min(1, -fold / 0.016))
    c -= 0.18 * gauss(y, 0, 1.0, 0, 0.03, 1)
    c -= 0.1 * smoothstep(hem + 0.06, hem, y)
    col.push(c, c, c)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return geo
}

/** Gola enrolada no decote da túnica. */
export function buildCollar(female: boolean, mat: THREE.Material) {
  const top = female ? 1.485 : 1.49
  const r = tunicRadius(top, female)
  const geo = new THREE.TorusGeometry(1, 0.1, 10, 48)
  geo.rotateX(Math.PI / 2)
  geo.scale(r * TUNIC_X, 0.05, r * TUNIC_Z)
  geo.translate(0, top - 0.004, 0)
  const m = new THREE.Mesh(geo, mat)
  m.name = 'gola'
  return m
}

/** Garante atributo de cor (branco) para materiais com cores por vértice. */
function ensureColor(o: THREE.Object3D) {
  o.traverse((c) => {
    const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined
    if (g && !g.getAttribute('color')) {
      const n = g.attributes.position.count
      g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(n * 3).fill(1), 3))
    }
  })
}

/** Manga: parte superior (no braço) e boca larga (no antebraço). */
export function buildSleeves(mat: THREE.Material) {
  const upperPts = [[0.056, -0.31], [0.053, -0.2], [0.05, -0.06], [0.047, 0.0], [0.02, 0.03]].map(([r, y]) => new THREE.Vector2(r, y))
  const upper = new THREE.LatheGeometry(upperPts, 32, Math.PI)
  deform(upper, (p) => {
    const phi = Math.atan2(p.x, p.z)
    const k = 1 + 0.06 * Math.sin(phi * 6 + p.y * 20) * smoothstep(0, -0.3, p.y)
    p.x *= k
    p.z *= k
  })
  const lowerPts = [[0.074, -0.12], [0.068, -0.08], [0.06, -0.02], [0.056, 0.04]].map(([r, y]) => new THREE.Vector2(r, y))
  const lower = new THREE.LatheGeometry(lowerPts, 32, Math.PI)
  deform(lower, (p) => {
    const phi = Math.atan2(p.x, p.z)
    const k = 1 + 0.05 * Math.sin(phi * 7) * smoothstep(0, -0.13, p.y)
    p.x *= k
    p.z *= k
  })
  return { upper: () => new THREE.Mesh(upper, mat), lower: () => new THREE.Mesh(lower, mat) }
}

export function buildMantle(item: MantleItem, female: boolean, outer: THREE.Material, inner: THREE.Material) {
  const g = new THREE.Group()
  g.name = 'manto'
  const hem = item.style === 'xale' ? 0.98 : item.style === 'longo' ? 0.16 : item.style === 'capuz' ? 0.42 : 0.36
  const top = female ? 1.47 : 1.478
  const S = 72, T = 56
  const pos: number[] = []
  const uv: number[] = []
  const col: number[] = []
  const idx: number[] = []
  const r = rng(31)
  const phase = r() * 6
  for (let j = 0; j <= T; j++) {
    const t = j / T
    const y = lerp(top, hem, t)
    const k = smoothstep(top, 1.385, y)
    const down = smoothstep(1.39, hem, y)
    const rx = lerp(0.1, female ? 0.235 : 0.25, k) + 0.09 * down
    const rz = lerp(0.088, 0.19, k) + 0.07 * down
    const span = item.style === 'xale' ? lerp(2.45, 2.1, smoothstep(1.4, hem, y)) : lerp(2.05, 1.86, smoothstep(1.43, 1.12, y))
    for (let i = 0; i <= S; i++) {
      const s = (i / S) * 2 - 1
      const phi = Math.PI + s * span
      let rr = 1 + (0.06 * Math.sin(phi * 8 + phase) + 0.025 * Math.sin(phi * 15 + phase * 2)) * smoothstep(1.32, hem, y)
      rr += 0.03 * smoothstep(0.85, 1, Math.abs(s)) * down
      const yy = y - (j === T ? 0.01 * Math.sin(phi * 6) : 0)
      pos.push(Math.sin(phi) * rx * rr, yy, Math.cos(phi) * rz * rr - 0.01)
      uv.push(i / S, 1 - t)
      const fold = (0.06 * Math.sin(phi * 8 + phase) + 0.025 * Math.sin(phi * 15 + phase * 2)) * smoothstep(1.32, hem, y)
      const c = 1 - 0.38 * Math.max(0, Math.min(1, -fold / 0.06))
      col.push(c, c, c)
    }
  }
  for (let j = 0; j < T; j++) {
    for (let i = 0; i < S; i++) {
      const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1
      idx.push(a, b, c, b, d, c)
    }
  }
  const geo = memoGeo(`manto|${item.style}|${female}`, () => {
    const g2 = new THREE.BufferGeometry()
    g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g2.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    g2.setIndex(idx)
    g2.computeVertexNormals()
    return g2
  })
  const out = new THREE.Mesh(geo, outer)
  const inn = new THREE.Mesh(geo, inner)
  g.add(out, inn)

  if (item.style === 'capuz') {
    // capuz abaixado, formando uma gola nas costas
    const cowl = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.045, 14, 40, 3.7), outer)
    deform(cowl.geometry, (p) => {
      const a = Math.atan2(p.y, p.x)
      p.multiplyScalar(1 + 0.08 * Math.sin(a * 9))
    })
    cowl.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 1.85 - Math.PI)
    cowl.scale.set(1.15, 1, 0.95)
    cowl.position.set(0, 1.45, -0.03)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 24, 1, true), outer)
    tip.scale.set(1, 1, 0.35)
    tip.rotation.x = Math.PI
    tip.position.set(0, 1.31, -0.19)
    g.add(cowl, tip)
  }
  if (item.style === 'xale') {
    // franja na barra
    const geoF = new THREE.CylinderGeometry(0.0015, 0.0015, 0.035, 4)
    const n = 60
    const fr = new THREE.InstancedMesh(geoF, outer, n)
    const m4 = new THREE.Matrix4()
    const rx = 0.25 + 0.09, rz = 0.19 + 0.07
    for (let i = 0; i < n; i++) {
      const s = (i / (n - 1)) * 2 - 1
      const phi = Math.PI + s * 2.1
      m4.makeTranslation(Math.sin(phi) * rx * 1.02, hem - 0.018, Math.cos(phi) * rz * 1.02 - 0.01)
      fr.setMatrixAt(i, m4)
    }
    g.add(fr)
  }
  ensureColor(g)
  return g
}

/** Cinto na cintura da túnica. */
export function buildBelt(item: BeltItem, female: boolean, mat: THREE.Material, metal: THREE.Material) {
  const g = new THREE.Group()
  g.name = 'cinto'
  const y = 1.05
  const r = tunicRadius(y, female)
  const rx = r * TUNIC_X + 0.006
  const rz = r * TUNIC_Z + 0.006
  if (item.style === 'corda') {
    for (const off of [0, Math.PI]) {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2
        const tw = a * 14 + off
        pts.push(new THREE.Vector3(Math.sin(a) * (rx + 0.003 * Math.cos(tw)), y + 0.004 * Math.sin(tw), Math.cos(a) * (rz + 0.003 * Math.cos(tw))))
      }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, 0.0045, 6, true), mat))
    }
    for (const dx of [0.03, 0.05]) {
      const end = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.16, 4, 8), mat)
      end.position.set(dx, y - 0.09, rz + 0.008)
      end.rotation.z = (dx - 0.04) * 3
      g.add(end)
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.035, 10), mat)
      tassel.position.set(dx + (dx - 0.04) * 0.5, y - 0.18, rz + 0.01)
      g.add(tassel)
    }
    return g
  }
  const h = item.style === 'faixa' ? 0.075 : 0.034
  const band = new THREE.CylinderGeometry(1, 1, h, 64, 6, true)
  deform(band, (p) => {
    const a = Math.atan2(p.x, p.z)
    const wr = item.style === 'faixa' ? 1 + 0.03 * Math.sin(p.y * 160 + a * 2) : 1
    p.set(p.x * rx * wr, p.y + y, p.z * rz * wr)
  })
  g.add(new THREE.Mesh(band, mat))
  if (item.style === 'faixa') {
    for (const [dx, len, rot] of [[0.06, 0.24, 0.12], [0.085, 0.2, 0.22]] as const) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.045, len, 0.006, 2, 8, 1), mat)
      deform(tail.geometry, (p) => { p.z += 0.006 * Math.sin(p.y * 40) })
      tail.position.set(dx, y - len / 2 - 0.02, rz + 0.012)
      tail.rotation.z = rot
      g.add(tail)
    }
  } else {
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), mat)
    knot.position.set(0.045, y, rz + 0.008)
    g.add(knot)
    for (const [dx, rot] of [[0.04, 0.15], [0.055, -0.1]] as const) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.13, 0.004), mat)
      tail.position.set(dx, y - 0.07, rz + 0.01)
      tail.rotation.z = rot
      g.add(tail)
    }
    if (item.buckle) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.028, 0.008), metal)
      b.position.set(0, y, rz + 0.008)
      g.add(b)
    }
  }
  return g
}

/** Calçado sobre o pé (espaço do tornozelo). */
export function buildFootwear(item: FootwearItem, mat: THREE.Material, female: boolean) {
  const k = female ? 0.92 : 1
  const g = new THREE.Group()
  const shape = new THREE.Shape()
  const outline: [number, number][] = [[0, -0.06], [0.034, -0.05], [0.04, 0.02], [0.05, 0.12], [0.046, 0.175], [0.02, 0.2], [-0.012, 0.198], [-0.038, 0.17], [-0.042, 0.11], [-0.034, 0.02], [-0.032, -0.05]]
  outline.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x * k, z * k) : shape.lineTo(x * k, z * k)))
  shape.closePath()
  const sole = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 6 })
  sole.rotateX(Math.PI / 2)
  sole.translate(0, -0.066, 0)
  g.add(new THREE.Mesh(sole, mat))
  const strap = (pts: THREE.Vector3[], r = 0.0038, closed = false) => g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), 40, r, 6, closed), mat))
  const arc = (z: number, w: number, top: number) => strap([new THREE.Vector3(-w, -0.066, z), new THREE.Vector3(-w * 0.8, top - 0.012, z), new THREE.Vector3(0, top, z), new THREE.Vector3(w * 0.8, top - 0.012, z), new THREE.Vector3(w, -0.066, z)].map((v) => v.multiplyScalar(1)))
  if (item.style === 'botas') {
    const shaft = new THREE.LatheGeometry([[0.048, -0.07], [0.05, -0.02], [0.044, 0.05], [0.05, 0.14], [0.054, 0.17]].map(([r, y]) => new THREE.Vector2(r * k, y)), 28, Math.PI)
    deform(shaft, (p) => {
      const b = 1 + 0.05 * Math.sin(p.y * 160)
      p.x *= b
      p.z = p.z * b * 0.95 + 0.004
    })
    g.add(new THREE.Mesh(shaft, mat))
    const vamp = new THREE.SphereGeometry(1, 28, 16)
    deform(vamp, (p) => p.set(p.x * 0.05 * k, p.y * 0.04 - 0.045, p.z * 0.12 * k + 0.065))
    g.add(new THREE.Mesh(vamp, mat))
    return g
  }
  arc(0.13 * k, 0.046 * k, -0.026)
  arc(0.06 * k, 0.042 * k, -0.018)
  strap(Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2
    return new THREE.Vector3(Math.sin(a) * 0.04 * k, -0.012 + 0.004 * Math.cos(a), Math.cos(a) * 0.038 * k + 0.004)
  }), 0.004, true)
  strap([new THREE.Vector3(0, -0.066, -0.055 * k), new THREE.Vector3(0, -0.04, -0.045 * k), new THREE.Vector3(0, -0.014, -0.036 * k)])
  if (item.style === 'tiras') {
    strap(Array.from({ length: 60 }, (_, i) => {
      const a = (i / 59) * Math.PI * 5
      const y = -0.01 + (i / 59) * 0.12
      const rr = 0.041 + (i / 59) * 0.008
      return new THREE.Vector3(Math.sin(a) * rr * k, y, Math.cos(a) * rr * k)
    }), 0.0035)
  }
  return g
}
