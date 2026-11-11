import { describe, expect, it } from 'vitest'
import type { AnswerResult } from '../types'
import { emptyProgress, migrateProgress } from '../services/storage/repositories'
import { starsFor, summarizeMatch } from '../services/game/scoring'
import { allChests, avatarPhaseId, chestState, openChest, phaseState, worldSections } from '../services/game/journeyMap'
import { unlockForExperience } from '../services/game/library'
import { masteredTopics, recordAnswers, reviewQuestions, weakTopics } from '../services/game/review'
import { applyMatch } from '../services/game/engine'
import { availableCharacters, availableThemes, buildRound, filteredPool } from '../services/game/freeModes'
import { checkAnswer } from '../services/game/answers'
import { getExperience, STORY_SEQUENCE, experiencesOf } from '../data/story'
import { QUESTIONS, questionsForExperience } from '../data/questions'

const done = { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }
const ans = (id: string, correct: boolean): AnswerResult => ({ questionId: id, type: 'multiple', correct, difficulty: 1, quality: correct ? 1 : 0 })

describe('estrelas', () => {
  it('1 estrela ao concluir, 2 com 70%, 3 com 90%', () => {
    expect(starsFor(0.5, false)).toBe(0)
    expect(starsFor(0.6, true)).toBe(1)
    expect(starsFor(0.69, true)).toBe(1)
    expect(starsFor(0.7, true)).toBe(2)
    expect(starsFor(0.89, true)).toBe(2)
    expect(starsFor(0.9, true)).toBe(3)
    // 9 de 10 = 90% → 3 estrelas; 7 de 10 → 2
    const r = (n: number) => Array.from({ length: 10 }, (_, i) => ans(`q${i}`, i < n))
    expect(summarizeMatch(r(9), 10, Infinity).stars).toBe(3)
    expect(summarizeMatch(r(7), 10, Infinity).stars).toBe(2)
    expect(summarizeMatch(r(6), 10, Infinity).stars).toBe(1)
    expect(summarizeMatch(r(5), 10, Infinity).stars).toBe(0)
  })
})

describe('mapa: mundos, fases e baús', () => {
  it('Gênesis e Êxodo viram mundos com fases numeradas em sequência e baús a cada 5 fases e no fim', () => {
    const sections = worldSections()
    expect(sections.map((s) => s.world.id)).toEqual(['mundo-genesis', 'mundo-exodo'])
    expect(sections[0].phases.map((p) => p.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(sections[1].phases[0].number).toBe(21)
    expect(sections[0].nodes.filter((n) => n.kind === 'chest')).toHaveLength(4)
    expect(sections[1].nodes.filter((n) => n.kind === 'chest')).toHaveLength(1)
  })

  it('estados das fases e posição do avatar acompanham o progresso', () => {
    const p = emptyProgress()
    expect(phaseState('gn-criacao', p)).toBe('atual')
    expect(phaseState('gn-homem-mulher', p)).toBe('bloqueada')
    expect(avatarPhaseId(p)).toBe('gn-criacao')
    p.experiences['gn-criacao'] = done
    expect(phaseState('gn-criacao', p)).toBe('concluida')
    expect(avatarPhaseId(p)).toBe('gn-homem-mulher')
    for (const e of STORY_SEQUENCE) p.experiences[e.id] = done
    expect(avatarPhaseId(p)).toBe(STORY_SEQUENCE.at(-1)!.id)
  })

  it('baú só abre depois da fase anterior e uma única vez', () => {
    const chest = allChests()[0]
    let p = emptyProgress()
    expect(chestState(chest, p)).toBe('fechado')
    expect(openChest(p, chest.id).xp).toBe(0)
    for (const e of experiencesOf('genesis').slice(0, 5)) p.experiences[e.id] = done
    expect(chestState(chest, p)).toBe('disponivel')
    const first = openChest(p, chest.id)
    expect(first.xp).toBe(chest.xp)
    p = first.progress
    expect(p.xp).toBe(chest.xp)
    expect(chestState(chest, p)).toBe('aberto')
    expect(openChest(p, chest.id).xp).toBe(0)
  })
})

describe('Biblioteca', () => {
  it('desbloqueia personagens e lugares da fase uma única vez', () => {
    const exp = getExperience('gn-chamado-abraao')!
    const a = unlockForExperience(emptyProgress(), exp)
    expect(a.newCharacters).toEqual(['abraao', 'sara', 'lo'])
    expect(a.newPlaces).toContain('ur')
    expect(a.progress.library.characters.abraao).toBeTruthy()
    const b = unlockForExperience(a.progress, exp)
    expect(b.newCharacters).toEqual([])
    expect(b.progress).toBe(a.progress)
  })
})

describe('revisão inteligente', () => {
  it('registra erros, aponta assuntos fracos e recomenda as perguntas erradas', () => {
    const qs = questionsForExperience('gn-noe')
    let review = recordAnswers({}, qs.map((q, i) => ans(q.id, i >= 3)))
    const p = { ...emptyProgress(), review }
    const weak = weakTopics(p, QUESTIONS)
    expect(weak[0].experienceId).toBe('gn-noe')
    expect(weak[0].pending).toBe(3)
    const rec = reviewQuestions(p, QUESTIONS, 8)
    expect(rec.map((q) => q.id).sort()).toEqual(qs.slice(0, 3).map((q) => q.id).sort())
    // depois de acertar tudo várias vezes, o assunto passa a ser dominado
    for (let k = 0; k < 6; k++) review = recordAnswers(review, qs.map((q) => ans(q.id, true)))
    const p2 = { ...emptyProgress(), review }
    expect(weakTopics(p2, QUESTIONS)).toEqual([])
    expect(masteredTopics(p2, QUESTIONS).map((t) => t.experienceId)).toContain('gn-noe')
  })

  it('o motor registra respostas e sequência de acertos; revisão rende XP de prática', () => {
    const results = Array.from({ length: 10 }, (_, i) => ans(`x${i}`, true))
    const out = applyMatch(emptyProgress(), { mode: 'revisao', title: 'R', results, summary: summarizeMatch(results, 10, Infinity) }, '2026-11-11')
    expect(out.progress.review.x0.seen).toBe(1)
    expect(out.progress.bestAnswerStreak).toBe(10)
    expect(out.xpGained).toBeGreaterThan(0)
    expect(out.progress.practice.xp).toBe(out.xpGained)
    expect(out.newAchievements).toEqual(expect.arrayContaining(['memoria-biblica', 'revisor']))
  })
})

describe('Modo Livre: personagem, tema e dificuldade', () => {
  it('há personagens e temas com pelo menos 5 perguntas', () => {
    const chars = availableCharacters(QUESTIONS).map((c) => c.id)
    expect(chars).toEqual(expect.arrayContaining(['noe', 'abraao', 'jose', 'moises', 'jaco']))
    expect(availableThemes(QUESTIONS).length).toBeGreaterThanOrEqual(5)
  })

  it('filtra por personagem e por nível', () => {
    const noe = filteredPool('personagem', QUESTIONS, { characterId: 'noe' })
    expect(noe.length).toBeGreaterThanOrEqual(5)
    expect(noe.every((q) => /Noé/.test(JSON.stringify(q)))).toBe(true)
    const iniciante = buildRound('dificuldade', QUESTIONS, Math.random, { level: 'iniciante', count: 10 })
    expect(iniciante).toHaveLength(10)
    expect(iniciante.every((q) => q.difficulty === 1)).toBe(true)
    const especialista = filteredPool('dificuldade', QUESTIONS, { level: 'especialista' })
    expect(especialista.every((q) => q.difficulty === 3)).toBe(true)
    expect(buildRound('tema', QUESTIONS, Math.random, { themeId: 'libertacao', count: 5 }).every((q) => q.bookId === 'exodo')).toBe(true)
  })
})

describe('Relacione', () => {
  it('acerto com no máximo 1 erro', () => {
    const q = QUESTIONS.find((x) => x.id === 'ma-01')!
    expect(checkAnswer(q, { kind: 'match', mistakes: 0 }).correct).toBe(true)
    expect(checkAnswer(q, { kind: 'match', mistakes: 1 }).correct).toBe(true)
    expect(checkAnswer(q, { kind: 'match', mistakes: 2 }).correct).toBe(false)
  })
})

describe('migração da v0.2', () => {
  it('fases unidas na v0.3 somam no destino e o restante é preservado', () => {
    const p = migrateProgress({
      ...emptyProgress(),
      experiences: { 'gn-isaque': done, 'gn-moria': { completed: true, bestStars: 2, bestScore: 60, attempts: 2 }, 'gn-jose-farao': done },
      lastExperienceId: 'gn-moria',
    } as never)
    expect(p.experiences['gn-isaque']).toEqual({ completed: true, bestStars: 2, bestScore: 80, attempts: 3 })
    expect(p.experiences['gn-jose-egito']).toEqual(done)
    expect(p.experiences['gn-moria']).toBeUndefined()
    expect(p.lastExperienceId).toBe('gn-isaque')
    expect(p.chests).toEqual({})
    expect(p.library).toEqual({ characters: {}, places: {} })
  })
})
