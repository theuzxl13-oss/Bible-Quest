import type { Experience, Question, QuestionType } from '../types'
import type { KeyValueStore } from './storage/keyValueStore'
import { CUSTOM_CONTENT_KEY } from './storage/repositories'
import { getBook } from '../data/bible/canon'

/*
 * CONTEÚDO PERSONALIZADO (painel administrativo)
 * Na versão estática, perguntas e rascunhos de experiências criados no painel
 * ficam SOMENTE neste navegador. Eles podem ser exportados em JSON para
 * revisão e inclusão oficial. Publicar para todos os jogadores exigirá o
 * backend (tabela `questions` com RLS e papel de revisor).
 */
export interface CustomContent {
  version: 1
  questions: Question[]
  experienceDrafts: Experience[]
  /** Se true, as perguntas locais entram no Modo Livre deste aparelho. */
  includeInFreeMode: boolean
}

export function emptyCustomContent(): CustomContent {
  return { version: 1, questions: [], experienceDrafts: [], includeInFreeMode: false }
}

export interface ContentRepository {
  load(): CustomContent
  save(content: CustomContent): void
}

export class LocalContentRepository implements ContentRepository {
  constructor(private store: KeyValueStore) {}
  load(): CustomContent {
    const raw = this.store.get(CUSTOM_CONTENT_KEY)
    if (!raw) return emptyCustomContent()
    try {
      const parsed = JSON.parse(raw) as Partial<CustomContent>
      return {
        version: 1,
        questions: Array.isArray(parsed.questions) ? parsed.questions.filter((q) => validateQuestion(q).length === 0) : [],
        experienceDrafts: Array.isArray(parsed.experienceDrafts) ? parsed.experienceDrafts : [],
        includeInFreeMode: Boolean(parsed.includeInFreeMode),
      }
    } catch {
      return emptyCustomContent()
    }
  }
  save(content: CustomContent) {
    this.store.set(CUSTOM_CONTENT_KEY, JSON.stringify(content))
  }
}

const CHOICE_TYPES: QuestionType[] = ['multiple', 'book', 'whoami', 'complete']

/** Valida uma pergunta. Retorna a lista de problemas (vazia = válida). */
export function validateQuestion(input: unknown): string[] {
  const errs: string[] = []
  if (!input || typeof input !== 'object') return ['Formato inválido.']
  const q = input as Partial<Question> & Record<string, unknown>
  if (!q.id || typeof q.id !== 'string') errs.push('Identificador ausente.')
  if (!q.bookId || !getBook(q.bookId as string)) errs.push('Livro bíblico inválido.')
  if (!q.prompt || String(q.prompt).trim().length < 5) errs.push('Enunciado muito curto.')
  if (!q.explanation || String(q.explanation).trim().length < 5) errs.push('Explicação obrigatória.')
  if (!q.reference || String(q.reference).trim().length < 3) errs.push('Referência bíblica obrigatória.')
  if (![1, 2, 3].includes(q.difficulty as number)) errs.push('Dificuldade deve ser 1, 2 ou 3.')
  if (!q.category) errs.push('Categoria obrigatória.')
  if (CHOICE_TYPES.includes(q.type as QuestionType)) {
    const opts = (q as { options?: unknown }).options
    const ans = (q as { answer?: unknown }).answer
    if (!Array.isArray(opts) || opts.length < 3 || opts.some((o) => typeof o !== 'string' || !o.trim())) errs.push('Informe pelo menos 3 alternativas.')
    else if (new Set(opts).size !== opts.length) errs.push('Alternativas repetidas.')
    if (typeof ans !== 'number' || !Array.isArray(opts) || ans < 0 || ans >= opts.length) errs.push('Resposta correta inválida.')
    if (q.type === 'complete' && !String((q as { verse?: string }).verse ?? '').includes('____')) errs.push('O trecho precisa conter a lacuna ____.')
    if (q.type === 'whoami' && !(Array.isArray((q as { clues?: unknown }).clues) && ((q as { clues: unknown[] }).clues.length >= 2))) errs.push('Informe pelo menos 2 pistas.')
  } else if (q.type === 'truefalse') {
    if (typeof (q as { answer?: unknown }).answer !== 'boolean') errs.push('Resposta deve ser verdadeiro ou falso.')
  } else if (q.type === 'order') {
    const items = (q as { items?: unknown }).items
    if (!Array.isArray(items) || items.length < 3) errs.push('Informe pelo menos 3 acontecimentos.')
  } else {
    errs.push('Modalidade não suportada no editor.')
  }
  return errs
}
