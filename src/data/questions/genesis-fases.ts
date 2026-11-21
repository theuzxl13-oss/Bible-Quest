import { bank } from './helpers'

/** Perguntas adicionadas na v0.3 para completar as 20 fases de Gênesis (5 a 10 por fase). */
export const GENESIS_FASES_QUESTIONS = bank('genesis', [
  // Noé, um homem justo
  {
    id: 'no-24', experienceId: 'gn-noe', type: 'complete', difficulty: 1, category: 'versiculos',
    prompt: 'Complete o versículo.',
    verse: 'Noé era varão justo e reto em suas gerações; Noé andava com ____.',
    options: ['Deus', 'seus filhos', 'os anjos', 'Enoque'], answer: 0,
    explanation: 'A mesma expressão foi usada antes para Enoque (Gênesis 5:24).',
    reference: 'Gênesis 6:9',
  },
  {
    id: 'no-25', experienceId: 'gn-noe', type: 'multiple', difficulty: 3, category: 'cronologia',
    prompt: 'Segundo Gênesis 5, com que idade Noé gerou Sem, Cam e Jafé?',
    options: ['500 anos', '600 anos', '120 anos', '950 anos'], answer: 0,
    explanation: 'Gênesis 5:32 diz que Noé tinha quinhentos anos quando gerou seus três filhos.',
    reference: 'Gênesis 5:32',
  },
  // A torre de Babel (imagem)
  {
    id: 'img-01', experienceId: 'gn-babel', type: 'multiple', difficulty: 1, category: 'narrativa',
    image: 'gn-babel',
    prompt: 'Esta pintura de Pieter Bruegel (1563) retrata qual relato de Gênesis?',
    options: ['A torre de Babel', 'A construção da arca', 'A cidade de Sodoma', 'O palácio de Faraó'], answer: 0,
    explanation: 'Bruegel imaginou a torre com arcos e andares em espiral. Gênesis diz apenas que era feita de tijolos e betume.',
    reference: 'Gênesis 11:1–9',
  },
  // O dilúvio (imagem)
  {
    id: 'img-03', experienceId: 'gn-diluvio', type: 'multiple', difficulty: 1, category: 'narrativa',
    image: 'noah-deluge',
    prompt: 'Esta pintura de John Martin (1834) retrata qual acontecimento?',
    options: ['O dilúvio', 'A travessia do mar Vermelho', 'A criação da luz', 'A destruição de Sodoma'], answer: 0,
    explanation: 'O título da obra é "O Dilúvio". O texto bíblico descreve as águas cobrindo até os montes altos.',
    reference: 'Gênesis 7:17–20',
  },
  // Abraão e Ló
  {
    id: 'ab-23', experienceId: 'gn-abraao-lo', type: 'multiple', difficulty: 3, category: 'narrativa',
    prompt: 'Quantos servos nascidos em sua casa Abrão armou para resgatar Ló?',
    options: ['318', '12', '70', '1.000'], answer: 0,
    explanation: 'Abrão armou trezentos e dezoito criados e perseguiu os reis até Dã.',
    reference: 'Gênesis 14:14',
  },
  {
    id: 'ab-24', experienceId: 'gn-abraao-lo', type: 'truefalse', difficulty: 1, category: 'narrativa',
    prompt: 'A mulher de Ló olhou para trás e foi convertida numa estátua de sal.',
    answer: true,
    explanation: 'Jesus lembra esse episódio em Lucas 17:32.',
    reference: 'Gênesis 19:26',
  },
  {
    id: 'ab-25', experienceId: 'gn-abraao-lo', type: 'multiple', difficulty: 1, category: 'personagens',
    prompt: 'Qual era o parentesco de Ló com Abrão?',
    options: ['Sobrinho', 'Irmão', 'Filho', 'Servo'], answer: 0,
    explanation: 'Ló era filho de Harã, irmão de Abrão.',
    reference: 'Gênesis 11:27; 12:5',
  },
  // A promessa de Deus
  {
    id: 'ab-26', experienceId: 'gn-promessa', type: 'multiple', difficulty: 3, category: 'cronologia',
    prompt: 'Segundo Gênesis 15, por quantos anos a descendência de Abrão seria afligida em terra alheia?',
    options: ['400 anos', '40 anos', '70 anos', '120 anos'], answer: 0,
    explanation: 'O texto fala em quatrocentos anos de servidão em terra que não seria sua.',
    reference: 'Gênesis 15:13',
  },
  {
    id: 'ab-27', experienceId: 'gn-promessa', type: 'whoami', difficulty: 2, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui serva egípcia de Sarai.', 'Fugi para o deserto e fui encontrada junto a uma fonte.', 'Sou mãe de Ismael.'],
    options: ['Agar', 'Rebeca', 'Lia', 'Zípora'], answer: 0,
    explanation: 'Agar deu a Abrão um filho, Ismael.',
    reference: 'Gênesis 16:1, 7, 15',
  },
  // Jacó e Esaú
  {
    id: 'je-09', experienceId: 'gn-jaco-esau', type: 'truefalse', difficulty: 2, category: 'narrativa',
    prompt: 'Rebeca ajudou Jacó a receber a bênção de Isaque no lugar de Esaú.',
    answer: true,
    explanation: 'Rebeca preparou a comida e as vestes para que Jacó se passasse por Esaú.',
    reference: 'Gênesis 27:5–17',
  },
  {
    id: 'img-02', experienceId: 'gn-jaco-esau', type: 'multiple', difficulty: 1, category: 'narrativa',
    image: 'gn-jacob',
    prompt: 'Esta obra de James Tissot retrata qual momento da vida de Jacó?',
    options: ['O sonho da escada em Betel', 'A luta até o romper da alva', 'O reencontro com Esaú', 'O casamento com Raquel'], answer: 0,
    explanation: 'No sonho, os anjos subiam e desciam por uma escada que tocava os céus.',
    reference: 'Gênesis 28:12',
  },
  // Jacó e sua família
  {
    id: 'je-10', experienceId: 'gn-jaco-familia', type: 'multiple', difficulty: 2, category: 'narrativa',
    prompt: 'Quantos anos Jacó serviu a Labão por Raquel antes do casamento?',
    options: ['Sete', 'Três', 'Doze', 'Quarenta'], answer: 0,
    explanation: 'Os sete anos pareceram poucos dias, pelo muito que a amava.',
    reference: 'Gênesis 29:20',
  },
  {
    id: 'je-11', experienceId: 'gn-jaco-familia', type: 'truefalse', difficulty: 2, category: 'narrativa',
    prompt: 'Na noite do casamento, Labão deu Lia a Jacó em lugar de Raquel.',
    answer: true,
    explanation: 'Jacó descobriu pela manhã e serviu mais sete anos por Raquel.',
    reference: 'Gênesis 29:23–27',
  },
  {
    id: 'je-12', experienceId: 'gn-jaco-familia', type: 'multiple', difficulty: 1, category: 'personagens',
    prompt: 'Quantos filhos homens Jacó teve?',
    options: ['Doze', 'Dez', 'Sete', 'Catorze'], answer: 0,
    explanation: 'Os doze filhos de Jacó deram nome às tribos de Israel.',
    reference: 'Gênesis 35:22–26',
  },
  {
    id: 'je-13', experienceId: 'gn-jaco-familia', type: 'whoami', difficulty: 2, category: 'personagens',
    prompt: 'Quem sou eu?',
    clues: ['Fui a esposa amada de Jacó.', 'Sou mãe de José e de Benjamim.', 'Morri no caminho para Belém.'],
    options: ['Raquel', 'Lia', 'Rebeca', 'Sara'], answer: 0,
    explanation: 'Raquel morreu ao dar à luz Benjamim.',
    reference: 'Gênesis 29:18; 35:16–19, 24',
  },
  // José e seus irmãos
  {
    id: 'jo-23', experienceId: 'gn-jose-sonhos', type: 'multiple', difficulty: 2, category: 'geografia',
    prompt: 'Onde José finalmente encontrou seus irmãos com os rebanhos?',
    options: ['Em Dotã', 'Em Berseba', 'Em Betel', 'Em Gósen'], answer: 0,
    explanation: 'José foi atrás dos irmãos e os achou em Dotã, onde foi lançado na cova.',
    reference: 'Gênesis 37:17',
  },
  // Relacione
  {
    id: 'ma-01', experienceId: 'gn-corrupcao', type: 'match', difficulty: 2, category: 'personagens',
    prompt: 'Relacione cada personagem ao que Gênesis diz sobre ele.',
    pairs: [
      { a: 'Enoque', b: 'Andou com Deus e não se viu mais' },
      { a: 'Matusalém', b: 'Viveu 969 anos' },
      { a: 'Lameque', b: 'Pai de Noé' },
      { a: 'Sete', b: 'Filho de Adão nascido depois de Abel' },
    ],
    explanation: 'Todos fazem parte da genealogia que liga Adão a Noé.',
    reference: 'Gênesis 4:25; 5:24, 27–29',
  },
  {
    id: 'ma-02', experienceId: 'gn-jose-perdao', type: 'match', difficulty: 2, category: 'personagens',
    prompt: 'Relacione cada filho de Jacó ao seu papel na história de José.',
    pairs: [
      { a: 'Rúben', b: 'O primogênito de Jacó' },
      { a: 'Judá', b: 'Ofereceu-se no lugar de Benjamim' },
      { a: 'Benjamim', b: 'O filho mais novo de Raquel' },
      { a: 'José', b: 'Governador sobre a terra do Egito' },
    ],
    explanation: 'Os irmãos que venderam José reencontram-no anos depois como governador.',
    reference: 'Gênesis 35:23–24; 42:6; 44:33',
  },
])
