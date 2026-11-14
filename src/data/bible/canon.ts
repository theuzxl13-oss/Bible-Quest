import type { BookGroup, BookMeta, Canon, Testament } from '../../types'

/*
 * Cânon evangélico (protestante) de 66 livros, na ordem tradicional.
 * Para adicionar outro cânon (ex.: católico, com 73 livros), crie outra
 * constante Canon e selecione-a em ACTIVE_CANON. O resto do jogo usa
 * apenas os ids dos livros.
 */
const BOOKS_66: BookMeta[] = [
  { id: 'genesis', name: 'Gênesis', abbrev: 'Gn', testament: 'AT', group: 'pentateuco', chapters: 50 },
  { id: 'exodo', name: 'Êxodo', abbrev: 'Êx', testament: 'AT', group: 'pentateuco', chapters: 40 },
  { id: 'levitico', name: 'Levítico', abbrev: 'Lv', testament: 'AT', group: 'pentateuco', chapters: 27 },
  { id: 'numeros', name: 'Números', abbrev: 'Nm', testament: 'AT', group: 'pentateuco', chapters: 36 },
  { id: 'deuteronomio', name: 'Deuteronômio', abbrev: 'Dt', testament: 'AT', group: 'pentateuco', chapters: 34 },
  { id: 'josue', name: 'Josué', abbrev: 'Js', testament: 'AT', group: 'historicos', chapters: 24 },
  { id: 'juizes', name: 'Juízes', abbrev: 'Jz', testament: 'AT', group: 'historicos', chapters: 21 },
  { id: 'rute', name: 'Rute', abbrev: 'Rt', testament: 'AT', group: 'historicos', chapters: 4 },
  { id: '1-samuel', name: '1 Samuel', abbrev: '1Sm', testament: 'AT', group: 'historicos', chapters: 31 },
  { id: '2-samuel', name: '2 Samuel', abbrev: '2Sm', testament: 'AT', group: 'historicos', chapters: 24 },
  { id: '1-reis', name: '1 Reis', abbrev: '1Rs', testament: 'AT', group: 'historicos', chapters: 22 },
  { id: '2-reis', name: '2 Reis', abbrev: '2Rs', testament: 'AT', group: 'historicos', chapters: 25 },
  { id: '1-cronicas', name: '1 Crônicas', abbrev: '1Cr', testament: 'AT', group: 'historicos', chapters: 29 },
  { id: '2-cronicas', name: '2 Crônicas', abbrev: '2Cr', testament: 'AT', group: 'historicos', chapters: 36 },
  { id: 'esdras', name: 'Esdras', abbrev: 'Ed', testament: 'AT', group: 'historicos', chapters: 10 },
  { id: 'neemias', name: 'Neemias', abbrev: 'Ne', testament: 'AT', group: 'historicos', chapters: 13 },
  { id: 'ester', name: 'Ester', abbrev: 'Et', testament: 'AT', group: 'historicos', chapters: 10 },
  { id: 'jo-livro', name: 'Jó', abbrev: 'Jó', testament: 'AT', group: 'poeticos', chapters: 42 },
  { id: 'salmos', name: 'Salmos', abbrev: 'Sl', testament: 'AT', group: 'poeticos', chapters: 150 },
  { id: 'proverbios', name: 'Provérbios', abbrev: 'Pv', testament: 'AT', group: 'poeticos', chapters: 31 },
  { id: 'eclesiastes', name: 'Eclesiastes', abbrev: 'Ec', testament: 'AT', group: 'poeticos', chapters: 12 },
  { id: 'cantares', name: 'Cantares', abbrev: 'Ct', testament: 'AT', group: 'poeticos', chapters: 8 },
  { id: 'isaias', name: 'Isaías', abbrev: 'Is', testament: 'AT', group: 'profetas-maiores', chapters: 66 },
  { id: 'jeremias', name: 'Jeremias', abbrev: 'Jr', testament: 'AT', group: 'profetas-maiores', chapters: 52 },
  { id: 'lamentacoes', name: 'Lamentações', abbrev: 'Lm', testament: 'AT', group: 'profetas-maiores', chapters: 5 },
  { id: 'ezequiel', name: 'Ezequiel', abbrev: 'Ez', testament: 'AT', group: 'profetas-maiores', chapters: 48 },
  { id: 'daniel', name: 'Daniel', abbrev: 'Dn', testament: 'AT', group: 'profetas-maiores', chapters: 12 },
  { id: 'oseias', name: 'Oseias', abbrev: 'Os', testament: 'AT', group: 'profetas-menores', chapters: 14 },
  { id: 'joel', name: 'Joel', abbrev: 'Jl', testament: 'AT', group: 'profetas-menores', chapters: 3 },
  { id: 'amos', name: 'Amós', abbrev: 'Am', testament: 'AT', group: 'profetas-menores', chapters: 9 },
  { id: 'obadias', name: 'Obadias', abbrev: 'Ob', testament: 'AT', group: 'profetas-menores', chapters: 1 },
  { id: 'jonas', name: 'Jonas', abbrev: 'Jn', testament: 'AT', group: 'profetas-menores', chapters: 4 },
  { id: 'miqueias', name: 'Miqueias', abbrev: 'Mq', testament: 'AT', group: 'profetas-menores', chapters: 7 },
  { id: 'naum', name: 'Naum', abbrev: 'Na', testament: 'AT', group: 'profetas-menores', chapters: 3 },
  { id: 'habacuque', name: 'Habacuque', abbrev: 'Hc', testament: 'AT', group: 'profetas-menores', chapters: 3 },
  { id: 'sofonias', name: 'Sofonias', abbrev: 'Sf', testament: 'AT', group: 'profetas-menores', chapters: 3 },
  { id: 'ageu', name: 'Ageu', abbrev: 'Ag', testament: 'AT', group: 'profetas-menores', chapters: 2 },
  { id: 'zacarias', name: 'Zacarias', abbrev: 'Zc', testament: 'AT', group: 'profetas-menores', chapters: 14 },
  { id: 'malaquias', name: 'Malaquias', abbrev: 'Ml', testament: 'AT', group: 'profetas-menores', chapters: 4 },
  { id: 'mateus', name: 'Mateus', abbrev: 'Mt', testament: 'NT', group: 'evangelhos', chapters: 28 },
  { id: 'marcos', name: 'Marcos', abbrev: 'Mc', testament: 'NT', group: 'evangelhos', chapters: 16 },
  { id: 'lucas', name: 'Lucas', abbrev: 'Lc', testament: 'NT', group: 'evangelhos', chapters: 24 },
  { id: 'joao', name: 'João', abbrev: 'Jo', testament: 'NT', group: 'evangelhos', chapters: 21 },
  { id: 'atos', name: 'Atos', abbrev: 'At', testament: 'NT', group: 'atos', chapters: 28 },
  { id: 'romanos', name: 'Romanos', abbrev: 'Rm', testament: 'NT', group: 'cartas-paulinas', chapters: 16 },
  { id: '1-corintios', name: '1 Coríntios', abbrev: '1Co', testament: 'NT', group: 'cartas-paulinas', chapters: 16 },
  { id: '2-corintios', name: '2 Coríntios', abbrev: '2Co', testament: 'NT', group: 'cartas-paulinas', chapters: 13 },
  { id: 'galatas', name: 'Gálatas', abbrev: 'Gl', testament: 'NT', group: 'cartas-paulinas', chapters: 6 },
  { id: 'efesios', name: 'Efésios', abbrev: 'Ef', testament: 'NT', group: 'cartas-paulinas', chapters: 6 },
  { id: 'filipenses', name: 'Filipenses', abbrev: 'Fp', testament: 'NT', group: 'cartas-paulinas', chapters: 4 },
  { id: 'colossenses', name: 'Colossenses', abbrev: 'Cl', testament: 'NT', group: 'cartas-paulinas', chapters: 4 },
  { id: '1-tessalonicenses', name: '1 Tessalonicenses', abbrev: '1Ts', testament: 'NT', group: 'cartas-paulinas', chapters: 5 },
  { id: '2-tessalonicenses', name: '2 Tessalonicenses', abbrev: '2Ts', testament: 'NT', group: 'cartas-paulinas', chapters: 3 },
  { id: '1-timoteo', name: '1 Timóteo', abbrev: '1Tm', testament: 'NT', group: 'cartas-paulinas', chapters: 6 },
  { id: '2-timoteo', name: '2 Timóteo', abbrev: '2Tm', testament: 'NT', group: 'cartas-paulinas', chapters: 4 },
  { id: 'tito', name: 'Tito', abbrev: 'Tt', testament: 'NT', group: 'cartas-paulinas', chapters: 3 },
  { id: 'filemom', name: 'Filemom', abbrev: 'Fm', testament: 'NT', group: 'cartas-paulinas', chapters: 1 },
  { id: 'hebreus', name: 'Hebreus', abbrev: 'Hb', testament: 'NT', group: 'cartas-gerais', chapters: 13 },
  { id: 'tiago', name: 'Tiago', abbrev: 'Tg', testament: 'NT', group: 'cartas-gerais', chapters: 5 },
  { id: '1-pedro', name: '1 Pedro', abbrev: '1Pe', testament: 'NT', group: 'cartas-gerais', chapters: 5 },
  { id: '2-pedro', name: '2 Pedro', abbrev: '2Pe', testament: 'NT', group: 'cartas-gerais', chapters: 3 },
  { id: '1-joao', name: '1 João', abbrev: '1Jo', testament: 'NT', group: 'cartas-gerais', chapters: 5 },
  { id: '2-joao', name: '2 João', abbrev: '2Jo', testament: 'NT', group: 'cartas-gerais', chapters: 1 },
  { id: '3-joao', name: '3 João', abbrev: '3Jo', testament: 'NT', group: 'cartas-gerais', chapters: 1 },
  { id: 'judas', name: 'Judas', abbrev: 'Jd', testament: 'NT', group: 'cartas-gerais', chapters: 1 },
  { id: 'apocalipse', name: 'Apocalipse', abbrev: 'Ap', testament: 'NT', group: 'profecia', chapters: 22 },
]

export const CANON_EVANGELICO: Canon = {
  id: 'evangelico-66',
  name: 'Cânon evangélico (66 livros)',
  books: BOOKS_66,
}

export const ACTIVE_CANON: Canon = CANON_EVANGELICO

export const BOOKS = ACTIVE_CANON.books

export function getBook(id: string | undefined): BookMeta | undefined {
  return BOOKS.find((b) => b.id === id)
}

export function booksOf(testament: Testament): BookMeta[] {
  return BOOKS.filter((b) => b.testament === testament)
}

export const TESTAMENT_LABEL: Record<Testament, string> = {
  AT: 'Antigo Testamento',
  NT: 'Novo Testamento',
}

export const GROUP_INFO: Record<BookGroup, { label: string; image: string }> = {
  pentateuco: { label: 'Pentateuco', image: 'place-raheh' },
  historicos: { label: 'Livros históricos', image: 'hero-jerusalem' },
  poeticos: { label: 'Livros poéticos e de sabedoria', image: 'place-catherine' },
  'profetas-maiores': { label: 'Profetas maiores', image: 'ot-belshazzar' },
  'profetas-menores': { label: 'Profetas menores', image: 'place-petra' },
  evangelhos: { label: 'Evangelhos', image: 'nt-beatitudes' },
  atos: { label: 'Atos dos Apóstolos', image: 'nt-tiberias' },
  'cartas-paulinas': { label: 'Cartas de Paulo', image: 'hero-jerusalem' },
  'cartas-gerais': { label: 'Cartas gerais', image: 'nt-tiberias' },
  profecia: { label: 'Profecia', image: 'nt-heaven' },
}

/** Grupos na ordem em que aparecem no cânon. */
export function groupsOf(testament: Testament): { group: BookGroup; books: BookMeta[] }[] {
  const out: { group: BookGroup; books: BookMeta[] }[] = []
  for (const b of booksOf(testament)) {
    const last = out[out.length - 1]
    if (last && last.group === b.group) last.books.push(b)
    else out.push({ group: b.group, books: [b] })
  }
  return out
}
