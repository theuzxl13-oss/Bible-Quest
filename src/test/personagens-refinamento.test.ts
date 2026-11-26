import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { arquivoLeve } from '../character3d/heroi'

/*
 * Reformulação visual, entrega 1 (personagens) — rodada de refinamento.
 * Confere nos GLB publicados: a variante do modo leve (mesmas peças, esqueleto, animações e
 * expressões, com menos triângulos e o corpo/rosto intactos), a túnica nova (peças com a mesma
 * textura de linho, malha regular), a barba cheia claramente maior que a curta e as sobrancelhas
 * marcantes com formato próprio.
 */

interface Gltf {
  meshes: { name?: string; primitives: { attributes: Record<string, number>; indices: number; material?: number }[]; extras?: { targetNames?: string[] } }[]
  materials: { name: string; pbrMetallicRoughness?: { baseColorTexture?: { index: number } } }[]
  accessors: { count: number; min?: number[]; max?: number[] }[]
  textures: { source?: number; extensions?: Record<string, { source: number }> }[]
  images: unknown[]
  animations: { name: string }[]
  skins: { joints: number[] }[]
  scenes: { extras?: { estilo?: string } }[]
}

function ler(f: string): Gltf {
  const b = readFileSync(f)
  const n = b.readUInt32LE(12)
  return JSON.parse(b.subarray(20, 20 + n).toString('utf8'))
}

/** triângulos por peça (nome depois de "__" no material) */
function trisPorPeca(j: Gltf) {
  const out: Record<string, number> = {}
  for (const m of j.meshes) {
    for (const p of m.primitives) {
      const nome = p.material !== undefined ? j.materials[p.material].name.split('__')[1] : '?'
      out[nome] = (out[nome] ?? 0) + j.accessors[p.indices].count / 3
    }
  }
  return out
}

/** caixa (min, max) da posição de uma peça, no espaço quantizado comum do arquivo */
function caixa(j: Gltf, peca: string) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const m of j.meshes) {
    for (const p of m.primitives) {
      if (p.material === undefined || j.materials[p.material].name.split('__')[1] !== peca) continue
      const a = j.accessors[p.attributes.POSITION]
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], a.min![k])
        max[k] = Math.max(max[k], a.max![k])
      }
    }
  }
  return { min, max, tam: max.map((v, k) => v - min[k]) }
}

const CORPOS = ['masculino', 'feminino'] as const

describe('personagens: rodada de refinamento', () => {
  it('o modo leve usa a variante "-leve" do mesmo modelo', () => {
    expect(arquivoLeve('masculino')).toBe('masculino-leve')
    expect(arquivoLeve('feminino')).toBe('feminino-leve')
  })

  for (const corpo of CORPOS) {
    it(`${corpo}: a variante leve tem as mesmas peças, esqueleto, animações e expressões, com menos triângulos`, () => {
      const fa = `public/models/personagem/heroi-${corpo}.glb`
      const fl = `public/models/personagem/heroi-${arquivoLeve(corpo)}.glb`
      expect(existsSync(fl), fl).toBe(true)
      const a = ler(fa)
      const l = ler(fl)
      const pa = trisPorPeca(a)
      const pl = trisPorPeca(l)
      expect(Object.keys(pl).sort()).toEqual(Object.keys(pa).sort())
      expect(l.scenes[0].extras?.estilo).toBe('modular')
      expect(l.animations.map((x) => x.name)).toEqual(a.animations.map((x) => x.name))
      expect(l.skins[0].joints.length).toBe(a.skins[0].joints.length)
      const morph = (j: Gltf) => j.meshes.flatMap((m) => m.extras?.targetNames ?? []).sort()
      expect(morph(l)).toEqual(morph(a))
      // corpo e rosto intactos; cabelos e roupas mais leves
      expect(pl.Corpo).toBe(pa.Corpo)
      for (const p of ['Tunica_cima', 'Tunica_saia', 'Cabelo_longo', 'Cabelo_curto']) expect(pl[p], p).toBeLessThan(pa[p] * 0.7)
      const total = (x: Record<string, number>) => Object.values(x).reduce((s, v) => s + v, 0)
      expect(total(pl)).toBeLessThan(total(pa) * 0.75)
      // o arquivo leve é menor
      expect(readFileSync(fl).length).toBeLessThan(readFileSync(fa).length)
    })

    it(`${corpo}: a túnica nova é uma peça de linho só, com a mesma textura em cima e nas saias`, () => {
      const j = ler(`public/models/personagem/heroi-${corpo}.glb`)
      const tex = (peca: string) => {
        const m = j.materials.find((x) => x.name === `Tunica__${peca}`)
        expect(m, peca).toBeTruthy()
        const t = j.textures[m!.pbrMetallicRoughness!.baseColorTexture!.index]
        return t.source ?? Object.values(t.extensions ?? {})[0]?.source
      }
      const fonte = tex('Tunica_cima')
      expect(fonte).toBeTypeOf('number')
      expect(tex('Tunica_saia')).toBe(fonte)
      expect(tex('Tunica_saia_curta')).toBe(fonte)
      // malha regular, sem a redução que deformava a primeira versão: orçamento folgado mas limitado
      const t = trisPorPeca(j)
      expect(t.Tunica_cima).toBeGreaterThan(4000)
      expect(t.Tunica_cima).toBeLessThan(12000)
      // a saia longa desce mais que a curta; as duas começam na cintura
      const longa = caixa(j, 'Tunica_saia')
      const curta = caixa(j, 'Tunica_saia_curta')
      expect(longa.tam[1]).toBeGreaterThan(curta.tam[1] * 1.5)
      expect(Math.abs(longa.max[1] - curta.max[1])).toBeLessThan(longa.tam[1] * 0.02)
    })

    it(`${corpo}: sobrancelhas marcantes têm formato próprio (mais longas que as suaves)`, () => {
      const j = ler(`public/models/personagem/heroi-${corpo}.glb`)
      const suave = caixa(j, 'Sobrancelhas')
      const marc = caixa(j, 'Sobrancelhas_marcantes')
      expect(marc.tam[0]).toBeGreaterThan(suave.tam[0] * 1.03)
      expect(marc.tam[1]).toBeGreaterThan(suave.tam[1])
    })
  }

  it('masculino: a barba cheia tem volume e comprimento claramente maiores que a curta', () => {
    const j = ler('public/models/personagem/heroi-masculino.glb')
    const curta = caixa(j, 'Barba_curta')
    const cheia = caixa(j, 'Barba_cheia')
    // desce bem abaixo do queixo (y para cima no glTF) e projeta mais para a frente
    expect(cheia.tam[1]).toBeGreaterThan(curta.tam[1] * 1.2)
    expect(cheia.min[1]).toBeLessThan(curta.min[1] - curta.tam[1] * 0.15)
    expect(cheia.tam[2]).toBeGreaterThan(curta.tam[2] * 1.1)
  })
})

describe('expressões do modelo modular', () => {
  it('intensidades sem exagero: cada expressão usa a sua forma, no máximo 1,3', async () => {
    const { EXPRESSAO_BASE } = await import('../character3d/heroi')
    expect(EXPRESSAO_BASE.neutra).toEqual({})
    expect(Object.keys(EXPRESSAO_BASE.sorriso)).toEqual(['Sorriso'])
    expect(Object.keys(EXPRESSAO_BASE.alegria)).toEqual(['Alegria'])
    expect(Object.keys(EXPRESSAO_BASE.surpresa)).toEqual(['Surpresa'])
    for (const e of Object.values(EXPRESSAO_BASE)) for (const v of Object.values(e)) expect(v).toBeLessThanOrEqual(1.3)
  })
})
