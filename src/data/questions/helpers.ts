import type { Question } from '../../types'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type QuestionInput = DistributiveOmit<Question, 'bookId'>

/**
 * Monta o banco de perguntas de um livro. Nas questões de escolha, a opção correta é
 * escrita na posição indicada por `answer`; a interface embaralha as opções
 * antes de exibir.
 */
export function bank(bookId: string, list: QuestionInput[]): Question[] {
  return list.map((q) => ({ ...q, bookId }) as Question)
}
