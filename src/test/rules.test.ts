import { describe, expect, it } from 'vitest'
import type { AnswerResult, Difficulty } from '../types'
import { chapterXp, FIRST_CLEAR_BONUS, summarizeMatch } from '../services/game/scoring'
import { levelFromXp, levelProgress, xpForLevel } from '../services/game/levels'
import { updateStreak, visibleStreak } from '../services/game/streak'
import { isChapterUnlocked, isJourneyUnlocked, journeyMedal, nextChapter } from '../services/game/unlock'
import { emptyProgress } from '../services/storage/repositories'
import { checkAnswer } from '../services/game/answers'
import { getQuestion } from '../data/questions'
import { JOURNEYS } from '../data/journeys'
import { dailyQuestions } from '../services/game/daily'
import { daysBetween } from '../services/game/dates'

const r = (correct: boolean, difficulty: Difficulty = 1): AnswerResult => ({ questionId: 'x', type: 'multiple', correct, difficulty, quality: correct ? 1 : 0 })

describe('pontuação', () => {
  it('soma pontos por dificuldade e bônus de constância a partir do 3º acerto seguido', () => {
    const s = summarizeMatch([r(true, 1), r(true, 2), r(true, 3)], 3)
    expect(s.score).toBe(10 + 15 + 20 + 5)
    expect(s.stars).toBe(3)
    expect(s.passed).toBe(true)
    expect(s.bestCombo).toBe(3)
  })

  it('erro zera a sequência e consome tentativa', () => {
    const s = summarizeMatch([r(true), r(true), r(false), r(true), r(true)], 5)
    expect(s.score).toBe(40)
    expect(s.livesLeft).toBe(2)
    expect(s.stars).toBe(2)
  })

  it('reprova abaixo de 60% ou sem tentativas', () => {
    expect(summarizeMatch([r(true), r(false), r(false), r(true), r(true)], 5).passed).toBe(true) // 60%
    expect(summarizeMatch([r(true), r(false), r(false), r(true), r(false)], 5).passed).toBe(false)
    const noLives = summarizeMatch([r(false), r(false), r(false)], 6)
    expect(noLives.livesLeft).toBe(0)
    expect(noLives.passed).toBe(false)
    expect(noLives.stars).toBe(0)
  })

  it('a pontuação não depende de tempo (mesmas respostas, mesmo resultado)', () => {
    const a = summarizeMatch([r(true), r(false), r(true)], 3)
    const b = summarizeMatch([r(true), r(false), r(true)], 3)
    expect(a).toEqual(b)
  })

  it('XP: bônus na primeira conclusão, metade ao repetir, um quarto ao reprovar', () => {
    const pass = summarizeMatch([r(true), r(true), r(true), r(true), r(true)], 5)
    expect(chapterXp(pass, false)).toBe(pass.score + FIRST_CLEAR_BONUS)
    expect(chapterXp(pass, true)).toBe(Math.round(pass.score * 0.5))
    const fail = summarizeMatch([r(true), r(false), r(false), r(false)], 5)
    expect(chapterXp(fail, false)).toBe(Math.round(fail.score * 0.25))
  })
})

describe('níveis', () => {
  it('limiares crescentes', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(99)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(1000)).toBe(5)
    expect(levelProgress(150)).toMatchObject({ level: 2, current: 50, needed: 200 })
  })
})

describe('sequência diária', () => {
  it('soma dias consecutivos, mantém no mesmo dia e reinicia após falha', () => {
    let s = updateStreak({ current: 0, best: 0, lastDay: null }, '2026-11-01')
    expect(s).toEqual({ current: 1, best: 1, lastDay: '2026-11-01' })
    s = updateStreak(s, '2026-11-01')
    expect(s.current).toBe(1)
    s = updateStreak(s, '2026-11-02')
    s = updateStreak(s, '2026-11-03')
    expect(s.current).toBe(3)
    s = updateStreak(s, '2026-11-06')
    expect(s).toEqual({ current: 1, best: 3, lastDay: '2026-11-06' })
  })

  it('atravessa viradas de mês e ano', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(updateStreak({ current: 4, best: 4, lastDay: '2026-02-28' }, '2026-03-01').current).toBe(5)
  })

  it('exibe zero se o jogador ficou mais de um dia sem jogar', () => {
    const s = { current: 5, best: 5, lastDay: '2026-11-01' }
    expect(visibleStreak(s, '2026-11-02')).toBe(5)
    expect(visibleStreak(s, '2026-11-04')).toBe(0)
  })
})

describe('desbloqueio', () => {
  it('somente o primeiro capítulo da primeira jornada começa liberado', () => {
    const p = emptyProgress()
    expect(isChapterUnlocked('criacao-1', p)).toBe(true)
    expect(isChapterUnlocked('criacao-2', p)).toBe(false)
    expect(isJourneyUnlocked('noe', p)).toBe(false)
    expect(isChapterUnlocked('noe-1', p)).toBe(false)
    expect(nextChapter(p)?.id).toBe('criacao-1')
  })

  it('libera o capítulo seguinte e a próxima jornada ao concluir', () => {
    const p = emptyProgress()
    const done = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }
    p.chapters['criacao-1'] = done
    expect(isChapterUnlocked('criacao-2', p)).toBe(true)
    for (const c of JOURNEYS[0].chapters) p.chapters[c.id] = done
    expect(isJourneyUnlocked('noe', p)).toBe(true)
    expect(isChapterUnlocked('noe-1', p)).toBe(true)
    expect(isChapterUnlocked('noe-2', p)).toBe(false)
    expect(journeyMedal('criacao', p)).toBe('ouro')
    expect(nextChapter(p)?.id).toBe('noe-1')
  })

  it('capítulo tentado e reprovado não libera o próximo', () => {
    const p = emptyProgress()
    p.chapters['criacao-1'] = { completed: false, bestStars: 0, bestScore: 10, attempts: 2 }
    expect(isChapterUnlocked('criacao-2', p)).toBe(false)
  })

  it('medalhas por estrelas', () => {
    const p = emptyProgress()
    JOURNEYS[0].chapters.forEach((c, i) => (p.chapters[c.id] = { completed: true, bestStars: i === 0 ? 1 : 2, bestScore: 0, attempts: 1 }))
    expect(journeyMedal('criacao', p)).toBe('bronze') // 7/12
    JOURNEYS[0].chapters.forEach((c) => (p.chapters[c.id].bestStars = 2))
    expect(journeyMedal('criacao', p)).toBe('prata')
  })
})

describe('verificação de respostas', () => {
  it('múltipla escolha, verdadeiro/falso, ordem e memória', () => {
    const mc = getQuestion('cr-02')!
    expect(checkAnswer(mc, { kind: 'choice', option: 'terra' }).correct).toBe(true)
    expect(checkAnswer(mc, { kind: 'choice', option: 'luz' }).correct).toBe(false)
    const tf = getQuestion('no-08')!
    expect(checkAnswer(tf, { kind: 'bool', value: false }).correct).toBe(true)
    const ord = getQuestion('cr-07')!
    if (ord.type !== 'order') throw new Error('tipo')
    expect(checkAnswer(ord, { kind: 'order', items: ord.items }).correct).toBe(true)
    const swapped = [...ord.items]
    ;[swapped[0], swapped[1]] = [swapped[1], swapped[0]]
    const res = checkAnswer(ord, { kind: 'order', items: swapped })
    expect(res.correct).toBe(false)
    expect(res.quality).toBeCloseTo((ord.items.length - 2) / ord.items.length)
    const mem = getQuestion('cr-11')!
    expect(checkAnswer(mem, { kind: 'memory', mistakes: 2 }).correct).toBe(true)
    expect(checkAnswer(mem, { kind: 'memory', mistakes: 3 }).correct).toBe(false)
  })
})

describe('desafio diário', () => {
  it('é determinístico por dia e muda entre dias', () => {
    const a = dailyQuestions('2026-11-11').map((q) => q.id)
    expect(a).toEqual(dailyQuestions('2026-11-11').map((q) => q.id))
    expect(a).toHaveLength(5)
    expect(new Set(a).size).toBe(5)
    expect(a).not.toEqual(dailyQuestions('2026-11-12').map((q) => q.id))
  })
})
