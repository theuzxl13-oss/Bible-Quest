/*
 * BIBLIOTECA — PERSONAGENS BÍBLICOS
 * Fichas com resumo, referências, acontecimentos, relações e lições.
 * As imagens são pinturas em domínio público relacionadas à história (não
 * retratos históricos). Os resumos são textos da equipe, com referências
 * para conferência. A ficha é desbloqueada quando o jogador chega a uma fase
 * em que o personagem aparece.
 */
export interface BibleCharacter {
  id: string
  name: string
  /** Papel curto, exibido em cartões. */
  role: string
  image: string
  /** Enquadramento da pintura no retrato (CSS object-position). */
  focus?: string
  summary: string
  references: string[]
  events: string[]
  relations: { id: string; label: string }[]
  lessons: string[]
}

export const CHARACTERS: BibleCharacter[] = [
  {
    id: 'adao', name: 'Adão', role: 'O primeiro homem', image: 'creation-eden', focus: '40% 60%',
    summary: 'Formado do pó da terra e colocado no jardim do Éden para cultivá-lo e guardá-lo. Deu nome aos animais e, com Eva, desobedeceu à ordem sobre a árvore da ciência do bem e do mal.',
    references: ['Gênesis 2:7–25', 'Gênesis 3', 'Gênesis 5:1–5', 'Romanos 5:12–19', '1 Coríntios 15:22'],
    events: ['É formado do pó da terra', 'Dá nome aos animais', 'Come do fruto proibido', 'Sai do jardim do Éden', 'Vive 930 anos'],
    relations: [{ id: 'eva', label: 'Esposa' }, { id: 'caim', label: 'Filho' }, { id: 'abel', label: 'Filho' }, { id: 'sete', label: 'Filho' }],
    lessons: ['O ser humano foi criado com propósito e responsabilidade.', 'A desobediência traz consequências que alcançam outros.'],
  },
  {
    id: 'eva', name: 'Eva', role: 'A primeira mulher', image: 'creation-eden', focus: '60% 50%',
    summary: 'Formada a partir de uma costela de Adão. Conversou com a serpente e comeu do fruto proibido. Adão a chamou de Eva porque era a mãe de todos os viventes.',
    references: ['Gênesis 2:21–25', 'Gênesis 3:1–20', 'Gênesis 4:1–2, 25'],
    events: ['É formada ao lado de Adão', 'É questionada pela serpente', 'Recebe o nome de Eva', 'Torna-se mãe de Caim, Abel e Sete'],
    relations: [{ id: 'adao', label: 'Marido' }, { id: 'caim', label: 'Filho' }, { id: 'abel', label: 'Filho' }, { id: 'sete', label: 'Filho' }],
    lessons: ['Homem e mulher compartilham a imagem de Deus.', 'A tentação começa questionando o que foi dito.'],
  },
  {
    id: 'caim', name: 'Caim', role: 'Lavrador, primeiro filho de Adão', image: 'gn-cain', focus: '35% 50%',
    summary: 'Lavrador da terra. Irado porque sua oferta não foi aceita, matou o irmão Abel. Foi afastado, mas recebeu um sinal para que ninguém o matasse.',
    references: ['Gênesis 4:1–17', 'Hebreus 11:4', '1 João 3:12'],
    events: ['Traz uma oferta do fruto da terra', 'Mata Abel no campo', 'Recebe um sinal de proteção', 'Habita na terra de Node'],
    relations: [{ id: 'abel', label: 'Irmão' }, { id: 'adao', label: 'Pai' }, { id: 'eva', label: 'Mãe' }],
    lessons: ['A ira precisa ser dominada antes de virar ação (Gênesis 4:7).'],
  },
  {
    id: 'abel', name: 'Abel', role: 'Pastor de ovelhas', image: 'gn-cain', focus: '65% 50%',
    summary: 'Pastor de ovelhas, segundo filho de Adão e Eva. Sua oferta foi aceita, e ele foi morto pelo irmão. Hebreus o cita como exemplo de fé.',
    references: ['Gênesis 4:2–10', 'Hebreus 11:4', 'Mateus 23:35'],
    events: ['Oferece dos primogênitos do rebanho', 'É morto por Caim'],
    relations: [{ id: 'caim', label: 'Irmão' }, { id: 'adao', label: 'Pai' }, { id: 'eva', label: 'Mãe' }],
    lessons: ['A fé é lembrada mesmo quando a vida é curta.'],
  },
  {
    id: 'sete', name: 'Sete', role: 'Filho de Adão e Eva', image: 'creation-eden', focus: '50% 70%',
    summary: 'Nascido depois da morte de Abel. Eva disse que Deus lhe dera outra semente em lugar de Abel. A genealogia de Gênesis 5 segue por sua descendência até Noé.',
    references: ['Gênesis 4:25–26', 'Gênesis 5:3–8'],
    events: ['Nasce depois da morte de Abel', 'Em seus dias começou-se a invocar o nome do Senhor'],
    relations: [{ id: 'adao', label: 'Pai' }, { id: 'eva', label: 'Mãe' }, { id: 'enoque', label: 'Descendente' }],
    lessons: ['A história continua mesmo depois de grandes perdas.'],
  },
  {
    id: 'enoque', name: 'Enoque', role: 'Andou com Deus', image: 'noah-aivazovsky', focus: '50% 20%',
    summary: 'Pai de Matusalém. Gênesis diz que andou com Deus e não se viu mais, porque Deus para si o tomou. Hebreus o cita como exemplo de fé.',
    references: ['Gênesis 5:18–24', 'Hebreus 11:5', 'Judas 14'],
    events: ['Gera Matusalém', 'Anda com Deus', 'É tomado por Deus'],
    relations: [{ id: 'matusalem', label: 'Filho' }, { id: 'noe', label: 'Bisneto' }],
    lessons: ['"Andar com Deus" descreve uma vida inteira de comunhão.'],
  },
  {
    id: 'matusalem', name: 'Matusalém', role: 'O mais longevo da Bíblia', image: 'noah-aivazovsky', focus: '50% 40%',
    summary: 'Filho de Enoque e avô de Noé. Viveu 969 anos, a maior idade registrada na Bíblia.',
    references: ['Gênesis 5:21–27'],
    events: ['Vive 969 anos'],
    relations: [{ id: 'enoque', label: 'Pai' }, { id: 'lameque', label: 'Filho' }],
    lessons: ['As genealogias ligam as gerações da criação ao dilúvio.'],
  },
  {
    id: 'lameque', name: 'Lameque', role: 'Pai de Noé', image: 'noah-aivazovsky', focus: '50% 60%',
    summary: 'Filho de Matusalém e pai de Noé, na genealogia de Sete. (Não confundir com outro Lameque, descendente de Caim, em Gênesis 4.)',
    references: ['Gênesis 5:25–31'],
    events: ['Dá ao filho o nome de Noé'],
    relations: [{ id: 'matusalem', label: 'Pai' }, { id: 'noe', label: 'Filho' }],
    lessons: ['Gênesis registra nomes iguais em linhagens diferentes; o contexto distingue as pessoas.'],
  },
  {
    id: 'noe', name: 'Noé', role: 'Construtor da arca', image: 'noah-ark', focus: '50% 50%',
    summary: 'Varão justo que andava com Deus. Construiu a arca conforme as instruções recebidas, foi preservado no dilúvio com sua família e recebeu a aliança simbolizada pelo arco nas nuvens.',
    references: ['Gênesis 6:8–9:29', 'Hebreus 11:7', '2 Pedro 2:5', 'Mateus 24:37–39'],
    events: ['Acha graça diante do Senhor', 'Constrói a arca', 'Atravessa o dilúvio', 'Edifica um altar', 'Recebe a aliança do arco'],
    relations: [{ id: 'lameque', label: 'Pai' }, { id: 'sem-cam-jafe', label: 'Filhos' }],
    lessons: ['Obediência completa mesmo quando a tarefa é longa.', 'Fidelidade num ambiente corrompido.'],
  },
  {
    id: 'sem-cam-jafe', name: 'Sem, Cam e Jafé', role: 'Os filhos de Noé', image: 'noah-subsiding', focus: '50% 50%',
    summary: 'Os três filhos de Noé entraram na arca com suas esposas. Gênesis 10 apresenta os povos que descenderam deles.',
    references: ['Gênesis 6:10', 'Gênesis 9:18–19', 'Gênesis 10'],
    events: ['Entram na arca', 'Saem para repovoar a terra'],
    relations: [{ id: 'noe', label: 'Pai' }],
    lessons: ['Depois do dilúvio, toda a humanidade é apresentada como uma só família.'],
  },
  {
    id: 'abraao', name: 'Abraão', role: 'O pai da fé', image: 'abraham-journey', focus: '55% 40%',
    summary: 'Chamado a sair de sua terra rumo a Canaã, recebeu promessas de terra, descendência e bênção para todas as famílias da terra. Creu, e isso lhe foi imputado por justiça.',
    references: ['Gênesis 11:27–25:11', 'Romanos 4', 'Hebreus 11:8–19', 'Tiago 2:21–23'],
    events: ['Sai de Ur e de Harã', 'Separa-se de Ló', 'Recebe a promessa das estrelas', 'Recebe o nome de Abraão', 'É pai de Isaque', 'É provado no monte Moriá'],
    relations: [{ id: 'sara', label: 'Esposa' }, { id: 'lo', label: 'Sobrinho' }, { id: 'isaque', label: 'Filho' }, { id: 'ismael', label: 'Filho' }],
    lessons: ['Fé é confiar mesmo sem ver o caminho inteiro.', 'Generosidade: deixou Ló escolher primeiro.'],
  },
  {
    id: 'sara', name: 'Sara', role: 'Mãe de Isaque', image: 'abraham-counsel', focus: '30% 50%',
    summary: 'Esposa de Abraão, chamada antes de Sarai. Riu ao ouvir que teria um filho na velhice, e deu à luz Isaque no tempo determinado.',
    references: ['Gênesis 11:29–30', 'Gênesis 17:15–19', 'Gênesis 18:9–15', 'Gênesis 21:1–7', 'Hebreus 11:11'],
    events: ['Acompanha Abrão desde Ur', 'Recebe o nome de Sara', 'Ri da promessa', 'Dá à luz Isaque'],
    relations: [{ id: 'abraao', label: 'Marido' }, { id: 'isaque', label: 'Filho' }, { id: 'agar', label: 'Serva' }],
    lessons: ['Nada é difícil demais para Deus (Gênesis 18:14).'],
  },
  {
    id: 'lo', name: 'Ló', role: 'Sobrinho de Abraão', image: 'abraham-journey', focus: '25% 50%',
    summary: 'Filho de Harã e sobrinho de Abrão. Escolheu a campina do Jordão e foi morar perto de Sodoma. Foi resgatado por Abrão e, depois, saiu de Sodoma antes da destruição da cidade.',
    references: ['Gênesis 11:27–31', 'Gênesis 13', 'Gênesis 14:12–16', 'Gênesis 19', '2 Pedro 2:7'],
    events: ['Acompanha Abrão', 'Escolhe a campina do Jordão', 'É levado cativo e resgatado', 'Sai de Sodoma'],
    relations: [{ id: 'abraao', label: 'Tio' }],
    lessons: ['Escolhas guiadas só pelo que os olhos veem podem levar a lugares perigosos.'],
  },
  {
    id: 'melquisedeque', name: 'Melquisedeque', role: 'Rei de Salém e sacerdote', image: 'hero-jerusalem', focus: '50% 50%',
    summary: 'Rei de Salém e sacerdote do Deus Altíssimo. Trouxe pão e vinho a Abrão e o abençoou. É citado em Salmos 110 e em Hebreus.',
    references: ['Gênesis 14:18–20', 'Salmos 110:4', 'Hebreus 7:1–3'],
    events: ['Abençoa Abrão', 'Recebe o dízimo de tudo'],
    relations: [{ id: 'abraao', label: 'Abençoou' }],
    lessons: ['Personagem breve, mas retomado séculos depois nas Escrituras.'],
  },
  {
    id: 'agar', name: 'Agar', role: 'Mãe de Ismael', image: 'place-raheh', focus: '50% 50%',
    summary: 'Serva egípcia de Sarai. Deu a Abrão um filho, Ismael. No deserto, foi encontrada junto a uma fonte.',
    references: ['Gênesis 16', 'Gênesis 21:9–21'],
    events: ['Torna-se mãe de Ismael', 'Foge para o deserto', 'É socorrida no deserto'],
    relations: [{ id: 'ismael', label: 'Filho' }, { id: 'sara', label: 'Senhora' }, { id: 'abraao', label: 'Pai de seu filho' }],
    lessons: ['O texto registra cuidado com quem estava à margem da família.'],
  },
  {
    id: 'ismael', name: 'Ismael', role: 'Primeiro filho de Abraão', image: 'place-raheh', focus: '50% 30%',
    summary: 'Filho de Abrão com Agar. Gênesis registra que dele também viria uma grande nação.',
    references: ['Gênesis 16:11–16', 'Gênesis 17:20', 'Gênesis 21:13–21', 'Gênesis 25:12–18'],
    events: ['Nasce quando Abrão tinha 86 anos', 'Cresce no deserto'],
    relations: [{ id: 'abraao', label: 'Pai' }, { id: 'agar', label: 'Mãe' }, { id: 'isaque', label: 'Meio-irmão' }],
    lessons: ['A promessa a Abraão alcança mais de uma linhagem.'],
  },
  {
    id: 'isaque', name: 'Isaque', role: 'O filho da promessa', image: 'abraham-counsel', focus: '70% 50%',
    summary: 'Filho de Abraão e Sara, nascido quando o pai tinha 100 anos. Foi levado ao monte Moriá, casou-se com Rebeca e foi pai de Esaú e Jacó.',
    references: ['Gênesis 21:1–7', 'Gênesis 22', 'Gênesis 24', 'Gênesis 25:19–28', 'Gênesis 27'],
    events: ['Nasce na velhice dos pais', 'Carrega a lenha ao Moriá', 'Casa-se com Rebeca', 'Abençoa Jacó'],
    relations: [{ id: 'abraao', label: 'Pai' }, { id: 'sara', label: 'Mãe' }, { id: 'rebeca', label: 'Esposa' }, { id: 'jaco', label: 'Filho' }, { id: 'esau', label: 'Filho' }],
    lessons: ['O nome Isaque lembra o riso: a promessa cumprida traz alegria.'],
  },
  {
    id: 'rebeca', name: 'Rebeca', role: 'Mãe de Esaú e Jacó', image: 'abraham-journey', focus: '70% 40%',
    summary: 'Esposa de Isaque e irmã de Labão. Mãe dos gêmeos Esaú e Jacó; ajudou Jacó a receber a bênção do pai.',
    references: ['Gênesis 24', 'Gênesis 25:20–28', 'Gênesis 27:5–17'],
    events: ['Aceita casar-se com Isaque', 'Dá à luz gêmeos', 'Ajuda Jacó a receber a bênção'],
    relations: [{ id: 'isaque', label: 'Marido' }, { id: 'jaco', label: 'Filho' }, { id: 'esau', label: 'Filho' }, { id: 'labao', label: 'Irmão' }],
    lessons: ['A narrativa mostra decisões humanas imperfeitas sem escondê-las.'],
  },
  {
    id: 'esau', name: 'Esaú', role: 'Irmão de Jacó', image: 'gn-jacob', focus: '50% 70%',
    summary: 'Primeiro dos gêmeos de Isaque e Rebeca, homem do campo. Vendeu a primogenitura a Jacó por pão e guisado de lentilhas. Anos depois, reconciliou-se com o irmão. É chamado também de Edom.',
    references: ['Gênesis 25:25–34', 'Gênesis 27', 'Gênesis 33', 'Hebreus 12:16–17'],
    events: ['Nasce primeiro', 'Vende a primogenitura', 'Perde a bênção', 'Reencontra Jacó'],
    relations: [{ id: 'jaco', label: 'Irmão gêmeo' }, { id: 'isaque', label: 'Pai' }, { id: 'rebeca', label: 'Mãe' }],
    lessons: ['Valorizar o que é duradouro acima do imediato.', 'Reconciliação é possível depois de anos.'],
  },
  {
    id: 'jaco', name: 'Jacó (Israel)', role: 'Pai das doze tribos', image: 'gn-jacob', focus: '40% 80%',
    summary: 'Filho de Isaque e Rebeca. Recebeu a primogenitura e a bênção, sonhou com a escada em Betel, serviu a Labão, teve doze filhos e recebeu o nome de Israel.',
    references: ['Gênesis 25:19–35:29', 'Gênesis 37–50', 'Hebreus 11:21'],
    events: ['Compra a primogenitura', 'Sonha em Betel', 'Casa-se com Lia e Raquel', 'Recebe o nome de Israel', 'Reencontra José no Egito'],
    relations: [{ id: 'esau', label: 'Irmão gêmeo' }, { id: 'raquel', label: 'Esposa' }, { id: 'lia', label: 'Esposa' }, { id: 'jose', label: 'Filho' }, { id: 'labao', label: 'Tio e sogro' }],
    lessons: ['A promessa segue adiante por meio de pessoas imperfeitas.'],
  },
  {
    id: 'labao', name: 'Labão', role: 'Tio e sogro de Jacó', image: 'abraham-journey', focus: '80% 50%',
    summary: 'Irmão de Rebeca, morava em Harã. Pai de Lia e Raquel. Deu Lia a Jacó em lugar de Raquel na noite do casamento.',
    references: ['Gênesis 24:29', 'Gênesis 29–31'],
    events: ['Recebe Jacó em Harã', 'Troca as noivas', 'Faz um acordo com Jacó'],
    relations: [{ id: 'jaco', label: 'Sobrinho e genro' }, { id: 'lia', label: 'Filha' }, { id: 'raquel', label: 'Filha' }, { id: 'rebeca', label: 'Irmã' }],
    lessons: ['O enganador Jacó também é enganado: a narrativa mostra consequências.'],
  },
  {
    id: 'lia', name: 'Lia', role: 'Primeira esposa de Jacó', image: 'abraham-counsel', focus: '20% 50%',
    summary: 'Filha mais velha de Labão. Foi dada a Jacó na noite do casamento. Mãe de Rúben, Simeão, Levi, Judá, Issacar, Zebulom e Diná.',
    references: ['Gênesis 29:16–35', 'Gênesis 30:17–21', 'Gênesis 35:23'],
    events: ['Casa-se com Jacó', 'É mãe de seis filhos e de Diná'],
    relations: [{ id: 'jaco', label: 'Marido' }, { id: 'raquel', label: 'Irmã' }, { id: 'ruben', label: 'Filho' }, { id: 'juda', label: 'Filho' }],
    lessons: ['Da linhagem de Lia, por meio de Judá, vem a casa real de Davi.'],
  },
  {
    id: 'raquel', name: 'Raquel', role: 'Esposa amada de Jacó', image: 'abraham-counsel', focus: '40% 40%',
    summary: 'Filha mais nova de Labão. Jacó serviu sete anos por ela. Mãe de José e de Benjamim; morreu no caminho de Belém.',
    references: ['Gênesis 29:9–30', 'Gênesis 30:22–24', 'Gênesis 35:16–20'],
    events: ['Encontra Jacó junto a um poço', 'É mãe de José', 'Morre ao dar à luz Benjamim'],
    relations: [{ id: 'jaco', label: 'Marido' }, { id: 'lia', label: 'Irmã' }, { id: 'jose', label: 'Filho' }, { id: 'benjamim', label: 'Filho' }],
    lessons: ['A história de amor e espera de Jacó e Raquel atravessa anos de trabalho.'],
  },
  {
    id: 'jose', name: 'José', role: 'Governador do Egito', image: 'joseph-granaries', focus: '30% 40%',
    summary: 'Filho de Jacó e Raquel. Vendido pelos irmãos, foi servo na casa de Potifar e prisioneiro, interpretou os sonhos de Faraó e tornou-se governador do Egito. Perdoou os irmãos.',
    references: ['Gênesis 37–50', 'Atos 7:9–16', 'Hebreus 11:22'],
    events: ['Recebe a túnica e tem sonhos', 'É vendido para o Egito', 'É preso injustamente', 'Interpreta os sonhos de Faraó', 'Torna-se governador', 'Perdoa os irmãos'],
    relations: [{ id: 'jaco', label: 'Pai' }, { id: 'raquel', label: 'Mãe' }, { id: 'benjamim', label: 'Irmão' }, { id: 'juda', label: 'Irmão' }, { id: 'potifar', label: 'Senhor' }],
    lessons: ['Integridade mesmo sem recompensa imediata.', 'Perdão e reconciliação depois da injustiça (Gênesis 50:20).'],
  },
  {
    id: 'ruben', name: 'Rúben', role: 'Primogênito de Jacó', image: 'joseph-israel', focus: '20% 60%',
    summary: 'Filho mais velho de Jacó e Lia. Convenceu os irmãos a lançar José numa cova em vez de matá-lo, pretendendo devolvê-lo ao pai.',
    references: ['Gênesis 29:32', 'Gênesis 37:21–22, 29–30', 'Gênesis 42:22'],
    events: ['Tenta livrar José', 'Lamenta ao encontrar a cova vazia'],
    relations: [{ id: 'jaco', label: 'Pai' }, { id: 'lia', label: 'Mãe' }, { id: 'jose', label: 'Irmão' }],
    lessons: ['Boas intenções precisam de coragem para se concretizar.'],
  },
  {
    id: 'juda', name: 'Judá', role: 'Filho de Jacó e Lia', image: 'joseph-israel', focus: '60% 60%',
    summary: 'Sugeriu vender José aos ismaelitas. Anos depois, ofereceu-se como escravo no lugar de Benjamim, mostrando uma grande mudança. Dele vem a tribo de Judá.',
    references: ['Gênesis 29:35', 'Gênesis 37:26–27', 'Gênesis 43:8–9', 'Gênesis 44:18–34', 'Gênesis 49:8–10'],
    events: ['Propõe vender José', 'Fica por fiador de Benjamim', 'Oferece-se no lugar do irmão'],
    relations: [{ id: 'jaco', label: 'Pai' }, { id: 'lia', label: 'Mãe' }, { id: 'jose', label: 'Irmão' }, { id: 'benjamim', label: 'Irmão' }],
    lessons: ['Pessoas podem mudar: de quem vende um irmão a quem se oferece por outro.'],
  },
  {
    id: 'benjamim', name: 'Benjamim', role: 'O filho mais novo de Jacó', image: 'joseph-granaries', focus: '70% 60%',
    summary: 'Filho mais novo de Jacó e Raquel, irmão de José por pai e mãe. O copo de prata foi colocado em seu saco para testar os irmãos.',
    references: ['Gênesis 35:16–18', 'Gênesis 42–45'],
    events: ['Nasce perto de Belém', 'Desce ao Egito com os irmãos', 'O copo de prata é encontrado em seu saco'],
    relations: [{ id: 'jose', label: 'Irmão' }, { id: 'raquel', label: 'Mãe' }, { id: 'jaco', label: 'Pai' }],
    lessons: ['A proteção de Benjamim revela a mudança no coração dos irmãos.'],
  },
  {
    id: 'potifar', name: 'Potifar', role: 'Capitão da guarda de Faraó', image: 'joseph-israel', focus: '80% 40%',
    summary: 'Oficial de Faraó que comprou José. Pôs José sobre sua casa e, depois de uma acusação, mandou-o para a prisão.',
    references: ['Gênesis 37:36', 'Gênesis 39:1–20'],
    events: ['Compra José', 'Confia sua casa a José', 'Manda José para a prisão'],
    relations: [{ id: 'jose', label: 'Servo' }],
    lessons: ['A integridade de José é reconhecida mesmo como servo.'],
  },
  {
    id: 'farao-jose', name: 'Faraó (tempo de José)', role: 'Rei do Egito', image: 'joseph-sphinx', focus: '50% 50%',
    summary: 'Rei do Egito que teve os sonhos das vacas e das espigas. Pôs José como governador sobre a terra. Gênesis não registra seu nome próprio.',
    references: ['Gênesis 41', 'Gênesis 47:1–10'],
    events: ['Sonha com vacas e espigas', 'Nomeia José governador', 'Recebe Jacó e sua família'],
    relations: [{ id: 'jose', label: 'Governador' }],
    lessons: ['O texto não identifica qual faraó era; propostas históricas variam.'],
  },
  {
    id: 'moises', name: 'Moisés', role: 'Libertador e legislador', image: 'moses-sinai', focus: '50% 30%',
    summary: 'Hebreu salvo das águas e criado no palácio. Fugiu para Midiã, viu a sarça ardente e foi enviado para libertar o povo do Egito. Recebeu a lei no monte Sinai.',
    references: ['Êxodo 2–20', 'Números', 'Deuteronômio 34', 'Atos 7:20–44', 'Hebreus 11:23–29'],
    events: ['É salvo das águas', 'Foge para Midiã', 'Vê a sarça ardente', 'Confronta Faraó', 'Conduz o povo pelo mar', 'Recebe os mandamentos'],
    relations: [{ id: 'arao', label: 'Irmão' }, { id: 'miria', label: 'Irmã' }, { id: 'jetro', label: 'Sogro' }, { id: 'filha-farao', label: 'Mãe adotiva' }],
    lessons: ['A chamada não depende da autoconfiança de quem é chamado.'],
  },
  {
    id: 'filha-farao', name: 'A filha de Faraó', role: 'Mãe adotiva de Moisés', image: 'joseph-israel', focus: '50% 50%',
    summary: 'Encontrou o menino na arca de juncos à beira do rio, teve compaixão e o criou como filho. Deu-lhe o nome de Moisés.',
    references: ['Êxodo 2:5–10', 'Atos 7:21'],
    events: ['Encontra o menino no rio', 'Adota Moisés'],
    relations: [{ id: 'moises', label: 'Filho adotivo' }],
    lessons: ['A compaixão de uma estrangeira preserva a vida de Moisés.'],
  },
  {
    id: 'miria', name: 'Miriã', role: 'Profetisa, irmã de Moisés', image: 'moses-redsea', focus: '60% 50%',
    summary: 'Irmã de Arão e de Moisés, chamada profetisa. Depois da travessia do mar, tomou o tamboril e conduziu as mulheres em cântico.',
    references: ['Êxodo 15:20–21', 'Números 12', 'Miqueias 6:4'],
    events: ['Conduz o cântico após a travessia'],
    relations: [{ id: 'moises', label: 'Irmão' }, { id: 'arao', label: 'Irmão' }],
    lessons: ['A gratidão se expressa em louvor depois do livramento.'],
  },
  {
    id: 'jetro', name: 'Jetro', role: 'Sacerdote de Midiã, sogro de Moisés', image: 'place-catherine', focus: '50% 70%',
    summary: 'Sacerdote de Midiã, também chamado Reuel. Moisés apascentava seu rebanho quando viu a sarça ardente. Mais tarde aconselhou Moisés a dividir o trabalho de julgar o povo.',
    references: ['Êxodo 2:16–21', 'Êxodo 3:1', 'Êxodo 18'],
    events: ['Acolhe Moisés em Midiã', 'Aconselha Moisés'],
    relations: [{ id: 'moises', label: 'Genro' }],
    lessons: ['Ouvir bons conselhos e dividir responsabilidades.'],
  },
  {
    id: 'arao', name: 'Arão', role: 'Irmão de Moisés, sacerdote', image: 'moses-plague', focus: '30% 60%',
    summary: 'Irmão mais velho de Moisés, designado para falar por ele diante do povo e de Faraó. Depois foi separado com seus filhos para o sacerdócio.',
    references: ['Êxodo 4:14–16', 'Êxodo 7:1–2', 'Êxodo 28:1', 'Êxodo 32'],
    events: ['Fala por Moisés', 'Estende a vara nas pragas', 'É separado como sacerdote'],
    relations: [{ id: 'moises', label: 'Irmão' }, { id: 'miria', label: 'Irmã' }],
    lessons: ['Cada pessoa tem um papel diferente na mesma missão.'],
  },
  {
    id: 'farao-exodo', name: 'Faraó (tempo do Êxodo)', role: 'Rei do Egito', image: 'moses-pharaoh', focus: '50% 50%',
    summary: 'Rei do Egito que se recusou a deixar o povo partir, mesmo diante das pragas. Êxodo não registra seu nome, e a identificação histórica é debatida.',
    references: ['Êxodo 5–14'],
    events: ['Recusa o pedido de Moisés', 'Endurece o coração', 'Persegue o povo até o mar'],
    relations: [{ id: 'moises', label: 'Adversário' }],
    lessons: ['A recusa obstinada traz consequências cada vez maiores.'],
  },
]

export function getCharacter(id: string | undefined): BibleCharacter | undefined {
  return CHARACTERS.find((c) => c.id === id)
}
