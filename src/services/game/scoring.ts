import type { AnswerResult, Difficulty } from '../../types'

export const MAX_LIVES = 3
export const PASS_RATIO = 0.6
export const FIRST_CLEAR_BONUS = 50
export const DAILY_BONUS = 30

const BASE_POINTS: Record<Difficulty, number> = { 1: 10, 2: 15, 3: 20 }
/** Bônus por constância dentro da partida: a partir do 3º acerto seguido. */
export const STREAK_BONUS = 5

export function basePoints(d: Difficulty): number {
  return BASE_POINTS[d]
}

export interface MatchSummary {
  correct: number
  total: number
  score: number
  stars: number
  passed: boolean
  livesLeft: number
  bestCombo: number
}

/**
 * Calcula a pontuação de uma partida. A velocidade não influencia a pontuação:
 * o jogo recompensa acerto, dificuldade e constância.
 * `total` é o número de perguntas da partida (pode ser maior que results.length
 * quando as vidas acabam antes do fim).
 */
export function summarizeMatch(results: AnswerResult[], total: number, lives = MAX_LIVES): MatchSummary {
  let score = 0
  let combo = 0
  let bestCombo = 0
  let correct = 0
  let livesLeft = lives
  for (const r of results) {
    if (r.correct) {
      correct++
      combo++
      bestCombo = Math.max(bestCombo, combo)
      score += basePoints(r.difficulty) + (combo >= 3 ? STREAK_BONUS : 0)
    } else {
      combo = 0
      livesLeft = Math.max(0, livesLeft - 1)
    }
  }
  const ratio = total > 0 ? correct / total : 0
  const passed = livesLeft > 0 && ratio >= PASS_RATIO
  const stars = !passed ? 0 : ratio === 1 ? 3 : ratio >= 0.8 ? 2 : 1
  return { correct, total, score, stars, passed, livesLeft, bestCombo }
}

/**
 * XP concedido por um capítulo. Primeira conclusão ganha bônus; repetir um
 * capítulo já concluído rende metade, para incentivar avanço sem punir revisão.
 * Mesmo sem passar, o jogador recebe um pouco de XP pelo que aprendeu.
 */
export function chapterXp(summary: MatchSummary, alreadyCompleted: boolean): number {
  if (!summary.passed) return Math.round(summary.score * 0.25)
  if (alreadyCompleted) return Math.round(summary.score * 0.5)
  return summary.score + FIRST_CLEAR_BONUS
}
