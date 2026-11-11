import * as THREE from 'three'
import { hexShade, rng } from './math'

/*
 * TEXTURAS PROCEDURAIS (desenhadas em canvas, sem arquivos externos)
 * Ficam em cache e são compartilhadas entre personagens; por isso nunca são
 * descartadas junto com um personagem.
 */

const cache = new Map<string, THREE.Texture>()

function make(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, color = true, repeat?: [number, number]) {
  const k = `${key}|${repeat?.join('x') ?? ''}`
  const hit = cache.get(k)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (color) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  cache.set(k, t)
  return t
}

/** Converte coordenadas da esfera unitária (frente em +Z) para pixels da textura. */
function sph(xu: number, yu: number, w: number, h: number): [number, number] {
  const z = Math.sqrt(Math.max(0.0001, 1 - xu * xu - yu * yu))
  return [(0.5 + Math.atan2(xu, z) / (2 * Math.PI)) * w, (Math.acos(Math.max(-1, Math.min(1, yu))) / Math.PI) * h]
}

function blob(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, alpha: number) {
  const grd = g.createRadialGradient(x, y, 0, x, y, 1)
  grd.addColorStop(0, color)
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.save()
  g.globalAlpha = alpha
  g.translate(x, y)
  g.scale(rx, ry)
  g.translate(-x, -y)
  g.fillStyle = grd
  g.beginPath()
  g.arc(x, y, 1, 0, Math.PI * 2)
  g.fill()
  g.restore()
}

export function skinTexture(skin: string, opts: { freckles: boolean; female: boolean; beard: boolean; hair: string }) {
  return make(`skin|${skin}|${opts.freckles}|${opts.female}|${opts.beard}|${opts.hair}`, 1024, 512, (g, w, h) => {
    g.fillStyle = skin
    g.fillRect(0, 0, w, h)
    const r = rng(7)
    // variação sutil de tom
    for (let i = 0; i < 2200; i++) {
      g.fillStyle = r() > 0.5 ? hexShade(skin, 0.03) : hexShade(skin, -0.035)
      g.globalAlpha = 0.18
      g.beginPath()
      g.arc(r() * w, r() * h, 2 + r() * 6, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 1
    const P = (x: number, y: number) => sph(x, y, w, h)
    // bochechas rosadas e sombra sob os olhos
    for (const s of [-1, 1]) {
      const [cx, cy] = P(0.4 * s, -0.12)
      blob(g, cx, cy, 36, 22, '#d46a5c', opts.female ? 0.2 : 0.12)
      const [ex, ey] = P(0.3 * s, 0.03)
      blob(g, ex, ey, 18, 6, hexShade(skin, -0.1), 0.25)
    }
    // barba rala (sombra)
    if (opts.beard) {
      for (let i = 0; i < 2600; i++) {
        const x = (r() - 0.5) * 1.5
        const y = -0.2 - r() * 0.75
        if (Math.abs(x) < 0.17 && y > -0.5 && y < -0.33) continue
        const [px, py] = P(Math.max(-0.95, Math.min(0.95, x)), y)
        g.fillStyle = opts.hair
        g.globalAlpha = 0.22
        g.fillRect(px, py, 1.4, 2.2)
      }
      g.globalAlpha = 1
    }
    // lábios
    const lip = new THREE.Color(skin).lerp(new THREE.Color(opts.female ? '#b45a5a' : '#9a5a4a'), opts.female ? 0.5 : 0.35)
    const lipHex = `#${lip.getHexString()}`
    const [ux, uy] = P(0, -0.385)
    blob(g, ux, uy, 26, 7, lipHex, 0.95)
    const [lx, ly] = P(0, -0.45)
    blob(g, lx, ly, 24, 9, hexShade(lipHex, 0.04), 0.95)
    const [mx, my] = P(0, -0.415)
    g.strokeStyle = hexShade(lipHex, -0.25)
    g.lineWidth = 2
    g.globalAlpha = 0.85
    g.beginPath()
    g.moveTo(mx - 24, my + 1)
    g.quadraticCurveTo(mx, my - 2, mx + 24, my + 1)
    g.stroke()
    g.globalAlpha = 1
    // narinas
    for (const s of [-1, 1]) {
      const [nx, ny] = P(0.07 * s, -0.235)
      blob(g, nx, ny, 5, 3, hexShade(skin, -0.3), 0.7)
    }
    if (opts.freckles) {
      for (let i = 0; i < 90; i++) {
        const x = (r() - 0.5) * 0.85
        const y = -0.02 - r() * 0.26
        const [fx, fy] = P(x, y)
        g.fillStyle = hexShade(skin, -0.2)
        g.globalAlpha = 0.45 + r() * 0.3
        g.beginPath()
        g.arc(fx, fy, 1.2 + r() * 1.3, 0, Math.PI * 2)
        g.fill()
      }
      g.globalAlpha = 1
    }
  })
}

export function eyeTexture(iris: string) {
  return make(`eye|${iris}`, 256, 128, (g, w, h) => {
    g.fillStyle = '#f4efe8'
    g.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2
    const grd = g.createRadialGradient(cx, cy, 2, cx, cy, 20)
    grd.addColorStop(0, hexShade(iris, -0.1))
    grd.addColorStop(0.55, iris)
    grd.addColorStop(0.92, hexShade(iris, -0.18))
    grd.addColorStop(1, '#1d1410')
    g.fillStyle = grd
    g.beginPath()
    g.arc(cx, cy, 20, 0, Math.PI * 2)
    g.fill()
    const r = rng(3)
    g.strokeStyle = hexShade(iris, 0.18)
    g.globalAlpha = 0.5
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2
      g.beginPath()
      g.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8)
      g.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18)
      g.stroke()
    }
    g.globalAlpha = 1
    g.fillStyle = '#0b0807'
    g.beginPath()
    g.arc(cx, cy, 7.5, 0, Math.PI * 2)
    g.fill()
  })
}

/** Tecido com fibras, listras e barra opcional. A barra fica na base (bainha) e, se `edges`, nas laterais. */
export function fabricTexture(color: string, opts: { stripes?: string; trim?: string; edges?: boolean; seed?: number } = {}) {
  return make(`fab|${color}|${opts.stripes}|${opts.trim}|${opts.edges}`, 512, 512, (g, w, h) => {
    g.fillStyle = color
    g.fillRect(0, 0, w, h)
    const r = rng(opts.seed ?? 11)
    for (let i = 0; i < 5000; i++) {
      const x = r() * w, y = r() * h
      g.strokeStyle = r() > 0.5 ? hexShade(color, 0.05) : hexShade(color, -0.06)
      g.globalAlpha = 0.12
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + (r() - 0.5) * 3, y + 4 + r() * 10)
      g.stroke()
    }
    g.globalAlpha = 1
    if (opts.stripes) {
      g.fillStyle = opts.stripes
      for (let x = 18; x < w; x += 64) {
        g.fillRect(x, 0, 10, h)
        g.fillRect(x + 16, 0, 3, h)
      }
    }
    if (opts.trim) {
      g.fillStyle = opts.trim
      g.fillRect(0, h - 26, w, 14)
      g.fillRect(0, h - 8, w, 4)
      g.fillStyle = hexShade(opts.trim, -0.2)
      for (let x = 0; x < w; x += 16) g.fillRect(x + 4, h - 22, 6, 6)
      if (opts.edges) {
        g.fillStyle = opts.trim
        g.fillRect(0, 0, 14, h)
        g.fillRect(w - 14, 0, 14, h)
      }
    }
  })
}

/** Trama do tecido (relevo), repetida sobre a peça. */
export function weaveBump() {
  return make('weave', 128, 128, (g, w, h) => {
    g.fillStyle = '#808080'
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const on = ((x + y) / 4) % 2 === 0
        g.fillStyle = on ? '#9a9a9a' : '#6a6a6a'
        g.fillRect(x, y, 4, 2)
        g.fillStyle = on ? '#707070' : '#a0a0a0'
        g.fillRect(x, y + 2, 4, 2)
      }
    }
  }, false, [10, 10])
}

/** Fios de cabelo: listras verticais com reflexos. */
export function hairTexture(color: string) {
  return make(`hair|${color}`, 512, 512, (g, w, h) => {
    g.fillStyle = color
    g.fillRect(0, 0, w, h)
    const r = rng(5)
    for (let i = 0; i < 1400; i++) {
      const x = r() * w
      g.strokeStyle = r() > 0.6 ? hexShade(color, 0.08 + r() * 0.06) : hexShade(color, -0.07)
      g.globalAlpha = 0.3
      g.lineWidth = 1 + r() * 1.5
      g.beginPath()
      g.moveTo(x, 0)
      g.bezierCurveTo(x + (r() - 0.5) * 20, h * 0.33, x + (r() - 0.5) * 20, h * 0.66, x + (r() - 0.5) * 10, h)
      g.stroke()
    }
    g.globalAlpha = 1
  })
}

export function hairBump() {
  return make('hairbump', 256, 256, (g, w, h) => {
    g.fillStyle = '#808080'
    g.fillRect(0, 0, w, h)
    const r = rng(9)
    for (let i = 0; i < 700; i++) {
      const x = r() * w
      g.strokeStyle = r() > 0.5 ? '#b0b0b0' : '#505050'
      g.lineWidth = 1 + r() * 2
      g.beginPath()
      g.moveTo(x, 0)
      g.lineTo(x + (r() - 0.5) * 6, h)
      g.stroke()
    }
  }, false, [3, 1])
}

export function leatherTexture(color: string) {
  return make(`leather|${color}`, 256, 256, (g, w, h) => {
    g.fillStyle = color
    g.fillRect(0, 0, w, h)
    const r = rng(13)
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.5 ? hexShade(color, 0.06) : hexShade(color, -0.08)
      g.globalAlpha = 0.3
      g.beginPath()
      g.arc(r() * w, r() * h, 1 + r() * 5, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 1
  })
}

export function woodTexture() {
  return make('wood', 64, 512, (g, w, h) => {
    g.fillStyle = '#7a5530'
    g.fillRect(0, 0, w, h)
    const r = rng(17)
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = r() > 0.5 ? '#5c3d20' : '#8f6a40'
      g.globalAlpha = 0.6
      g.lineWidth = 1 + r() * 2
      const x = r() * w
      g.beginPath()
      g.moveTo(x, 0)
      g.bezierCurveTo(x + 4, h / 3, x - 4, (2 * h) / 3, x + 2, h)
      g.stroke()
    }
    g.globalAlpha = 1
  })
}

export function wickerTexture() {
  return make('wicker', 256, 128, (g, w, h) => {
    g.fillStyle = '#b48a4f'
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 16) {
        const off = (y / 8) % 2 ? 8 : 0
        g.fillStyle = '#d0a866'
        g.fillRect(x + off, y + 1, 12, 6)
        g.fillStyle = '#7d5a2c'
        g.fillRect(x + off + 12, y, 3, 8)
      }
    }
  })
}

/** Sombra de contato (disco com degradê) sob os pés. */
export function contactShadow() {
  return make('contact', 128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grd.addColorStop(0, 'rgba(0,0,0,0.55)')
    grd.addColorStop(0.55, 'rgba(0,0,0,0.25)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, w, h)
  })
}
