import type { Question } from '../../types'
import type { QuestionInput } from './helpers'

/*
 * Perguntas de toda a Bíblia usadas SOMENTE no Modo Livre (sem experienceId).
 * Citações: Almeida Revista e Corrigida 1911 (domínio público), em revisão.
 * Onde a redação exata não foi conferida, o enunciado descreve o
 * acontecimento em vez de citar o texto.
 */
type GeneralInput = QuestionInput & { bookId: string }

const list: GeneralInput[] = [
  // Identifique o livro
  {
    id: 'lv-01', bookId: 'salmos', type: 'book', difficulty: 1, category: 'livros',
    prompt: 'Em qual livro está escrito: "O Senhor é o meu pastor; nada me faltará"?',
    options: ['Salmos', 'Provérbios', 'Isaías', 'João'], answer: 0,
    explanation: 'É o início do Salmo 23, atribuído a Davi.',
    reference: 'Salmos 23:1',
  },
  {
    id: 'lv-02', bookId: 'joao', type: 'book', difficulty: 1, category: 'livros',
    prompt: 'Em qual livro está escrito: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito"?',
    options: ['João', 'Mateus', 'Romanos', 'Hebreus'], answer: 0,
    explanation: 'É um dos versículos mais conhecidos do Evangelho de João.',
    reference: 'João 3:16',
  },
  {
    id: 'lv-03', bookId: 'eclesiastes', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está escrito: "Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu"?',
    options: ['Eclesiastes', 'Provérbios', 'Jó', 'Salmos'], answer: 0,
    explanation: 'Eclesiastes 3 lista vários "tempos" da vida humana.',
    reference: 'Eclesiastes 3:1',
  },
  {
    id: 'lv-04', bookId: 'proverbios', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está escrito: "O temor do Senhor é o princípio da ciência"?',
    options: ['Provérbios', 'Eclesiastes', 'Deuteronômio', 'Lamentações'], answer: 0,
    explanation: 'É o lema que abre o livro de Provérbios.',
    reference: 'Provérbios 1:7',
  },
  {
    id: 'lv-05', bookId: '1-corintios', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual carta está escrito: "O amor é sofredor, é benigno"?',
    options: ['1 Coríntios', 'Gálatas', 'Efésios', '1 Pedro'], answer: 0,
    explanation: '1 Coríntios 13 é conhecido como o capítulo do amor.',
    reference: '1 Coríntios 13:4',
  },
  {
    id: 'lv-06', bookId: 'hebreus', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está escrito: "Ora, a fé é o firme fundamento das coisas que se esperam"?',
    options: ['Hebreus', 'Tiago', 'Romanos', 'Judas'], answer: 0,
    explanation: 'Hebreus 11 apresenta uma galeria de exemplos de fé, de Abel a Raabe.',
    reference: 'Hebreus 11:1',
  },
  {
    id: 'lv-07', bookId: 'apocalipse', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está escrito: "Eis que estou à porta e bato"?',
    options: ['Apocalipse', 'Lucas', 'Cantares', 'Atos'], answer: 0,
    explanation: 'A frase faz parte da mensagem à igreja de Laodiceia.',
    reference: 'Apocalipse 3:20',
  },
  {
    id: 'lv-08', bookId: 'mateus', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está escrito: "Bem-aventurados os pobres de espírito, porque deles é o Reino dos céus"?',
    options: ['Mateus', 'Marcos', 'Romanos', 'Tiago'], answer: 0,
    explanation: 'É a primeira bem-aventurança do Sermão do Monte.',
    reference: 'Mateus 5:3',
  },
  {
    id: 'lv-09', bookId: '1-samuel', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está o relato de Davi vencendo o gigante Golias?',
    options: ['1 Samuel', '2 Samuel', 'Juízes', '1 Reis'], answer: 0,
    explanation: 'O confronto com Golias está em 1 Samuel 17.',
    reference: '1 Samuel 17',
  },
  {
    id: 'lv-10', bookId: 'daniel', type: 'book', difficulty: 1, category: 'livros',
    prompt: 'Em qual livro está o relato do homem lançado na cova dos leões?',
    options: ['Daniel', 'Ezequiel', 'Jeremias', 'Ester'], answer: 0,
    explanation: 'Daniel foi lançado na cova por continuar orando a Deus.',
    reference: 'Daniel 6',
  },
  {
    id: 'lv-11', bookId: 'jonas', type: 'book', difficulty: 1, category: 'livros',
    prompt: 'Em qual livro um profeta é engolido por um grande peixe?',
    options: ['Jonas', 'Naum', 'Miqueias', 'Amós'], answer: 0,
    explanation: 'Jonas esteve três dias e três noites no ventre do peixe.',
    reference: 'Jonas 1:17',
  },
  {
    id: 'lv-12', bookId: 'atos', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está o relato de Saulo vendo uma luz do céu no caminho para Damasco?',
    options: ['Atos dos Apóstolos', 'Filemom', 'Romanos', 'Lucas'], answer: 0,
    explanation: 'A conversão de Saulo é narrada em Atos 9 e recontada por ele em Atos 22 e 26.',
    reference: 'Atos 9:1–9',
  },
  {
    id: 'lv-13', bookId: 'atos', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está o relato do dia de Pentecostes, quando os discípulos falaram em outras línguas?',
    options: ['Atos dos Apóstolos', 'João', 'Marcos', 'Romanos'], answer: 0,
    explanation: 'O Pentecostes é narrado em Atos 2.',
    reference: 'Atos 2:1–13',
  },
  {
    id: 'lv-14', bookId: 'neemias', type: 'book', difficulty: 3, category: 'livros',
    prompt: 'Em qual livro está o relato da reconstrução dos muros de Jerusalém após o exílio?',
    options: ['Neemias', 'Ageu', 'Lamentações', 'Josué'], answer: 0,
    explanation: 'Neemias, copeiro do rei persa, lidera a reconstrução dos muros.',
    reference: 'Neemias 2:17–18; 6:15',
  },
  {
    id: 'lv-15', bookId: 'rute', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro uma moabita diz à sogra: "o teu povo é o meu povo, o teu Deus é o meu Deus"?',
    options: ['Rute', 'Ester', 'Juízes', '1 Samuel'], answer: 0,
    explanation: 'Rute decide acompanhar Noemi de volta a Belém.',
    reference: 'Rute 1:16',
  },
  {
    id: 'lv-16', bookId: 'josue', type: 'book', difficulty: 2, category: 'livros',
    prompt: 'Em qual livro está o relato da queda dos muros de Jericó?',
    options: ['Josué', 'Juízes', 'Números', 'Êxodo'], answer: 0,
    explanation: 'Os muros caíram depois de sete dias de voltas ao redor da cidade.',
    reference: 'Josué 6',
  },
  // Quem sou eu? (toda a Bíblia)
  {
    id: 'ge-01', bookId: '1-samuel', type: 'whoami', difficulty: 1, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui pastor de ovelhas em Belém.', 'Fui ungido por Samuel ainda jovem.', 'Venci o gigante Golias.'],
    options: ['Davi', 'Saul', 'Salomão', 'Samuel'], answer: 0,
    explanation: 'Davi foi ungido por Samuel e mais tarde se tornou rei de Israel.',
    reference: '1 Samuel 16:11–13; 17:49–50',
  },
  {
    id: 'ge-02', bookId: 'ester', type: 'whoami', difficulty: 2, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui criada por meu primo Mardoqueu.', 'Tornei-me rainha na Pérsia.', 'Intercedi pelo meu povo diante do rei Assuero.'],
    options: ['Ester', 'Rute', 'Débora', 'Ana'], answer: 0,
    explanation: 'Ester arriscou a vida para interceder pelos judeus.',
    reference: 'Ester 2:7, 17; 7:3',
  },
  {
    id: 'ge-03', bookId: 'mateus', type: 'whoami', difficulty: 1, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui pescador na Galileia.', 'Sou irmão de André.', 'Andei sobre as águas em direção a Jesus.'],
    options: ['Pedro', 'João', 'Tiago', 'Paulo'], answer: 0,
    explanation: 'Simão Pedro foi chamado por Jesus junto ao mar da Galileia.',
    reference: 'Mateus 4:18; 14:29',
  },
  {
    id: 'ge-04', bookId: '1-reis', type: 'whoami', difficulty: 2, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Sou filho de Davi.', 'Pedi a Deus um coração entendido para julgar o povo.', 'Edifiquei o templo em Jerusalém.'],
    options: ['Salomão', 'Roboão', 'Ezequias', 'Josias'], answer: 0,
    explanation: 'Salomão pediu sabedoria e construiu o primeiro templo.',
    reference: '1 Reis 3:9; 6:1, 14',
  },
  {
    id: 'ge-05', bookId: '2-reis', type: 'whoami', difficulty: 3, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui profeta no tempo do rei Acabe.', 'Fui alimentado por corvos junto ao ribeiro de Querite.', 'Subi ao céu num redemoinho.'],
    options: ['Elias', 'Eliseu', 'Jonas', 'Isaías'], answer: 0,
    explanation: 'Elias foi levado ao céu diante de Eliseu.',
    reference: '1 Reis 17:1–6; 2 Reis 2:11',
  },
  // Perguntas gerais
  {
    id: 'ge-06', bookId: 'mateus', type: 'multiple', difficulty: 1, category: 'geografia',
    prompt: 'Em que cidade Jesus nasceu?',
    options: ['Belém', 'Nazaré', 'Jerusalém', 'Cafarnaum'], answer: 0,
    explanation: 'Jesus nasceu em Belém da Judeia e cresceu em Nazaré.',
    reference: 'Mateus 2:1; Lucas 2:4–7',
  },
  {
    id: 'ge-07', bookId: 'lucas', type: 'multiple', difficulty: 1, category: 'personagens',
    prompt: 'Quantos discípulos Jesus escolheu e chamou de apóstolos?',
    options: ['Doze', 'Sete', 'Dez', 'Setenta'], answer: 0,
    explanation: 'Jesus escolheu doze, a quem também deu o nome de apóstolos.',
    reference: 'Lucas 6:13',
  },
  {
    id: 'ge-08', bookId: 'joao', type: 'truefalse', difficulty: 1, category: 'narrativa',
    prompt: 'Jesus transformou água em vinho numa festa de casamento em Caná da Galileia.',
    answer: true,
    explanation: 'João chama esse acontecimento de o primeiro dos sinais de Jesus.',
    reference: 'João 2:1–11',
  },
  {
    id: 'ge-09', bookId: '1-samuel', type: 'truefalse', difficulty: 1, category: 'historia',
    prompt: 'Davi foi o primeiro rei de Israel.',
    answer: false,
    explanation: 'O primeiro rei foi Saul, ungido por Samuel. Davi veio depois.',
    reference: '1 Samuel 10:1; 16:13',
  },
  {
    id: 'ge-10', bookId: 'apocalipse', type: 'truefalse', difficulty: 1, category: 'livros',
    prompt: 'No cânon evangélico, Apocalipse é o último livro da Bíblia.',
    answer: true,
    explanation: 'Apocalipse fecha o Novo Testamento e a Bíblia.',
    reference: 'Apocalipse 1:1',
  },
  {
    id: 'ge-11', bookId: 'genesis', type: 'order', difficulty: 2, category: 'cronologia',
    prompt: 'Organize estes acontecimentos na ordem da história bíblica.',
    items: ['A criação', 'O dilúvio', 'O chamado de Abraão', 'A saída do Egito', 'O reinado de Davi', 'O exílio na Babilônia'],
    explanation: 'Uma visão panorâmica do Antigo Testamento, de Gênesis a 2 Reis.',
    reference: 'Gênesis 1; 7; 12; Êxodo 12; 2 Samuel 5; 2 Reis 25',
  },
  {
    id: 'ge-12', bookId: 'lucas', type: 'order', difficulty: 2, category: 'cronologia',
    prompt: 'Organize os acontecimentos da vida de Jesus segundo Lucas.',
    items: ['O nascimento em Belém', 'O batismo no rio Jordão', 'A escolha dos doze apóstolos', 'A crucificação', 'A ressurreição'],
    explanation: 'Lucas narra esses acontecimentos nos capítulos 2, 3, 6, 23 e 24.',
    reference: 'Lucas 2; 3; 6; 23; 24',
  },
  {
    id: 'ge-13', bookId: 'salmos', type: 'complete', difficulty: 1, category: 'versiculos',
    prompt: 'Complete o versículo.',
    verse: 'O Senhor é o meu ____; nada me faltará.',
    options: ['pastor', 'rei', 'refúgio', 'guia'], answer: 0,
    explanation: 'O Salmo 23 usa a imagem do pastor que cuida das ovelhas.',
    reference: 'Salmos 23:1',
  },
  {
    id: 'ge-14', bookId: 'joao', type: 'complete', difficulty: 1, category: 'versiculos',
    prompt: 'Complete o versículo.',
    verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho ____, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    options: ['unigênito', 'amado', 'eterno', 'escolhido'], answer: 0,
    explanation: '"Unigênito" significa único, o único Filho.',
    reference: 'João 3:16',
  },
  {
    id: 'ge-15', bookId: 'mateus', type: 'complete', difficulty: 2, category: 'versiculos',
    prompt: 'Complete o versículo.',
    verse: 'Bem-aventurados os ____, porque eles serão chamados filhos de Deus.',
    options: ['pacificadores', 'mansos', 'humildes', 'justos'], answer: 0,
    explanation: 'É uma das bem-aventuranças do Sermão do Monte.',
    reference: 'Mateus 5:9',
  },
  {
    id: 'ge-16', bookId: 'mateus', type: 'truefalse', difficulty: 1, category: 'livros',
    prompt: 'O Novo Testamento começa com o Evangelho de Mateus.',
    answer: true,
    explanation: 'Mateus abre com a genealogia de Jesus.',
    reference: 'Mateus 1:1',
  },
  {
    id: 'ge-17', bookId: 'daniel', type: 'multiple', difficulty: 1, category: 'personagens',
    prompt: 'Quem foi lançado na cova dos leões por continuar orando a Deus?',
    options: ['Daniel', 'Jeremias', 'José', 'Neemias'], answer: 0,
    explanation: 'Daniel orava três vezes ao dia, mesmo depois do decreto do rei.',
    reference: 'Daniel 6:10–16',
  },
  {
    id: 'ge-18', bookId: 'genesis', type: 'memory', difficulty: 1, category: 'livros',
    prompt: 'Associe cada posição ao livro correspondente (cânon evangélico).',
    pairs: [
      { a: 'Primeiro livro da Bíblia', b: 'Gênesis' },
      { a: 'Último livro do Antigo Testamento', b: 'Malaquias' },
      { a: 'Primeiro livro do Novo Testamento', b: 'Mateus' },
      { a: 'Último livro da Bíblia', b: 'Apocalipse' },
    ],
    explanation: 'O cânon evangélico tem 39 livros no Antigo Testamento e 27 no Novo.',
    reference: 'Gênesis 1:1; Malaquias 4:6; Mateus 1:1; Apocalipse 22:21',
  },
]

export const GERAL_QUESTIONS: Question[] = list as Question[]
