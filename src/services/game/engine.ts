import type { AnswerResult, FreeModeId, MatchRecord, Progress } from '../../types'
import { ACHIEVEMENTS } from '../../data/achievements'
import { levelFromXp } from './levels'
import { capPractice, DAILY_BONUS, storyXp, type MatchSummary } from './scoring'
import { updateStreak } from './streak'
import { canClaimDaily } from './daily'
import { recordAnswers } from './review'

export interface MatchInput {
  mode: MatchRecord['mode']
  title: string
  freeMode?: FreeModeId
  bookId?: string
  experienceId?: string
  results: AnswerResult[]
  summary: MatchSummary
  /** Multiplayer demonstrativo: o jogador venceu a partida simulada. */
  demoWin?: boolean
}

export interface MatchOutcome {
  progress: Progress
  record: MatchRecord
  xpGained: number
  /** XP que não foi concedido por causa do limite diário de prática. */
  xpCapped: number
  /** true quando o desafio diário já tinha sido recompensado hoje. */
  dailyAlreadyClaimed: boolean
  newAchievements: string[]
  levelBefore: number
  levelAfter: number
  firstClear: boolean
}

const HISTORY_LIMIT = 50
const DAILY_LOG_LIMIT = 60

function newRecordId(now: Date): string {
  return `m-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Aplica o resultado de qualquer partida (Modo História, Modo Livre, diário
 * ou multiplayer demonstrativo) ao progresso ÚNICO do jogador.
 * Função pura, exceto pelo id e pela data do registro.
 */
export function applyMatch(progress: Progress, input: MatchInput, today: string, now = new Date()): MatchOutcome {
  const { summary } = input
  const next: Progress = structuredClone(progress)
  if (next.practice.day !== today) next.practice = { day: today, xp: 0 }

  let xpGained = 0
  let xpCapped = 0
  let firstClear = false
  let dailyAlreadyClaimed = false

  const addPractice = (requested: number) => {
    const granted = capPractice(requested, next.practice.xp)
    next.practice.xp += granted
    xpCapped += requested - granted
    return granted
  }

  if (input.mode === 'historia' && input.experienceId) {
    const prev = next.experiences[input.experienceId] ?? { completed: false, bestStars: 0, bestScore: 0, attempts: 0 }
    const xp = storyXp({ summary, alreadyCompleted: prev.completed, previousBestScore: prev.bestScore })
    xpGained = xp.story + addPractice(xp.practice)
    firstClear = summary.passed && !prev.completed
    next.experiences[input.experienceId] = {
      completed: prev.completed || summary.passed,
      bestStars: Math.max(prev.bestStars, summary.stars),
      bestScore: Math.max(prev.bestScore, summary.score),
      attempts: prev.attempts + 1,
    }
    next.lastExperienceId = input.experienceId
    if (summary.passed && summary.correct === summary.total) next.stats.perfectExperiences++
  } else if (input.mode === 'diario') {
    if (canClaimDaily(next, today)) {
      xpGained = summary.score + DAILY_BONUS
      next.daily.lastCompletedDay = today
      next.daily.completedCount++
      next.daily.log = [{ day: today, correct: summary.correct, total: summary.total, xp: xpGained }, ...next.daily.log].slice(0, DAILY_LOG_LIMIT)
    } else {
      dailyAlreadyClaimed = true
    }
  } else if (input.mode === 'livre' && input.freeMode) {
    xpGained = addPractice(summary.score)
    next.free.matches++
    const m = next.free.byMode[input.freeMode] ?? { played: 0, best: 0 }
    next.free.byMode[input.freeMode] = { played: m.played + 1, best: Math.max(m.best, summary.score) }
    next.free.oneClueHits += input.results.filter((r) => r.correct && r.cluesUsed === 1).length
    if (input.freeMode === 'contra-o-tempo') next.free.bestTimeAttack = Math.max(next.free.bestTimeAttack, summary.correct)
  } else if (input.mode === 'revisao') {
    xpGained = addPractice(summary.score)
  } else if (input.mode === 'demo-multiplayer') {
    // Resultados simulados não concedem XP nem contam sequência; só estatística identificada como demonstração.
    next.multiplayer.demoMatches++
    if (input.demoWin) next.multiplayer.demoWins++
  }

  if (input.mode !== 'demo-multiplayer') {
    next.review = recordAnswers(next.review, input.results, now)
    for (const r of input.results) {
      next.currentAnswerStreak = r.correct ? next.currentAnswerStreak + 1 : 0
      next.bestAnswerStreak = Math.max(next.bestAnswerStreak, next.currentAnswerStreak)
    }
  }

  for (const r of input.results) {
    next.stats.answered++
    if (r.correct) next.stats.correct++
    const t = next.stats.byType[r.type] ?? { answered: 0, correct: 0 }
    next.stats.byType[r.type] = { answered: t.answered + 1, correct: t.correct + (r.correct ? 1 : 0) }
  }

  const levelBefore = levelFromXp(next.xp)
  next.xp += xpGained
  const levelAfter = levelFromXp(next.xp)

  if (input.mode !== 'demo-multiplayer' && input.results.length > 0) next.streak = updateStreak(next.streak, today)

  const record: MatchRecord = {
    id: newRecordId(now),
    date: now.toISOString(),
    mode: input.mode,
    freeMode: input.freeMode,
    bookId: input.bookId,
    experienceId: input.experienceId,
    title: input.title,
    correct: summary.correct,
    total: summary.total,
    score: summary.score,
    xp: xpGained,
    stars: summary.stars,
    passed: summary.passed,
  }
  next.history = [record, ...next.history].slice(0, HISTORY_LIMIT)

  const newAchievements: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (!next.achievements[a.id] && a.check(next)) {
      next.achievements[a.id] = now.toISOString()
      newAchievements.push(a.id)
    }
  }

  return { progress: next, record, xpGained, xpCapped, dailyAlreadyClaimed, newAchievements, levelBefore, levelAfter, firstClear }
}
