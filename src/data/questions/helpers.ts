import type { JourneyId, Question } from '../../types'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type QuestionInput = DistributiveOmit<Question, 'journeyId'>

/**
 * Monta o banco de uma jornada. Nas questões de escolha, a opção correta é
 * escrita na posição indicada por `answer`; a interface embaralha as opções
 * antes de exibir.
 */
export function bank(journeyId: JourneyId, list: QuestionInput[]): Question[] {
  return list.map((q) => ({ ...q, journeyId }) as Question)
}
