import type { Question, QuestionType } from '../../types'
import { ABRAAO_QUESTIONS } from './abraao'
import { CRIACAO_QUESTIONS } from './criacao'
import { JOSE_QUESTIONS } from './jose'
import { MOISES_QUESTIONS } from './moises'
import { NOE_QUESTIONS } from './noe'

export const QUESTIONS: Question[] = [
  ...CRIACAO_QUESTIONS,
  ...NOE_QUESTIONS,
  ...ABRAAO_QUESTIONS,
  ...JOSE_QUESTIONS,
  ...MOISES_QUESTIONS,
]

export function questionsForChapter(chapterId: string): Question[] {
  return QUESTIONS.filter((q) => q.chapterId === chapterId)
}

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple: 'Múltipla escolha',
  complete: 'Complete o versículo',
  truefalse: 'Verdadeiro ou falso',
  whoami: 'Quem sou eu?',
  book: 'Identifique o livro',
  order: 'Organize os acontecimentos',
  memory: 'Desafio de memória',
}

export const DIFFICULTY_LABEL = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil' } as const
