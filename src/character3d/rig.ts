import * as THREE from 'three'
import type { CharacterAppearance } from '../types'
import { resolveLook } from '../data/character/look'
import { buildAccessories } from './accessories'
import { buildEars, buildFace, buildFoot, buildHand, buildHeadMesh, buildNeck, buildShin, buildThigh, curlHand, type FaceParts } from './anatomy'
import { buildBelt, buildCollar, buildFootwear, buildMantle, buildSleeves, buildTunic } from './clothing'
import { buildBeard, buildHair } from './hair'
import { hexShade } from './math'
import { eyeTexture, fabricTexture, hairBump, hairTexture, leatherTexture, skinTexture, weaveBump } from './textures'

/*
 * MONTAGEM E ANIMAÇÃO DO PERSONAGEM 3D
 * Esqueleto simples por grupos (quadril, peito, pescoço, cabeça, ombros,
 * cotovelos, punhos, quadris, joelhos, tornozelos). As roupas acompanham o
 * osso em que estão presas. As animações são procedurais e suaves.
 */

export type Pose3D = 'idle' | 'walk' | 'celebrate' | 'react' | 'wave' | 'still'
export type Quality3D = 'alta' | 'leve'

const HIP = 0.95

interface Joints {
  body: THREE.Group
  chest: THREE.Group
  neck: THREE.Group
  head: THREE.Group
  shoulder: [THREE.Group, THREE.Group]
  elbow: [THREE.Group, THREE.Group]
  wrist: [THREE.Group, THREE.Group]
  hip: [THREE.Group, THREE.Group]
  knee: [THREE.Group, THREE.Group]
  ankle: [THREE.Group, THREE.Group]
}

export interface Rig {
  root: THREE.Group
  update(pose: Pose3D, t: number, dt: number, reduced?: boolean): void
  dispose(): void
}

const g = (name: string, x = 0, y = 0, z = 0) => {
  const o = new THREE.Group()
  o.name = name
  o.position.set(x, y, z)
  return o
}

export function buildCharacter(a: CharacterAppearance, quality: Quality3D): Rig {
  const look = resolveLook(a)
  // no 3D os tons de pele ganham um pouco de saturação (a iluminação clareia)
  look.skin = hexShade(look.skin, -0.03, 0.08)
  const female = look.body === 'feminino'
  const phys = quality === 'alta'
  const M = (p: THREE.MeshPhysicalMaterialParameters) => {
    if (phys) return new THREE.MeshPhysicalMaterial(p)
    // qualidade leve: material padrão, sem brilho de tecido nem verniz
    const { sheen: _s, sheenColor: _sc, sheenRoughness: _sr, clearcoat: _c, clearcoatRoughness: _cr, specularIntensity: _si, ...rest } = p
    void _s, void _sc, void _sr, void _c, void _cr, void _si
    return new THREE.MeshStandardMaterial(rest)
  }
  const iris = a.skin <= 1 && [2, 3, 4].includes(a.hairColor) ? '#5b6a3c' : '#3d2617'

  // pele: brilho avermelhado nas bordas imita a luz atravessando a pele (subsurface)
  const sss = { roughness: 0.52, sheen: 0.32, sheenColor: new THREE.Color('#ff8f78'), sheenRoughness: 0.45, specularIntensity: 0.45 }
  const skinFace = M({ map: skinTexture(look.skin, { freckles: look.face === 'sardas', female, beard: look.beard !== 'nenhuma', hair: look.hair }), ...sss })
  const skin = M({ color: look.skin, ...sss })
  const eye = M({ map: eyeTexture(iris), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })
  const browMat = new THREE.MeshStandardMaterial({ color: hexShade(look.hair, 0.02), roughness: 0.85 })
  const lash = new THREE.MeshStandardMaterial({ color: '#1a120d', roughness: 0.8 })
  const mouth = new THREE.MeshStandardMaterial({ color: '#4a1f1a', roughness: 0.7 })
  const teeth = new THREE.MeshStandardMaterial({ color: '#f1ead8', roughness: 0.4 })
  const hairMat = M({ map: hairTexture(look.hair), bumpMap: hairBump(), bumpScale: 1.4, roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color(hexShade(look.hair, 0.18)), sheenRoughness: 0.35, side: THREE.DoubleSide })
  const cloth = (color: string, opt: { stripes?: string; trim?: string; edges?: boolean }) =>
    M({ map: fabricTexture(color, opt), bumpMap: weaveBump(), bumpScale: 0.5, roughness: 0.92, sheen: 0.7, sheenColor: new THREE.Color(hexShade(color, 0.15)), sheenRoughness: 0.7, side: THREE.DoubleSide })
  const tunicMat = cloth(look.tunic.color, { stripes: look.tunic.stripes, trim: look.tunic.trim })
  const leather = (c: string) => new THREE.MeshStandardMaterial({ map: leatherTexture(c), roughness: 0.68 })
  const metal = new THREE.MeshStandardMaterial({ color: '#c08a3e', metalness: 0.85, roughness: 0.32 })

  const root = new THREE.Group()
  root.name = 'personagem'
  const sx = female ? 0.152 : 0.17
  const J: Joints = {
    body: g('quadril', 0, HIP, 0),
    chest: g('peito', 0, 0.25, 0),
    neck: g('pescoco', 0, 0.255, 0),
    head: g('cabeca', 0, female ? 0.03 : 0.045, 0.008),
    shoulder: [g('ombro-d', -sx, 0.2, 0), g('ombro-e', sx, 0.2, 0)],
    elbow: [g('cotovelo-d', 0, -0.29, 0), g('cotovelo-e', 0, -0.29, 0)],
    wrist: [g('punho-d', 0, -0.255, 0), g('punho-e', 0, -0.255, 0)],
    hip: [g('quadril-d', -0.088, 0, 0), g('quadril-e', 0.088, 0, 0)],
    knee: [g('joelho-d', 0, -0.43, 0), g('joelho-e', 0, -0.43, 0)],
    ankle: [g('tornozelo-d', 0, -0.42, 0), g('tornozelo-e', 0, -0.42, 0)],
  }
  root.add(J.body)
  J.body.add(J.chest)
  J.chest.add(J.neck)
  J.neck.add(J.head)
  if (female) root.scale.setScalar(0.95)

  // roupas presas ao corpo (coordenadas com os pés em y = 0)
  const dress = g('vestes', 0, -HIP, 0)
  J.body.add(dress)
  const tunicBody = tunicMat.clone()
  tunicBody.vertexColors = true
  dress.add(buildTunic(female, Boolean(look.tunic.short), tunicBody))
  dress.add(buildCollar(female, tunicMat))
  // peito sob o decote (evita o vão escuro na gola)
  const chestFill = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), skin)
  chestFill.scale.set(female ? 0.07 : 0.08, 0.06, female ? 0.055 : 0.062)
  chestFill.position.set(0, female ? 1.43 : 1.435, 0.004)
  dress.add(chestFill)
  if (look.mantle) {
    const mOuter = cloth(look.mantle.color, { stripes: look.mantle.stripes, trim: look.mantle.trim, edges: true })
    const mInner = new THREE.MeshStandardMaterial({ color: hexShade(look.mantle.color, -0.05), roughness: 0.95, side: THREE.BackSide })
    ;(mOuter as THREE.MeshStandardMaterial).side = THREE.FrontSide
    mOuter.vertexColors = true
    mInner.vertexColors = true
    dress.add(buildMantle(look.mantle, female, mOuter, mInner))
  }
  if (look.belt) dress.add(buildBelt(look.belt, female, look.belt.style === 'faixa' ? cloth(look.belt.color, {}) : leather(look.belt.color), metal))

  // pescoço e cabeça
  J.neck.add(buildNeck(female, skin))
  const headPivot = g('cranio', 0, 0.11, 0)
  headPivot.scale.setScalar(1.07)
  J.head.add(headPivot)
  headPivot.add(buildHeadMesh(female, skinFace))
  // cor dos lábios acompanha o tom de pele (mais escura em peles escuras)
  const dark = new THREE.Color(look.skin).getHSL({ h: 0, s: 0, l: 0 }).l < 0.4
  const lipColor = new THREE.Color(look.skin).lerp(new THREE.Color(dark ? '#5a2a26' : female ? '#b45a5a' : '#9a5a4a'), dark ? 0.35 : female ? 0.5 : 0.35)
  const lipMat = M({ color: lipColor, roughness: 0.48, map: null })
  const crease = new THREE.MeshStandardMaterial({ color: hexShade(look.skin, -0.16), roughness: 0.8 })
  const face: FaceParts = buildFace(female, { skin: skinFace, eye, brow: browMat, lash, mouth, teeth, lip: lipMat, crease }, look.face === 'marcante' ? 0.0027 : female ? 0.0017 : 0.0022)
  headPivot.add(face.group)
  headPivot.add(buildEars(female, skin))

  const acc = buildAccessories(look.accessories, female, quality)
  const lockMat = M({ map: hairTexture(look.hair), roughness: 0.48, sheen: 0.6, sheenColor: new THREE.Color(hexShade(look.hair, 0.2)), sheenRoughness: 0.3 })
  headPivot.add(buildHair(look.hairStyle, female, hairMat, { covered: acc.coversHair, lockMat, mantle: Boolean(look.mantle) }))
  const beard = buildBeard(look.beard, female, hairMat)
  if (beard) headPivot.add(beard)
  if (acc.head) headPivot.add(acc.head)
  if (acc.chest) J.neck.add(acc.chest)
  if (acc.body) dress.add(acc.body)

  // braços
  const sleeves = buildSleeves(tunicMat)
  const hands: THREE.Group[] = []
  ;[0, 1].forEach((i) => {
    const side = i === 0 ? -1 : 1
    J.chest.add(J.shoulder[i])
    J.shoulder[i].add(J.elbow[i])
    J.elbow[i].add(J.wrist[i])
    const upperSkin = new THREE.Mesh(new THREE.CapsuleGeometry(female ? 0.034 : 0.039, 0.22, 4, 14), skin)
    upperSkin.position.y = -0.145
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), tunicMat)
    cap.scale.set(1, 0.9, 1)
    cap.position.y = -0.012
    J.shoulder[i].add(upperSkin, sleeves.upper(), cap)
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(female ? 0.03 : 0.034, 0.2, 4, 14), skin)
    fore.position.y = -0.13
    J.elbow[i].add(fore, sleeves.lower())
    const hand = buildHand(side, skin, female)
    J.wrist[i].add(hand)
    hands.push(hand)
  })
  curlHand(hands[1], 0.15)
  curlHand(hands[0], acc.grip || 0.15)
  let holder: THREE.Group | null = null
  if (acc.hand) {
    holder = g('item-mao', 0, -0.06, 0)
    holder.add(acc.hand)
    J.wrist[0].add(holder)
  }

  // pernas e pés
  ;[0, 1].forEach((i) => {
    J.body.add(J.hip[i])
    J.hip[i].add(J.knee[i])
    J.knee[i].add(J.ankle[i])
    J.hip[i].add(buildThigh(female, skin))
    J.knee[i].add(buildShin(female, skin))
    const foot = buildFoot(female, skin)
    const shoe = buildFootwear(look.foot, leather(look.foot.color), female)
    const fg = g('pe')
    fg.add(foot, shoe)
    if (i === 1) fg.scale.x = -1
    fg.rotation.y = i === 0 ? 0.08 : -0.08
    J.ankle[i].add(fg)
  })

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = phys
      o.receiveShadow = false
    }
  })

  // ---------- animação ----------
  const carry = acc.carry
  const cur = new Map<THREE.Object3D, THREE.Vector3>()
  const target = (o: THREE.Object3D, x: number, y: number, z: number) => {
    let v = cur.get(o)
    if (!v) cur.set(o, (v = new THREE.Vector3(o.rotation.x, o.rotation.y, o.rotation.z)))
    return { o, x, y, z }
  }
  let bodyY = HIP
  let blinkAt = 2
  const flame = root.getObjectByName('chama')

  function update(pose: Pose3D, t: number, dt: number, reduced = false) {
    const p = reduced && pose !== 'still' ? 'still' : pose
    const T: ReturnType<typeof target>[] = []
    const s = Math.sin
    let by = HIP
    // repouso
    let arm = [{ x: -0.16, z: -0.1 }, { x: -0.16, z: 0.1 }]
    let elbow = [-0.22, -0.22]
    let elbowZ = [0, 0]
    let hip = [0, 0]
    let knee = [0, 0]
    let chestX = 0
    let headX = 0, headY = 0, headZ = 0, bodyZ = 0, bodyRY = 0
    let breathe = 0
    let expression: 'neutral' | 'smile' | 'open' = 'neutral'
    let brows = 0
    if (carry === 'cajado') {
      arm[0] = { x: -0.32, z: -0.2 }
      elbow[0] = -0.75
    } else if (carry === 'frente') {
      arm[0] = { x: -0.25, z: -0.16 }
      elbow[0] = -1.15
    } else if (carry === 'pendurado') {
      arm[0] = { x: -0.12, z: -0.2 }
      elbow[0] = -0.25
    }
    if (p === 'idle') {
      breathe = s(t * 1.7)
      by += 0.003 * breathe
      bodyZ = 0.012 * s(t * 0.45)
      headY = 0.14 * s(t * 0.33)
      headX = 0.03 * s(t * 0.5 + 1)
      arm = arm.map((v, i) => ({ x: v.x + 0.025 * s(t * 0.9 + i), z: v.z }))
      expression = Math.sin(t * 0.21) > 0.55 ? 'smile' : 'neutral'
    } else if (p === 'walk') {
      const f = t * 6.6
      hip = [-0.42 * s(f), 0.42 * s(f)]
      knee = [0.65 * Math.max(0, s(f - 1.3)), 0.65 * Math.max(0, s(f - 1.3 + Math.PI))]
      by += -0.012 + 0.022 * Math.abs(Math.cos(f))
      bodyRY = 0.06 * s(f)
      arm = [{ x: carry ? arm[0].x : 0.34 * s(f), z: arm[0].z }, { x: -0.34 * s(f), z: 0.13 }]
      expression = 'smile'
      headX = 0.05
    } else if (p === 'celebrate') {
      const j = Math.max(0, s(t * 5.2))
      by += 0.07 * j
      arm = [{ x: -0.1, z: -2.55 }, { x: -0.1, z: 2.55 }]
      elbow = [-0.35, -0.35]
      knee = [0.3 * j, 0.3 * j]
      hip = [-0.15 * j, -0.15 * j]
      headX = -0.18
      expression = 'open'
      brows = 1
    } else if (p === 'react') {
      chestX = 0.1
      headZ = 0.12
      headX = 0.06 + 0.04 * s(t * 1.2)
      arm[1] = { x: -1.05, z: 0.32 }
      elbow[1] = -1.95
      expression = 'open'
      brows = 1
    } else if (p === 'wave') {
      arm[1] = { x: -0.15, z: 2.35 }
      elbow[1] = -0.35
      elbowZ[1] = 0.35 * s(t * 8)
      headZ = -0.08
      headY = 0.1
      expression = 'smile'
      brows = 0.5
    }
    T.push(
      target(J.chest, chestX, 0, 0),
      target(J.head, headX, headY, headZ),
      target(J.body, 0, bodyRY, bodyZ),
      target(J.shoulder[0], arm[0].x, 0, arm[0].z),
      target(J.shoulder[1], arm[1].x, 0, arm[1].z),
      target(J.elbow[0], elbow[0], 0, elbowZ[0]),
      target(J.elbow[1], elbow[1], 0, elbowZ[1]),
      target(J.hip[0], hip[0], 0, 0),
      target(J.hip[1], hip[1], 0, 0),
      target(J.knee[0], knee[0], 0, 0),
      target(J.knee[1], knee[1], 0, 0),
      target(J.ankle[0], -(hip[0] + knee[0]) * 0.7, 0, 0),
      target(J.ankle[1], -(hip[1] + knee[1]) * 0.7, 0, 0),
      target(J.wrist[0], carry === 'cajado' ? 0.75 - arm[0].x * 0 : carry === 'frente' ? 0.2 : 0, 0, 0),
    )
    const k = Math.min(1, dt * 7)
    for (const { o, x, y, z } of T) {
      const v = cur.get(o)!
      v.x += (x - v.x) * k
      v.y += (y - v.y) * k
      v.z += (z - v.z) * k
      o.rotation.set(v.x, v.y, v.z)
    }
    bodyY += (by - bodyY) * Math.min(1, dt * 10)
    J.body.position.y = bodyY
    J.chest.scale.set(1 + 0.006 * breathe, 1 + 0.01 * breathe, 1 + 0.012 * breathe)
    // expressão e piscar
    face.mouths.neutral.visible = expression === 'neutral'
    face.mouths.smile.visible = expression === 'smile'
    face.mouths.open.visible = expression === 'open'
    for (const b of face.brows) b.position.y = 0.004 * brows
    let lid = 0
    if (!reduced && p !== 'still') {
      if (t > blinkAt + 0.14) blinkAt = t + 2.5 + ((t * 7.3) % 1) * 3
      if (t > blinkAt) lid = 1
    }
    for (const l of face.lids) l.rotation.x = l.userData.open + lid * 1.25 - brows * 0.08
    // o cajado fica sempre na vertical, apoiado no chão
    if (holder && carry === 'cajado') {
      root.updateMatrixWorld(true)
      const qw = J.wrist[0].getWorldQuaternion(new THREE.Quaternion())
      const qr = root.getWorldQuaternion(new THREE.Quaternion())
      holder.quaternion.copy(qw.invert().multiply(qr))
      const grip = holder.getWorldPosition(new THREE.Vector3())
      root.worldToLocal(grip)
      acc.hand!.position.y = 0.92 - grip.y + (p === 'celebrate' || p === 'walk' ? 0.25 : 0)
    }
    if (flame) flame.scale.y = 1.7 + (reduced ? 0 : 0.25 * s(t * 13) * s(t * 7))
  }

  update('still', 0, 1)

  return {
    root,
    update,
    dispose() {
      root.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry && !m.geometry.userData.shared) m.geometry.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        for (const mat of mats) mat.dispose()
      })
    },
  }
}
