import type { AnswerResult, JourneyId, MatchRecord, Progress } from '../../types'
import { ACHIEVEMENTS } from '../../data/achievements'
import { levelFromXp } from './levels'
import { chapterXp, DAILY_BONUS, type MatchSummary } from './scoring'
import { updateStreak } from './streak'

export interface MatchInput {
  mode: MatchRecord['mode']
  title: string
  journeyId?: JourneyId
  chapterId?: string
  results: AnswerResult[]
  summary: MatchSummary
}

export interface MatchOutcome {
  progress: Progress
  record: MatchRecord
  xpGained: number
  newAchievements: string[]
  levelBefore: number
  levelAfter: number
  firstClear: boolean
}

const HISTORY_LIMIT = 50

function newRecordId(now: Date): string {
  return `m-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Aplica o resultado de uma partida ao progresso. Função pura (exceto id/data). */
export function applyMatch(progress: Progress, input: MatchInput, today: string, now = new Date()): MatchOutcome {
  const { summary } = input
  const next: Progress = structuredClone(progress)
  let xpGained = 0
  let firstClear = false

  if (input.mode === 'capitulo' && input.chapterId) {
    const prev = next.chapters[input.chapterId] ?? { completed: false, bestStars: 0, bestScore: 0, attempts: 0 }
    xpGained = chapterXp(summary, prev.completed)
    firstClear = summary.passed && !prev.completed
    next.chapters[input.chapterId] = {
      completed: prev.completed || summary.passed,
      bestStars: Math.max(prev.bestStars, summary.stars),
      bestScore: Math.max(prev.bestScore, summary.score),
      attempts: prev.attempts + 1,
    }
    if (summary.passed && summary.correct === summary.total) next.stats.perfectChapters++
  } else if (input.mode === 'diario') {
    const alreadyToday = next.daily.lastCompletedDay === today
    xpGained = alreadyToday ? 0 : summary.score + DAILY_BONUS
    if (!alreadyToday) {
      next.daily = { lastCompletedDay: today, completedCount: next.daily.completedCount + 1 }
    }
  } else {
    // Partida demonstrativa de multiplayer: não concede XP para não misturar
    // resultados simulados com o progresso real.
    xpGained = 0
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

  if (input.mode !== 'demo-multiplayer') next.streak = updateStreak(next.streak, today)

  const record: MatchRecord = {
    id: newRecordId(now),
    date: now.toISOString(),
    mode: input.mode,
    journeyId: input.journeyId,
    chapterId: input.chapterId,
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

  return { progress: next, record, xpGained, newAchievements, levelBefore, levelAfter, firstClear }
}
