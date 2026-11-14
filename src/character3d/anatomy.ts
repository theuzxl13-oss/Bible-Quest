import * as THREE from 'three'
import { backSeamSphere, deform, gauss, memoGeo, smoothstep } from './math'

/*
 * ANATOMIA DO PERSONAGEM
 * A cabeça é uma esfera esculpida por funções (saliências gaussianas para
 * nariz, maçãs do rosto, lábios, queixo e órbitas), o que dá um rosto liso e
 * contínuo, com proporções humanas. Cabelo e barba reutilizam a mesma forma.
 * Unidades: metros. O personagem olha para +Z.
 */

/** Meia altura da cabeça (do centro ao queixo), em metros. */
export const HEAD_H = 0.118

/** Forma da cabeça a partir de uma direção da esfera unitária. */
export function headShape(u: THREE.Vector3, female: boolean, out = new THREE.Vector3()) {
  const { x, y, z } = u
  let X = x * 0.73
  const Y = y
  let Z = z * 0.86
  const jaw = smoothstep(0.1, -0.95, y)
  X *= 1 - (female ? 0.3 : 0.22) * jaw
  if (z > 0) Z += 0.05 * jaw * smoothstep(0.3, 1, z)
  // bochechas e mandíbula mais cheias
  X *= 1 + 0.05 * gauss(x, y, 0, -0.35, 2, 0.35)
  if (z < 0) Z *= 1 - 0.38 * smoothstep(-0.15, -0.95, y)
  if (z < 0 && y > -0.1) Z *= 1.06
  const f = smoothstep(0.35, 0.8, z)
  if (f > 0) {
    let d = 0
    d -= 0.07 * (gauss(x, y, 0.3, 0.12, 0.14, 0.085) + gauss(x, y, -0.3, 0.12, 0.14, 0.085))
    d += (female ? 0.022 : 0.045) * (gauss(x, y, 0.3, 0.27, 0.2, 0.06) + gauss(x, y, -0.3, 0.27, 0.2, 0.06))
    d += (female ? 0.085 : 0.1) * gauss(x, y, 0, 0.02, 0.06, 0.2)
    d += (female ? 0.13 : 0.155) * gauss(x, y, 0, -0.17, 0.085, 0.075)
    d += 0.05 * (gauss(x, y, 0.085, -0.2, 0.05, 0.05) + gauss(x, y, -0.085, -0.2, 0.05, 0.05))
    d += 0.035 * (gauss(x, y, 0.42, -0.06, 0.14, 0.1) + gauss(x, y, -0.42, -0.06, 0.14, 0.1))
    d += 0.045 * gauss(x, y, 0, -0.38, 0.15, 0.04)
    d += (female ? 0.058 : 0.05) * gauss(x, y, 0, -0.46, 0.13, 0.04)
    d -= 0.022 * gauss(x, y, 0, -0.415, 0.15, 0.014)
    d -= 0.02 * gauss(x, y, 0, -0.56, 0.12, 0.04)
    d += (female ? 0.03 : 0.045) * gauss(x, y, 0, -0.8, 0.22, 0.12)
    Z += d * f
  }
  return out.set(X, Y, Z).multiplyScalar(HEAD_H)
}

/** Ponto da superfície da cabeça para coordenadas (x, y) da frente da esfera unitária. */
export function facePoint(x: number, y: number, female: boolean) {
  const z = Math.sqrt(Math.max(0, 1 - x * x - y * y))
  return headShape(new THREE.Vector3(x, y, z), female)
}

export function buildHeadMesh(female: boolean, skin: THREE.Material) {
  const geo = memoGeo(`cabeca|${female}`, () => {
    const g = backSeamSphere(1, 96, 72)
    const u = new THREE.Vector3()
    return deform(g, (p) => {
      u.copy(p).normalize()
      headShape(u, female, p)
    })
  })
  const m = new THREE.Mesh(geo, skin)
  m.name = 'cabeca'
  return m
}

export interface FaceParts {
  group: THREE.Group
  lids: THREE.Object3D[]
  brows: THREE.Object3D[]
  mouths: { neutral: THREE.Object3D; smile: THREE.Object3D; open: THREE.Object3D }
}

export function buildFace(female: boolean, mats: { skin: THREE.Material; eye: THREE.Material; brow: THREE.Material; lash: THREE.Material; mouth: THREE.Material; teeth: THREE.Material; lip: THREE.Material; crease: THREE.Material }, browWeight: number): FaceParts {
  const group = new THREE.Group()
  const lids: THREE.Object3D[] = []
  const brows: THREE.Object3D[] = []
  const eyeR = 0.0134
  for (const s of [-1, 1]) {
    const p = facePoint(0.3 * s, 0.12, female)
    const eyeGroup = new THREE.Group()
    eyeGroup.position.set(p.x, p.y, p.z - 0.0045)
    const ball = new THREE.Mesh(backSeamSphere(eyeR, 32, 20), mats.eye)
    eyeGroup.add(ball)
    // pálpebra superior (gira para piscar) com linha dos cílios
    const lidPivot = new THREE.Group()
    const lid = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 1.07, 32, 12, 0, Math.PI * 2, 0, 1.2), mats.skin)
    lidPivot.add(lid)
    const lashR = eyeR * 1.075 * Math.sin(1.2)
    const lash = new THREE.Mesh(new THREE.TorusGeometry(lashR, female ? 0.0011 : 0.0008, 5, 28, Math.PI), mats.lash)
    lash.rotation.x = Math.PI / 2
    lash.position.y = eyeR * 1.075 * Math.cos(1.2)
    lidPivot.add(lash)
    lidPivot.rotation.x = 0.15
    lidPivot.userData.open = 0.15
    eyeGroup.add(lidPivot)
    lids.push(lidPivot)
    const lower = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 1.05, 24, 8, 0, Math.PI * 2, Math.PI - 0.95, 0.95), mats.skin)
    lower.rotation.x = -0.3
    eyeGroup.add(lower)
    // vinco da pálpebra superior
    const creaseR = eyeR * 1.2 * Math.sin(0.9)
    const crease = new THREE.Mesh(new THREE.TorusGeometry(creaseR, 0.00075, 4, 24, Math.PI * 0.8), mats.crease)
    crease.rotation.set(Math.PI / 2 - 0.25, 0, Math.PI * 0.1)
    crease.position.y = eyeR * 1.2 * Math.cos(0.9) + 0.0015
    eyeGroup.add(crease)
    group.add(eyeGroup)

    // sobrancelha: curva sobre o arco da órbita
    const pts = [0.1, 0.2, 0.32, 0.44, 0.52].map((x, i) => {
      const y = [0.255, 0.285, 0.3, 0.285, 0.24][i]
      const q = facePoint(x * s, y, female)
      q.z += 0.0035
      return q
    })
    const curve = new THREE.CatmullRomCurve3(pts)
    // sobrancelha feita de fios curtos: mais densos e inclinados para cima na parte interna
    const hairs = 90
    const stroke = new THREE.CapsuleGeometry(browWeight * 0.3, 0.0042, 2, 4)
    const brow = new THREE.InstancedMesh(stroke, mats.brow, hairs)
    const m4 = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < hairs; i++) {
      const k = (i * 0.618034) % 1
      const at = curve.getPointAt(k)
      const tan = curve.getTangentAt(k).normalize()
      const lift = (1 - k) * 0.55 + 0.08
      const dirv = tan.clone().multiplyScalar(s).add(new THREE.Vector3(0, lift, 0)).normalize()
      q.setFromUnitVectors(up, dirv)
      const jitter = ((i * 37) % 7) / 7 - 0.5
      at.y += jitter * browWeight * 1.3
      at.x += (((i * 53) % 11) / 11 - 0.5) * 0.002
      const sc = 0.75 + 0.5 * (1 - k)
      m4.compose(at, q, new THREE.Vector3(1, sc, 1))
      brow.setMatrixAt(i, m4)
    }
    brows.push(brow)
    group.add(brow)
  }

  // lábios com volume (afinam nos cantos; arco do cupido no superior)
  const lip = (y: number, w: number, h: number, d: number, upper: boolean) => {
    const geo = new THREE.SphereGeometry(1, 28, 12)
    deform(geo, (p) => {
      const ax = Math.abs(p.x)
      p.y *= 1 - 0.55 * ax * ax
      if (upper && p.y > 0) p.y *= 1 + 0.35 * gauss(p.x, 0, 0.32, 0, 0.18, 1) + 0.35 * gauss(p.x, 0, -0.32, 0, 0.18, 1) - 0.25 * gauss(p.x, 0, 0, 0, 0.12, 1)
      p.z *= 1 - 0.4 * ax * ax
      p.set(p.x * w, p.y * h, p.z * d)
    })
    const m = new THREE.Mesh(geo, mats.lip)
    const at = facePoint(0, y, female)
    m.position.set(at.x, at.y, at.z - d * 0.55)
    return m
  }
  group.add(lip(-0.39, female ? 0.0182 : 0.0178, female ? 0.0036 : 0.0028, 0.0042, true))
  group.add(lip(-0.447, female ? 0.0165 : 0.016, female ? 0.0046 : 0.0038, 0.0046, false))

  // boca: três expressões (neutra, sorriso, alegria)
  const line = (lift: number) => {
    const pts = [-0.15, -0.08, 0, 0.08, 0.15].map((x) => {
      const y = -0.415 + lift * (Math.abs(x) / 0.15) ** 2
      const q = facePoint(x, y, female)
      q.z += 0.001
      return q
    })
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0008, 5, false), mats.mouth)
  }
  const neutral = line(0.005)
  const smile = line(0.04)
  const open = new THREE.Group()
  const mp = facePoint(0, -0.425, female)
  const cavity = new THREE.Mesh(new THREE.SphereGeometry(0.011, 20, 12), mats.mouth)
  cavity.scale.set(1.25, 0.55, 0.45)
  cavity.position.set(mp.x, mp.y, mp.z - 0.002)
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.0035, 0.004), mats.teeth)
  teeth.position.set(mp.x, mp.y + 0.0035, mp.z + 0.0005)
  open.add(cavity, teeth)
  smile.visible = false
  open.visible = false
  group.add(neutral, smile, open)
  return { group, lids, brows, mouths: { neutral, smile, open } }
}

export function buildEars(female: boolean, skin: THREE.Material) {
  const g = new THREE.Group()
  for (const s of [-1, 1]) {
    const geo = backSeamSphere(1, 24, 16)
    deform(geo, (p) => {
      p.set(p.x * 0.009, p.y * 0.031, p.z * 0.021)
      // curva da orelha: borda dobrada para fora e lóbulo
      p.x += 0.006 * (p.z / 0.021) ** 2
      if (p.y < -0.018) p.z *= 0.8
    })
    const ear = new THREE.Mesh(geo, skin)
    const side = headShape(new THREE.Vector3(s, 0.0, -0.1).normalize(), female)
    ear.position.set(side.x + s * 0.004, side.y - 0.006, side.z - 0.004)
    ear.rotation.y = s * 0.35
    ear.rotation.x = -0.12
    ear.scale.setScalar(female ? 0.9 : 1)
    ear.name = 'orelha'
    g.add(ear)
  }
  return g
}

export function buildNeck(female: boolean, skin: THREE.Material) {
  const pts = [
    new THREE.Vector2(female ? 0.062 : 0.072, 0),
    new THREE.Vector2(female ? 0.05 : 0.058, 0.03),
    new THREE.Vector2(female ? 0.046 : 0.054, 0.09),
    new THREE.Vector2(female ? 0.046 : 0.052, 0.15),
  ]
  const geo = new THREE.LatheGeometry(pts, 32, Math.PI)
  geo.scale(1, 1, 0.9)
  const m = new THREE.Mesh(geo, skin)
  m.name = 'pescoco'
  return m
}

/** Mão com palma e cinco dedos articulados. `side` = -1 (direita) ou 1 (esquerda). */
export function buildHand(side: number, skin: THREE.Material, female: boolean) {
  const hand = new THREE.Group()
  const k = female ? 0.9 : 1
  const palmGeo = backSeamSphere(1, 24, 16)
  deform(palmGeo, (p) => {
    p.set(p.x * 0.014 * k, p.y * 0.045 * k, p.z * 0.026 * k)
    if (p.y < 0) p.z *= 1.08
  })
  const palm = new THREE.Mesh(palmGeo, skin)
  palm.position.y = -0.045 * k
  hand.add(palm)
  const fingers: THREE.Group[] = []
  const zs = [0.014, 0.0048, -0.0045, -0.013]
  const lens = [0.038, 0.043, 0.04, 0.032]
  zs.forEach((z, i) => {
    const base = new THREE.Group()
    base.position.set(0, -0.086 * k, z * k)
    const prox = new THREE.Mesh(new THREE.CapsuleGeometry(0.0074 * k, lens[i] * 0.55 * k, 4, 10), skin)
    prox.position.y = -lens[i] * 0.3 * k
    base.add(prox)
    const tipPivot = new THREE.Group()
    tipPivot.position.y = -lens[i] * 0.6 * k
    const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0068 * k, lens[i] * 0.42 * k, 4, 10), skin)
    tip.position.y = -lens[i] * 0.24 * k
    tipPivot.add(tip)
    base.add(tipPivot)
    base.userData.tip = tipPivot
    base.userData.side = side
    fingers.push(base)
    hand.add(base)
  })
  const thumb = new THREE.Group()
  thumb.position.set(side * -0.004, -0.03 * k, 0.022 * k)
  const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0078 * k, 0.03 * k, 4, 10), skin)
  t1.position.y = -0.018 * k
  thumb.add(t1)
  thumb.rotation.set(-0.5, 0, side * 0.35)
  hand.add(thumb)
  hand.userData.fingers = fingers
  return hand
}

/** Fecha os dedos (0 = mão relaxada, 1 = punho fechado segurando algo). */
export function curlHand(hand: THREE.Object3D, amount: number) {
  for (const f of hand.userData.fingers as THREE.Group[]) {
    const s = f.userData.side as number
    f.rotation.z = -s * (0.35 + amount * 1.15)
    ;(f.userData.tip as THREE.Group).rotation.z = -s * (0.35 + amount * 1.25)
  }
}

export function buildShin(female: boolean, skin: THREE.Material) {
  const k = female ? 0.9 : 1
  const pts = [
    [0.028, 0.0], [0.032, 0.05], [0.04, 0.14], [0.05, 0.25], [0.048, 0.33], [0.045, 0.42],
  ].map(([r, y]) => new THREE.Vector2(r * k, y))
  const geo = new THREE.LatheGeometry(pts, 24, Math.PI)
  geo.scale(1, 1, 0.92)
  const m = new THREE.Mesh(geo, skin)
  m.position.y = -0.42
  return m
}

export function buildThigh(female: boolean, skin: THREE.Material) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(female ? 0.062 : 0.066, 0.3, 6, 16), skin)
  m.position.y = -0.21
  return m
}

/** Pé com dedos. A sola fica em y = -0,08 a partir do tornozelo. */
export function buildFoot(female: boolean, skin: THREE.Material) {
  const k = female ? 0.92 : 1
  const g = new THREE.Group()
  const geo = backSeamSphere(1, 32, 20)
  deform(geo, (p) => {
    const z = p.z
    let X = p.x * 0.042 * (1 + 0.15 * smoothstep(-0.2, 0.6, z))
    let Y = p.y * 0.034
    const Z = z * 0.115 + 0.065
    if (Y < -0.02) Y = -0.02 - (Y + 0.02) * 0.2
    Y -= 0.012 * smoothstep(0, 1, z)
    if (z < -0.5) X *= 0.9
    p.set(X * k, Y - 0.046, Z * k)
  })
  g.add(new THREE.Mesh(geo, skin))
  const toes = [0.0085, 0.0072, 0.0066, 0.006, 0.0055]
  toes.forEach((r, i) => {
    const t = new THREE.Mesh(new THREE.SphereGeometry(r * k, 12, 8), skin)
    t.scale.set(1, 0.85, 1.25)
    t.position.set((0.026 - i * 0.0128) * k, -0.064, (0.168 - Math.abs(i - 0.3) * 0.0065) * k)
    g.add(t)
  })
  return g
}
