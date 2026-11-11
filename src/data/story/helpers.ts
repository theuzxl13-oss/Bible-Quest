import type { Experience } from '../../types'

type ExperienceInput = Omit<Experience, 'bookId' | 'order'>

/** Define as experiências de um livro na ordem em que aparecem na jornada. */
export function experiences(bookId: string, list: ExperienceInput[]): Experience[] {
  return list.map((e, i) => ({ ...e, bookId, order: i + 1 }))
}
