import type { Progress } from '../../types'
import { daysBetween } from './dates'

/** Atualiza a sequência diária ao concluir uma atividade em `today`. */
export function updateStreak(streak: Progress['streak'], today: string): Progress['streak'] {
  if (streak.lastDay === today) return streak
  let current = 1
  if (streak.lastDay) {
    const diff = daysBetween(streak.lastDay, today)
    if (diff === 1) current = streak.current + 1
    else if (diff <= 0) return streak // relógio voltou: não altera
  }
  return { current, best: Math.max(streak.best, current), lastDay: today }
}

/** Sequência exibida: zera se o jogador ficou mais de um dia sem jogar. */
export function visibleStreak(streak: Progress['streak'], today: string): number {
  if (!streak.lastDay) return 0
  const diff = daysBetween(streak.lastDay, today)
  return diff <= 1 ? streak.current : 0
}
