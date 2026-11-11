import type { AnswerResult, Question } from '../../types'

export type AnswerResponse =
  | { kind: 'choice'; option: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'order'; items: string[] }
  | { kind: 'memory'; mistakes: number }

/** Erros tolerados no desafio de memória para ainda contar como acerto. */
export const MEMORY_MISTAKES_ALLOWED = 2

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
    case 'memory': {
      if (r.kind === 'memory') {
        correct = r.mistakes <= MEMORY_MISTAKES_ALLOWED
        quality = Math.max(0, 1 - r.mistakes / (q.pairs.length * 2))
      }
      break
    }
  }
  return { questionId: q.id, type: q.type, correct, difficulty: q.difficulty, quality }
}
