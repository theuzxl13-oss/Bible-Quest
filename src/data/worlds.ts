/*
 * MUNDOS DA JORNADA
 * Cada mundo agrupa livros consecutivos do cânon e define a ambientação do
 * mapa (cores, pintura de fundo e elementos de cenário). Para expandir o jogo,
 * basta adicionar experiências aos livros: o mundo passa a ter fases.
 */
export type DecorKind =
  | 'arvore' | 'palmeira' | 'flor' | 'montanha' | 'rio' | 'tenda' | 'piramide'
  | 'coluna' | 'cidade' | 'onda' | 'estrela' | 'arca' | 'torre' | 'duna' | 'oliveira' | 'pergaminho'

export interface World {
  id: string
  number: number
  title: string
  subtitle: string
  books: string[]
  art: string
  theme: { ground: string; groundDeep: string; path: string; accent: string }
  decor: DecorKind[]
}

export const WORLDS: World[] = [
  {
    id: 'mundo-genesis', number: 1, title: 'Gênesis', subtitle: 'Jardins, montanhas e os caminhos dos patriarcas',
    books: ['genesis'], art: 'creation-eden',
    theme: { ground: '#24412e', groundDeep: '#132619', path: '#e6d4a4', accent: '#a9d18e' },
    decor: ['arvore', 'flor', 'montanha', 'rio', 'arca', 'torre', 'tenda', 'estrela', 'oliveira', 'piramide'],
  },
  {
    id: 'mundo-exodo', number: 2, title: 'Êxodo e o deserto', subtitle: 'O Egito antigo, o mar e o monte de Deus',
    books: ['exodo', 'levitico', 'numeros', 'deuteronomio'], art: 'moses-leaving',
    theme: { ground: '#6b4a24', groundDeep: '#3d2812', path: '#f3e2b5', accent: '#f0b75a' },
    decor: ['piramide', 'palmeira', 'duna', 'onda', 'montanha', 'tenda', 'coluna'],
  },
  {
    id: 'mundo-conquista', number: 3, title: 'Conquista e Terra Prometida', subtitle: 'Campos, cidades muradas e juízes',
    books: ['josue', 'juizes', 'rute'], art: 'place-raheh',
    theme: { ground: '#4f5a2a', groundDeep: '#2b3315', path: '#eadcab', accent: '#d8c66a' },
    decor: ['oliveira', 'cidade', 'montanha', 'rio', 'flor'],
  },
  {
    id: 'mundo-reino', number: 4, title: 'Reis e reinos', subtitle: 'Samuel, Davi, Salomão e o templo',
    books: ['1-samuel', '2-samuel', '1-reis', '2-reis', '1-cronicas', '2-cronicas'], art: 'hero-jerusalem',
    theme: { ground: '#5a4a3a', groundDeep: '#30261c', path: '#efe1bd', accent: '#e8c46c' },
    decor: ['cidade', 'coluna', 'oliveira', 'montanha'],
  },
  {
    id: 'mundo-exilio', number: 5, title: 'Exílio e retorno', subtitle: 'Babilônia, Pérsia e a reconstrução',
    books: ['esdras', 'neemias', 'ester'], art: 'ot-belshazzar',
    theme: { ground: '#4a3550', groundDeep: '#28192c', path: '#ead7b8', accent: '#d9a46c' },
    decor: ['coluna', 'cidade', 'palmeira', 'rio'],
  },
  {
    id: 'mundo-poesia', number: 6, title: 'Poesia e sabedoria', subtitle: 'Cânticos, orações e provérbios',
    books: ['jo-livro', 'salmos', 'proverbios', 'eclesiastes', 'cantares'], art: 'place-catherine',
    theme: { ground: '#2f3f55', groundDeep: '#18212f', path: '#efe3c4', accent: '#9cc3e6' },
    decor: ['estrela', 'pergaminho', 'montanha', 'flor'],
  },
  {
    id: 'mundo-profetas', number: 7, title: 'Os profetas', subtitle: 'Mensagens de juízo e de esperança',
    books: ['isaias', 'jeremias', 'lamentacoes', 'ezequiel', 'daniel', 'oseias', 'joel', 'amos', 'obadias', 'jonas', 'miqueias', 'naum', 'habacuque', 'sofonias', 'ageu', 'zacarias', 'malaquias'], art: 'ot-belshazzar',
    theme: { ground: '#3b2f2a', groundDeep: '#1f1814', path: '#eadab8', accent: '#e39a5c' },
    decor: ['pergaminho', 'cidade', 'onda', 'montanha', 'estrela'],
  },
  {
    id: 'mundo-evangelhos', number: 8, title: 'Os Evangelhos', subtitle: 'A Galileia, Jerusalém e a vida de Jesus',
    books: ['mateus', 'marcos', 'lucas', 'joao'], art: 'nt-tiberias',
    theme: { ground: '#2c4a45', groundDeep: '#152825', path: '#efe3c4', accent: '#8fd1c4' },
    decor: ['rio', 'oliveira', 'montanha', 'cidade', 'estrela'],
  },
  {
    id: 'mundo-igreja', number: 9, title: 'A igreja primitiva', subtitle: 'Atos e as cartas às comunidades',
    books: ['atos', 'romanos', '1-corintios', '2-corintios', 'galatas', 'efesios', 'filipenses', 'colossenses', '1-tessalonicenses', '2-tessalonicenses', '1-timoteo', '2-timoteo', 'tito', 'filemom', 'hebreus', 'tiago', '1-pedro', '2-pedro', '1-joao', '2-joao', '3-joao', 'judas'], art: 'nt-tiberias',
    theme: { ground: '#30405e', groundDeep: '#182035', path: '#efe3c4', accent: '#b3c7f0' },
    decor: ['coluna', 'onda', 'cidade', 'pergaminho'],
  },
  {
    id: 'mundo-apocalipse', number: 10, title: 'Apocalipse', subtitle: 'Visões e a esperança da nova criação',
    books: ['apocalipse'], art: 'nt-heaven',
    theme: { ground: '#3a3060', groundDeep: '#1d1733', path: '#f7e9c2', accent: '#f4d77d' },
    decor: ['estrela', 'montanha', 'rio', 'cidade'],
  },
]

export function worldOfBook(bookId: string): World | undefined {
  return WORLDS.find((w) => w.books.includes(bookId))
}
