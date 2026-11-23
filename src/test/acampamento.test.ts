import { describe, expect, it } from 'vitest'
import { ELEMENTOS_ACAMPAMENTO, textoCondicao } from '../data/acampamento'
import { bausDisponiveis, conquistaRecente, elementosLiberados, formatarTempo, minutosAteAmanha, proximaMelhoria } from '../services/game/acampamento'
import { emptyProgress } from '../services/storage/repositories'
import { allChests } from '../services/game/journeyMap'
import { STORY_SEQUENCE } from '../data/story'
import { xpForLevel } from '../services/game/levels'

/* Central do acampamento (v0.10): regras puras ligadas ao progresso real. */

describe('acampamento evolutivo', () => {
  it('começa só com os elementos básicos e evolui com nível, fases, conquistas e baús', () => {
    const p = emptyProgress()
    expect(elementosLiberados(p)).toEqual(['tenda', 'fogueira', 'mesa', 'quadro', 'bau'])
    const q = emptyProgress()
    q.xp = xpForLevel(4)
    for (const e of STORY_SEQUENCE.slice(0, 3)) q.experiences[e.id] = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }
    q.achievements = { a: '2026-11-01', b: '2026-11-02', c: '2026-11-03' }
    const lib = elementosLiberados(q)
    for (const id of ['jarros', 'palmeiras', 'lanternas', 'tenda-grande']) expect(lib).toContain(id)
    expect(lib).not.toContain('estandarte')
    q.chests = { qualquer: '2026-11-03' }
    expect(elementosLiberados(q)).toContain('estandarte')
  })

  it('catálogo: ids únicos e toda condição tem texto', () => {
    const ids = ELEMENTOS_ACAMPAMENTO.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of ELEMENTOS_ACAMPAMENTO) expect(textoCondicao(e.condicao).length).toBeGreaterThan(5)
  })

  it('próxima melhoria mostra o andamento real e some quando tudo está liberado', () => {
    const p = emptyProgress()
    const m = proximaMelhoria(p)!
    expect(m.elemento.id).toBe('jarros')
    expect(m).toMatchObject({ atual: 1, meta: 2 })
    const tudo = emptyProgress()
    tudo.xp = xpForLevel(20)
    for (const e of STORY_SEQUENCE) tudo.experiences[e.id] = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }
    tudo.achievements = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`a${i}`, '2026-11-01']))
    tudo.chests = { x: '2026-11-01' }
    expect(proximaMelhoria(tudo)).toBeNull()
  })

  it('baús prontos e conquista recente vêm do progresso', () => {
    const p = emptyProgress()
    expect(bausDisponiveis(p)).toBe(0)
    const bau = allChests()[0]
    for (const e of STORY_SEQUENCE) {
      p.experiences[e.id] = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }
      if (e.id === bau.afterExperienceId) break
    }
    expect(bausDisponiveis(p)).toBe(1)
    p.chests[bau.id] = '2026-11-01'
    expect(bausDisponiveis(p)).toBe(0)
    expect(conquistaRecente(p)).toBeNull()
    p.achievements = { 'primeiro-passo': '2026-11-10T10:00:00Z', 'sem-erros': '2026-11-12T10:00:00Z' }
    expect(conquistaRecente(p)?.id).toBe('sem-erros')
  })

  it('contagem até o próximo desafio diário', () => {
    expect(minutosAteAmanha(new Date(2026, 10, 13, 22, 30))).toBe(90)
    expect(formatarTempo(90)).toBe('1h 30min')
    expect(formatarTempo(5)).toBe('5min')
  })
})
