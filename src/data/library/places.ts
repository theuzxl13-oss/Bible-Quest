/*
 * BIBLIOTECA — LUGARES
 * Quando a localização exata é desconhecida ou debatida, o texto diz isso.
 */
export interface BiblePlace {
  id: string
  name: string
  image: string
  context: string
  events: string[]
  references: string[]
}

export const PLACES: BiblePlace[] = [
  {
    id: 'eden', name: 'Éden', image: 'creation-eden',
    context: 'O jardim plantado "da banda do oriente", regado por um rio que se dividia em quatro braços, entre eles o Tigre e o Eufrates. A localização exata não é conhecida.',
    events: ['Criação do homem e da mulher', 'A ordem sobre a árvore', 'A queda e a saída do jardim'],
    references: ['Gênesis 2:8–14', 'Gênesis 3:23–24'],
  },
  {
    id: 'node', name: 'Terra de Node', image: 'gn-cain',
    context: 'Região "da banda do oriente do Éden" para onde Caim foi depois de matar Abel. Não se sabe onde ficava.',
    events: ['Caim habita em Node'],
    references: ['Gênesis 4:16'],
  },
  {
    id: 'ararate', name: 'Montes de Ararate', image: 'noah-subsiding',
    context: 'Região montanhosa ao norte da Mesopotâmia, associada ao antigo reino de Urartu. O texto fala em "montes de Ararate", no plural, sem indicar um pico específico.',
    events: ['A arca repousa depois do dilúvio'],
    references: ['Gênesis 8:4'],
  },
  {
    id: 'sinar', name: 'Sinar', image: 'gn-babel',
    context: 'Planície da Mesopotâmia, associada à região da Babilônia. Ali foi construída a cidade e a torre de Babel.',
    events: ['A construção da torre de Babel', 'A confusão das línguas'],
    references: ['Gênesis 10:10', 'Gênesis 11:2'],
  },
  {
    id: 'ur', name: 'Ur dos Caldeus', image: 'abraham-journey',
    context: 'Importante cidade da Mesopotâmia, no sul do atual Iraque, de onde partiu a família de Terá e Abrão.',
    events: ['Partida da família de Abrão'],
    references: ['Gênesis 11:28–31', 'Atos 7:2–4'],
  },
  {
    id: 'hara', name: 'Harã', image: 'abraham-journey',
    context: 'Cidade ao norte da Mesopotâmia, na rota comercial para Canaã. Ali morreu Terá, e ali Jacó viveu anos depois, na casa de Labão.',
    events: ['Morte de Terá', 'Partida de Abrão para Canaã', 'Jacó serve a Labão'],
    references: ['Gênesis 11:31–32', 'Gênesis 12:4–5', 'Gênesis 29:4'],
  },
  {
    id: 'canaa', name: 'Canaã', image: 'place-raheh',
    context: 'Terra entre o rio Jordão e o mar Mediterrâneo, prometida a Abrão e à sua descendência.',
    events: ['Abrão chega à terra prometida', 'Os patriarcas vivem como peregrinos'],
    references: ['Gênesis 12:5–7', 'Gênesis 17:8'],
  },
  {
    id: 'siquem', name: 'Siquém', image: 'place-raheh',
    context: 'Lugar no centro de Canaã onde Abrão edificou o primeiro altar ao chegar à terra.',
    events: ['Primeiro altar de Abrão em Canaã'],
    references: ['Gênesis 12:6–7', 'Gênesis 33:18–20'],
  },
  {
    id: 'hebrom', name: 'Hebrom e os carvalhais de Manre', image: 'abraham-counsel',
    context: 'Região no sul de Canaã onde Abraão armou suas tendas e recebeu os três visitantes. Ali ficava a cova de Macpela, onde foram sepultados os patriarcas.',
    events: ['Abraão habita junto aos carvalhais', 'A visita dos três homens', 'Sepultamento de Sara'],
    references: ['Gênesis 13:18', 'Gênesis 18:1', 'Gênesis 23:19'],
  },
  {
    id: 'sodoma', name: 'Sodoma', image: 'moses-plague',
    context: 'Cidade da campina do Jordão, perto de onde Ló foi morar. Foi destruída junto com Gomorra. A localização exata é debatida.',
    events: ['Ló habita perto da cidade', 'Destruição de Sodoma e Gomorra'],
    references: ['Gênesis 13:12–13', 'Gênesis 19:24–29'],
  },
  {
    id: 'moria', name: 'Moriá', image: 'place-raheh',
    context: 'Terra onde Abraão foi provado. A Bíblia associa o monte Moriá ao lugar onde Salomão construiu o templo em Jerusalém.',
    events: ['A prova de Abraão'],
    references: ['Gênesis 22:2', '2 Crônicas 3:1'],
  },
  {
    id: 'betel', name: 'Betel', image: 'gn-jacob',
    context: 'Lugar onde Jacó sonhou com a escada. O nome significa "casa de Deus".',
    events: ['O sonho de Jacó', 'Jacó volta a Betel e edifica um altar'],
    references: ['Gênesis 28:10–19', 'Gênesis 35:1–15'],
  },
  {
    id: 'dota', name: 'Dotã', image: 'abraham-journey',
    context: 'Lugar no centro de Canaã, onde José encontrou seus irmãos e foi lançado na cova.',
    events: ['José é vendido pelos irmãos'],
    references: ['Gênesis 37:17–28'],
  },
  {
    id: 'egito', name: 'Egito', image: 'joseph-sphinx',
    context: 'Grande civilização às margens do Nilo. Cenário da história de José e do início de Êxodo.',
    events: ['José é vendido e governa o Egito', 'A família de Jacó se estabelece', 'A escravidão e as pragas'],
    references: ['Gênesis 39–50', 'Êxodo 1–12'],
  },
  {
    id: 'gosen', name: 'Gósen', image: 'joseph-israel',
    context: 'Região do delta do Nilo onde a família de Jacó foi habitar.',
    events: ['A família de Jacó recebe a terra', 'O povo se multiplica'],
    references: ['Gênesis 45:10', 'Gênesis 47:6', 'Êxodo 8:22'],
  },
  {
    id: 'nilo', name: 'Rio Nilo', image: 'joseph-israel',
    context: 'O grande rio do Egito, base da agricultura egípcia.',
    events: ['O menino Moisés é colocado entre os juncos', 'As águas se tornam em sangue'],
    references: ['Êxodo 2:3', 'Êxodo 7:20'],
  },
  {
    id: 'midia', name: 'Midiã', image: 'place-catherine',
    context: 'Região para onde Moisés fugiu, geralmente situada a leste do golfo de Ácaba. Ali Moisés viveu com a família de Jetro.',
    events: ['Moisés se casa com Zípora', 'Moisés apascenta o rebanho de Jetro'],
    references: ['Êxodo 2:15–22', 'Êxodo 3:1'],
  },
  {
    id: 'horebe', name: 'Horebe (monte Sinai)', image: 'moses-sinai',
    context: 'O "monte de Deus", onde Moisés viu a sarça ardente e onde o povo recebeu a lei. A localização exata é debatida; a tradição a liga ao sul da península do Sinai.',
    events: ['A sarça ardente', 'A entrega dos Dez Mandamentos'],
    references: ['Êxodo 3:1', 'Êxodo 19–20'],
  },
  {
    id: 'mar-vermelho', name: 'Mar Vermelho', image: 'moses-redsea',
    context: 'O mar atravessado pelo povo ao sair do Egito. O hebraico diz "mar de juncos", e o ponto exato da travessia é debatido.',
    events: ['O mar se abre e o povo passa em seco'],
    references: ['Êxodo 14', 'Êxodo 15:4'],
  },
]

export function getPlace(id: string | undefined): BiblePlace | undefined {
  return PLACES.find((p) => p.id === id)
}
