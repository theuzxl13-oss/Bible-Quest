import type { Chapter, Journey, JourneyId } from '../types'

/*
 * CONTEÚDO DAS JORNADAS
 * - "narrative": narrativa dramatizada escrita pela equipe. NÃO é texto bíblico
 *   e não atribui falas aos personagens. É exibida com o selo "Narrativa".
 * - "context": explicação histórica e bíblica. Datas antigas são aproximadas e
 *   debatidas por estudiosos; o texto indica isso quando relevante.
 * - "passages": trechos curtos da Almeida Revista e Corrigida (edição de 1911,
 *   domínio público), com ortografia atualizada. REVISAR CONTRA A FONTE antes
 *   de uma publicação oficial (ver README → Conteúdo bíblico).
 */

type ChapterInput = Omit<Chapter, 'journeyId' | 'order'>

function chapters(journeyId: JourneyId, list: ChapterInput[]): Chapter[] {
  return list.map((c, i) => ({ ...c, journeyId, order: i + 1 }))
}

export const JOURNEYS: Journey[] = [
  {
    id: 'criacao',
    order: 1,
    title: 'A Criação do Mundo',
    subtitle: 'No princípio',
    books: 'Gênesis 1–3',
    era: 'Origens',
    image: 'creation-chaos',
    summary:
      'Descubra como Gênesis apresenta a origem dos céus, da terra e da humanidade, o jardim do Éden e as consequências da desobediência.',
    chapters: chapters('criacao', [
      {
        id: 'criacao-1',
        title: 'No princípio',
        scope: 'Gênesis 1:1–5',
        image: 'creation-chaos',
        narrative: [
          'Antes de qualquer cidade, rei ou caminho, havia apenas o silêncio das águas e a escuridão sobre o abismo.',
          'O primeiro capítulo da Bíblia abre a cena com uma ordem: e a luz surge, separando o dia da noite. Começa aqui a história que atravessa todas as Escrituras.',
        ],
        context: [
          'Gênesis significa "origem". É o primeiro dos cinco livros conhecidos como Pentateuco (ou Torá), tradicionalmente atribuídos a Moisés.',
          'O texto afirma que Deus é o criador de tudo e que a criação acontece pela sua palavra. A descrição é organizada em dias, cada um encerrado com a expressão "e foi a tarde e a manhã".',
        ],
        passages: [
          { reference: 'Gênesis 1:1', text: 'No princípio, criou Deus os céus e a terra.' },
          { reference: 'Gênesis 1:3', text: 'E disse Deus: Haja luz. E houve luz.' },
        ],
      },
      {
        id: 'criacao-2',
        title: 'Os dias da criação',
        scope: 'Gênesis 1:6–2:3',
        image: 'creation-eden',
        narrative: [
          'Dia após dia, o mundo ganha forma: o firmamento, os mares e a terra seca, as plantas, os astros, os peixes, as aves e os animais.',
          'Ao fim do sexto dia, tudo é contemplado. No sétimo, a obra está concluída e o dia é separado para descanso.',
        ],
        context: [
          'O relato segue um padrão: nos três primeiros dias são formados ambientes (luz, céu e mares, terra), e nos três seguintes eles são preenchidos (astros, aves e peixes, animais e seres humanos).',
          'O sétimo dia é abençoado e santificado. Mais tarde, o mandamento do sábado no Êxodo faz referência a esse descanso (Êxodo 20:11).',
        ],
        passages: [
          { reference: 'Gênesis 1:31', text: 'E viu Deus tudo quanto tinha feito, e eis que era muito bom.' },
          { reference: 'Gênesis 2:3', text: 'E abençoou Deus o dia sétimo e o santificou.' },
        ],
      },
      {
        id: 'criacao-3',
        title: 'O jardim do Éden',
        scope: 'Gênesis 1:26–2:25',
        image: 'creation-eden',
        narrative: [
          'Do pó da terra é formado o primeiro homem, e ele recebe o fôlego de vida. Um jardim no Éden é plantado para ele morar, cultivar e guardar.',
          'Adão dá nome aos animais, mas não encontra companhia semelhante a ele. Então surge a mulher, e os dois passam a formar uma só carne.',
        ],
        context: [
          'Gênesis 1 apresenta a criação do ser humano "à imagem de Deus", homem e mulher. Gênesis 2 detalha o mesmo acontecimento com foco no jardim e na relação entre os dois.',
          'O texto cita quatro rios ligados ao Éden, entre eles o Tigre (Hidequel) e o Eufrates, rios conhecidos da Mesopotâmia (Gênesis 2:14).',
        ],
        passages: [
          {
            reference: 'Gênesis 1:27',
            text: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou.',
          },
          {
            reference: 'Gênesis 2:15',
            text: 'E tomou o Senhor Deus o homem e o pôs no jardim do Éden para o lavrar e o guardar.',
          },
        ],
      },
      {
        id: 'criacao-4',
        title: 'A queda e a promessa',
        scope: 'Gênesis 3',
        image: 'creation-expulsion',
        narrative: [
          'Entre todas as árvores do jardim, apenas uma era proibida. A serpente questiona a ordem recebida, e o fruto é comido.',
          'Os olhos se abrem, vem a vergonha, e o casal se esconde. A história segue com consequências, mas também com uma promessa que ecoará ao longo das Escrituras.',
        ],
        context: [
          'A árvore proibida era a "árvore da ciência do bem e do mal" (Gênesis 2:17). Após a desobediência, Adão e Eva são enviados para fora do jardim, e querubins guardam o caminho da árvore da vida (Gênesis 3:24).',
          'Gênesis 3:15 é conhecido na tradição cristã como o "protoevangelho", a primeira promessa de vitória sobre o mal.',
        ],
        passages: [
          {
            reference: 'Gênesis 3:15',
            text: 'E porei inimizade entre ti e a mulher e entre a tua semente e a sua semente; esta te ferirá a cabeça, e tu lhe ferirás o calcanhar.',
          },
        ],
      },
    ]),
  },
  {
    id: 'noe',
    order: 2,
    title: 'Noé e a Arca',
    subtitle: 'As águas e a aliança',
    books: 'Gênesis 6–9',
    era: 'Mundo antediluviano',
    image: 'noah-deluge',
    summary:
      'Acompanhe Noé na construção da arca, o dilúvio que cobriu a terra e o arco nas nuvens como sinal da aliança.',
    chapters: chapters('noe', [
      {
        id: 'noe-1',
        title: 'Um homem justo',
        scope: 'Gênesis 6:1–13',
        image: 'noah-aivazovsky',
        narrative: [
          'A terra estava cheia de violência, e o coração humano se inclinava para o mal.',
          'No meio dessa geração, um homem se destacava: Noé, que andava com Deus.',
        ],
        context: [
          'Noé era filho de Lameque e descendente de Sete, terceiro filho de Adão (Gênesis 5:28–29). Seus filhos foram Sem, Cam e Jafé.',
          'Relatos antigos de grandes inundações existem em outras culturas da Mesopotâmia, como a Epopeia de Gilgamesh. O texto bíblico, porém, apresenta o dilúvio com foco moral e na aliança de Deus com a humanidade.',
        ],
        passages: [
          { reference: 'Gênesis 6:8', text: 'Noé, porém, achou graça aos olhos do Senhor.' },
          {
            reference: 'Gênesis 6:9',
            text: 'Noé era varão justo e reto em suas gerações; Noé andava com Deus.',
          },
        ],
      },
      {
        id: 'noe-2',
        title: 'A construção da arca',
        scope: 'Gênesis 6:14–7:5',
        image: 'noah-ark',
        narrative: [
          'Madeira de gofer, betume por dentro e por fora, três andares e uma porta ao lado. As medidas eram precisas.',
          'Noé reúne sua família e os animais conforme as instruções. A obra é longa, e ele a cumpre por completo.',
        ],
        context: [
          'A arca media 300 côvados de comprimento, 50 de largura e 30 de altura (Gênesis 6:15). Um côvado equivalia aproximadamente ao comprimento do antebraço, cerca de 45 cm.',
          'Entravam pares de animais de cada espécie; dos animais limpos e das aves, entravam sete pares (Gênesis 7:2–3).',
        ],
        passages: [
          {
            reference: 'Gênesis 6:22',
            text: 'Assim fez Noé; conforme a tudo o que Deus lhe mandou, assim o fez.',
          },
        ],
      },
      {
        id: 'noe-3',
        title: 'O dilúvio',
        scope: 'Gênesis 7:6–8:14',
        image: 'noah-deluge',
        narrative: [
          'As fontes do abismo se rompem e as janelas dos céus se abrem. A chuva cai sem cessar, e as águas sobem acima dos montes.',
          'Dentro da arca, Noé espera. Quando as águas baixam, a arca repousa nos montes de Ararate, e aves são enviadas para ver se a terra já secou.',
        ],
        context: [
          'Noé tinha 600 anos quando o dilúvio começou (Gênesis 7:6). A chuva durou quarenta dias e quarenta noites (Gênesis 7:12).',
          'Ararate corresponde a uma região montanhosa ao norte da Mesopotâmia, associada ao antigo reino de Urartu. A pomba voltou com uma folha de oliveira no bico (Gênesis 8:11).',
        ],
        passages: [
          {
            reference: 'Gênesis 7:12',
            text: 'E houve chuva sobre a terra quarenta dias e quarenta noites.',
          },
        ],
      },
      {
        id: 'noe-4',
        title: 'O arco e a aliança',
        scope: 'Gênesis 8:15–9:17',
        image: 'noah-subsiding',
        narrative: [
          'Ao sair da arca, Noé levanta um altar. A terra recomeça.',
          'No céu aparece o arco nas nuvens, sinal de uma aliança para todas as gerações.',
        ],
        context: [
          'A aliança com Noé é feita com toda a humanidade e com os seres vivos: as águas não voltariam a destruir toda a carne (Gênesis 9:11).',
          'Almeida usa a palavra "concerto" com o sentido de aliança ou pacto.',
        ],
        passages: [
          {
            reference: 'Gênesis 9:13',
            text: 'O meu arco tenho posto na nuvem; este será por sinal do concerto entre mim e a terra.',
          },
        ],
      },
    ]),
  },
  {
    id: 'abraao',
    order: 3,
    title: 'Abraão',
    subtitle: 'O pai da fé',
    books: 'Gênesis 11–22',
    era: 'Era patriarcal',
    image: 'abraham-journey',
    summary:
      'Siga Abrão desde Ur dos Caldeus até Canaã, a promessa de uma descendência como as estrelas e a prova no monte Moriá.',
    chapters: chapters('abraao', [
      {
        id: 'abraao-1',
        title: 'O chamado',
        scope: 'Gênesis 11:27–12:9',
        image: 'abraham-journey',
        narrative: [
          'Uma família deixa Ur dos Caldeus e para em Harã. Ali, Abrão recebe uma ordem e uma promessa.',
          'Sem saber exatamente o destino, ele parte com Sarai, seu sobrinho Ló, servos e rebanhos, rumo à terra de Canaã.',
        ],
        context: [
          'Ur foi uma importante cidade da Mesopotâmia, no sul do atual Iraque. Harã ficava ao norte, na rota comercial para Canaã.',
          'A tradição situa os patriarcas no início do segundo milênio a.C., mas as datas exatas são debatidas. Abrão tinha 75 anos quando saiu de Harã (Gênesis 12:4).',
        ],
        passages: [
          {
            reference: 'Gênesis 12:1',
            text: 'Ora, o Senhor disse a Abrão: Sai-te da tua terra, e da tua parentela, e da casa de teu pai, para a terra que eu te mostrarei.',
          },
        ],
      },
      {
        id: 'abraao-2',
        title: 'Ló e a promessa das estrelas',
        scope: 'Gênesis 13–15',
        image: 'abraham-counsel',
        narrative: [
          'Os rebanhos crescem tanto que a terra não comporta Abrão e Ló juntos. Abrão deixa o sobrinho escolher primeiro.',
          'Mais tarde, numa noite, Abrão é levado para fora e convidado a olhar para o céu.',
        ],
        context: [
          'Ló escolheu a campina do Jordão, perto de Sodoma; Abrão habitou em Canaã e depois junto aos carvalhais de Manre, em Hebrom (Gênesis 13:10–18).',
          'Em Gênesis 14, Abrão encontra Melquisedeque, rei de Salém e sacerdote do Deus Altíssimo. Gênesis 15:6 é citado no Novo Testamento em Romanos 4:3.',
        ],
        passages: [
          {
            reference: 'Gênesis 15:5',
            text: 'Olha, agora, para os céus e conta as estrelas, se as podes contar.',
          },
          { reference: 'Gênesis 15:6', text: 'E creu ele no Senhor, e foi-lhe imputado isto por justiça.' },
        ],
      },
      {
        id: 'abraao-3',
        title: 'Isaque, o filho da promessa',
        scope: 'Gênesis 17–21',
        image: 'abraham-counsel',
        narrative: [
          'Os anos passam e o filho prometido não chega. Abrão recebe um novo nome, e Sarai também.',
          'Três visitantes chegam à tenda em Manre. A promessa parece impossível, e Sara ri. Mas no tempo determinado nasce Isaque.',
        ],
        context: [
          'Abrão passa a se chamar Abraão, e Sarai passa a se chamar Sara (Gênesis 17:5, 15). O sinal da aliança nessa etapa é a circuncisão.',
          'O nome Isaque está ligado ao riso (Gênesis 21:6). Abraão tinha 100 anos quando Isaque nasceu (Gênesis 21:5).',
        ],
        passages: [{ reference: 'Gênesis 18:14', text: 'Haveria coisa alguma difícil ao Senhor?' }],
      },
      {
        id: 'abraao-4',
        title: 'A prova no monte Moriá',
        scope: 'Gênesis 22',
        image: 'place-raheh',
        narrative: [
          'Três dias de caminhada até o monte indicado. Isaque carrega a lenha; Abraão leva o fogo e o cutelo.',
          'No momento decisivo, Abraão é impedido de ferir o filho, e um carneiro preso pelos chifres é encontrado.',
        ],
        context: [
          'O relato é chamado na tradição judaica de "Aqedá" (a amarração de Isaque). A Bíblia associa a região de Moriá ao local onde, depois, Salomão construiu o templo (2 Crônicas 3:1).',
          'Abraão chama o lugar de "o Senhor proverá" (Gênesis 22:14).',
        ],
        passages: [
          {
            reference: 'Gênesis 22:8',
            text: 'Deus proverá para si o cordeiro para o holocausto, meu filho.',
          },
        ],
      },
    ]),
  },
  {
    id: 'jose',
    order: 4,
    title: 'José no Egito',
    subtitle: 'Dos sonhos ao palácio',
    books: 'Gênesis 37–50',
    era: 'Era patriarcal',
    image: 'joseph-granaries',
    summary:
      'De filho preferido a escravo, de prisioneiro a governador do Egito: a história de José e o reencontro com seus irmãos.',
    chapters: chapters('jose', [
      {
        id: 'jose-1',
        title: 'Os sonhos e a túnica',
        scope: 'Gênesis 37',
        image: 'abraham-journey',
        narrative: [
          'José, filho de Jacó, recebe uma túnica especial e tem sonhos em que seus irmãos se inclinam diante dele.',
          'A inveja cresce. Em Dotã, longe do pai, os irmãos o lançam numa cova e o vendem a mercadores que seguiam para o Egito.',
        ],
        context: [
          'Jacó, também chamado Israel, teve doze filhos. José e Benjamim eram filhos de Raquel (Gênesis 35:24).',
          'José foi vendido por vinte moedas de prata (Gênesis 37:28). Os irmãos mancharam a túnica com sangue de um cabrito para enganar o pai (Gênesis 37:31).',
        ],
        passages: [
          {
            reference: 'Gênesis 37:3',
            text: 'E Israel amava a José mais do que a todos os seus filhos, porque era filho da sua velhice; e fez-lhe uma túnica de várias cores.',
          },
        ],
      },
      {
        id: 'jose-2',
        title: 'Escravo e prisioneiro',
        scope: 'Gênesis 39–40',
        image: 'joseph-israel',
        narrative: [
          'No Egito, José serve na casa de Potifar e tudo o que faz prospera. Acusado injustamente, vai parar na prisão.',
          'Mesmo ali, recebe responsabilidades e interpreta os sonhos do copeiro e do padeiro do Faraó.',
        ],
        context: [
          'Potifar era oficial do Faraó e capitão da guarda (Gênesis 39:1).',
          'O copeiro foi restaurado ao cargo, mas esqueceu-se de José por dois anos (Gênesis 40:23; 41:1).',
        ],
        passages: [{ reference: 'Gênesis 39:2', text: 'E o Senhor estava com José, e foi varão próspero.' }],
      },
      {
        id: 'jose-3',
        title: 'Os sonhos do Faraó',
        scope: 'Gênesis 41',
        image: 'joseph-sphinx',
        narrative: [
          'Sete vacas gordas e sete magras. Sete espigas cheias e sete miúdas. Nenhum sábio do Egito sabe explicar.',
          'José é chamado da prisão, interpreta os sonhos e propõe um plano. Aos trinta anos, torna-se governador sobre a terra do Egito.',
        ],
        context: [
          'Os sonhos anunciavam sete anos de fartura seguidos de sete anos de fome (Gênesis 41:29–30).',
          'José recebeu o nome egípcio Zafenate-Paneia e casou-se com Asenate. Seus filhos foram Manassés e Efraim (Gênesis 41:45, 51–52).',
        ],
        passages: [
          {
            reference: 'Gênesis 41:16',
            text: 'Isso não está em mim; Deus dará resposta de paz a Faraó.',
          },
        ],
      },
      {
        id: 'jose-4',
        title: 'Reencontro e perdão',
        scope: 'Gênesis 42–50',
        image: 'joseph-granaries',
        narrative: [
          'A fome chega a Canaã, e os irmãos de José descem ao Egito para comprar trigo. Eles não o reconhecem.',
          'Depois de provas e lágrimas, José se revela. A família de Jacó vai morar na terra de Gósen.',
        ],
        context: [
          'José testou os irmãos e pediu que trouxessem Benjamim, o caçula (Gênesis 42–44). Judá se ofereceu como escravo no lugar de Benjamim (Gênesis 44:33).',
          'A família de Jacó se estabeleceu em Gósen, região do delta do Nilo (Gênesis 47:6). José morreu com 110 anos (Gênesis 50:26).',
        ],
        passages: [
          {
            reference: 'Gênesis 45:4',
            text: 'Eu sou José, vosso irmão, a quem vendestes para o Egito.',
          },
          {
            reference: 'Gênesis 50:20',
            text: 'Vós bem intentastes mal contra mim, porém Deus o tornou em bem.',
          },
        ],
      },
    ]),
  },
  {
    id: 'moises',
    order: 5,
    title: 'Moisés e o Êxodo',
    subtitle: 'Liberdade e aliança',
    books: 'Êxodo 1–20',
    era: 'Êxodo',
    image: 'moses-redsea',
    summary:
      'Do cesto no Nilo à sarça ardente, das pragas do Egito à travessia do mar e aos mandamentos no Sinai.',
    chapters: chapters('moises', [
      {
        id: 'moises-1',
        title: 'Salvo das águas',
        scope: 'Êxodo 1–2',
        image: 'joseph-israel',
        narrative: [
          'Os descendentes de Jacó se multiplicam no Egito e passam a ser oprimidos com trabalhos pesados.',
          'Um menino hebreu é escondido pela mãe num cesto às margens do Nilo e encontrado pela filha do Faraó.',
        ],
        context: [
          'Um novo rei, que não conhecera José, escravizou os israelitas (Êxodo 1:8–11). As parteiras Sifrá e Puá temeram a Deus e não mataram os meninos (Êxodo 1:15–17).',
          'Adulto, Moisés fugiu para Midiã, onde se casou com Zípora, filha de Jetro, também chamado Reuel (Êxodo 2:15–21).',
        ],
        passages: [
          {
            reference: 'Êxodo 2:10',
            text: 'E chamou o seu nome Moisés e disse: Porque das águas o tenho tirado.',
          },
        ],
      },
      {
        id: 'moises-2',
        title: 'A sarça ardente',
        scope: 'Êxodo 3–4',
        image: 'place-catherine',
        narrative: [
          'Pastoreando as ovelhas de Jetro, Moisés chega ao monte Horebe. Uma sarça arde em fogo, mas não se consome.',
          'Ali ele recebe uma missão que parece grande demais. Seu irmão Arão irá com ele.',
        ],
        context: [
          'Horebe é outro nome usado para o monte de Deus, associado ao Sinai. A localização exata é debatida; a tradição a liga à região do Mosteiro de Santa Catarina, no sul do Sinai.',
          'Deus revela seu nome a Moisés em Êxodo 3:14. Moisés recebe sinais, como a vara que se transforma em serpente (Êxodo 4:2–4).',
        ],
        passages: [
          {
            reference: 'Êxodo 3:5',
            text: 'Tira os teus sapatos de teus pés; porque o lugar em que tu estás é terra santa.',
          },
          { reference: 'Êxodo 3:14', text: 'E disse Deus a Moisés: EU SOU O QUE SOU.' },
        ],
      },
      {
        id: 'moises-3',
        title: 'As pragas e a Páscoa',
        scope: 'Êxodo 5–12',
        image: 'moses-plague',
        narrative: [
          'Diante do Faraó, Moisés e Arão levam um pedido. O coração do rei se endurece, e o Egito é atingido por pragas.',
          'Na última noite, as casas marcadas com sangue do cordeiro são poupadas. É a primeira Páscoa.',
        ],
        context: [
          'As dez pragas foram: sangue, rãs, piolhos, moscas, peste nos animais, úlceras, saraiva, gafanhotos, trevas e morte dos primogênitos (Êxodo 7–12).',
          'A Páscoa (Pessach) passou a ser celebrada como memorial da libertação (Êxodo 12:14). O pão comido era sem fermento (Êxodo 12:8).',
        ],
        passages: [
          { reference: 'Êxodo 5:1', text: 'Assim diz o Senhor, Deus de Israel: Deixa ir o meu povo.' },
          { reference: 'Êxodo 12:13', text: 'Vendo eu sangue, passarei por cima de vós.' },
        ],
      },
      {
        id: 'moises-4',
        title: 'O mar e o monte',
        scope: 'Êxodo 13–20',
        image: 'moses-sinai',
        narrative: [
          'Guiado por uma coluna de nuvem de dia e de fogo à noite, o povo chega ao mar. Atrás vêm os carros do Egito.',
          'O mar se abre e o povo passa em seco. Semanas depois, no Sinai, o monte fumega e são dadas as palavras da aliança.',
        ],
        context: [
          'No deserto, o povo recebeu o maná (Êxodo 16) e água da rocha (Êxodo 17). Miriã, irmã de Moisés, conduziu o cântico após a travessia (Êxodo 15:20–21).',
          'Os Dez Mandamentos estão em Êxodo 20:1–17 e são repetidos em Deuteronômio 5. A data do Êxodo é debatida (as propostas mais comuns ficam entre os séculos XV e XIII a.C.).',
        ],
        passages: [
          { reference: 'Êxodo 14:14', text: 'O Senhor pelejará por vós, e vós vos calareis.' },
          { reference: 'Êxodo 20:3', text: 'Não terás outros deuses diante de mim.' },
        ],
      },
    ]),
  },
]

export const ALL_CHAPTERS: Chapter[] = JOURNEYS.flatMap((j) => j.chapters)

export function getJourney(id: string | undefined): Journey | undefined {
  return JOURNEYS.find((j) => j.id === id)
}

export function getChapter(id: string | undefined): Chapter | undefined {
  return ALL_CHAPTERS.find((c) => c.id === id)
}

export const BIBLE_SOURCE_NOTE =
  'Texto bíblico: Almeida Revista e Corrigida, edição de 1911 (domínio público), com ortografia atualizada. Em revisão contra a fonte.'
