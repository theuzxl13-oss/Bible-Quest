import type { AnswerResult, Question } from '../../types'

export type AnswerResponse =
  | { kind: 'choice'; option: string; cluesUsed?: number }
  | { kind: 'bool'; value: boolean }
  | { kind: 'order'; items: string[] }
  | { kind: 'memory'; mistakes: number }
  | { kind: 'match'; mistakes: number }

/**
 * Erros tolerados no desafio de memória: um por par. Simulações mostram que,
 * com memória perfeita, 4 pares exigem até 3 erros inevitáveis (as primeiras
 * cartas são descobertas às cegas); o limite antigo de 2 reprovava 13% das
 * partidas perfeitas.
 */
/** Erros tolerados em "Relacione" (as duas colunas ficam visíveis). */
export const MATCH_MISTAKES_ALLOWED = 1

export function memoryMistakesAllowed(pairs: number): number {
  return pairs
}

export function correctOptionText(q: Question): string | null {
  if ('options' in q) return q.options[q.answer]
  return null
}

export function checkAnswer(q: Question, r: AnswerResponse): AnswerResult {
  let correct = false
  let quality = 0
  switch (q.type) {
    case 'multiple':
    case 'book':
    case 'whoami':
    case 'complete':
      correct = r.kind === 'choice' && r.option === q.options[q.answer]
      quality = correct ? 1 : 0
      break
    case 'truefalse':
      correct = r.kind === 'bool' && r.value === q.answer
      quality = correct ? 1 : 0
      break
    case 'order': {
      if (r.kind === 'order') {
        const hits = r.items.filter((it, i) => it === q.items[i]).length
        quality = hits / q.items.length
        correct = hits === q.items.length
      }
      break
    }
    case 'match': {
      // Relacione: as colunas ficam visíveis, então tolera-se no máximo 1 erro.
      if (r.kind === 'match') {
        correct = r.mistakes <= MATCH_MISTAKES_ALLOWED
        quality = Math.max(0, 1 - r.mistakes / q.pairs.length)
      }
      break
    }
    case 'memory': {
      if (r.kind === 'memory') {
        correct = r.mistakes <= memoryMistakesAllowed(q.pairs.length)
        quality = Math.max(0, 1 - r.mistakes / (q.pairs.length * 2))
      }
      break
    }
  }
  return { questionId: q.id, type: q.type, correct, difficulty: q.difficulty, quality }
}
