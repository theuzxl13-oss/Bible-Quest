import { describe, expect, it } from 'vitest'
import type { AnswerResult } from '../types'
import { applyMatch } from '../services/game/engine'
import { summarizeMatch, DAILY_BONUS, FIRST_CLEAR_BONUS, PRACTICE_DAILY_CAP } from '../services/game/scoring'
import { emptyProgress, migrateProgress } from '../services/storage/repositories'

const ok = (n: number, extra: Partial<AnswerResult> = {}): AnswerResult[] =>
  Array.from({ length: n }, (_, i) => ({ questionId: `q${i}`, type: 'complete', correct: true, difficulty: 1, quality: 1, ...extra }))
const story = (results: AnswerResult[], total = results.length) => ({ mode: 'historia' as const, title: 'T', bookId: 'genesis', experienceId: 'gn-criacao', results, summary: summarizeMatch(results, total) })
const free = (results: AnswerResult[], mode: 'aleatorias' | 'quem-sou-eu' | 'contra-o-tempo' = 'aleatorias') => ({ mode: 'livre' as const, freeMode: mode, title: 'L', results, summary: summarizeMatch(results, results.length) })

describe('progressão única compartilhada pelos modos', () => {
  it('Modo História: primeira conclusão concede XP com bônus, estrelas, histórico e conquistas', () => {
    const out = applyMatch(emptyProgress(), story(ok(5)), '2026-11-11')
    expect(out.firstClear).toBe(true)
    expect(out.xpGained).toBe(out.record.score + FIRST_CLEAR_BONUS)
    expect(out.progress.experiences['gn-criacao']).toMatchObject({ completed: true, bestStars: 3, attempts: 1 })
    expect(out.progress.lastExperienceId).toBe('gn-criacao')
    expect(out.progress.history[0]).toMatchObject({ mode: 'historia', experienceId: 'gn-criacao' })
    expect(out.newAchievements).toEqual(expect.arrayContaining(['primeiro-passo', 'sem-erros']))
    expect(out.progress.streak).toEqual({ current: 1, best: 1, lastDay: '2026-11-11' })
  })

  it('XP do Modo História e do Modo Livre somam no mesmo total', () => {
    const a = applyMatch(emptyProgress(), story(ok(5)), '2026-11-11')
    const b = applyMatch(a.progress, free(ok(4)), '2026-11-11')
    expect(b.xpGained).toBe(b.record.score)
    expect(b.progress.xp).toBe(a.xpGained + b.xpGained)
    expect(b.progress.history.map((h) => h.mode)).toEqual(['livre', 'historia'])
    expect(b.progress.free.matches).toBe(1)
    expect(b.newAchievements).toContain('livre-1')
  })

  it('repetir experiência concluída sem melhorar não rende XP', () => {
    const first = applyMatch(emptyProgress(), story(ok(5)), '2026-11-11')
    const again = applyMatch(first.progress, story(ok(5)), '2026-11-11')
    expect(again.xpGained).toBe(0)
    expect(again.progress.experiences['gn-criacao'].attempts).toBe(2)
  })

  it('Modo Livre respeita o limite diário de XP de prática, que reinicia no dia seguinte', () => {
    let p = emptyProgress()
    let total = 0
    for (let i = 0; i < 20; i++) {
      const out = applyMatch(p, free(ok(10)), '2026-11-11')
      p = out.progress
      total += out.xpGained
    }
    expect(total).toBe(PRACTICE_DAILY_CAP)
    const capped = applyMatch(p, free(ok(10)), '2026-11-11')
    expect(capped.xpGained).toBe(0)
    expect(capped.xpCapped).toBeGreaterThan(0)
    const tomorrow = applyMatch(p, free(ok(10)), '2026-11-12')
    expect(tomorrow.xpGained).toBeGreaterThan(0)
  })

  it('reprovação no Modo História conta como XP de prática', () => {
    const results: AnswerResult[] = [true, false, false, false].map((c, i) => ({ questionId: `${i}`, type: 'multiple', correct: c, difficulty: 2, quality: 0 }))
    const out = applyMatch(emptyProgress(), story(results, 7), '2026-11-11')
    expect(out.progress.experiences['gn-criacao'].completed).toBe(false)
    expect(out.xpGained).toBe(Math.round(15 * 0.25))
    expect(out.progress.practice).toEqual({ day: '2026-11-11', xp: out.xpGained })
  })

  it('desafio diário concede a recompensa uma única vez por dia e registra o histórico', () => {
    const s = summarizeMatch(ok(5), 5)
    const a = applyMatch(emptyProgress(), { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-11')
    expect(a.xpGained).toBe(s.score + DAILY_BONUS)
    expect(a.progress.daily.log).toEqual([{ day: '2026-11-11', correct: 5, total: 5, xp: a.xpGained }])
    const b = applyMatch(a.progress, { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-11')
    expect(b.xpGained).toBe(0)
    expect(b.dailyAlreadyClaimed).toBe(true)
    expect(b.progress.daily.completedCount).toBe(1)
    const back = applyMatch(a.progress, { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-10')
    expect(back.xpGained).toBe(0)
    const c = applyMatch(b.progress, { mode: 'diario', title: 'D', results: ok(5), summary: s }, '2026-11-12')
    expect(c.xpGained).toBeGreaterThan(0)
    expect(c.progress.streak.current).toBe(2)
  })

  it('estatísticas do Modo Livre: recorde por modalidade, pistas e contra o tempo', () => {
    const a = applyMatch(emptyProgress(), free(ok(3, { type: 'whoami', cluesUsed: 1 }), 'quem-sou-eu'), '2026-11-11')
    expect(a.progress.free.oneClueHits).toBe(3)
    expect(a.newAchievements).toContain('detetive')
    const b = applyMatch(a.progress, free(ok(12), 'contra-o-tempo'), '2026-11-11')
    expect(b.progress.free.bestTimeAttack).toBe(12)
    expect(b.progress.free.byMode['contra-o-tempo']).toEqual({ played: 1, best: b.record.score })
    expect(b.newAchievements).toContain('relampago')
  })

  it('partida demonstrativa de multiplayer não concede XP nem conta sequência', () => {
    const out = applyMatch(emptyProgress(), { mode: 'demo-multiplayer', title: 'M', results: ok(5), summary: summarizeMatch(ok(5), 5) }, '2026-11-11')
    expect(out.xpGained).toBe(0)
    expect(out.progress.streak.lastDay).toBeNull()
  })

  it('não altera o objeto de progresso original', () => {
    const p = emptyProgress()
    applyMatch(p, story(ok(5)), '2026-11-11')
    expect(p).toEqual(emptyProgress())
  })
})

describe('migração da versão 0.1', () => {
  it('converte capítulos em experiências e preserva XP, histórico e conquistas', () => {
    const legacy = {
      xp: 280,
      chapters: {
        'criacao-1': { completed: true, bestStars: 3, bestScore: 75, attempts: 1 },
        'criacao-2': { completed: true, bestStars: 2, bestScore: 60, attempts: 2 },
      },
      achievements: { 'primeiro-passo': '2026-11-11T00:00:00Z' },
      history: [{ id: 'm1', date: '2026-11-11', mode: 'capitulo', chapterId: 'criacao-1', title: 'x', correct: 5, total: 5, score: 75, xp: 125, stars: 3, passed: true }],
      streak: { current: 1, best: 1, lastDay: '2026-11-11' },
      daily: { lastCompletedDay: null, completedCount: 0 },
      stats: { answered: 11, correct: 11, perfectChapters: 2, byType: {} },
    }
    const p = migrateProgress(legacy as never)
    expect(p.xp).toBe(280)
    expect(p.experiences['gn-criacao']).toEqual({ completed: true, bestStars: 3, bestScore: 75, attempts: 3 })
    expect(p.history[0]).toMatchObject({ mode: 'historia', experienceId: 'gn-criacao' })
    expect(p.stats.perfectExperiences).toBe(2)
    expect(p.daily.log).toEqual([])
    expect(p.free.matches).toBe(0)
    expect(p.achievements['primeiro-passo']).toBeTruthy()
  })
})
