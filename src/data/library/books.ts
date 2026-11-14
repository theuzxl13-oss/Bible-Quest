/*
 * BIBLIOTECA — LIVROS
 * Resumos curtos e neutros, escritos pela equipe, respeitando o gênero
 * literário de cada livro. Autorias e datas tradicionais são debatidas e,
 * por isso, não são afirmadas aqui.
 */
export interface BookInfo {
  genre: string
  summary: string
  themes: string[]
  keyRefs: string[]
}

const b = (genre: string, summary: string, themes: string[], keyRefs: string[]): BookInfo => ({ genre, summary, themes, keyRefs })

export const BOOK_INFO: Record<string, BookInfo> = {
  genesis: b('Narrativa', 'As origens: a criação, a queda, o dilúvio, Babel e as histórias de Abraão, Isaque, Jacó e José.', ['Criação', 'Aliança', 'Promessa'], ['Gênesis 1:1', 'Gênesis 12:1–3', 'Gênesis 50:20']),
  exodo: b('Narrativa e lei', 'A libertação de Israel do Egito, a travessia do mar, a aliança no Sinai e a construção do tabernáculo.', ['Libertação', 'Aliança', 'Presença de Deus'], ['Êxodo 3:14', 'Êxodo 14:13–14', 'Êxodo 20:1–17']),
  levitico: b('Lei', 'Instruções sobre ofertas, sacerdócio, pureza e festas, com o chamado à santidade.', ['Santidade', 'Sacrifício', 'Adoração'], ['Levítico 16', 'Levítico 19:18']),
  numeros: b('Narrativa e lei', 'Os censos do povo e os quarenta anos no deserto, entre a saída do Sinai e a chegada às portas de Canaã.', ['Fidelidade', 'Murmuração', 'Jornada'], ['Números 6:24–26', 'Números 13–14', 'Números 21:8–9']),
  deuteronomio: b('Discursos', 'Os discursos de Moisés antes da entrada na terra, que retomam a lei e renovam a aliança.', ['Amor a Deus', 'Obediência', 'Memória'], ['Deuteronômio 6:4–5', 'Deuteronômio 30:19']),
  josue: b('Narrativa', 'A entrada em Canaã sob a liderança de Josué e a divisão da terra entre as tribos.', ['Coragem', 'Promessa cumprida', 'Herança'], ['Josué 1:9', 'Josué 6', 'Josué 24:15']),
  juizes: b('Narrativa', 'Ciclos de infidelidade, opressão e livramento por meio de juízes como Débora, Gideão e Sansão.', ['Ciclos', 'Livramento', 'Liderança'], ['Juízes 2:16–19', 'Juízes 6–7', 'Juízes 21:25']),
  rute: b('Narrativa', 'A história de lealdade de Rute, a moabita, com Noemi, e de Boaz, o resgatador. Rute é bisavó de Davi.', ['Lealdade', 'Resgate', 'Providência'], ['Rute 1:16', 'Rute 4:13–17']),
  '1-samuel': b('Narrativa', 'A transição dos juízes para a monarquia: Samuel, o reinado de Saul e a ascensão de Davi.', ['Liderança', 'Obediência', 'Escolha de Deus'], ['1 Samuel 3:10', '1 Samuel 16:7', '1 Samuel 17']),
  '2-samuel': b('Narrativa', 'O reinado de Davi: sucessos, a aliança davídica, seus erros e as consequências em sua casa.', ['Aliança davídica', 'Arrependimento', 'Consequências'], ['2 Samuel 7:12–16', '2 Samuel 12:13']),
  '1-reis': b('Narrativa', 'O reinado de Salomão e a construção do templo, a divisão do reino e o ministério de Elias.', ['Sabedoria', 'Templo', 'Fidelidade'], ['1 Reis 3:9', '1 Reis 8', '1 Reis 18']),
  '2-reis': b('Narrativa', 'Os reinos de Israel e Judá até as quedas de Samaria e de Jerusalém, com o ministério de Eliseu.', ['Profecia', 'Juízo', 'Reformas'], ['2 Reis 2:11', '2 Reis 17', '2 Reis 25']),
  '1-cronicas': b('Narrativa', 'Genealogias de Adão a Davi e o reinado de Davi, com atenção ao culto e ao templo.', ['Identidade', 'Adoração', 'Davi'], ['1 Crônicas 16', '1 Crônicas 17']),
  '2-cronicas': b('Narrativa', 'De Salomão ao exílio, destacando os reis de Judá, o templo e as reformas.', ['Templo', 'Reforma', 'Arrependimento'], ['2 Crônicas 7:14', '2 Crônicas 36:22–23']),
  esdras: b('Narrativa', 'O retorno do exílio, a reconstrução do templo e a restauração do ensino da lei com Esdras.', ['Restauração', 'Templo', 'Lei'], ['Esdras 1:1–4', 'Esdras 7:10']),
  neemias: b('Narrativa e memórias', 'A reconstrução dos muros de Jerusalém sob Neemias e a renovação da aliança.', ['Reconstrução', 'Oração', 'Liderança'], ['Neemias 1:4–11', 'Neemias 6:15']),
  ester: b('Narrativa', 'Na Pérsia, a rainha Ester intercede por seu povo ameaçado. Origem da festa de Purim.', ['Coragem', 'Providência', 'Livramento'], ['Ester 4:14', 'Ester 9:20–22']),
  'jo-livro': b('Poesia e sabedoria', 'O sofrimento de Jó e o diálogo com seus amigos sobre a justiça, até as palavras do Senhor no redemoinho.', ['Sofrimento', 'Justiça', 'Soberania'], ['Jó 1:21', 'Jó 38:1–4', 'Jó 42:5']),
  salmos: b('Poesia e oração', 'Coleção de 150 cânticos e orações: louvor, lamento, gratidão, confiança e arrependimento.', ['Louvor', 'Lamento', 'Confiança'], ['Salmos 1', 'Salmos 23', 'Salmos 51']),
  proverbios: b('Sabedoria', 'Ditos de sabedoria para a vida diária: palavras, trabalho, amizade, família e o temor do Senhor.', ['Sabedoria', 'Prudência', 'Temor do Senhor'], ['Provérbios 1:7', 'Provérbios 3:5–6']),
  eclesiastes: b('Sabedoria', 'Reflexão sobre o sentido da vida "debaixo do sol", concluindo com o temor a Deus.', ['Sentido', 'Tempo', 'Temor a Deus'], ['Eclesiastes 3:1', 'Eclesiastes 12:13']),
  cantares: b('Poesia', 'Poema de amor entre o amado e a amada. É lido de formas diferentes nas tradições judaica e cristã.', ['Amor', 'Casamento', 'Beleza'], ['Cantares 8:6–7']),
  isaias: b('Profecia', 'Mensagens de juízo e de esperança a Judá, com promessas de restauração e do Servo do Senhor.', ['Santidade', 'Esperança', 'Servo do Senhor'], ['Isaías 6', 'Isaías 9:6', 'Isaías 53']),
  jeremias: b('Profecia', 'Advertências antes da queda de Jerusalém e a promessa de uma nova aliança.', ['Arrependimento', 'Juízo', 'Nova aliança'], ['Jeremias 1:5', 'Jeremias 29:11', 'Jeremias 31:31–34']),
  lamentacoes: b('Poesia', 'Lamentos pela destruição de Jerusalém, com uma confissão de esperança no meio da dor.', ['Lamento', 'Misericórdia', 'Esperança'], ['Lamentações 3:22–23']),
  ezequiel: b('Profecia', 'Visões do profeta entre os exilados: a glória de Deus, o juízo e a restauração, como o vale de ossos secos.', ['Glória de Deus', 'Juízo', 'Restauração'], ['Ezequiel 1', 'Ezequiel 37:1–14']),
  daniel: b('Narrativa e visões', 'Histórias de fidelidade na Babilônia, como a cova dos leões, e visões sobre reinos e o reino de Deus. A interpretação das visões varia entre tradições.', ['Fidelidade', 'Soberania', 'Reino de Deus'], ['Daniel 1:8', 'Daniel 3', 'Daniel 6']),
  oseias: b('Profecia', 'A vida do profeta ilustra o amor fiel de Deus por um povo infiel.', ['Amor fiel', 'Infidelidade', 'Restauração'], ['Oseias 6:6', 'Oseias 11:1–4']),
  joel: b('Profecia', 'Uma praga de gafanhotos como chamado ao arrependimento e a promessa do derramamento do Espírito.', ['Arrependimento', 'Dia do Senhor', 'Espírito'], ['Joel 2:12–13', 'Joel 2:28']),
  amos: b('Profecia', 'Denúncia da injustiça social e da religiosidade vazia em Israel.', ['Justiça', 'Juízo', 'Verdadeira adoração'], ['Amós 5:24']),
  obadias: b('Profecia', 'O menor livro do Antigo Testamento: mensagem sobre Edom e o dia do Senhor.', ['Orgulho', 'Juízo', 'Dia do Senhor'], ['Obadias 1:15']),
  jonas: b('Narrativa profética', 'O profeta que fugiu de sua missão, o grande peixe e a misericórdia de Deus por Nínive.', ['Obediência', 'Misericórdia', 'Missão'], ['Jonas 1:17', 'Jonas 4:11']),
  miqueias: b('Profecia', 'Juízo e esperança, com a promessa de um governante vindo de Belém.', ['Justiça', 'Misericórdia', 'Esperança'], ['Miqueias 5:2', 'Miqueias 6:8']),
  naum: b('Profecia', 'Anúncio da queda de Nínive, capital da Assíria.', ['Justiça de Deus', 'Juízo'], ['Naum 1:7']),
  habacuque: b('Profecia', 'O diálogo do profeta com Deus sobre o mal e a justiça, terminando em confiança.', ['Fé', 'Justiça', 'Confiança'], ['Habacuque 2:4', 'Habacuque 3:17–18']),
  sofonias: b('Profecia', 'O dia do Senhor e a promessa de restauração de um remanescente humilde.', ['Dia do Senhor', 'Remanescente', 'Alegria'], ['Sofonias 3:17']),
  ageu: b('Profecia', 'Encorajamento aos que voltaram do exílio para reconstruir o templo.', ['Prioridades', 'Reconstrução'], ['Ageu 1:4–8']),
  zacarias: b('Profecia', 'Visões e mensagens de esperança para Jerusalém depois do exílio.', ['Restauração', 'Esperança', 'Rei'], ['Zacarias 4:6', 'Zacarias 9:9']),
  malaquias: b('Profecia', 'Último livro do Antigo Testamento no cânon evangélico: chamado à fidelidade na adoração e na vida.', ['Fidelidade', 'Aliança', 'Mensageiro'], ['Malaquias 3:1', 'Malaquias 4:5–6']),
  mateus: b('Evangelho', 'A vida, os ensinamentos, a morte e a ressurreição de Jesus, com destaque para o Sermão do Monte e o cumprimento das Escrituras.', ['Reino dos céus', 'Cumprimento', 'Discipulado'], ['Mateus 5–7', 'Mateus 28:18–20']),
  marcos: b('Evangelho', 'Relato breve e dinâmico da vida e do ministério de Jesus, com ênfase em suas ações.', ['Serviço', 'Poder', 'Cruz'], ['Marcos 1:1', 'Marcos 10:45']),
  lucas: b('Evangelho', 'Relato organizado da vida de Jesus, com atenção aos pobres, às mulheres e aos marginalizados.', ['Compaixão', 'Salvação', 'Oração'], ['Lucas 2:1–20', 'Lucas 15', 'Lucas 19:10']),
  joao: b('Evangelho', 'Sinais e discursos de Jesus escritos para que o leitor creia e tenha vida.', ['Vida', 'Fé', 'Amor'], ['João 1:1', 'João 3:16', 'João 20:31']),
  atos: b('Narrativa', 'A expansão da igreja de Jerusalém a Roma, com Pedro, o Pentecostes e as viagens de Paulo.', ['Espírito Santo', 'Igreja', 'Missão'], ['Atos 1:8', 'Atos 2', 'Atos 9']),
  romanos: b('Carta', 'Carta de Paulo sobre o evangelho, a justificação pela fé e a vida transformada.', ['Graça', 'Fé', 'Nova vida'], ['Romanos 1:16–17', 'Romanos 5:1', 'Romanos 12:1–2']),
  '1-corintios': b('Carta', 'Orientações de Paulo a uma igreja dividida: unidade, ética, culto, amor e ressurreição.', ['Unidade', 'Amor', 'Ressurreição'], ['1 Coríntios 13', '1 Coríntios 15']),
  '2-corintios': b('Carta', 'Carta pessoal de Paulo sobre seu ministério, fraqueza e consolação.', ['Consolo', 'Ministério', 'Generosidade'], ['2 Coríntios 5:17', '2 Coríntios 12:9']),
  galatas: b('Carta', 'Defesa da liberdade em Cristo e da justificação pela fé.', ['Liberdade', 'Fé', 'Fruto do Espírito'], ['Gálatas 2:20', 'Gálatas 5:22–23']),
  efesios: b('Carta', 'A igreja como corpo de Cristo, a graça e a vida nova em comunidade.', ['Graça', 'Unidade', 'Vida nova'], ['Efésios 2:8–9', 'Efésios 6:10–18']),
  filipenses: b('Carta', 'Carta de alegria escrita por Paulo na prisão.', ['Alegria', 'Humildade', 'Contentamento'], ['Filipenses 2:5–11', 'Filipenses 4:4–13']),
  colossenses: b('Carta', 'A supremacia de Cristo e a vida cristã.', ['Supremacia de Cristo', 'Vida nova'], ['Colossenses 1:15–20', 'Colossenses 3:1–17']),
  '1-tessalonicenses': b('Carta', 'Encorajamento a uma igreja jovem e ensino sobre a vinda do Senhor.', ['Esperança', 'Santidade'], ['1 Tessalonicenses 4:13–18', '1 Tessalonicenses 5:16–18']),
  '2-tessalonicenses': b('Carta', 'Esclarecimentos sobre o dia do Senhor e exortação à perseverança e ao trabalho.', ['Perseverança', 'Esperança'], ['2 Tessalonicenses 3:10–13']),
  '1-timoteo': b('Carta', 'Orientações a Timóteo sobre liderança, ensino e vida na igreja.', ['Liderança', 'Ensino', 'Piedade'], ['1 Timóteo 4:12']),
  '2-timoteo': b('Carta', 'Últimas palavras de Paulo a Timóteo: fidelidade e as Escrituras.', ['Fidelidade', 'Escrituras'], ['2 Timóteo 3:16–17', '2 Timóteo 4:7']),
  tito: b('Carta', 'Orientações para organizar as igrejas em Creta e viver o bem.', ['Boas obras', 'Liderança'], ['Tito 2:11–14']),
  filemom: b('Carta', 'Bilhete de Paulo pedindo que Filemom receba Onésimo como irmão.', ['Reconciliação', 'Fraternidade'], ['Filemom 1:15–16']),
  hebreus: b('Carta', 'Cristo como superior aos anjos, a Moisés e ao sacerdócio antigo, e a galeria dos heróis da fé.', ['Fé', 'Sacerdócio', 'Perseverança'], ['Hebreus 4:14–16', 'Hebreus 11', 'Hebreus 12:1–2']),
  tiago: b('Carta', 'Sabedoria prática: fé que se mostra em obras, controle da língua e cuidado com os pobres.', ['Fé e obras', 'Sabedoria', 'Justiça'], ['Tiago 1:5', 'Tiago 2:17']),
  '1-pedro': b('Carta', 'Esperança e firmeza para cristãos que enfrentam sofrimento.', ['Esperança', 'Sofrimento', 'Santidade'], ['1 Pedro 1:3', '1 Pedro 5:7']),
  '2-pedro': b('Carta', 'Crescimento na fé e alerta contra falsos mestres.', ['Crescimento', 'Verdade'], ['2 Pedro 1:5–8', '2 Pedro 3:9']),
  '1-joao': b('Carta', 'Comunhão, amor e segurança para quem crê.', ['Amor', 'Comunhão', 'Verdade'], ['1 João 1:9', '1 João 4:8']),
  '2-joao': b('Carta', 'Breve carta sobre andar na verdade e no amor.', ['Verdade', 'Amor'], ['2 João 1:6']),
  '3-joao': b('Carta', 'Breve carta sobre hospitalidade e bom exemplo.', ['Hospitalidade', 'Exemplo'], ['3 João 1:11']),
  judas: b('Carta', 'Chamado a batalhar pela fé diante de falsos ensinos.', ['Perseverança', 'Fé'], ['Judas 1:3', 'Judas 1:24–25']),
  apocalipse: b('Profecia apocalíptica', 'Visões dadas a João, com mensagens às sete igrejas e a esperança de novos céus e nova terra. As visões são interpretadas de maneiras diferentes nas tradições cristãs.', ['Esperança', 'Fidelidade', 'Vitória de Deus'], ['Apocalipse 1:8', 'Apocalipse 3:20', 'Apocalipse 21:1–5']),
}
