import type { Settings } from '../types'

/*
 * QUALIDADE GRÁFICA (sem importar o Three.js)
 * - 2d: sem WebGL disponível, ou escolhido pelo jogador;
 * - leve: aparelhos com poucos núcleos ou pouca memória;
 * - alta: o restante.
 */

export type Quality = 'alta' | 'leve' | '2d'

export const QUALITY_LABEL: Record<Quality, string> = { alta: '3D em alta qualidade', leve: '3D leve', '2d': 'personagem em 2D' }

let webgl: boolean | null = null

export function webglAvailable(): boolean {
  if (webgl !== null) return webgl
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || /jsdom/i.test(navigator.userAgent)) return (webgl = false)
  try {
    const c = document.createElement('canvas')
    webgl = Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webgl = false
  }
  return webgl
}

export function resolveQuality(setting: Settings['graphics'] | undefined): Quality {
  if (setting === '2d' || !webglAvailable()) return '2d'
  if (setting === 'alta' || setting === 'leve') return setting
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3
  return weak ? 'leve' : 'alta'
}
