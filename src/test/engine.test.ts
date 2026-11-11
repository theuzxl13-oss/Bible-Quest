import { describe, expect, it } from 'vitest'
import type { AnswerResult } from '../types'
import { applyMatch } from '../services/game/engine'
import { summarizeMatch, DAILY_BONUS, FIRST_CLEAR_BONUS } from '../services/game/scoring'
import { emptyProgress } from '../services/storage/repositories'

const ok = (n: number): AnswerResult[] =>
  Array.from({ length: n }, (_, i) => ({ questionId: `q${i}`, type: 'complete', correct: true, difficulty: 1, quality: 1 }))

describe('aplicação de partidas ao progresso', () => {
  it('primeira conclusão perfeita: XP com bônus, estrelas, histórico e conquistas', () => {
    const results = ok(5)
    const summary = summarizeMatch(results, 5)
    const out = applyMatch(emptyProgress(), { mode: 'capitulo', title: 'T', journeyId: 'criacao', chapterId: 'criacao-1', results, summary }, '2026-11-11')
    expect(out.firstClear).toBe(true)
    expect(out.xpGained).toBe(summary.score + FIRST_CLEAR_BONUS)
    expect(out.progress.xp).toBe(out.xpGained)
    expect(out.progress.chapters['criacao-1']).toMatchObject({ completed: true, bestStars: 3, attempts: 1 })
    expect(out.progress.history).toHaveLength(1)
    expect(out.progress.stats).toMatchObject({ answered: 5, correct: 5, perfectChapters: 1 })
    expect(out.progress.stats.byType.complete).toEqual({ answered: 5, correct: 5 })
    expect(out.newAchievements).toEqual(expect.arrayContaining(['primeiro-passo', 'sem-erros']))
    expect(out.progress.streak).toEqual({ current: 1, best: 1, lastDay: '2026-11-11' })
  })

  it('repetir capítulo concluído rende metade do XP e não regride estrelas', () => {
    const first = applyMatch(emptyProgress(), { mode: 'capitulo', title: 'T', chapterId: 'criacao-1', results: ok(5), summary: summarizeMatch(ok(5), 5) }, '2026-11-11')
    const weaker = [...ok(3), { questionId: 'z', type: 'multiple', correct: false, difficulty: 1, quality: 0 } as AnswerResult, ...ok(1)]
    const s2 = summarizeMatch(weaker, 5)
    const second = applyMatch(first.progress, { mode: 'capitulo', title: 'T', chapterId: 'criacao-1', results: weaker, summary: s2 }, '2026-11-11')
    expect(second.firstClear).toBe(false)
    expect(second.xpGained).toBe(Math.round(s2.score * 0.5))
    expect(second.progress.chapters['criacao-1'].bestStars).toBe(3)
    expect(second.progress.chapters['criacao-1'].attempts).toBe(2)
    expect(second.newAchievements).toEqual([])
  })

  it('reprovação não conclui o capítulo', () => {
    const results: AnswerResult[] = [false, false, false].map((c, i) => ({ questionId: `${i}`, type: 'multiple', correct: c, difficulty: 1, quality: 0 }))
    const out = applyMatch(emptyProgress(), { mode: 'capitulo', title: 'T', chapterId: 'criacao-1', results, summary: summarizeMatch(results, 5) }, '2026-11-11')
    expect(out.progress.chapters['criacao-1'].completed).toBe(false)
    expect(out.xpGained).toBe(0)
  })

  it('desafio diário concede bônus só uma vez por dia', () => {
    const s = summarizeMatch(ok(5), 5)
    const a = applyMatch(emptyProgress(), { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-11')
    expect(a.xpGained).toBe(s.score + DAILY_BONUS)
    expect(a.newAchievements).toContain('diario-1')
    const b = applyMatch(a.progress, { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-11')
    expect(b.xpGained).toBe(0)
    expect(b.progress.daily.completedCount).toBe(1)
    const c = applyMatch(b.progress, { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-12')
    expect(c.xpGained).toBeGreaterThan(0)
    expect(c.progress.streak.current).toBe(2)
  })

  it('partida demonstrativa de multiplayer não concede XP nem conta sequência', () => {
    const out = applyMatch(emptyProgress(), { mode: 'demo-multiplayer', title: 'M', results: ok(5), summary: summarizeMatch(ok(5), 5) }, '2026-11-11')
    expect(out.xpGained).toBe(0)
    expect(out.progress.streak.lastDay).toBeNull()
  })

  it('não altera o objeto de progresso original', () => {
    const p = emptyProgress()
    applyMatch(p, { mode: 'capitulo', title: 'T', chapterId: 'criacao-1', results: ok(5), summary: summarizeMatch(ok(5), 5) }, '2026-11-11')
    expect(p).toEqual(emptyProgress())
  })
})
