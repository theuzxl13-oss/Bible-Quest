import { describe, expect, it } from 'vitest'
import type { AnswerResult, CharacterConfig, Progress } from '../types'
import { ITEMS, getItem } from '../data/character/items'
import { BASES, newAppearance } from '../data/character/bases'
import { QUIZ_NODES, QUIZ_REGIONS } from '../data/quiz/regions'
import { QUESTIONS } from '../data/questions'
import { equipItem, isItemUnlocked, meetsRequirement, syncUnlockedItems, unequipItem } from '../services/game/items'
import { isQuizNodeUnlocked, isQuizRegionUnlocked, quizAvatarNode, quizNodeState } from '../services/game/quizMap'
import { applyMatch } from '../services/game/engine'
import { summarizeMatch } from '../services/game/scoring'
import { filteredPool } from '../services/game/freeModes'
import { emptyProgress, migrateCharacter, migrateProgress } from '../services/storage/repositories'
import { MemoryStore } from '../services/storage/keyValueStore'
import { STORAGE_PREFIX } from '../services/storage/repositories'
import { createLocalServices } from '../services'
import { QUIZ_MIN_QUESTIONS } from '../pages/quiz/QuizChallenge'

const done = (p: Progress, ids: string[]): Progress => ({
  ...p,
  quiz: { nodes: Object.fromEntries(ids.map((id) => [id, { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }])) },
})

describe('itens do personagem', () => {
  it('ids únicos, todas as bases usam apenas itens iniciais e existentes', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length)
    for (const b of BASES) {
      const a = newAppearance(b.id, 'Ana')
      const ids = [a.equipped.tunica, a.equipped.manto, a.equipped.calcado, a.equipped.cinto, ...a.equipped.acessorios].filter(Boolean) as string[]
      for (const id of ids) expect(getItem(id)?.unlock.kind, `${b.id}: ${id}`).toBe('inicial')
    }
  })

  it('itens bloqueados exigem progresso real e nunca dinheiro', () => {
    const p = emptyProgress()
    const locked = ITEMS.filter((i) => i.unlock.kind !== 'inicial')
    expect(locked.length).toBeGreaterThan(10)
    for (const i of locked) expect(isItemUnlocked(i, p), i.id).toBe(false)
    expect(meetsRequirement({ kind: 'nivel', value: 2 }, { ...p, xp: 100000 })).toBe(true)
  })

  it('desbloqueio registra o item uma vez e o marca para a tela de recompensa', () => {
    const p = { ...emptyProgress(), xp: 100000 }
    const first = syncUnlockedItems(p)
    expect(first.newItems).toContain('manto-azul')
    expect(first.progress.items.unseen).toContain('manto-azul')
    const again = syncUnlockedItems(first.progress)
    expect(again.newItems).toEqual([])
  })

  it('equipar respeita o encaixe; túnica e calçado não podem ser retirados', () => {
    const a = newAppearance('viajante', 'Ana')
    const b = equipItem(a, 'manto-azul')
    expect(b.equipped.manto).toBe('manto-azul')
    expect(unequipItem(b, 'manto-azul').equipped.manto).toBeNull()
    expect(unequipItem(b, b.equipped.tunica).equipped.tunica).toBe(b.equipped.tunica)
    const hands = ITEMS.filter((i) => i.slot === 'acessorio' && i.place === 'mao').map((i) => i.id)
    const c = equipItem(equipItem(a, hands[0]), hands[1])
    expect(c.equipped.acessorios.filter((id) => hands.includes(id))).toEqual([hands[1]])
  })
})

describe('migração sem perder progresso', () => {
  it('personagem da v0.3 vira aparência por itens, preservando pele, cabelo e acessório', () => {
    const old: CharacterConfig = { name: 'Davi', archetype: 'pastora', skin: 3, hair: 'tranca', hairColor: 2, outfit: 'manto', outfitColor: 0, accessory: 'cajado' }
    const m = migrateCharacter(old)
    expect(m).toMatchObject({ version: 2, name: 'Davi', base: 'pastora', skin: 3, hairStyle: 'tranca', hairColor: 2 })
    expect(m.equipped).toMatchObject({ manto: 'manto-marrom', acessorios: ['cajado'] })
    expect(migrateCharacter(m)).toBe(m)
  })

  it('perfil e progresso antigos são carregados com o personagem e o XP intactos', () => {
    const store = new MemoryStore()
    const s = createLocalServices(store)
    const p = s.auth.createLocalProfile({ nickname: 'Davi', avatar: 'lamp', ageRange: '18mais' })
    const old: CharacterConfig = { name: 'Davi', archetype: 'viajante', skin: 1, hair: 'curto', hairColor: 1, outfit: 'viagem', outfitColor: 0, accessory: 'bolsa' }
    store.set(`${STORAGE_PREFIX}profile`, JSON.stringify({ ...p, character: old }))
    const legacy = { ...emptyProgress(), xp: 420 } as Partial<Progress>
    delete legacy.items
    delete legacy.quiz
    store.set(`${STORAGE_PREFIX}progress`, JSON.stringify(legacy))
    const again = createLocalServices(store)
    expect(again.auth.current()?.character).toMatchObject({ version: 2, name: 'Davi', equipped: { cinto: 'cinto-couro', acessorios: ['bolsa'] } })
    const prog = again.progress.load()
    expect(prog.xp).toBe(420)
    expect(prog.items).toEqual({ unlocked: {}, unseen: [] })
    expect(prog.quiz).toEqual({ nodes: {} })
    expect(migrateProgress(prog)).toEqual(prog)
  })
})

describe('mapa do Modo Quiz', () => {
  it('começa no primeiro desafio do vale; o resto está bloqueado', () => {
    const p = emptyProgress()
    expect(quizAvatarNode(p).id).toBe('vale-1')
    expect(quizNodeState('vale-2', p)).toBe('bloqueado')
    expect(isQuizRegionUnlocked('planicie', p)).toBe(false)
  })

  it('a região seguinte abre só com todos os desafios da anterior concluídos', () => {
    const vale = QUIZ_REGIONS[0].nodes.map((n) => n.id)
    const quase = done(emptyProgress(), vale.slice(0, -1))
    expect(isQuizRegionUnlocked('planicie', quase)).toBe(false)
    const tudo = done(emptyProgress(), vale)
    expect(isQuizRegionUnlocked('planicie', tudo)).toBe(true)
    expect(isQuizNodeUnlocked('planicie-1', tudo)).toBe(true)
    expect(isQuizNodeUnlocked('planicie-2', tudo)).toBe(false)
    // concluir a região libera o item da região
    expect(syncUnlockedItems(tudo).newItems).toContain('manto-viajante')
  })

  it('cada desafio tem perguntas suficientes no banco oficial', () => {
    for (const n of QUIZ_NODES) {
      const n2 = filteredPool(n.mode, QUESTIONS, { level: n.level, characterId: n.characterId, themeId: n.themeId }).length
      expect(n2, n.id).toBeGreaterThanOrEqual(QUIZ_MIN_QUESTIONS)
    }
  })

  it('primeira conclusão rende bônus; repetir conta como treino com limite', () => {
    const results: AnswerResult[] = Array.from({ length: 6 }, (_, i) => ({ questionId: `q${i}`, type: 'truefalse', correct: true, difficulty: 1, quality: 1, points: 10 }))
    const summary = summarizeMatch(results, 6)
    const input = { mode: 'quiz' as const, title: 'Vale', freeMode: 'verdadeiro-falso' as const, quizNodeId: 'vale-1', results, summary }
    const first = applyMatch(emptyProgress(), input, '2026-11-11')
    expect(first.xpGained).toBe(summary.score + 30)
    expect(first.progress.quiz.nodes['vale-1'].completed).toBe(true)
    const second = applyMatch(first.progress, input, '2026-11-11')
    expect(second.xpGained).toBeLessThan(first.xpGained)
    expect(second.firstClear).toBe(false)
  })
})
