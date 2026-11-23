import type { Experience } from '../../types'
import { experiences } from './helpers'

/*
 * GÊNESIS — 19 experiências organizadas por acontecimento.
 * intro/learning: textos explicativos da equipe.
 * narrative: dramatização da equipe, sem falas atribuídas a personagens.
 * passages: Almeida Revista e Corrigida 1911 (domínio público), ortografia
 * atualizada, EM REVISÃO contra a fonte.
 */
export const GENESIS: Experience[] = experiences('genesis', [
  {
    id: 'gn-criacao',
    title: 'A criação do mundo',
    scope: 'Gênesis 1:1–2:3',
    image: 'creation-chaos',
    intro: [
      'Gênesis significa "origem". É o primeiro dos cinco livros conhecidos como Pentateuco (ou Torá), tradicionalmente atribuídos a Moisés.',
      'O primeiro capítulo apresenta Deus como criador de tudo. A criação é organizada em dias, cada um encerrado com a expressão "e foi a tarde e a manhã".',
    ],
    narrative: [
      'Antes de qualquer cidade, rei ou caminho, havia apenas o silêncio das águas e a escuridão sobre o abismo.',
      'Então a luz surge, separando o dia da noite. Dia após dia o mundo ganha forma: o firmamento, os mares e a terra seca, as plantas, os astros, os peixes, as aves e os animais. No sétimo dia a obra está concluída.',
    ],
    passages: [
      { reference: 'Gênesis 1:1', text: 'No princípio, criou Deus os céus e a terra.' },
      { reference: 'Gênesis 1:3', text: 'E disse Deus: Haja luz. E houve luz.' },
      { reference: 'Gênesis 1:31', text: 'E viu Deus tudo quanto tinha feito, e eis que era muito bom.' },
    ],
    references: ['Gênesis 1:1–31', 'Gênesis 2:1–3', 'Êxodo 20:11', 'João 1:1–3'],
    learning: [
      'O relato segue um padrão: nos três primeiros dias são formados ambientes (luz, céu e mares, terra) e nos três seguintes eles são preenchidos (astros, aves e peixes, animais e seres humanos).',
      'O texto destaca que a criação acontece pela palavra de Deus e que ela é avaliada como boa. O sétimo dia é abençoado e santificado, e o mandamento do sábado no Êxodo faz referência a esse descanso. Cristãos e judeus leem os "dias" de maneiras diferentes; o jogo não toma partido nesse debate.',
    ],
    characters: [],
    places: ['eden'],
  },
  {
    id: 'gn-homem-mulher',
    title: 'A criação do homem e da mulher',
    scope: 'Gênesis 1:26–31; 2:4–7, 18–25',
    image: 'creation-eden',
    intro: [
      'Gênesis apresenta a criação do ser humano duas vezes, com enfoques diferentes. Gênesis 1 mostra o ser humano como ponto alto da criação, feito à imagem de Deus. Gênesis 2 aproxima a câmera: o homem formado do pó e a mulher formada ao seu lado.',
    ],
    narrative: [
      'Do pó da terra é moldado o primeiro homem, e ele recebe o fôlego de vida.',
      'Ele dá nome aos animais, mas nenhum deles é companhia à sua altura. Então surge a mulher, e os dois passam a formar uma só carne.',
    ],
    passages: [
      { reference: 'Gênesis 1:27', text: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou.' },
      {
        reference: 'Gênesis 2:7',
        text: 'E formou o Senhor Deus o homem do pó da terra e soprou em seus narizes o fôlego da vida; e o homem foi feito alma vivente.',
      },
      { reference: 'Gênesis 2:18', text: 'Não é bom que o homem esteja só; far-lhe-ei uma adjutora que esteja como diante dele.' },
    ],
    references: ['Gênesis 1:26–31', 'Gênesis 2:4–7', 'Gênesis 2:18–25'],
    learning: [
      'A expressão "imagem de Deus" é aplicada ao homem e à mulher, o que fundamenta, na tradição judaica e cristã, o valor e a dignidade de todo ser humano.',
      'Gênesis 2 mostra que o ser humano foi feito para relacionamentos. A união entre homem e mulher é citada mais tarde por Jesus em Mateus 19:4–6.',
    ],
    characters: ['adao', 'eva'],
    places: ['eden'],
  },
  {
    id: 'gn-eden',
    title: 'O jardim do Éden',
    scope: 'Gênesis 2:8–17',
    image: 'creation-eden',
    intro: [
      'O Éden é descrito como um jardim plantado "da banda do oriente", regado por um rio que se dividia em quatro braços. Dois deles, o Tigre (Hidequel) e o Eufrates, são rios conhecidos da Mesopotâmia.',
    ],
    narrative: [
      'Árvores agradáveis à vista e boas para comida enchem o jardim. No centro, duas árvores se destacam.',
      'O homem recebe uma tarefa e um limite: cuidar do jardim e não comer de uma única árvore.',
    ],
    passages: [
      { reference: 'Gênesis 2:15', text: 'E tomou o Senhor Deus o homem e o pôs no jardim do Éden para o lavrar e o guardar.' },
    ],
    references: ['Gênesis 2:8–17'],
    learning: [
      'O trabalho aparece antes da queda: cultivar e guardar o jardim faz parte do propósito original dado ao ser humano.',
      'A ordem sobre a árvore da ciência do bem e do mal introduz o tema da confiança e da obediência, que será decisivo no capítulo seguinte.',
    ],
    characters: ['adao'],
    places: ['eden'],
  },
  {
    id: 'gn-queda',
    title: 'A queda',
    scope: 'Gênesis 3',
    image: 'creation-expulsion',
    intro: [
      'Gênesis 3 explica, dentro da narrativa bíblica, a entrada do pecado e de suas consequências no mundo. A serpente é apresentada como o mais astuto dos animais do campo.',
    ],
    narrative: [
      'Entre todas as árvores do jardim, apenas uma era proibida. A serpente questiona a ordem recebida, e o fruto é comido.',
      'Os olhos se abrem, vem a vergonha, e o casal se esconde. A história segue com consequências, mas também com uma promessa que ecoará ao longo das Escrituras.',
    ],
    passages: [
      {
        reference: 'Gênesis 3:15',
        text: 'E porei inimizade entre ti e a mulher e entre a tua semente e a sua semente; esta te ferirá a cabeça, e tu lhe ferirás o calcanhar.',
      },
    ],
    references: ['Gênesis 3:1–24', 'Romanos 5:12', '1 Coríntios 15:21–22'],
    learning: [
      'Depois da desobediência, Adão e Eva são enviados para fora do jardim, e querubins guardam o caminho da árvore da vida.',
      'Gênesis 3:15 é chamado na tradição cristã de "protoevangelho", entendido como a primeira promessa de vitória sobre o mal. Paulo relaciona Adão e Cristo em Romanos 5 e 1 Coríntios 15.',
    ],
    characters: ['adao', 'eva'],
    places: ['eden'],
  },
  {
    id: 'gn-caim-abel',
    title: 'Caim e Abel',
    scope: 'Gênesis 4',
    image: 'gn-cain',
    intro: [
      'Os primeiros filhos de Adão e Eva têm ofícios diferentes: Abel é pastor de ovelhas e Caim é lavrador. O capítulo mostra como o mal avança dentro da própria família.',
    ],
    narrative: [
      'Dois irmãos trazem ofertas. A de um é aceita, a do outro não, e o rosto de Caim se fecha.',
      'No campo, longe de todos, acontece o primeiro homicídio. Caim é afastado, mas recebe um sinal de proteção. Mais tarde nasce Sete, e a família recomeça.',
    ],
    passages: [
      {
        reference: 'Gênesis 4:9',
        text: 'E disse o Senhor a Caim: Onde está Abel, teu irmão? E ele disse: Não sei; sou eu guardador do meu irmão?',
      },
    ],
    references: ['Gênesis 4:1–26', 'Hebreus 11:4', '1 João 3:12'],
    learning: [
      'Antes do crime, Caim é advertido de que o pecado está à porta e que ele deve dominá-lo (Gênesis 4:7). A narrativa mostra a responsabilidade pessoal diante da ira e da inveja.',
      'O Novo Testamento lembra Abel como exemplo de fé (Hebreus 11:4). Mesmo após o crime, Caim recebe um sinal para não ser morto, o que revela limites à vingança.',
    ],
    characters: ['caim', 'abel', 'sete'],
    places: ['node'],
  },
  {
    id: 'gn-corrupcao',
    title: 'A corrupção da humanidade',
    scope: 'Gênesis 5:1–6:8',
    image: 'noah-aivazovsky',
    intro: [
      'Gênesis 5 traz a genealogia de Adão até Noé, com idades muito longas. Entre os nomes, um se destaca: Enoque, que andou com Deus.',
      'Gênesis 6 descreve a multiplicação da maldade sobre a terra e prepara a história do dilúvio.',
    ],
    narrative: [
      'Gerações se sucedem. Os nomes passam, as idades impressionam, e um homem simplesmente desaparece porque andava com Deus.',
      'Com o tempo, a terra se enche de violência. No meio dessa geração, um homem acha graça diante do Senhor.',
    ],
    passages: [
      { reference: 'Gênesis 5:24', text: 'E andou Enoque com Deus; e não se viu mais, porquanto Deus para si o tomou.' },
      { reference: 'Gênesis 6:8', text: 'Noé, porém, achou graça aos olhos do Senhor.' },
    ],
    references: ['Gênesis 5:1–32', 'Gênesis 6:1–8', 'Hebreus 11:5'],
    learning: [
      'As genealogias ligam a história da criação à de Noé e mostram a continuidade das gerações. As idades longas são um traço do texto, interpretado de formas diferentes por estudiosos.',
      'O contraste entre a maldade geral e a vida de Enoque e de Noé mostra que, mesmo num ambiente corrompido, é possível andar com Deus.',
    ],
    characters: ['enoque', 'matusalem', 'lameque', 'noe'],
    places: [],
  },
  {
    id: 'gn-noe',
    title: 'Noé, um homem justo',
    scope: 'Gênesis 6:9–13',
    image: 'noah-aivazovsky',
    intro: [
      'Depois de descrever a maldade que se espalhava pela terra, o texto volta a atenção para um homem e sua família.',
      'Noé era filho de Lameque, e seus filhos foram Sem, Cam e Jafé. Gênesis o apresenta antes mesmo de mencionar a arca.',
    ],
    narrative: [
      'Ao redor, a violência tomou conta da terra. Mas numa casa, um pai e três filhos seguem outro caminho.',
      'Noé anda com Deus, como Enoque andara antes dele. É a ele que serão confiadas instruções para salvar a vida.',
    ],
    passages: [
      { reference: 'Gênesis 6:9', text: 'Noé era varão justo e reto em suas gerações; Noé andava com Deus.' },
    ],
    references: ['Gênesis 5:28–32', 'Gênesis 6:9–13', 'Hebreus 11:7', '2 Pedro 2:5'],
    learning: [
      'O texto descreve Noé com três expressões: justo, reto em suas gerações e alguém que andava com Deus. O Novo Testamento o chama de pregoeiro da justiça (2 Pedro 2:5).',
      'A fidelidade de Noé aparece em contraste com uma geração inteira, mostrando que é possível viver de modo diferente do ambiente ao redor.',
    ],
    characters: ['noe', 'sem-cam-jafe', 'lameque'],
    places: [],
  },
  {
    id: 'gn-arca',
    title: 'A construção da arca',
    scope: 'Gênesis 6:14–7:5',
    image: 'noah-ark',
    intro: [
      'Noé recebe instruções detalhadas: o material, as medidas, os andares, a janela e a porta. Depois, quem e o que entraria na arca.',
      'Relatos antigos de grandes inundações existem em outras culturas da Mesopotâmia, como a Epopeia de Gilgamesh. O texto bíblico apresenta o dilúvio com foco moral e na aliança.',
    ],
    narrative: [
      'Madeira de gofer, betume por dentro e por fora, três andares e uma porta ao lado. As medidas eram precisas.',
      'Noé reúne sua família, os animais e o mantimento conforme as instruções. A obra é longa, e ele a cumpre por completo.',
    ],
    passages: [{ reference: 'Gênesis 6:22', text: 'Assim fez Noé; conforme a tudo o que Deus lhe mandou, assim o fez.' }],
    references: ['Gênesis 6:14–22', 'Gênesis 7:1–5', 'Hebreus 11:7'],
    learning: [
      'A arca media 300 côvados de comprimento, 50 de largura e 30 de altura. Um côvado equivalia aproximadamente ao antebraço, cerca de 45 cm.',
      'O destaque do texto é a obediência de Noé: ele faz tudo conforme o que lhe foi ordenado. Hebreus 11:7 cita a construção da arca como um ato de fé.',
    ],
    characters: ['noe', 'sem-cam-jafe'],
    places: [],
  },
  {
    id: 'gn-diluvio',
    title: 'O dilúvio',
    scope: 'Gênesis 7:6–8:19',
    image: 'noah-deluge',
    intro: ['Noé tinha 600 anos quando as águas vieram. O texto descreve as fontes do abismo rompidas e as janelas dos céus abertas.'],
    narrative: [
      'A chuva cai sem cessar, e as águas sobem acima dos montes. Dentro da arca, Noé espera.',
      'Quando as águas baixam, a arca repousa nos montes de Ararate. Aves são enviadas para ver se a terra já secou.',
    ],
    passages: [{ reference: 'Gênesis 7:12', text: 'E houve chuva sobre a terra quarenta dias e quarenta noites.' }],
    references: ['Gênesis 7:6–24', 'Gênesis 8:1–19'],
    learning: [
      'Ararate corresponde a uma região montanhosa ao norte da Mesopotâmia, associada ao antigo reino de Urartu. A pomba voltou com uma folha de oliveira no bico (Gênesis 8:11).',
      'O texto afirma que Deus se lembrou de Noé (Gênesis 8:1). O dilúvio é apresentado como juízo, mas também como preservação de vida para um recomeço.',
    ],
    characters: ['noe'],
    places: ['ararate'],
  },
  {
    id: 'gn-alianca-noe',
    title: 'A aliança com Noé',
    scope: 'Gênesis 8:20–9:17',
    image: 'noah-subsiding',
    intro: ['Ao sair da arca, Noé edifica um altar. Segue-se uma aliança que inclui toda a humanidade e os seres vivos.'],
    narrative: [
      'A terra recomeça. A fumaça do altar sobe no ar limpo depois das águas.',
      'No céu aparece o arco nas nuvens, sinal de uma aliança para todas as gerações.',
    ],
    passages: [
      {
        reference: 'Gênesis 9:13',
        text: 'O meu arco tenho posto na nuvem; este será por sinal do concerto entre mim e a terra.',
      },
    ],
    references: ['Gênesis 8:20–22', 'Gênesis 9:1–17'],
    learning: [
      'Na Almeida, "concerto" tem o sentido de aliança ou pacto. A aliança com Noé garante que as águas não voltariam a destruir toda a carne (Gênesis 9:11).',
      'É uma aliança universal, feita com Noé, sua descendência e todos os seres vivos que saíram da arca.',
    ],
    characters: ['noe', 'sem-cam-jafe'],
    places: ['ararate'],
  },
  {
    id: 'gn-babel',
    title: 'A torre de Babel',
    scope: 'Gênesis 11:1–9',
    image: 'gn-babel',
    intro: [
      'Depois do dilúvio, as famílias se multiplicam (Gênesis 10). Gênesis 11 conta como os povos foram espalhados e passaram a falar línguas diferentes.',
      'A cena se passa na terra de Sinar, na Mesopotâmia, região onde se construíam torres de tijolo em degraus, os zigurates.',
    ],
    narrative: [
      'Tijolos cozidos no fogo, betume no lugar da cal, e um projeto ambicioso: uma cidade e uma torre que alcançasse os céus.',
      'De repente, as palavras deixam de ser entendidas. A obra para, e os construtores se espalham pela face da terra.',
    ],
    passages: [
      { reference: 'Gênesis 11:4', text: 'Eia, edifiquemos nós uma cidade e uma torre cujo cume toque nos céus.' },
      { reference: 'Gênesis 11:9', text: 'Por isso, se chamou o seu nome Babel, porquanto ali confundiu o Senhor a língua de toda a terra.' },
    ],
    references: ['Gênesis 11:1–9', 'Gênesis 10:32'],
    learning: [
      'O texto apresenta o projeto como tentativa de fazer um nome para si e de evitar a dispersão. A confusão das línguas encerra a obra.',
      'O nome Babel é associado no texto ao verbo hebraico para "confundir". Muitos leitores cristãos relacionam esse episódio ao Pentecostes, quando pessoas de várias línguas ouviram a mesma mensagem (Atos 2).',
    ],
    characters: [],
    places: ['sinar'],
  },
  {
    id: 'gn-chamado-abraao',
    title: 'O chamado de Abraão',
    scope: 'Gênesis 11:27–12:9',
    image: 'abraham-journey',
    intro: [
      'Ur foi uma importante cidade da Mesopotâmia, no sul do atual Iraque. Harã ficava ao norte, na rota comercial para Canaã.',
      'A tradição situa os patriarcas no início do segundo milênio a.C., mas as datas exatas são debatidas.',
    ],
    narrative: [
      'Uma família deixa Ur dos Caldeus e para em Harã. Ali, Abrão recebe uma ordem e uma promessa.',
      'Sem saber exatamente o destino, ele parte com Sarai, seu sobrinho Ló, servos e rebanhos, rumo à terra de Canaã.',
    ],
    passages: [
      {
        reference: 'Gênesis 12:1',
        text: 'Ora, o Senhor disse a Abrão: Sai-te da tua terra, e da tua parentela, e da casa de teu pai, para a terra que eu te mostrarei.',
      },
    ],
    references: ['Gênesis 11:27–32', 'Gênesis 12:1–9', 'Hebreus 11:8'],
    learning: [
      'A promessa inclui terra, descendência e bênção: em Abrão seriam benditas todas as famílias da terra (Gênesis 12:3).',
      'Abrão tinha 75 anos quando saiu de Harã. Hebreus 11:8 cita essa partida como exemplo de fé: ele saiu sem saber para onde ia.',
    ],
    characters: ['abraao', 'sara', 'lo'],
    places: ['ur', 'hara', 'canaa', 'siquem'],
  },
  {
    id: 'gn-abraao-lo',
    title: 'Abraão e Ló',
    scope: 'Gênesis 13–14; 19',
    image: 'abraham-counsel',
    intro: [
      'Os rebanhos de Abrão e de Ló crescem tanto que a terra não comporta os dois juntos. A separação leva Ló para perto de Sodoma, onde os acontecimentos dos capítulos 14 e 19 se desenrolam.',
    ],
    narrative: [
      'Abrão deixa o sobrinho escolher primeiro, e Ló olha para a campina bem regada do Jordão.',
      'Quando Ló é levado cativo numa guerra entre reis, Abrão reúne seus homens e parte para resgatá-lo. Na volta, um rei-sacerdote sai ao seu encontro.',
    ],
    passages: [
      { reference: 'Gênesis 13:8', text: 'Ora, não haja contenda entre mim e ti e entre os meus pastores e os teus pastores, porque irmãos somos.' },
    ],
    references: ['Gênesis 13:1–18', 'Gênesis 14:1–24', 'Gênesis 19:1–29', 'Hebreus 7:1–3'],
    learning: [
      'Abrão habitou junto aos carvalhais de Manre, em Hebrom. Em Gênesis 14 ele encontra Melquisedeque, rei de Salém e sacerdote do Deus Altíssimo, citado depois em Salmos 110 e Hebreus 7.',
      'Gênesis 19 narra a destruição de Sodoma e Gomorra e a saída de Ló. Jesus lembra a mulher de Ló como advertência em Lucas 17:32.',
    ],
    characters: ['abraao', 'lo', 'melquisedeque'],
    places: ['canaa', 'hebrom', 'sodoma'],
  },
  {
    id: 'gn-promessa',
    title: 'A promessa de Deus',
    scope: 'Gênesis 15–17',
    image: 'place-raheh',
    intro: [
      'Abrão ainda não tem filhos. Em Gênesis 15, a promessa de descendência é renovada e uma aliança é firmada. Os capítulos 16 e 17 mostram a espera, o nascimento de Ismael e a mudança dos nomes de Abrão e Sarai.',
    ],
    narrative: [
      'Numa noite, Abrão é levado para fora e convidado a olhar para o céu estrelado.',
      'Anos se passam. Agar foge para o deserto e é encontrada junto a uma fonte. Mais tarde, Abrão recebe um novo nome e um sinal da aliança.',
    ],
    passages: [
      { reference: 'Gênesis 15:5', text: 'Olha, agora, para os céus e conta as estrelas, se as podes contar.' },
      { reference: 'Gênesis 15:6', text: 'E creu ele no Senhor, e foi-lhe imputado isto por justiça.' },
    ],
    references: ['Gênesis 15:1–21', 'Gênesis 16:1–16', 'Gênesis 17:1–27', 'Romanos 4:3', 'Gálatas 3:6'],
    learning: [
      'Gênesis 15:6 é um dos versículos do Antigo Testamento mais citados no Novo, em Romanos 4, Gálatas 3 e Tiago 2.',
      'Abrão passa a se chamar Abraão, e Sarai passa a se chamar Sara. O sinal da aliança nessa etapa é a circuncisão (Gênesis 17).',
    ],
    characters: ['abraao', 'sara', 'agar', 'ismael'],
    places: ['canaa'],
  },
  {
    id: 'gn-isaque',
    title: 'Isaque, o filho da promessa',
    scope: 'Gênesis 18–22',
    image: 'abraham-counsel',
    intro: [
      'Três visitantes chegam à tenda de Abraão em Manre e anunciam o nascimento de um filho. Gênesis 21 narra o nascimento de Isaque, e Gênesis 22, a prova no monte Moriá.',
    ],
    narrative: [
      'No calor do dia, três visitantes são recebidos à porta da tenda. A promessa parece impossível, e Sara ri.',
      'No tempo determinado nasce Isaque. Anos depois, pai e filho caminham três dias até um monte. No momento decisivo, Abraão é impedido de ferir o filho, e um carneiro é encontrado preso pelos chifres.',
    ],
    passages: [
      { reference: 'Gênesis 18:14', text: 'Haveria coisa alguma difícil ao Senhor?' },
      { reference: 'Gênesis 22:8', text: 'Deus proverá para si o cordeiro para o holocausto, meu filho.' },
    ],
    references: ['Gênesis 18:1–15', 'Gênesis 21:1–7', 'Gênesis 22:1–19', 'Hebreus 11:17–19'],
    learning: [
      'O nome Isaque está ligado ao riso (Gênesis 21:6). Abraão tinha 100 anos quando ele nasceu.',
      'Gênesis 22 é chamado na tradição judaica de Aqedá. É um texto difícil, lido de muitas formas; o próprio relato termina afirmando que Deus não aceitou o sacrifício do menino e proveu um substituto. A Bíblia associa Moriá ao local onde Salomão construiu o templo (2 Crônicas 3:1).',
    ],
    characters: ['abraao', 'sara', 'isaque'],
    places: ['hebrom', 'moria'],
  },
  {
    id: 'gn-jaco-esau',
    title: 'Jacó e Esaú',
    scope: 'Gênesis 25:19–28:22',
    image: 'gn-jacob',
    intro: [
      'Isaque casou-se com Rebeca, e dela nasceram gêmeos. Esaú era homem do campo; Jacó habitava em tendas. A rivalidade entre os dois começa ainda no nascimento.',
    ],
    narrative: [
      'Um prato de guisado troca de mãos, e com ele um direito de primogenitura. Depois, uma bênção é dada a quem não era esperado.',
      'Fugindo do irmão, Jacó dorme no caminho com uma pedra por travesseiro e sonha.',
    ],
    passages: [
      {
        reference: 'Gênesis 28:12',
        text: 'E sonhou: e eis uma escada posta na terra, cujo topo tocava nos céus; e eis que os anjos de Deus subiam e desciam por ela.',
      },
    ],
    references: ['Gênesis 25:19–34', 'Gênesis 27:1–45', 'Gênesis 28:10–22', 'Hebreus 12:16–17'],
    learning: [
      'A narrativa não esconde as falhas de Jacó nem de Rebeca. Hebreus 12:16 lembra Esaú como alguém que desprezou a primogenitura.',
      'Em Betel, a promessa feita a Abraão e a Isaque é repetida a Jacó (Gênesis 28:13–15).',
    ],
    characters: ['isaque', 'rebeca', 'esau', 'jaco'],
    places: ['betel'],
  },
  {
    id: 'gn-jaco-familia',
    title: 'Jacó e sua família',
    scope: 'Gênesis 29–35',
    image: 'abraham-journey',
    intro: [
      'Jacó chega a Harã, à casa de Labão, irmão de sua mãe. Ali trabalha por muitos anos, forma uma família numerosa e, depois, volta para Canaã.',
    ],
    narrative: [
      'Junto a um poço, Jacó conhece Raquel. Sete anos de trabalho parecem poucos dias pelo amor que tinha por ela.',
      'Na volta para casa, Jacó luta até o romper da alva e recebe um novo nome. Depois, reencontra Esaú, e os irmãos se reconciliam.',
    ],
    passages: [{ reference: 'Gênesis 32:28', text: 'Não se chamará mais o teu nome Jacó, mas Israel.' }],
    references: ['Gênesis 29:1–30', 'Gênesis 32:22–32', 'Gênesis 33:1–20', 'Gênesis 35:16–26'],
    learning: [
      'Os doze filhos de Jacó darão nome às tribos de Israel. Raquel morreu ao dar à luz Benjamim, no caminho de Belém.',
      'O novo nome Israel passa a designar também o povo descendente de Jacó. O reencontro com Esaú termina em reconciliação.',
    ],
    characters: ['jaco', 'labao', 'lia', 'raquel', 'esau'],
    places: ['hara', 'canaa'],
  },
  {
    id: 'gn-jose-sonhos',
    title: 'José e seus irmãos',
    scope: 'Gênesis 37',
    image: 'abraham-journey',
    intro: ['Jacó teve doze filhos. José e Benjamim eram filhos de Raquel. A preferência do pai por José desperta a inveja dos irmãos.'],
    narrative: [
      'José recebe uma túnica especial e tem sonhos em que seus irmãos se inclinam diante dele.',
      'Em Dotã, longe do pai, os irmãos o lançam numa cova e o vendem a mercadores que seguiam para o Egito.',
    ],
    passages: [
      {
        reference: 'Gênesis 37:3',
        text: 'E Israel amava a José mais do que a todos os seus filhos, porque era filho da sua velhice; e fez-lhe uma túnica de várias cores.',
      },
    ],
    references: ['Gênesis 37:1–36'],
    learning: [
      'José foi vendido por vinte moedas de prata. Os irmãos mancharam a túnica com sangue de um cabrito para enganar o pai.',
      'O capítulo mostra os efeitos da preferência e da inveja dentro de uma família, tema que será resolvido só no fim do livro.',
    ],
    characters: ['jose', 'jaco', 'ruben', 'juda'],
    places: ['canaa', 'dota'],
  },
  {
    id: 'gn-jose-egito',
    title: 'José no Egito',
    scope: 'Gênesis 39–41',
    image: 'joseph-sphinx',
    intro: [
      'No Egito, José é comprado por Potifar, oficial de Faraó. O caminho passa pela prisão antes de chegar ao palácio.',
    ],
    narrative: [
      'Na casa de Potifar, tudo o que José faz prospera. Acusado injustamente, ele vai parar na prisão, onde interpreta os sonhos do copeiro e do padeiro.',
      'Dois anos depois, Faraó sonha com sete vacas gordas e sete magras. José é chamado da prisão e, aos trinta anos, torna-se governador sobre a terra do Egito.',
    ],
    passages: [
      { reference: 'Gênesis 39:2', text: 'E o Senhor estava com José, e foi varão próspero.' },
      { reference: 'Gênesis 41:16', text: 'Isso não está em mim; Deus dará resposta de paz a Faraó.' },
    ],
    references: ['Gênesis 39:1–23', 'Gênesis 40:1–23', 'Gênesis 41:1–57', 'Atos 7:9–10'],
    learning: [
      'O texto repete que o Senhor estava com José, na casa de Potifar e na prisão. A integridade de José não trouxe recompensa imediata: o copeiro se esqueceu dele por dois anos.',
      'José atribui a Deus a interpretação dos sonhos. Recebeu o nome egípcio Zafenate-Paneia, casou-se com Asenate e teve dois filhos, Manassés e Efraim.',
    ],
    characters: ['jose', 'potifar', 'farao-jose'],
    places: ['egito'],
  },
  {
    id: 'gn-jose-perdao',
    title: 'José: reencontro e perdão',
    scope: 'Gênesis 42–50',
    image: 'joseph-granaries',
    intro: ['A fome chega a Canaã, e os irmãos de José descem ao Egito para comprar trigo, sem reconhecê-lo.'],
    narrative: [
      'Depois de provas e lágrimas, José se revela aos irmãos.',
      'A família de Jacó vai morar na terra de Gósen. No fim do livro, José olha para trás e vê um propósito maior em tudo o que viveu.',
    ],
    passages: [
      { reference: 'Gênesis 45:4', text: 'Eu sou José, vosso irmão, a quem vendestes para o Egito.' },
      { reference: 'Gênesis 50:20', text: 'Vós bem intentastes mal contra mim, porém Deus o tornou em bem.' },
    ],
    references: ['Gênesis 42–45', 'Gênesis 46:1–7', 'Gênesis 47:1–12', 'Gênesis 50:15–26'],
    learning: [
      'Judá se oferece como escravo no lugar de Benjamim, mostrando a mudança dos irmãos. José morre com 110 anos.',
      'Gênesis termina com perdão e reconciliação. A família de Israel está no Egito, o que prepara o cenário do livro de Êxodo.',
    ],
    characters: ['jose', 'juda', 'benjamim', 'ruben', 'jaco'],
    places: ['egito', 'gosen'],
  },
])
