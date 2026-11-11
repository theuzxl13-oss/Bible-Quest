import type { Experience } from '../../types'
import { experiences } from './helpers'

/* ÊXODO — 4 experiências (capítulos 1–20). Mesmas regras de conteúdo de Gênesis. */
export const EXODO: Experience[] = experiences('exodo', [
  {
    id: 'ex-salvo',
    title: 'Moisés, salvo das águas',
    scope: 'Êxodo 1–2',
    image: 'joseph-israel',
    intro: [
      'Êxodo significa "saída". O livro começa séculos depois de José: os descendentes de Jacó se multiplicaram no Egito e um novo rei, que não conhecera José, os escraviza.',
    ],
    narrative: [
      'Os israelitas são oprimidos com trabalhos pesados. Um menino hebreu é escondido pela mãe num cesto às margens do Nilo.',
      'A filha de Faraó o encontra e o adota. Já adulto, Moisés foge para Midiã.',
    ],
    passages: [{ reference: 'Êxodo 2:10', text: 'E chamou o seu nome Moisés e disse: Porque das águas o tenho tirado.' }],
    references: ['Êxodo 1:1–22', 'Êxodo 2:1–25', 'Atos 7:17–29'],
    learning: [
      'As parteiras Sifrá e Puá temeram a Deus e não mataram os meninos (Êxodo 1:15–17). Em Midiã, Moisés casou-se com Zípora, filha de Jetro, também chamado Reuel.',
      'O capítulo termina dizendo que Deus ouviu o gemido do povo e se lembrou da aliança com Abraão, Isaque e Jacó (Êxodo 2:24).',
    ],
  },
  {
    id: 'ex-sarca',
    title: 'A sarça ardente',
    scope: 'Êxodo 3–4',
    image: 'place-catherine',
    intro: [
      'Horebe é outro nome usado para o monte de Deus, associado ao Sinai. A localização exata é debatida; a tradição a liga à região do Mosteiro de Santa Catarina, no sul do Sinai.',
    ],
    narrative: [
      'Pastoreando as ovelhas de Jetro, Moisés chega ao monte Horebe. Uma sarça arde em fogo, mas não se consome.',
      'Ali ele recebe uma missão que parece grande demais. Seu irmão Arão irá com ele.',
    ],
    passages: [
      { reference: 'Êxodo 3:5', text: 'Tira os teus sapatos de teus pés; porque o lugar em que tu estás é terra santa.' },
      { reference: 'Êxodo 3:14', text: 'E disse Deus a Moisés: EU SOU O QUE SOU.' },
    ],
    references: ['Êxodo 3:1–22', 'Êxodo 4:1–31'],
    learning: [
      'Deus revela seu nome a Moisés em Êxodo 3:14. Moisés recebe sinais, como a vara que se transforma em serpente.',
      'Moisés apresenta várias objeções à missão. O texto mostra que a chamada não depende da autoconfiança de quem é chamado.',
    ],
  },
  {
    id: 'ex-pragas',
    title: 'As pragas e a Páscoa',
    scope: 'Êxodo 5–12',
    image: 'moses-plague',
    intro: ['Diante de Faraó, Moisés e Arão pedem a libertação do povo. O coração do rei se endurece, e o Egito é atingido por dez pragas.'],
    narrative: [
      'Uma após outra, as pragas atingem o Egito, e o rei continua a recusar.',
      'Na última noite, as casas marcadas com sangue do cordeiro são poupadas. É a primeira Páscoa.',
    ],
    passages: [
      { reference: 'Êxodo 5:1', text: 'Assim diz o Senhor, Deus de Israel: Deixa ir o meu povo.' },
      { reference: 'Êxodo 12:13', text: 'Vendo eu sangue, passarei por cima de vós.' },
    ],
    references: ['Êxodo 5–11', 'Êxodo 12:1–42'],
    learning: [
      'As dez pragas foram: sangue, rãs, piolhos, moscas, peste nos animais, úlceras, saraiva, gafanhotos, trevas e morte dos primogênitos.',
      'A Páscoa (Pessach) passou a ser celebrada como memorial da libertação (Êxodo 12:14). No Novo Testamento, a Páscoa é o contexto da última ceia de Jesus.',
    ],
  },
  {
    id: 'ex-mar-sinai',
    title: 'O mar e o monte Sinai',
    scope: 'Êxodo 13–20',
    image: 'moses-sinai',
    intro: [
      'Guiado por uma coluna de nuvem de dia e de fogo à noite, o povo deixa o Egito. A data do Êxodo é debatida; as propostas mais comuns ficam entre os séculos XV e XIII a.C.',
    ],
    narrative: [
      'O povo chega ao mar, e atrás vêm os carros do Egito. O mar se abre e o povo passa em seco.',
      'Semanas depois, no Sinai, o monte fumega e são dadas as palavras da aliança.',
    ],
    passages: [
      { reference: 'Êxodo 14:14', text: 'O Senhor pelejará por vós, e vós vos calareis.' },
      { reference: 'Êxodo 20:3', text: 'Não terás outros deuses diante de mim.' },
    ],
    references: ['Êxodo 13:17–22', 'Êxodo 14–17', 'Êxodo 19:1–25', 'Êxodo 20:1–17', 'Deuteronômio 5:6–21'],
    learning: [
      'No deserto, o povo recebeu o maná e água da rocha. Miriã, irmã de Moisés, conduziu o cântico após a travessia.',
      'Os Dez Mandamentos começam lembrando a libertação (Êxodo 20:2): a lei é apresentada como resposta a um Deus que já havia libertado o povo.',
    ],
  },
])
