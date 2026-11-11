import * as THREE from 'three'
import type { AccessoryItem } from '../data/character/items'
import { HEAD_H, headShape } from './anatomy'
import { TUNIC_X, TUNIC_Z, tunicRadius } from './clothing'
import { deform, noise3, rng, smoothstep, table } from './math'
import { fabricTexture, leatherTexture, weaveBump, wickerTexture, woodTexture } from './textures'

/*
 * ACESSÓRIOS DE ÉPOCA
 * Itens de mão são presos à mão direita; os demais ao corpo ou à cabeça.
 */

export interface AccessoryParts {
  hand?: THREE.Object3D
  /** Força da mão fechando ao segurar o item (0 a 1). */
  grip: number
  /** Pose do braço direito ao segurar (cotovelo dobrado). */
  carry: 'cajado' | 'frente' | 'pendurado' | null
  body?: THREE.Object3D
  head?: THREE.Object3D
  chest?: THREE.Object3D
  /** O cabelo é coberto (lenço). */
  coversHair: boolean
  light?: THREE.PointLight
}

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o)

export function buildAccessories(items: AccessoryItem[], female: boolean, quality: 'alta' | 'leve'): AccessoryParts {
  const out: AccessoryParts = { grip: 0, carry: null, coversHair: false }
  for (const it of items) {
    switch (it.kind) {
      case 'cajado': {
        const wood = std({ map: woodTexture(), roughness: 0.75 })
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= 20; i++) {
          const y = -0.92 + i * 0.09
          pts.push(new THREE.Vector3(0.008 * Math.sin(i * 0.9), y, 0.006 * Math.cos(i * 1.3)))
        }
        // curva no alto (cajado de pastor)
        pts.push(new THREE.Vector3(0.015, 0.92, 0), new THREE.Vector3(0.05, 0.99, 0), new THREE.Vector3(0.1, 0.98, 0), new THREE.Vector3(0.115, 0.92, 0), new THREE.Vector3(0.1, 0.87, 0))
        const staff = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.014, 10), wood)
        staff.rotation.y = Math.PI / 2
        out.hand = staff
        out.grip = 1
        out.carry = 'cajado'
        break
      }
      case 'pergaminho': {
        const g = new THREE.Group()
        const parchment = std({ color: '#e8d7ae', roughness: 0.85 })
        const woodM = std({ map: woodTexture(), roughness: 0.7 })
        const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.2, 24), parchment)
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.25, 10), woodM)
        g.add(roll, rod)
        for (const s of [-1, 1]) {
          const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), woodM)
          knob.position.y = s * 0.13
          g.add(knob)
        }
        const tie = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.0025, 6, 24), std({ color: '#8e3328', roughness: 0.8 }))
        tie.rotation.x = Math.PI / 2
        g.add(tie)
        g.rotation.x = Math.PI / 2
        g.position.set(0, -0.09, 0.02)
        out.hand = g
        out.grip = 0.8
        out.carry = 'frente'
        break
      }
      case 'lamparina': {
        const g = new THREE.Group()
        const clay = std({ color: '#a8643a', roughness: 0.9 })
        const body = new THREE.LatheGeometry([[0.001, 0], [0.04, 0.004], [0.05, 0.018], [0.038, 0.03], [0.012, 0.032], [0.01, 0.026]].map(([r, y]) => new THREE.Vector2(r, y)), 28)
        deform(body, (p) => {
          if (p.z > 0) p.z *= 1 + 0.9 * smoothstep(0.01, 0.05, p.z) * (1 - Math.abs(p.x) / 0.05)
        })
        g.add(new THREE.Mesh(body, clay))
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.012, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffd27a' }))
        flame.scale.set(0.7, 1.7, 0.7)
        flame.position.set(0, 0.045, 0.085)
        flame.name = 'chama'
        g.add(flame)
        if (quality === 'alta') {
          const light = new THREE.PointLight('#ffb35c', 0.6, 0.9, 2)
          light.position.copy(flame.position)
          g.add(light)
          out.light = light
        }
        g.position.set(0.0, -0.11, 0.03)
        g.rotation.y = -Math.PI / 2
        out.hand = g
        out.grip = 0.6
        out.carry = 'frente'
        break
      }
      case 'cesto': {
        const g = new THREE.Group()
        const wick = std({ map: wickerTexture(), roughness: 0.9, side: THREE.DoubleSide })
        g.add(new THREE.Mesh(new THREE.LatheGeometry([[0.05, 0], [0.075, 0.03], [0.09, 0.09], [0.093, 0.1]].map(([r, y]) => new THREE.Vector2(r, y)), 32), wick))
        const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), wick)
        bottom.rotation.x = -Math.PI / 2
        g.add(bottom)
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.006, 8, 30, Math.PI), wick)
        handle.position.y = 0.1
        g.add(handle)
        g.position.set(0, -0.3, 0.0)
        out.hand = g
        out.grip = 0.9
        out.carry = 'pendurado'
        break
      }
      case 'bolsa':
      case 'odre': {
        const leather = std({ map: leatherTexture(it.kind === 'bolsa' ? '#6b4423' : '#7a5232'), roughness: 0.65 })
        const g = new THREE.Group()
        const bag = new THREE.SphereGeometry(1, 28, 20)
        if (it.kind === 'bolsa') {
          deform(bag, (p) => {
            p.set(p.x * 0.085, p.y * 0.075 * (p.y < 0 ? 1 : 0.9), p.z * 0.035)
            if (p.y < -0.04) p.y = -0.04 - (p.y + 0.04) * 0.4
          })
        } else {
          deform(bag, (p) => {
            const t = 1 - 0.35 * smoothstep(0, 1, p.y)
            p.set(p.x * 0.06 * t, p.y * 0.11, p.z * 0.045 * t)
          })
        }
        const bagM = new THREE.Mesh(bag, leather)
        const hy = 0.94
        const r = tunicRadius(hy, female)
        bagM.position.set(r * TUNIC_X * 0.86, hy, r * TUNIC_Z * 0.6 + 0.05)
        bagM.rotation.y = 0.7
        g.add(bagM)
        if (it.kind === 'bolsa') {
          const flap = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, 1.3), leather)
          flap.scale.set(0.088, 0.05, 0.04)
          flap.position.copy(bagM.position).add(new THREE.Vector3(0, 0.03, 0))
          flap.rotation.y = 0.7
          g.add(flap)
        }
        // alça a tiracolo: do ombro direito, pela frente e pelas costas
        const shoulder = new THREE.Vector3(-0.15, 1.44, 0)
        const front: THREE.Vector3[] = []
        const back: THREE.Vector3[] = []
        for (let i = 0; i <= 12; i++) {
          const t = i / 12
          const y = THREE.MathUtils.lerp(shoulder.y, hy + 0.05, t)
          const x = THREE.MathUtils.lerp(shoulder.x, bagM.position.x, t)
          const rr = tunicRadius(y, female)
          const zf = Math.sqrt(Math.max(0, 1 - (x / (rr * TUNIC_X + 0.012)) ** 2)) * (rr * TUNIC_Z + 0.012)
          front.push(new THREE.Vector3(x, y, zf))
          back.push(new THREE.Vector3(x, y, -zf))
        }
        const path = [...back.reverse(), new THREE.Vector3(-0.17, 1.465, 0), ...front]
        const strap = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 120, 0.0055, 6), leather)
        strap.scale.set(1, 1, 1)
        g.add(strap)
        out.body = g
        break
      }
      case 'lenco': {
        const cloth = new THREE.MeshPhysicalMaterial({ map: fabricTexture(it.color ?? '#d9c7a0', { stripes: '#8b5e34' }), bumpMap: weaveBump(), bumpScale: 0.6, roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color('#fff2d6'), sheenRoughness: 0.8, side: THREE.DoubleSide })
        const geo = new THREE.SphereGeometry(1, 72, 48)
        const u = new THREE.Vector3()
        deform(geo, (p) => {
          u.copy(p).normalize()
          const base = headShape(u, female)
          const a = Math.abs(Math.atan2(u.x, u.z))
          const lineY = table([[0, 0.6], [0.6, 0.5], [1.1, 0.0], [1.6, -0.6], [Math.PI, -1]], a)
          const m = smoothstep(lineY - 0.02, lineY + 0.08, u.y)
          if (m < 0.01) return void p.copy(base).multiplyScalar(0.95)
          p.copy(base).add(base.clone().normalize().multiplyScalar((0.2 + 0.03 * noise3(u.x * 5, u.y * 5, u.z * 5)) * HEAD_H * m))
          // tecido cai até os ombros nas costas e laterais
          if (u.y < -0.3 && a > 1.2) p.y -= 0.06 * smoothstep(-0.3, -1, u.y)
        })
        const scarf = new THREE.Mesh(geo, cloth)
        out.head = scarf
        out.coversHair = true
        break
      }
      case 'louros': {
        const g = new THREE.Group()
        const leaf = new THREE.SphereGeometry(0.012, 8, 6)
        leaf.scale(1, 0.35, 2.2)
        const n = 46
        const inst = new THREE.InstancedMesh(leaf, std({ color: '#5f7d3a', roughness: 0.6 }), n)
        const m4 = new THREE.Matrix4()
        const r = rng(41)
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const dir = new THREE.Vector3(Math.sin(a), 0.42, Math.cos(a)).normalize()
          const p = headShape(dir, female).multiplyScalar(1.17)
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() - 0.5, a + Math.PI / 2 + (i % 2 ? 0.5 : -0.5), 0.3))
          m4.compose(p, q, new THREE.Vector3(1, 1, 1))
          inst.setMatrixAt(i, m4)
        }
        g.add(inst)
        out.head = g
        break
      }
      case 'colar': {
        const n = 26
        const bead = new THREE.SphereGeometry(0.0065, 10, 8)
        const inst = new THREE.InstancedMesh(bead, std({ roughness: 0.4, metalness: 0.1 }), n)
        const m4 = new THREE.Matrix4()
        const cols = ['#b5562f', '#d9c7a0', '#2f6b6b', '#8a5a2b']
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const front = Math.max(0, Math.cos(a))
          const p = new THREE.Vector3(Math.sin(a) * 0.082, 0.02 - 0.06 * front, Math.cos(a) * 0.072 + 0.005)
          m4.makeTranslation(p.x, p.y, p.z)
          inst.setMatrixAt(i, m4)
          inst.setColorAt(i, new THREE.Color(cols[i % cols.length]))
        }
        out.chest = inst
        break
      }
    }
  }
  return out
}
