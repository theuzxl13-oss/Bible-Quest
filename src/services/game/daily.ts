import type { Progress, Question } from '../../types'
import { QUESTIONS } from '../../data/questions'
import { hashString, seededRandom, shuffle } from './random'
import { dayKey, daysBetween } from './dates'

export const DAILY_SIZE = 5

/** Seleção determinística: todos os jogadores recebem as mesmas perguntas no mesmo dia. */
export function dailyQuestions(day: string, size = DAILY_SIZE, pool: Question[] = QUESTIONS): Question[] {
  const rand = seededRandom(hashString(`daily:${day}`))
  const eligible = pool.filter((q) => q.type !== 'memory' && q.type !== 'order')
  // garante variedade: uma pergunta de dificuldade 3 no máximo 2
  const picked: Question[] = []
  for (const q of shuffle(eligible, rand)) {
    if (picked.length >= size) break
    if (q.difficulty === 3 && picked.filter((x) => x.difficulty === 3).length >= 2) continue
    picked.push(q)
  }
  return picked
}

/**
 * A recompensa diária só pode ser recebida uma vez por dia. Se o relógio do
 * aparelho voltar para antes do último desafio recompensado, a recompensa é
 * negada (evita trapaça simples trocando a data).
 */
export function canClaimDaily(p: Progress, today: string): boolean {
  const last = p.daily.lastCompletedDay
  if (!last) return true
  return daysBetween(last, today) >= 1
}

export interface DailyContext {
  day: string
  /** 'device' = data do aparelho; 'server' = data validada por servidor (futuro). */
  source: 'device' | 'server'
  /** true se a data do aparelho parece ter voltado no tempo em relação ao progresso salvo. */
  clockSuspicious: boolean
}

/**
 * Contrato do serviço de desafio diário. Na versão estática usa a data do
 * aparelho com proteção contra retrocesso de relógio. Na versão online, uma
 * implementação Supabase deve obter o dia e validar a recompensa no servidor
 * (Edge Function `claim-daily`), ignorando a data do cliente.
 */
export interface DailyService {
  context(p: Progress): DailyContext
}

export class LocalDailyService implements DailyService {
  constructor(private now: () => Date = () => new Date()) {}
  context(p: Progress): DailyContext {
    const day = dayKey(this.now())
    const lastSeen = [p.daily.lastCompletedDay, p.streak.lastDay].filter(Boolean).sort().pop()
    const clockSuspicious = Boolean(lastSeen && daysBetween(lastSeen!, day) < 0)
    return { day, source: 'device', clockSuspicious }
  }
}
