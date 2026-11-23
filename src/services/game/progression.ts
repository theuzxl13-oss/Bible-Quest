import type { BookMeta, Experience, Progress, Testament } from '../../types'
import { BOOKS, booksOf } from '../../data/bible/canon'
import { STORY_SEQUENCE, experiencesOf } from '../../data/story'

/*
 * PROGRESSÃO DO MODO HISTÓRIA
 * - A jornada segue a ordem dos livros do cânon e, dentro de cada livro, a
 *   ordem das experiências.
 * - Uma experiência fica liberada quando a anterior (na sequência global) foi
 *   concluída. A primeira de Gênesis começa liberada.
 * - Experiências já concluídas continuam sempre acessíveis para revisão.
 * - Livros sem conteúdo aparecem como "em preparação".
 */

export function isExperienceCompleted(id: string, p: Progress): boolean {
  return Boolean(p.experiences[id]?.completed)
}

export function isExperienceUnlocked(id: string, p: Progress): boolean {
  const idx = STORY_SEQUENCE.findIndex((e) => e.id === id)
  if (idx < 0) return false
  if (idx === 0 || isExperienceCompleted(id, p)) return true
  return isExperienceCompleted(STORY_SEQUENCE[idx - 1].id, p)
}

/** Próxima experiência a jogar: a primeira liberada e não concluída. */
export function nextExperience(p: Progress): Experience | null {
  return STORY_SEQUENCE.find((e) => !isExperienceCompleted(e.id, p) && isExperienceUnlocked(e.id, p)) ?? null
}

/** "Continuar de onde parou": a próxima pendente; se tudo estiver concluído, a última aberta. */
export function continueExperience(p: Progress): Experience | null {
  return nextExperience(p) ?? STORY_SEQUENCE.find((e) => e.id === p.lastExperienceId) ?? null
}

export type BookStatus = 'concluido' | 'em-andamento' | 'disponivel' | 'bloqueado' | 'em-preparacao'

export function bookCompletion(bookId: string, p: Progress) {
  const exps = experiencesOf(bookId)
  const done = exps.filter((e) => isExperienceCompleted(e.id, p)).length
  const stars = exps.reduce((s, e) => s + (p.experiences[e.id]?.bestStars ?? 0), 0)
  return { done, total: exps.length, ratio: exps.length ? done / exps.length : 0, stars, maxStars: exps.length * 3 }
}

export function bookStatus(book: BookMeta, p: Progress): BookStatus {
  const exps = experiencesOf(book.id)
  if (exps.length === 0) return 'em-preparacao'
  const c = bookCompletion(book.id, p)
  if (c.done === c.total) return 'concluido'
  if (c.done > 0) return 'em-andamento'
  return isExperienceUnlocked(exps[0].id, p) ? 'disponivel' : 'bloqueado'
}

export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  concluido: 'Concluído',
  'em-andamento': 'Em andamento',
  disponivel: 'Disponível',
  bloqueado: 'Bloqueado',
  'em-preparacao': 'Em preparação',
}

/**
 * Porcentagem de conclusão de um conjunto de livros. Cada livro pesa igual;
 * livros em preparação contam como 0%, para que o número reflita a jornada
 * real até Apocalipse.
 */
function completionOf(books: BookMeta[], p: Progress): number {
  if (books.length === 0) return 0
  return books.reduce((s, b) => s + bookCompletion(b.id, p).ratio, 0) / books.length
}

export function testamentCompletion(t: Testament, p: Progress): number {
  return completionOf(booksOf(t), p)
}

export function journeyCompletion(p: Progress): number {
  return completionOf(BOOKS, p)
}

export function percent(ratio: number): string {
  const v = ratio * 100
  if (v > 0 && v < 1) return `${v.toFixed(1).replace('.', ',')}%`
  return `${Math.round(v)}%`
}

export type Medal = 'ouro' | 'prata' | 'bronze' | null

/** Medalha do livro conforme a média de estrelas, após concluir todas as experiências. */
export function bookMedal(bookId: string, p: Progress): Medal {
  const c = bookCompletion(bookId, p)
  if (c.total === 0 || c.done < c.total) return null
  const r = c.stars / c.maxStars
  if (r === 1) return 'ouro'
  if (r >= 2 / 3) return 'prata'
  return 'bronze'
}

/** Livros com conteúdo, na ordem, e o próximo livro em preparação (para mostrar o que vem a seguir). */
export function upcomingBook(): BookMeta | undefined {
  return BOOKS.find((b) => experiencesOf(b.id).length === 0)
}
