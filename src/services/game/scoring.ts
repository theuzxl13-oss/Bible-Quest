import type { AnswerResult, Difficulty } from '../../types'

export const MAX_LIVES = 3
export const PASS_RATIO = 0.6
/**
 * Estrelas por fase (configurável):
 * 1 estrela = fase concluída (aproveitamento >= PASS_RATIO);
 * 2 estrelas = aproveitamento >= 70%; 3 estrelas = aproveitamento >= 90%.
 */
export const STAR_RULES = { two: 0.7, three: 0.9 }

export function starsFor(ratio: number, passed: boolean): number {
  if (!passed) return 0
  if (ratio >= STAR_RULES.three) return 3
  if (ratio >= STAR_RULES.two) return 2
  return 1
}
export const FIRST_CLEAR_BONUS = 50
export const DAILY_BONUS = 30
/**
 * Limite diário de XP "de prática": Modo Livre e tentativas reprovadas no Modo
 * História. Impede acumular XP sem limite repetindo o mesmo conteúdo.
 */
export const PRACTICE_DAILY_CAP = 300

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
 * Pontuação padrão (Modo História, diário, várias modalidades livres).
 * A velocidade não influencia: o jogo recompensa acerto, dificuldade e constância.
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
      score += (r.points ?? basePoints(r.difficulty)) + (combo >= 3 ? STREAK_BONUS : 0)
    } else {
      combo = 0
      livesLeft = Math.max(0, livesLeft - 1)
    }
  }
  const ratio = total > 0 ? correct / total : 0
  const passed = livesLeft > 0 && ratio >= PASS_RATIO
  const stars = starsFor(ratio, passed)
  return { correct, total, score, stars, passed, livesLeft, bestCombo }
}

/** Quem sou eu?: quanto menos pistas, mais pontos. Com todas as pistas, vale o básico. */
export function whoamiPoints(d: Difficulty, cluesShown: number, totalClues: number): number {
  return basePoints(d) + 5 * Math.max(0, totalClues - cluesShown)
}

/** Contra o tempo: bônus de velocidade (só nesta modalidade). */
export function timeAttackPoints(d: Difficulty, secondsTaken: number): number {
  const bonus = secondsTaken <= 4 ? 10 : secondsTaken <= 8 ? 5 : 0
  return basePoints(d) + bonus
}

export const TIME_ATTACK_SECONDS = 60
export const TIME_ATTACK_MAX_ERRORS = 3

export interface StoryXpInput {
  summary: MatchSummary
  alreadyCompleted: boolean
  previousBestScore: number
}

/**
 * XP de uma experiência do Modo História:
 * - primeira conclusão: pontos + bônus (uma única vez por experiência);
 * - repetição de experiência concluída: apenas o quanto superar a melhor pontuação;
 * - reprovação: 25% dos pontos, como XP de prática (sujeito ao limite diário).
 * Retorna o XP de jornada e o XP de prática separadamente.
 */
export function storyXp({ summary, alreadyCompleted, previousBestScore }: StoryXpInput): { story: number; practice: number } {
  if (!summary.passed) return { story: 0, practice: Math.round(summary.score * 0.25) }
  if (!alreadyCompleted) return { story: summary.score + FIRST_CLEAR_BONUS, practice: 0 }
  return { story: Math.max(0, summary.score - previousBestScore), practice: 0 }
}

/** Aplica o limite diário de XP de prática. */
export function capPractice(requested: number, used: number, cap = PRACTICE_DAILY_CAP): number {
  return Math.max(0, Math.min(requested, cap - used))
}

/** XP de um baú de recompensa (aberto uma única vez). */
export const CHEST_XP = 40
export const WORLD_CHEST_XP = 100
