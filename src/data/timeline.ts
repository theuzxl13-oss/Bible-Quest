/*
 * LINHA DO TEMPO BÍBLICA
 * Cada evento informa o TIPO de informação de data:
 *  - 'biblico': a sequência ou o dado vem diretamente do texto bíblico
 *    (por exemplo, "depois do dilúvio"), sem data em calendário moderno;
 *  - 'estimado': data aproximada com amplo apoio histórico;
 *  - 'debatido': propostas diferentes entre estudiosos.
 * Nenhuma data precisa é inventada.
 */
export type DatingKind = 'biblico' | 'estimado' | 'debatido'

export interface TimelineEvent {
  id: string
  era: string
  title: string
  dating: { kind: DatingKind; label: string }
  description: string
  references: string[]
  books: string[]
  characters: string[]
  /** Fase do Modo História relacionada, se houver. */
  experienceId?: string
}

export const DATING_LABEL: Record<DatingKind, string> = {
  biblico: 'Sequência bíblica',
  estimado: 'Data estimada',
  debatido: 'Data debatida',
}

export const TIMELINE: TimelineEvent[] = [
  {
    id: 't-criacao', era: 'Origens', title: 'A criação', experienceId: 'gn-criacao',
    dating: { kind: 'debatido', label: 'Sem data no texto; a leitura dos "dias" é debatida' },
    description: 'Gênesis abre a Bíblia com a criação dos céus e da terra e do ser humano à imagem de Deus.',
    references: ['Gênesis 1–2'], books: ['genesis'], characters: ['adao', 'eva'],
  },
  {
    id: 't-queda', era: 'Origens', title: 'A queda e a saída do Éden', experienceId: 'gn-queda',
    dating: { kind: 'biblico', label: 'Logo após a criação, segundo a narrativa' },
    description: 'A desobediência no jardim e a promessa de Gênesis 3:15.',
    references: ['Gênesis 3'], books: ['genesis'], characters: ['adao', 'eva'],
  },
  {
    id: 't-diluvio', era: 'Origens', title: 'O dilúvio', experienceId: 'gn-diluvio',
    dating: { kind: 'debatido', label: 'Noé tinha 600 anos (Gênesis 7:6); data em calendário moderno é debatida' },
    description: 'As águas cobrem a terra; Noé e sua família são preservados na arca.',
    references: ['Gênesis 6–9'], books: ['genesis'], characters: ['noe'],
  },
  {
    id: 't-babel', era: 'Origens', title: 'A torre de Babel', experienceId: 'gn-babel',
    dating: { kind: 'biblico', label: 'Depois do dilúvio, na terra de Sinar' },
    description: 'A confusão das línguas e a dispersão dos povos.',
    references: ['Gênesis 11:1–9'], books: ['genesis'], characters: [],
  },
  {
    id: 't-abraao', era: 'Patriarcas', title: 'O chamado de Abraão', experienceId: 'gn-chamado-abraao',
    dating: { kind: 'debatido', label: 'Tradicionalmente início do 2º milênio a.C.; debatido' },
    description: 'Abrão deixa Harã rumo a Canaã aos 75 anos, com a promessa de terra, descendência e bênção.',
    references: ['Gênesis 12:1–9'], books: ['genesis'], characters: ['abraao', 'sara', 'lo'],
  },
  {
    id: 't-isaque', era: 'Patriarcas', title: 'Nascimento de Isaque', experienceId: 'gn-isaque',
    dating: { kind: 'biblico', label: 'Abraão tinha 100 anos (Gênesis 21:5)' },
    description: 'Cumpre-se a promessa de um filho a Abraão e Sara.',
    references: ['Gênesis 21:1–7'], books: ['genesis'], characters: ['isaque', 'abraao', 'sara'],
  },
  {
    id: 't-jaco', era: 'Patriarcas', title: 'Jacó recebe o nome de Israel', experienceId: 'gn-jaco-familia',
    dating: { kind: 'biblico', label: 'Na volta de Harã para Canaã' },
    description: 'Os doze filhos de Jacó darão nome às tribos de Israel.',
    references: ['Gênesis 32:28', 'Gênesis 35:22–26'], books: ['genesis'], characters: ['jaco'],
  },
  {
    id: 't-jose', era: 'Patriarcas', title: 'José governa o Egito', experienceId: 'gn-jose-egito',
    dating: { kind: 'biblico', label: 'José tinha 30 anos (Gênesis 41:46)' },
    description: 'A família de Jacó se estabelece em Gósen durante a fome.',
    references: ['Gênesis 41–47'], books: ['genesis'], characters: ['jose', 'jaco'],
  },
  {
    id: 't-exodo', era: 'Êxodo e deserto', title: 'A saída do Egito', experienceId: 'ex-pragas',
    dating: { kind: 'debatido', label: 'Propostas entre os séculos XV e XIII a.C.' },
    description: 'Depois das pragas e da primeira Páscoa, o povo deixa o Egito e atravessa o mar.',
    references: ['Êxodo 12–14'], books: ['exodo'], characters: ['moises', 'arao'],
  },
  {
    id: 't-sinai', era: 'Êxodo e deserto', title: 'A aliança no Sinai', experienceId: 'ex-mar-sinai',
    dating: { kind: 'biblico', label: 'No terceiro mês após a saída do Egito (Êxodo 19:1)' },
    description: 'O povo recebe os Dez Mandamentos. Deuteronômio 5 os repete.',
    references: ['Êxodo 19–20', 'Deuteronômio 5'], books: ['exodo', 'deuteronomio'], characters: ['moises'],
  },
  {
    id: 't-conquista', era: 'Terra prometida', title: 'Entrada em Canaã',
    dating: { kind: 'debatido', label: 'Depende da data do Êxodo; debatido' },
    description: 'Depois de quarenta anos no deserto, o povo entra na terra com Josué.',
    references: ['Josué 1–6'], books: ['numeros', 'josue'], characters: [],
  },
  {
    id: 't-davi', era: 'Reino', title: 'Reinado de Davi',
    dating: { kind: 'estimado', label: 'Por volta de 1000 a.C. (estimativa comum)' },
    description: 'Davi reina sobre Israel e recebe a promessa de uma dinastia (2 Samuel 7).',
    references: ['2 Samuel 5–7'], books: ['1-samuel', '2-samuel', '1-cronicas'], characters: [],
  },
  {
    id: 't-templo', era: 'Reino', title: 'Salomão constrói o templo',
    dating: { kind: 'estimado', label: 'Século X a.C. (estimativa)' },
    description: 'O templo é construído em Jerusalém, no monte Moriá (2 Crônicas 3:1).',
    references: ['1 Reis 6–8', '2 Crônicas 3'], books: ['1-reis', '2-cronicas'], characters: [],
  },
  {
    id: 't-divisao', era: 'Reino', title: 'Divisão do reino',
    dating: { kind: 'estimado', label: 'Por volta de 930 a.C. (estimativa)' },
    description: 'Depois de Salomão, o reino se divide em Israel, ao norte, e Judá, ao sul.',
    references: ['1 Reis 12'], books: ['1-reis', '2-cronicas'], characters: [],
  },
  {
    id: 't-samaria', era: 'Reino', title: 'Queda de Samaria',
    dating: { kind: 'estimado', label: '722 a.C. (data bem estabelecida historicamente)' },
    description: 'O reino do norte é levado pela Assíria.',
    references: ['2 Reis 17'], books: ['2-reis'], characters: [],
  },
  {
    id: 't-exilio', era: 'Exílio e retorno', title: 'Destruição de Jerusalém e exílio na Babilônia',
    dating: { kind: 'estimado', label: '586 a.C. (data bem estabelecida historicamente)' },
    description: 'O templo é destruído e parte do povo é levada para a Babilônia. Lamentações, Jeremias, Ezequiel e Daniel se relacionam a esse período.',
    references: ['2 Reis 25', '2 Crônicas 36'], books: ['2-reis', 'lamentacoes', 'jeremias', 'ezequiel', 'daniel'], characters: [],
  },
  {
    id: 't-retorno', era: 'Exílio e retorno', title: 'Retorno do exílio',
    dating: { kind: 'estimado', label: 'A partir de 538 a.C., após o decreto de Ciro' },
    description: 'Retorno a Jerusalém, reconstrução do templo e, depois, dos muros.',
    references: ['Esdras 1', 'Neemias 2'], books: ['esdras', 'neemias', 'ageu', 'zacarias'], characters: [],
  },
  {
    id: 't-jesus', era: 'Evangelhos', title: 'Nascimento de Jesus',
    dating: { kind: 'estimado', label: 'Por volta de 6–4 a.C. (estimativa)' },
    description: 'Jesus nasce em Belém, segundo Mateus e Lucas.',
    references: ['Mateus 1–2', 'Lucas 2'], books: ['mateus', 'lucas'], characters: [],
  },
  {
    id: 't-cruz', era: 'Evangelhos', title: 'Crucificação e ressurreição de Jesus',
    dating: { kind: 'estimado', label: 'Por volta de 30–33 d.C. (estimativa)' },
    description: 'Os quatro Evangelhos narram a morte e a ressurreição de Jesus.',
    references: ['Mateus 27–28', 'Marcos 15–16', 'Lucas 23–24', 'João 19–20'], books: ['mateus', 'marcos', 'lucas', 'joao'], characters: [],
  },
  {
    id: 't-pentecostes', era: 'Igreja primitiva', title: 'Pentecostes',
    dating: { kind: 'biblico', label: 'Cinquenta dias após a Páscoa' },
    description: 'O Espírito Santo é derramado em Jerusalém e a igreja começa a crescer.',
    references: ['Atos 2'], books: ['atos'], characters: [],
  },
  {
    id: 't-paulo', era: 'Igreja primitiva', title: 'Viagens missionárias de Paulo',
    dating: { kind: 'estimado', label: 'Meados do século I d.C. (estimativa)' },
    description: 'As igrejas se espalham pelo Império Romano. Muitas cartas do Novo Testamento são desse período.',
    references: ['Atos 13–28'], books: ['atos', 'romanos', '1-corintios', 'galatas'], characters: [],
  },
  {
    id: 't-apocalipse', era: 'Igreja primitiva', title: 'As visões de João',
    dating: { kind: 'debatido', label: 'Final do século I d.C. é a proposta mais comum; debatido' },
    description: 'João recebe as visões na ilha de Patmos (Apocalipse 1:9).',
    references: ['Apocalipse 1:9–11'], books: ['apocalipse'], characters: [],
  },
]
