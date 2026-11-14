import type { Question } from '../types'
import { CHARACTERS } from './library/characters'

/*
 * Temas bíblicos e personagens para o Modo Livre.
 * Os temas usam a fase (experiência) ou o livro de cada pergunta.
 */
export interface Theme {
  id: string
  label: string
  experiences?: string[]
  books?: string[]
  /** Prefixo de id de experiência (ex.: 'ex-' para todo o Êxodo). */
  prefix?: string
}

export const THEMES: Theme[] = [
  { id: 'criacao', label: 'Criação e origens', experiences: ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao'] },
  { id: 'alianca', label: 'Alianças e promessas', experiences: ['gn-noe', 'gn-alianca-noe', 'gn-chamado-abraao', 'gn-promessa', 'gn-isaque', 'ex-mar-sinai'] },
  { id: 'familia', label: 'Famílias e reconciliação', experiences: ['gn-caim-abel', 'gn-jaco-esau', 'gn-jaco-familia', 'gn-jose-sonhos', 'gn-jose-perdao'], books: ['rute'] },
  { id: 'libertacao', label: 'Libertação e deserto', prefix: 'ex-' },
  { id: 'juizo-e-recomeco', label: 'Juízo e recomeço', experiences: ['gn-arca', 'gn-diluvio', 'gn-alianca-noe', 'gn-babel', 'gn-abraao-lo'] },
  { id: 'sabedoria', label: 'Poesia e sabedoria', books: ['salmos', 'proverbios', 'eclesiastes', 'jo-livro'] },
  { id: 'jesus', label: 'Vida de Jesus', books: ['mateus', 'marcos', 'lucas', 'joao'] },
  { id: 'igreja', label: 'Igreja e cartas', books: ['atos', 'romanos', '1-corintios', 'hebreus', 'apocalipse'] },
]

export function questionMatchesTheme(q: Question, t: Theme): boolean {
  if (q.experienceId && t.experiences?.includes(q.experienceId)) return true
  if (q.experienceId && t.prefix && q.experienceId.startsWith(t.prefix)) return true
  return Boolean(t.books?.includes(q.bookId))
}

/** Nomes usados para identificar perguntas sobre um personagem. */
function namesOf(name: string): string[] {
  return name
    .replace(/\(.*?\)/g, (m) => ',' + m.slice(1, -1))
    .split(/,| e /)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !/^(tempo|Faraó)$/i.test(s))
}

function textOf(q: Question): string {
  const parts: string[] = [q.prompt, q.explanation]
  if ('options' in q) parts.push(q.options[q.answer])
  if ('verse' in q && q.verse) parts.push(q.verse)
  if ('clues' in q && q.clues) parts.push(...q.clues)
  if ('items' in q) parts.push(...q.items)
  if ('pairs' in q) parts.push(...q.pairs.flatMap((p) => [p.a, p.b]))
  return parts.join(' ')
}

export function questionMentions(q: Question, characterId: string): boolean {
  const c = CHARACTERS.find((x) => x.id === characterId)
  if (!c) return false
  const text = textOf(q)
  return namesOf(c.name).some((n) => new RegExp(`(^|[^\\p{L}])${n}([^\\p{L}]|$)`, 'u').test(text))
}
