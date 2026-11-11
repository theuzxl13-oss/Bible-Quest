import type { Question } from '../../types'
import { QUESTIONS } from '../../data/questions'
import { hashString, seededRandom, shuffle } from './random'

export const DAILY_SIZE = 5

/** Seleção determinística do desafio diário: todos os jogadores recebem as mesmas perguntas no mesmo dia. */
export function dailyQuestions(day: string, size = DAILY_SIZE, pool: Question[] = QUESTIONS): Question[] {
  const rand = seededRandom(hashString(`daily:${day}`))
  const eligible = pool.filter((q) => q.type !== 'memory' && q.type !== 'order')
  return shuffle(eligible, rand).slice(0, size)
}
