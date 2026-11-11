import { describe, expect, it } from 'vitest'
import type { AnswerResult, Difficulty } from '../types'
import { capPractice, FIRST_CLEAR_BONUS, PRACTICE_DAILY_CAP, storyXp, summarizeMatch, timeAttackPoints, whoamiPoints } from '../services/game/scoring'
import { levelFromXp, levelProgress, xpForLevel } from '../services/game/levels'
import { updateStreak, visibleStreak } from '../services/game/streak'
import { bookCompletion, bookMedal, bookStatus, continueExperience, isExperienceUnlocked, journeyCompletion, nextExperience, testamentCompletion } from '../services/game/progression'
import { STORY_SEQUENCE, experiencesOf } from '../data/story'
import { getBook } from '../data/bible/canon'
import { buildRound } from '../services/game/freeModes'
import { QUESTIONS } from '../data/questions'
import { canClaimDaily, LocalDailyService } from '../services/game/daily'
import { seededRandom } from '../services/game/random'
import { emptyProgress } from '../services/storage/repositories'
import { checkAnswer } from '../services/game/answers'
import { getQuestion } from '../data/questions'
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

  it('XP do Modo História: bônus só na primeira conclusão, repetição só pela melhora, reprovação vira prática', () => {
    const pass = summarizeMatch([r(true), r(true), r(true), r(true), r(true)], 5)
    expect(storyXp({ summary: pass, alreadyCompleted: false, previousBestScore: 0 })).toEqual({ story: pass.score + FIRST_CLEAR_BONUS, practice: 0 })
    expect(storyXp({ summary: pass, alreadyCompleted: true, previousBestScore: pass.score })).toEqual({ story: 0, practice: 0 })
    expect(storyXp({ summary: pass, alreadyCompleted: true, previousBestScore: pass.score - 15 })).toEqual({ story: 15, practice: 0 })
    const fail = summarizeMatch([r(true), r(false), r(false), r(false)], 5)
    expect(storyXp({ summary: fail, alreadyCompleted: false, previousBestScore: 0 })).toEqual({ story: 0, practice: Math.round(fail.score * 0.25) })
  })

  it('limite diário de XP de prática', () => {
    expect(capPractice(100, 0)).toBe(100)
    expect(capPractice(100, PRACTICE_DAILY_CAP - 30)).toBe(30)
    expect(capPractice(100, PRACTICE_DAILY_CAP)).toBe(0)
  })

  it('Quem sou eu? vale mais com menos pistas; Contra o tempo premia rapidez', () => {
    expect(whoamiPoints(1, 1, 3)).toBe(20)
    expect(whoamiPoints(1, 3, 3)).toBe(10)
    expect(timeAttackPoints(1, 3)).toBe(20)
    expect(timeAttackPoints(1, 6)).toBe(15)
    expect(timeAttackPoints(1, 12)).toBe(10)
  })

  it('pontos específicos por resposta entram na pontuação', () => {
    const s = summarizeMatch([{ ...r(true), points: 25 }], 1)
    expect(s.score).toBe(25)
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

const done = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }

describe('progressão do Modo História', () => {
  it('começa em Gênesis com só a primeira experiência liberada', () => {
    const p = emptyProgress()
    expect(isExperienceUnlocked('gn-criacao', p)).toBe(true)
    expect(isExperienceUnlocked('gn-homem-mulher', p)).toBe(false)
    expect(isExperienceUnlocked('ex-salvo', p)).toBe(false)
    expect(nextExperience(p)?.id).toBe('gn-criacao')
    expect(bookStatus(getBook('genesis')!, p)).toBe('disponivel')
    expect(bookStatus(getBook('exodo')!, p)).toBe('bloqueado')
    expect(bookStatus(getBook('levitico')!, p)).toBe('em-preparacao')
  })

  it('libera a próxima experiência e o próximo livro na ordem', () => {
    const p = emptyProgress()
    p.experiences['gn-criacao'] = done
    expect(isExperienceUnlocked('gn-homem-mulher', p)).toBe(true)
    expect(isExperienceUnlocked('gn-eden', p)).toBe(false)
    expect(bookStatus(getBook('genesis')!, p)).toBe('em-andamento')
    for (const e of experiencesOf('genesis')) p.experiences[e.id] = done
    expect(bookStatus(getBook('genesis')!, p)).toBe('concluido')
    expect(isExperienceUnlocked('ex-salvo', p)).toBe(true)
    expect(isExperienceUnlocked('ex-sarca', p)).toBe(false)
    expect(nextExperience(p)?.id).toBe('ex-salvo')
    expect(bookMedal('genesis', p)).toBe('ouro')
  })

  it('reprovação não libera e experiências concluídas continuam acessíveis', () => {
    const p = emptyProgress()
    p.experiences['gn-criacao'] = { completed: false, bestStars: 0, bestScore: 10, attempts: 2 }
    expect(isExperienceUnlocked('gn-homem-mulher', p)).toBe(false)
    // experiência concluída (ex.: migrada) continua acessível mesmo fora da ordem
    p.experiences['gn-queda'] = done
    expect(isExperienceUnlocked('gn-queda', p)).toBe(true)
  })

  it('porcentagens por livro, testamento e jornada (livros em preparação contam 0%)', () => {
    const p = emptyProgress()
    const gn = experiencesOf('genesis')
    for (const e of gn.slice(0, Math.floor(gn.length / 2))) p.experiences[e.id] = done
    const ratio = Math.floor(gn.length / 2) / gn.length
    expect(bookCompletion('genesis', p).ratio).toBeCloseTo(ratio)
    expect(testamentCompletion('AT', p)).toBeCloseTo(ratio / 39)
    expect(testamentCompletion('NT', p)).toBe(0)
    expect(journeyCompletion(p)).toBeCloseTo(ratio / 66)
  })

  it('continuar de onde parou: próxima pendente ou última aberta', () => {
    const p = emptyProgress()
    for (const e of STORY_SEQUENCE) p.experiences[e.id] = done
    p.lastExperienceId = 'gn-babel'
    expect(continueExperience(p)?.id).toBe('gn-babel')
    delete p.experiences['ex-sarca']
    expect(continueExperience(p)?.id).toBe('ex-sarca')
  })

  it('medalhas por estrelas', () => {
    const p = emptyProgress()
    experiencesOf('exodo').forEach((e, i) => (p.experiences[e.id] = { completed: true, bestStars: i === 0 ? 1 : 2, bestScore: 0, attempts: 1 }))
    expect(bookMedal('exodo', p)).toBe('bronze') // 7/12
    experiencesOf('exodo').forEach((e) => (p.experiences[e.id].bestStars = 2))
    expect(bookMedal('exodo', p)).toBe('prata')
  })
})

describe('Modo Livre: rodadas', () => {
  it('perguntas aleatórias: 10 de vários livros, dificuldade crescente', () => {
    const round = buildRound('aleatorias', QUESTIONS, seededRandom(1))
    expect(round).toHaveLength(10)
    expect(round.map((q) => q.difficulty)).toEqual([...round.map((q) => q.difficulty)].sort())
    expect(new Set(round.map((q) => q.id)).size).toBe(10)
  })

  it('cada modalidade só usa o tipo certo de pergunta', () => {
    expect(buildRound('verdadeiro-falso', QUESTIONS).every((q) => q.type === 'truefalse')).toBe(true)
    expect(buildRound('complete', QUESTIONS).every((q) => q.type === 'complete')).toBe(true)
    expect(buildRound('quem-sou-eu', QUESTIONS).every((q) => q.type === 'whoami')).toBe(true)
    expect(buildRound('ordem', QUESTIONS).every((q) => q.type === 'order')).toBe(true)
    expect(buildRound('livro', QUESTIONS).every((q) => q.type === 'book')).toBe(true)
  })
})

describe('desafio diário: uma recompensa por dia', () => {
  it('bloqueia no mesmo dia e se o relógio voltar', () => {
    const p = emptyProgress()
    expect(canClaimDaily(p, '2026-11-11')).toBe(true)
    p.daily.lastCompletedDay = '2026-11-11'
    expect(canClaimDaily(p, '2026-11-11')).toBe(false)
    expect(canClaimDaily(p, '2026-11-10')).toBe(false)
    expect(canClaimDaily(p, '2026-11-12')).toBe(true)
  })

  it('detecta relógio do aparelho anterior ao último registro', () => {
    const p = emptyProgress()
    p.daily.lastCompletedDay = '2026-11-11'
    expect(new LocalDailyService(() => new Date(2026, 10, 9)).context(p).clockSuspicious).toBe(true)
    expect(new LocalDailyService(() => new Date(2026, 10, 12)).context(p)).toEqual({ day: '2026-11-12', source: 'device', clockSuspicious: false })
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
    // 4 pares: até 4 erros (memória perfeita pode precisar de 3)
    expect(checkAnswer(mem, { kind: 'memory', mistakes: 3 }).correct).toBe(true)
    expect(checkAnswer(mem, { kind: 'memory', mistakes: 4 }).correct).toBe(true)
    expect(checkAnswer(mem, { kind: 'memory', mistakes: 5 }).correct).toBe(false)
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
