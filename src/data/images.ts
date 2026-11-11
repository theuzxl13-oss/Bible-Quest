// Catálogo de imagens. Todas são reproduções de obras em domínio público
// (artistas falecidos há mais de 100 anos), obtidas no Wikimedia Commons.
// Os arquivos foram redimensionados e convertidos para WebP em public/images/art.

export interface ArtImage {
  key: string
  title: string
  artist: string
  year: string
  /** Descrição para leitores de tela. */
  alt: string
  /** Nome do arquivo no Wikimedia Commons. */
  commonsFile: string
}

export const ART: Record<string, ArtImage> = {
  'hero-jerusalem': {
    key: 'hero-jerusalem',
    title: 'Jerusalém vista do Monte das Oliveiras',
    artist: 'David Roberts',
    year: 'c. 1841',
    alt: 'Vista panorâmica de Jerusalém antiga sobre colinas áridas, em tons de areia e céu claro.',
    commonsFile: 'David Roberts - Jerusalem from the Mount of Olives - 1927.124 - Cleveland Museum of Art.jpg',
  },
  'creation-chaos': {
    key: 'creation-chaos',
    title: 'O Caos. A Criação',
    artist: 'Ivan Aivazovsky',
    year: '1841',
    alt: 'Luz dourada rompendo nuvens escuras sobre as águas, evocando o início da criação.',
    commonsFile: 'Aivazovsky Chaos 1841.jpg',
  },
  'creation-eden': {
    key: 'creation-eden',
    title: 'O Jardim do Éden',
    artist: 'Thomas Cole',
    year: '1828',
    alt: 'Paisagem exuberante com árvores, lago e montanhas iluminadas, representando o Éden.',
    commonsFile: 'Thomas Cole - The Garden of Eden (1828).jpg',
  },
  'creation-expulsion': {
    key: 'creation-expulsion',
    title: 'Expulsão do Jardim do Éden',
    artist: 'Thomas Cole',
    year: '1828',
    alt: 'Paisagem dramática dividida entre um jardim luminoso e uma região sombria e rochosa.',
    commonsFile: 'Cole Thomas Expulsion from the Garden of Eden 1828.jpg',
  },
  'noah-deluge': {
    key: 'noah-deluge',
    title: 'O Dilúvio',
    artist: 'John Martin',
    year: '1834',
    alt: 'Ondas gigantescas e céu tempestuoso engolindo montanhas durante o dilúvio.',
    commonsFile: 'John Martin - The Deluge - Google Art Project.jpg',
  },
  'noah-subsiding': {
    key: 'noah-subsiding',
    title: 'O baixar das águas do Dilúvio',
    artist: 'Thomas Cole',
    year: '1829',
    alt: 'Águas calmas entre rochedos ao entardecer, com a arca ao longe sob um céu que se abre.',
    commonsFile: 'Thomas Cole - The Subsiding of the Waters of the Deluge - Google Art Project.jpg',
  },
  'noah-ark': {
    key: 'noah-ark',
    title: 'A Arca de Noé',
    artist: 'Edward Hicks',
    year: '1846',
    alt: 'Animais em pares caminhando em direção a uma grande arca de madeira sob nuvens escuras.',
    commonsFile: "Edward Hicks, American - Noah's Ark - Google Art Project.jpg",
  },
  'noah-aivazovsky': {
    key: 'noah-aivazovsky',
    title: 'O Dilúvio',
    artist: 'Ivan Aivazovsky',
    year: '1864',
    alt: 'Pessoas e animais sobre rochas cercadas por águas revoltas sob céu escuro.',
    commonsFile: 'Aivazovsky - Deluge.jpg',
  },
  'abraham-counsel': {
    key: 'abraham-counsel',
    title: 'O conselho de Abrão a Sarai',
    artist: 'James Tissot',
    year: 'c. 1896–1902',
    alt: 'Abrão e Sarai conversando dentro de uma tenda, com tapetes e tecidos coloridos.',
    commonsFile: "James Jacques Joseph Tissot - Abram's Counsel to Sarai - Google Art Project.jpg",
  },
  'abraham-journey': {
    key: 'abraham-journey',
    title: 'A partida de Abraão',
    artist: 'József Molnár',
    year: '1850',
    alt: 'Abraão conduzindo sua família, camelos e rebanhos por uma paisagem desértica ao entardecer.',
    commonsFile: 'Molnár Ábrahám kiköltözése 1850.jpg',
  },
  'joseph-granaries': {
    key: 'joseph-granaries',
    title: 'José, administrador dos celeiros do Faraó',
    artist: 'Lawrence Alma-Tadema',
    year: '1874',
    alt: 'José sentado em trono egípcio dourado enquanto um escriba registra a colheita.',
    commonsFile: 'Joseph Overseer of the Pharaohs Granaries.jpg',
  },
  'joseph-dwelleth': {
    key: 'joseph-dwelleth',
    title: 'José habita no Egito',
    artist: 'James Tissot',
    year: 'c. 1896–1902',
    alt: 'José em carruagem egípcia sendo saudado por uma multidão com os braços erguidos.',
    commonsFile: 'James Jacques Joseph Tissot - Joseph Dwelleth in Egypt - Google Art Project.jpg',
  },
  'joseph-sphinx': {
    key: 'joseph-sphinx',
    title: 'A Grande Esfinge e as pirâmides de Gizé',
    artist: 'David Roberts',
    year: '1839',
    alt: 'A Esfinge parcialmente coberta de areia diante das pirâmides de Gizé.',
    commonsFile: 'The Great Sphinx, Pyramids of Gizeh-1839) by David Roberts, RA.jpg',
  },
  'joseph-israel': {
    key: 'joseph-israel',
    title: 'Israel no Egito',
    artist: 'Edward Poynter',
    year: '1867',
    alt: 'Multidão puxando uma enorme estátua de leão diante de templos e obeliscos egípcios.',
    commonsFile: '1867 Edward Poynter - Israel in Egypt.jpg',
  },
  'moses-leaving': {
    key: 'moses-leaving',
    title: 'Os israelitas deixam o Egito',
    artist: 'David Roberts',
    year: '1828',
    alt: 'Grande cidade egípcia com templos monumentais e uma multidão em marcha sob céu dourado.',
    commonsFile: 'David Roberts-IsraelitesLeavingEgypt 1828.jpg',
  },
  'moses-redsea': {
    key: 'moses-redsea',
    title: 'A travessia do Mar Vermelho',
    artist: 'Ivan Aivazovsky',
    year: '1891',
    alt: 'O povo atravessando entre águas verdes e agitadas sob um céu noturno.',
    commonsFile: 'Aivazovsky Passage of the Jews through the Red Sea.jpg',
  },
  'moses-sinai': {
    key: 'moses-sinai',
    title: 'Moisés no Monte Sinai',
    artist: 'Jean-Léon Gérôme',
    year: 'c. 1895–1900',
    alt: 'Monte envolto em nuvem escura com luz no cume e o acampamento do povo na planície.',
    commonsFile: 'Gérôme, Jean-Léon - Moses on Mount Sinai Jean-Léon Gérôme -1895-1900.jpg',
  },
  'moses-plague': {
    key: 'moses-plague',
    title: 'A sétima praga',
    artist: 'John Martin',
    year: '1823',
    alt: 'Tempestade de raios e granizo sobre uma cidade egípcia monumental.',
    commonsFile: 'Martin, John - The Seventh Plague - 1823.jpg',
  },
  'moses-pharaoh': {
    key: 'moses-pharaoh',
    title: 'A destruição do exército do Faraó',
    artist: 'John Martin',
    year: 'c. 1833',
    alt: 'Ondas imensas se fechando sob um sol vermelho no horizonte.',
    commonsFile: "The Destruction of Pharaoh's Host, by John Martin (Getty 103QTX).jpg",
  },
  'place-petra': {
    key: 'place-petra',
    title: 'El Deir, Petra',
    artist: 'David Roberts',
    year: '1839',
    alt: 'Fachada monumental esculpida na rocha em Petra, cercada por montanhas.',
    commonsFile: 'David Roberts - El Deir Petra - 1927.141 - Cleveland Museum of Art.jpg',
  },
  'place-raheh': {
    key: 'place-raheh',
    title: 'A planície de El Raheh, Monte Sinai',
    artist: 'David Roberts',
    year: '1839',
    alt: 'Ampla planície desértica diante de montanhas avermelhadas.',
    commonsFile: 'David Roberts - The Plain of El Raheh, Mount Sinai - B1975.3.1074 - Yale Center for British Art.jpg',
  },
  'place-catherine': {
    key: 'place-catherine',
    title: 'Mosteiro de Santa Catarina e o Monte Horebe',
    artist: 'David Roberts',
    year: '1839',
    alt: 'Mosteiro fortificado no vale aos pés de montanhas altas e rochosas.',
    commonsFile: 'David Roberts - Convent of St. Catherine with Mount Horeb - 1927.90 - Cleveland Museum of Art.jpg',
  },
}

/** Caminho público da imagem, compatível com subdiretórios do GitHub Pages. */
export function artUrl(key: string, size: 'lg' | 'sm' = 'lg'): string {
  const suffix = size === 'sm' ? '-sm' : ''
  return `${import.meta.env.BASE_URL}images/art/${key}${suffix}.webp`
}

export function commonsUrl(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`
}
