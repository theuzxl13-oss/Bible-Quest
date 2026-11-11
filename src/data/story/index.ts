import type { Experience } from '../../types'
import { BOOKS, getBook } from '../bible/canon'
import { GENESIS } from './genesis'
import { EXODO } from './exodo'

/*
 * Registro das experiências do Modo História por livro.
 * Para adicionar um livro: crie src/data/story/<livro>.ts com experiences('<id>', [...])
 * e registre aqui. Livros sem entrada aparecem como "Em preparação".
 */
const BY_BOOK: Record<string, Experience[]> = {
  genesis: GENESIS,
  exodo: EXODO,
}

export function experiencesOf(bookId: string): Experience[] {
  return BY_BOOK[bookId] ?? []
}

/** Todas as experiências na ordem canônica da jornada. */
export const STORY_SEQUENCE: Experience[] = BOOKS.flatMap((b) => experiencesOf(b.id))

export function getExperience(id: string | undefined): Experience | undefined {
  return STORY_SEQUENCE.find((e) => e.id === id)
}

export function hasContent(bookId: string): boolean {
  return experiencesOf(bookId).length > 0
}

export function bookOfExperience(e: Experience) {
  return getBook(e.bookId)!
}

export const BIBLE_SOURCE_NOTE =
  'Texto bíblico: Almeida Revista e Corrigida, edição de 1911 (domínio público), com ortografia atualizada. Em revisão contra a fonte.'
