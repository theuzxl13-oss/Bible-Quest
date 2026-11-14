import type { FreeModeId, Question, QuestionType } from '../../types'
import { ABRAAO_QUESTIONS } from './abraao'
import { CRIACAO_QUESTIONS } from './criacao'
import { GENESIS_EXTRA_QUESTIONS } from './genesis-extra'
import { GENESIS_FASES_QUESTIONS } from './genesis-fases'
import { GERAL_QUESTIONS } from './geral'
import { JOSE_QUESTIONS } from './jose'
import { MOISES_QUESTIONS } from './moises'
import { NOE_QUESTIONS } from './noe'

/** Banco completo: perguntas das experiências do Modo História e perguntas gerais do Modo Livre. */
export const QUESTIONS: Question[] = [
  ...CRIACAO_QUESTIONS,
  ...GENESIS_EXTRA_QUESTIONS,
  ...GENESIS_FASES_QUESTIONS,
  ...NOE_QUESTIONS,
  ...ABRAAO_QUESTIONS,
  ...JOSE_QUESTIONS,
  ...MOISES_QUESTIONS,
  ...GERAL_QUESTIONS,
]

export function questionsForExperience(experienceId: string, pool: Question[] = QUESTIONS): Question[] {
  return pool.filter((q) => q.experienceId === experienceId)
}

export function getQuestion(id: string, pool: Question[] = QUESTIONS): Question | undefined {
  return pool.find((q) => q.id === id)
}

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple: 'Múltipla escolha',
  complete: 'Complete o versículo',
  truefalse: 'Verdadeiro ou falso',
  whoami: 'Quem sou eu?',
  book: 'Identifique o livro',
  order: 'Organize os acontecimentos',
  memory: 'Desafio de memória',
  match: 'Relacione',
}

export const DIFFICULTY_LABEL = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil' } as const

/** Tipos de pergunta aceitos por cada modalidade do Modo Livre. */
export const FREE_MODE_TYPES: Record<FreeModeId, QuestionType[]> = {
  aleatorias: ['multiple', 'book', 'whoami', 'complete'],
  'verdadeiro-falso': ['truefalse'],
  complete: ['complete'],
  'quem-sou-eu': ['whoami'],
  'contra-o-tempo': ['multiple', 'book', 'whoami', 'complete', 'truefalse'],
  ordem: ['order'],
  livro: ['book'],
  personagem: ['multiple', 'book', 'whoami', 'complete', 'truefalse'],
  tema: ['multiple', 'book', 'whoami', 'complete', 'truefalse'],
  dificuldade: ['multiple', 'book', 'whoami', 'complete', 'truefalse'],
}
