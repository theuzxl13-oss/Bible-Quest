# Bible Quest

**Uma jornada pelas Escrituras.** Jogo bíblico educativo, cinematográfico e para todas as idades, desenvolvido pela **Kzann Tech**.

O jogador cria seu **personagem** (próprio, que não representa ninguém da Bíblia), veste-o com roupas de época e o acompanha por dois mapas: a jornada pelas Escrituras e o mapa de desafios. O jogo tem **dois modos** que compartilham a mesma evolução (XP, níveis, estrelas, medalhas, conquistas, histórico e sequência diária):

- **Modo História — A grande jornada bíblica:** um caminho de fases pela ordem dos livros, de Gênesis a Apocalipse, organizado em 10 mundos.
- **Modo Quiz — Desafios bíblicos:** um mapa próprio com 4 regiões e 24 desafios, além do treino livre com dez modalidades e quatro níveis de dificuldade, do desafio diário e de salas multiplayer (em demonstração).

Também há a **Biblioteca Bíblica** (personagens, livros, lugares e linha do tempo) e a **Revisão inteligente**, que aprende com os erros.

Links e status:

- **Jogar agora:** https://theuzxl13-oss.github.io/Bible-Quest/
- **Repositório:** https://github.com/theuzxl13-oss/Bible-Quest
- **Status:** versão 0.9 (editor com cores livres e expressão; herói masculino no estilo de filme de animação 3D; a estrutura feminina continua com o modelo da v0.7 até a versão estilizada ficar pronta). A publicação é verificada no endereço público a cada versão; veja o histórico no fim deste arquivo.

## Como jogar

### Começando

A entrada tem 5 passos:

1. **Boas-vindas:** "Uma jornada pelas Escrituras." e o botão **Começar jornada**.
2. **Identificação:** nome ou apelido e faixa etária (até 12, 13 a 17, 18 ou mais). Não pedimos data de nascimento, endereço nem telefone.
3. **Escolha do personagem:** 8 personagens diversos (Viajante, Pastora, Escriba, Exploradora, Mensageiro, Guardiã, Peregrino e Contadora de histórias).
4. **Personalização:** prévia em corpo inteiro, atualizada na hora. Você escolhe:
   - nome, tom de pele, rosto;
   - 7 estilos e 6 cores de cabelo;
   - túnica, manto, sandálias, cinto e acessórios, todos inspirados nos tempos bíblicos.

   O passo termina em **Finalizar personagem**.
5. **Chegada:** o personagem entra caminhando no universo Bible Quest.

**Home.** É uma cena de jogo com:

- o personagem em corpo inteiro;
- nome, nível e barra de XP;
- progresso geral;
- os botões Personalizar, Modo História, Modo Quiz, Conquistas, Biblioteca e Estatísticas.

**Personagem estilizado (v0.8).** O herói masculino tem visual de filme de animação 3D: olhos grandes, cabelo volumoso, túnica de linho com barra bordada, faixa, manto curto e sandálias de tiras.

- Gerado de uma imagem de referência com o **TRELLIS.2** (Microsoft, licença MIT), pela demonstração gratuita do Hugging Face, e preparado no Blender por `tools/personagem/estilizado/`.
- Corpo, cabelo e roupa formam uma peça só. A personalização troca as **cores**: pele (6 tons), cabelo, túnica, manto, faixa e couro. Olhos, bordados e sobrancelhas mantêm a pintura original.
- Usa as mesmas animações e expressões (piscar, sorriso, surpresa, alegria) e os acessórios de mão e a coroa de folhas.
- Ainda não muda com corte de cabelo, estilo de manto, cinto, calçado e barba; essas variações virão aos poucos.
- Cerca de 1,8 MB.

**Personagem 3D (v0.7, estrutura feminina).** Um **modelo 3D de verdade (GLB)**:

- malha humana contínua (MakeHuman, CC0) com esqueleto de 163 ossos e pesos de pele;
- rosto com textura de pele real, olhos com íris, sobrancelhas, cílios e dentes;
- 7 cortes de cabelo com textura de fios, tingidos com a cor escolhida;
- roupas de época **drapeadas por simulação de tecido** no Blender;
- animações (espera, caminhada, corrida, vitória, saudação, descoberta) e expressões faciais (piscar, sorriso, surpresa, alegria).

O modelo é gerado por scripts em `tools/personagem/` (veja o README de lá) e publicado em `public/models/personagem/`. As licenças estão em `public/models/personagem/LICENCAS.md` e o diagnóstico em `docs/AUDITORIA-v0.7.md`.

Até a v0.6, o personagem era montado por código, com:

- rosto esculpido, com lábios em volume, vinco nas pálpebras, olhos que piscam e expressões;
- sobrancelhas fio a fio;
- cabelo com centenas de **mechas** afinando até a ponta e cachos em espiral;
- barba com mechas;
- mãos e pés com dedos;
- roupas com dobras sombreadas, gola enrolada e textura de tecido;
- iluminação de três pontos e sombras.

Na personalização é possível:

- **girar 360°** (arrastando ou com o botão "Girar 360°");
- **aproximar e afastar**;
- ver de **frente, de lado e de costas**.

Também é possível escolher a **estrutura do corpo**, a **barba** (curta ou cheia) e o **tingimento** da túnica e do manto, com 8 corantes naturais da Antiguidade.

O personagem se anima em espera (respiração), caminhada, comemoração, descoberta e saudação.

Em **Configurações → Qualidade gráfica do personagem** você escolhe:

- **Automática.**
- **Alta.**
- **Leve:** sem sombras, para aparelhos mais simples.
- **2D:** o desenho anterior, usado também quando o aparelho não tem WebGL.

Detalhes técnicos em [`docs/AUDITORIA-v0.5.md`](docs/AUDITORIA-v0.5.md).

**Personagem único.** A aparência é uma só entidade, salva no perfil e desenhada pelo mesmo componente em todas as telas: Home, topo, mapas, fases, cenas, desafios e resultados.

**Guarda-roupa** (`Personalizar`):

- 36 itens, dos quais 12 estão disponíveis desde o início.
- Os demais são conquistados jogando: nível, estrelas, conquistas, livro concluído, baús do mapa e regiões do Modo Quiz. Nunca com dinheiro.
- Itens bloqueados mostram o requisito.
- É possível equipar e retirar itens (túnica e calçado são obrigatórios), descartar as alterações ou restaurar a aparência anterior.
- Ao desbloquear um item, a **tela de recompensa** mostra o nome, a prévia no seu personagem e o motivo, com as opções **Equipar** ou **Guardar para depois**.

### Modo História

A jornada segue **Testamento → Livro → Mundo → Fase**, usando o cânon evangélico de 66 livros.

- **O mapa.** É um caminho sinuoso com fases numeradas. A fase atual pulsa, as concluídas mostram suas estrelas e as futuras ficam bloqueadas (tocar nelas explica o que falta). O seu aventureiro fica na fase atual e **caminha pelo mapa** quando uma nova fase é liberada.
- **Baús.** Há um baú de recompensa a cada 5 fases e outro no fim de cada mundo. Cada baú abre **uma única vez** e dá 40 XP (100 XP no baú do fim do mundo).
- **Mundos.** São 10 mundos com ambientação própria: Gênesis, Êxodo e o deserto, Conquista e Terra Prometida, Reis e reinos, Exílio e retorno, Poesia e sabedoria, Profetas, Evangelhos, Igreja primitiva e Apocalipse. Hoje, **Gênesis (20 fases) e Êxodo (4 fases)** têm conteúdo; os demais aparecem como "em preparação". Ao entrar num mundo novo, uma abertura apresenta os personagens que você vai conhecer.
- **Cada fase.** A tela da fase mostra número, título, pintura, personagens bíblicos, referência, dificuldade e quantidade de perguntas. Depois vem:
  1. uma **cena** em quadros: introdução, narrativa dramatizada com os personagens entrando em cena, trechos bíblicos com referências e aprendizado;
  2. um **desafio de 5 a 10 perguntas**, com uma por vez, explicação e referência após cada resposta.
- **Estrelas.** A fase é concluída com 60% de acertos (1 estrela). Com 70% são 2 estrelas e com 90%, 3 estrelas.
- **Resultado.** Mostra pontos, acertos, erros, aproveitamento, XP, estrelas e recompensas, com os botões "Continuar a jornada" e "Revisar conteúdo".
- **Biblioteca.** Personagens e lugares de cada fase entram na Biblioteca quando você chega à fase.

### Modo Quiz

**Mapa de desafios** (`#/quiz`), independente do Modo História, com identidade própria: trilha de pedras, estandartes e desafios em forma de escudo. São 4 regiões com 6 desafios cada:

1. Vale dos Iniciantes.
2. Planície do Saber.
3. Montanhas dos Sábios.
4. Torre dos Especialistas.

Como funciona:

- Cada desafio combina modalidade, dificuldade e quantidade de perguntas, e tem uma tela de introdução com as instruções.
- Os desafios abrem em sequência; uma região abre quando a anterior está completa. Desafios bloqueados não abrem por URL.
- As estrelas seguem a mesma regra da história: 1 ao concluir (60%), 2 com 70% e 3 com 90%.
- A primeira conclusão rende os pontos da partida mais 30 XP; repetir conta como treino, com limite diário.
- Concluir uma região libera um item do guarda-roupa.

**Treino livre** (`#/quiz/treino`). Escolha uma modalidade e, quando fizer sentido, a dificuldade (**Iniciante, Intermediário, Avançado ou Especialista**) e a quantidade de perguntas (5, 10 ou 15):

| Modalidade | Como funciona |
| --- | --- |
| Perguntas aleatórias | 10 perguntas de vários livros, da mais fácil para a mais difícil |
| Verdadeiro ou falso | 10 afirmações, com explicação e referência após cada resposta |
| Complete o versículo | 8 trechos da Almeida 1911 (domínio público) com uma palavra faltando |
| Quem sou eu? | As pistas aparecem uma a uma; cada pista não usada vale +5 pontos |
| Contra o tempo | 60 segundos ou 3 erros; respostas em até 4 s valem +10, em até 8 s valem +5 |
| Ordem dos acontecimentos | 4 sequências para organizar, com explicação ao final de cada uma |
| Identifique o livro | 8 passagens ou acontecimentos de toda a Bíblia |
| Desafios por personagem | Perguntas sobre o personagem escolhido (só aparecem personagens com 5 ou mais perguntas) |
| Desafios por tema | Criação, alianças, famílias, libertação, juízo e recomeço, sabedoria, vida de Jesus, igreja |
| Desafios por dificuldade | Do Iniciante ao Especialista; no Especialista, só perguntas difíceis e 20 segundos por pergunta |

Também fazem parte do Modo Quiz:

- **Desafio diário:** 5 perguntas por dia, iguais para todos os jogadores. A recompensa especial (pontos + 30 XP) vale **uma vez por dia**. A tela mostra os desafios realizados e a sequência de dias.
- **Multiplayer:** salas privadas em **modo demonstração** (veja abaixo).

### Biblioteca Bíblica e linha do tempo

- **Personagens:** 35 fichas de Gênesis e Êxodo, com resumo, acontecimentos, relações, lições e referências. A ficha é desbloqueada quando você chega a uma fase em que o personagem aparece.
- **Livros:** os 66 livros, com gênero literário, resumo, temas, referências importantes e seu progresso.
- **Lugares:** 19 lugares, com contexto (indicando quando a localização é debatida), acontecimentos e referências.
- **Linha do tempo:** 22 marcos, cada um com o tipo de informação de data:
  - sequência bíblica;
  - data estimada;
  - data debatida.

  Nenhuma data precisa é inventada, e a página explica que a ordem dos livros nem sempre é a ordem dos acontecimentos.

### Revisão inteligente

O jogo registra cada resposta, em todos os modos, e a tela **Revisão** mostra:

- os **assuntos para revisar** (fases com menos de 70% de acertos ou com erros pendentes);
- os **assuntos dominados** (90% ou mais com pelo menos 5 respostas);
- o desempenho **por livro**;
- a **evolução dos acertos** nas últimas partidas;
- os **últimos erros**, com explicação.

Você pode revisar as perguntas erradas de uma fase ou fazer uma revisão geral. O painel só mostra uma sugestão quando há assunto fraco, sem interromper a jornada.

### Evolução compartilhada e regras contra acúmulo infinito

- O XP do Modo História, do Modo Quiz, das revisões, dos baús e do diário soma no mesmo nível. Há também medalhas por livro, 26 conquistas, histórico das últimas 50 partidas, estatísticas por modalidade e recordes por categoria.
- **Primeira conclusão** de uma experiência: pontos + 50 XP de bônus.
- **Repetir uma experiência concluída:** só rende XP se você superar sua melhor pontuação (e apenas a diferença).
- **Limite diário de XP de prática: 300 XP.** Vale para o Modo Quiz e para tentativas reprovadas no Modo História. Depois do limite você continua jogando e registrando recordes, sem XP extra.
- **Desafio diário:** a recompensa vale uma vez por dia. Se o relógio do aparelho voltar no tempo, a recompensa fica bloqueada.
- **Baús:** são finitos e cada um abre só uma vez.
- **Pontuação:**
  - Fácil 10, médio 15, difícil 20, e +5 por acerto a partir do 3º seguido.
  - A velocidade só conta no Contra o tempo e no multiplayer.

## Tecnologias

- React 19, TypeScript 7 e Vite 8 (com `@vitejs/plugin-react` 6)
- Three.js 0.187, para o personagem 3D, num pacote separado carregado só quando o personagem aparece (cerca de 165 KB comprimido)
- React Router 7 com `HashRouter`, para que links diretos funcionem no GitHub Pages e num futuro WebView Android
- CSS moderno, sem framework, com tokens de cor, layout responsivo e modos de acessibilidade
- Vitest 5 e Testing Library para testes de regras e fluxos
- Fontes auto-hospedadas via Fontsource: Cinzel, Inter e Crimson Pro
- GitHub Actions para validar, compilar e publicar

## Instalação e execução local

Requisito: Node.js 22 ou superior.

```bash
npm ci
```

```bash
npm run dev
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run typecheck` | Verifica os tipos com TypeScript |
| `npm test` | Roda os testes (regras do jogo, conteúdo, serviços e fluxos de tela) |
| `npm run build` | Faz o typecheck e gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

## Estrutura do projeto

```
public/images/art/        Pinturas em domínio público (WebP, 1280px e 560px)
src/
  types/                  Tipos de domínio (livros, experiências, perguntas, progresso)
  data/
    bible/canon.ts        Cânon de 66 livros (preparado para outros cânones)
    story/                Fases do Modo História, um arquivo por livro (genesis.ts, exodo.ts)
    library/              Biblioteca: personagens bíblicos, lugares e fichas dos 66 livros
    character/            Itens do personagem (items.ts, com requisitos de desbloqueio), personagens-base (bases.ts) e
                          look.ts (aparência resolvida, tingimentos e identidade visual)
    quiz/regions.ts       Regiões e desafios do mapa do Modo Quiz
    worlds.ts             Os 10 mundos do mapa (livros, cores e cenário)
    timeline.ts           Linha do tempo com o tipo de datação de cada evento
    themes.ts             Temas e busca por personagem para o Modo Quiz
    questions/            Banco de perguntas por livro + perguntas gerais do Modo Quiz
    achievements.ts       Conquistas
    images.ts             Catálogo e créditos das obras
  services/
    game/                 Regras puras: journeyMap (mundos, fases, baús, avatar), library (fichas), review
                          (revisão inteligente), progression (desbloqueio e porcentagens), scoring (pontos, estrelas, XP e limites),
                          engine (aplica partidas ao progresso único), daily (desafio diário e serviço de data),
                          freeModes (modalidades), quizMap (mapa do Quiz), items (desbloqueio e equipamento),
                          answers, levels, streak
    storage/              Armazenamento local e repositórios, com migração do progresso da v0.1
    content.ts            Conteúdo criado no painel administrativo (local) e validação
    multiplayer/          Contratos, serviço de demonstração e ponto de troca para Supabase Realtime
    supabase/             Leitura de configuração pública (sem chaves no código)
    auth.ts               Contrato de autenticação e perfil local
  character3d/            Personagem 3D: anatomy (cabeça esculpida, rosto, mãos, pés), hair (cabelos e barba),
                          clothing (túnica, mangas, manto, cintos, calçados), accessories, textures (procedurais),
                          rig (esqueleto, materiais e animações), stage (luzes e câmera), runtime (visualizador e
                          miniaturas, carregado sob demanda), quality (qualidade gráfica)
  state/GameContext.tsx   Estado global e ações
  components/             Layout, character/ (Character: personagem em SVG por camadas; PlayerCharacter; ItemReward),
                          map/ (mapa e cenário), ícones,
                          imagens, QuestionView (8 tipos de exercício), QuizRunner
  pages/
    story/                Mapa de fases, tela da fase, cena narrativa, desafio, livro, todos os livros
    library/              Biblioteca, fichas e linha do tempo
    onboarding/           Boas-vindas, escolha do personagem, personalização/guarda-roupa e chegada
    quiz/                 Mapa do Modo Quiz e tela de desafio
    Statistics.tsx        Estatísticas
    Review.tsx            Revisão inteligente
    free/                 Treino livre do Modo Quiz, partida por modalidade, multiplayer
    ...                   Início, apresentação, cadastro, painel, diário, resultado, ranking, conquistas, perfil,
                          configurações, sobre
  admin/                  Painel administrativo (carregado sob demanda) e editores de conteúdo
  test/                   Testes
docs/supabase/schema.sql  Esquema proposto com políticas RLS
```

### Como adicionar um livro ao Modo História

1. Crie `src/data/story/<livro>.ts` com `experiences('<id-do-livro>', [...])`, seguindo `genesis.ts`.
2. Registre o livro em `src/data/story/index.ts`.
3. Crie as perguntas em `src/data/questions/`, com `experienceId` apontando para cada experiência (mínimo de 5 por experiência), e inclua-as em `questions/index.ts`.
4. Rode `npm test`. Os testes de conteúdo validam a ordem, as 4 partes de leitura, as referências, as perguntas e as imagens.

A progressão, o mapa, as porcentagens e as medalhas passam a considerar o novo livro automaticamente.

## Funcionalidades implementadas

- **Personagem 3D** com rotação 360°, zoom, vistas, animações, estrutura corporal, barba, tingimentos e qualidade gráfica ajustável, com alternativa 2D.
- **Entrada em 5 passos e personagem por itens**, com guarda-roupa, tela de recompensa e migração automática dos personagens da v0.3.
- **Home em cena:**
  - Personagem em corpo inteiro, nível, XP e progresso geral.
  - Modo História e Modo Quiz com seus textos.
  - Atalhos para Personalizar, Conquistas, Biblioteca, Estatísticas, desafio diário, revisão e rankings.
  - Partidas recentes.
- **Modo Quiz:** mapa de 4 regiões e 24 desafios, independente do Modo História, mais o treino livre. Os endereços antigos `#/livre/...` redirecionam para `#/quiz/treino/...`.
- **Biblioteca:** além de personagens, livros e lugares, tem abas de **Acontecimentos** (liberados ao concluir a fase) e **Temas**.
- **Revisão:** assuntos, **personagens para revisar** e livros com baixo desempenho.
- **Estatísticas** (`#/estatisticas`): geral, Modo História, Modo Quiz por região e modalidade, tipos de pergunta, diário.
- **Modo História:**
  - Mapa dos 66 livros com status e porcentagens.
  - Página do livro com o caminho das experiências.
  - Páginas de experiência com as 7 etapas e desafio.
  - **Conteúdo:**
    - **Gênesis:** 19 experiências (criação, homem e mulher, Éden, queda, Caim e Abel, corrupção da humanidade, arca, dilúvio, aliança com Noé, Babel, chamado de Abraão, Abraão e Ló, Isaque, Moriá, Jacó e Esaú, e quatro experiências de José).
    - **Êxodo:** 4 experiências.
    - **Outros 64 livros:** aparecem como "em preparação".
- **Treino livre do Modo Quiz:**
  - 10 modalidades, cada uma com regras próprias.
  - Recordes por modalidade.
  - Limite diário de XP de prática.
- **Perguntas:** 197 no total, em 8 tipos (incluindo ordenação, memória e "Relacione"), todas com resposta, explicação, referência, dificuldade e categoria.
  - 144 estão ligadas a experiências.
  - 34 são de toda a Bíblia (Salmos, Provérbios, Daniel, Jonas, Evangelhos, Atos, cartas, Apocalipse e outros).
- **Desafio diário:**
  - Conjunto determinístico por dia.
  - Recompensa uma vez por dia, com proteção contra o relógio do aparelho voltar no tempo.
  - Registro dos desafios feitos e sequência de dias.
- **Perfil local:**
  - Estatísticas dos dois modos e progresso por livro e testamento.
  - Recordes do Modo Quiz e histórico.
  - Exportação e exclusão de dados (LGPD).
- **Migração automática** do progresso salvo na versão 0.1 (capítulos viram experiências; XP, histórico e conquistas são preservados).
- **Painel administrativo** (`#/admin`), com 8 seções:
  - Livros.
  - Experiências: rascunhos locais com editor.
  - Perguntas: criar, editar, excluir, importar e exportar JSON, e usar no Modo Quiz deste aparelho.
  - Desafios diários: prévia dos próximos 7 dias.
  - Medalhas e recompensas.
  - Usuários.
  - Denúncias.
  - Estatísticas.
- **Acessibilidade:**
  - Três tamanhos de texto, alto contraste e opção de reduzir animações.
  - Leitura em voz alta.
  - Atalhos de teclado (1 a 4) e foco visível.
  - Alvos de toque com pelo menos 44px.

## O que é demonstrativo e o que depende de backend

| Recurso | Situação na versão estática | Depende de backend para |
| --- | --- | --- |
| Perfil e progresso | Funciona, salvo só neste navegador | Conta, login seguro e sincronização entre aparelhos (Supabase Auth + PostgreSQL) |
| Rankings | Seus recordes reais por categoria (XP geral, Modo História, Modo Quiz, Desafio diário, Multiplayer futuro). Nenhum jogador é inventado | Comparação com outros jogadores |
| Multiplayer | Demonstração: sala local com participantes fictícios identificados, cronômetro por pergunta, placar, vencedor e ranking da partida | Entrar por código, convidar amigos, sincronizar respostas em tempo real (Supabase Realtime + Edge Function de validação) |
| Desafio diário | Funciona, com a data do aparelho e proteção contra retrocesso do relógio | Data e recompensa validadas no servidor |
| Painel administrativo | Edição local (este navegador) com exportação e importação em JSON; conteúdo oficial somente leitura | Publicar conteúdo para todos, usuários, denúncias e moderação, com autenticação, papéis, RLS e auditoria |

A interface de cada recurso informa claramente o que é demonstração. Nenhuma tela simula uma conexão online real.

## Limitações da versão estática

- **Dados locais.** O progresso fica no `localStorage`: não sincroniza entre aparelhos e é perdido se os dados do navegador forem apagados.
- **Segurança.** Não há autenticação segura nem administração segura: qualquer proteção no navegador pode ser contornada.
- **Conteúdo.** Só Gênesis e Êxodo têm experiências; os demais livros estão em preparação.

## Conteúdo bíblico e licenças

- **Texto bíblico.** Os trechos vêm da Almeida Revista e Corrigida, edição de 1911 (domínio público), com ortografia atualizada. São apenas trechos curtos, sempre com referência. **Antes de uma publicação oficial, revise cada trecho contra a fonte**; eles estão em `src/data/story/` e nas perguntas "Complete o versículo". Traduções protegidas não são usadas.
- **Narrativa e explicações.** A narrativa dramatizada tem selo próprio, não é texto bíblico e não atribui falas a Deus, a Jesus ou a personagens. Introduções e aprendizados são textos explicativos da equipe. Datas antigas e localizações debatidas são apresentadas como debatidas, e interpretações variadas são apresentadas como tais.
- **Imagens.** São 29 obras em domínio público (David Roberts, John Martin, Thomas Cole, Aivazovsky, Alma-Tadema, Poynter, Gérôme, Tissot, Edward Hicks, József Molnár e Pieter Bruegel), obtidas no Wikimedia Commons, com créditos e links na tela Sobre.

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy.yml` roda em pushes para `main`, `master` e `claude/**`, ou manualmente. Ele:

1. instala as dependências com `npm ci`;
2. verifica os tipos;
3. roda os testes;
4. gera o build;
5. publica `dist/` com `actions/deploy-pages`.

O build usa `base: './'` e `HashRouter`, então funciona em qualquer subdiretório (como `/Bible-Quest/`) sem configuração extra.

**Configuração do GitHub (já feita):**

1. Em **Settings → Pages → Build and deployment → Source**, está selecionado **GitHub Actions**.
2. Em **Settings → Environments → github-pages → Deployment branches**, estão permitidas as branches `claude/dazzling-johnson-mig8ai` e `claude/loving-carson-8mrbjo`. Para publicar a partir de outra branch, adicione-a nessa lista; sem isso, a etapa de publicação falha em poucos segundos e sem log.
3. As permissões `pages: write` e `id-token: write` já estão declaradas no workflow.

Cada push nessas branches publica automaticamente. Para publicar manualmente, use **Actions → Build e publicação no GitHub Pages → Run workflow**.

## Variáveis de ambiente futuras

O Supabase será ativado definindo, no momento do build, apenas valores públicos:

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon pública>
```

Nunca coloque a `service_role` key, senhas ou tokens no frontend.

## Variáveis de ambiente futuras

O Supabase será ativado definindo, no momento do build, apenas valores públicos:

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon pública>
```

Nunca coloque a `service_role` key, senhas ou tokens no frontend.

## Testes

São 115 testes automatizados (Vitest e Testing Library), em sete arquivos. O ambiente de teste não tem WebGL, então os testes de tela usam o personagem 2D; o 3D é verificado no navegador.

- **v0.6:**
  - A ficha de personagem traz o contexto histórico.
  - A tela de boas-vindas mostra o personagem de quem já começou.
- **v0.5:**
  - Corpo e barba deduzidos para perfis antigos.
  - O tingimento muda a cor e a identidade visual.
  - Sem WebGL, o personagem cai para 2D.
  - No guarda-roupa, corpo, barba e tingimento são salvos.

- **Personagem e Modo Quiz** (`personagem.test.ts`):
  - Os personagens-base usam só itens iniciais, e os itens bloqueados exigem progresso real.
  - Um item desbloqueado é registrado uma vez e vai para a tela de recompensa.
  - Regras de equipar e retirar.
  - Migração da aparência v0.3 sem perda de XP.
  - Progressão das regiões do Quiz e item da região.
  - Cada desafio tem perguntas suficientes.
  - O bônus de primeira conclusão vale só uma vez.

- **Conteúdo** (`content.test.ts`):
  - O cânon tem 66 livros, e cada um tem ficha e pertence a exatamente um mundo.
  - Gênesis tem 20 fases, e **toda fase tem de 5 a 10 perguntas** e pelo menos 3 tipos de exercício.
  - Personagens e lugares das fases existem na Biblioteca, e cada personagem aparece em alguma fase.
  - A linha do tempo classifica todas as datas.
  - A narrativa não tem falas citadas.
  - Há 190 ou mais perguntas válidas, sem repetição.
  - Todas as imagens existem.
- **Aventura** (`aventura.test.ts`):
  - Estrelas por aproveitamento (1, 70% e 90%).
  - Mundos, numeração das fases e baús; estados das fases e posição do avatar.
  - O baú abre uma única vez.
  - Desbloqueio da Biblioteca.
  - Revisão inteligente: assuntos fracos e dominados, perguntas recomendadas e XP de prática.
  - Treino livre por personagem, tema e dificuldade.
  - Exercício "Relacione".
  - Migração da v0.2.
- **Regras**, **Motor** e **Serviços**: pontuação, progressão, diário, limites de XP, persistência e conteúdo do painel administrativo.
- **Fluxos de tela** (`flow.test.tsx`):
  - Cadastro → **criação do personagem** → abertura do mundo → mapa (fase atual, fase bloqueada com aviso) → tela da fase → cena narrativa → desafio de 10 perguntas → 3 estrelas → "Continuar a jornada" → **o avatar avança para a fase 2**.
  - Reprovação abaixo de 60%.
  - Fichas desbloqueadas ao entrar na fase.
  - **Baú aberto uma vez** com +40 XP.
  - Revisão das perguntas erradas.
  - Personagem obrigatório antes da jornada.
  - Ranking sem jogadores inventados.
  - Especialista com cronômetro.
  - Treino livre, diário, multiplayer, acessibilidade, painel administrativo e página 404.
  - **v0.4:**
    - A Home em cena mostra os dois textos dos modos.
    - Um desafio do Quiz concluído libera o próximo (com bônus) sem tocar no Modo História, e um desafio bloqueado não abre por URL.
    - Na tela de recompensa, "Equipar" veste o item no personagem.
    - **A mesma aparência (atributo `data-appearance`) aparece em todas as telas, mesmo ao montar o app de novo.**

Além dos testes automatizados, cada versão é auditada no navegador (Playwright), em celular (Pixel 7) e computador.

Na v0.5 a auditoria roda com WebGL (SwiftShader) e verifica também o personagem 3D: a prévia é um canvas WebGL, as vistas de frente, lado e costas, e o giro com o mouse.

Na v0.4, a auditoria percorre o cenário de consistência do personagem:

1. Escolha da Exploradora, cabelo ondulado, túnica de linho (bege), manto marrom, sandálias claras, cinto e bolsa.
2. Finalizar personagem → chegada → Home → mapa da história → fase → cena → desafio → resultado → tela de recompensa → mapa do Quiz → desafio → resultado.
3. Recarregar a página.

Em cada etapa, a aparência desenhada é comparada com a salva. As telas novas também são auditadas.

Nas versões anteriores, a auditoria cobriu:

- criação do personagem;
- mapa e avanço do avatar;
- duas fases completas, com cena e desafio;
- as 10 modalidades;
- diário, inclusive a tentativa de receber a recompensa duas vezes;
- multiplayer;
- Biblioteca e fichas;
- linha do tempo e revisão;
- todas as abas do painel administrativo;
- todos os links internos.

Em cada tela são verificados erros de console, imagens quebradas, rolagem lateral e botões sem nome.

## Histórico de atualizações

Este README é atualizado a cada mudança no projeto. A entrada mais recente fica no topo.

### 0.9.0 — 13/11/2026 — Editor de personagem: cores livres, expressão e troca ao vivo

Primeira entrega do editor modular (`docs/EDITOR-3D-PLANO.md`, Etapas 4 e 6).

- **Cores livres por região:** nova aba **Cores** no guarda-roupa e na criação, para cabelo, túnica, manto, faixa e cinto, e couro.
  - Cada região tem uma paleta de época, a opção "cor original" e um seletor livre (`SeletorDeCor`).
  - A cor livre vale nos dois modelos (estilizado e v0.7) e tem prioridade sobre o tingimento.
- **Expressão de repouso:** Serena, Sorriso, Alegre ou Curiosa, na aba Rosto. Usa os morph targets do modelo.
- **Troca ao vivo:** no modelo estilizado, mudar uma cor só atualiza os uniforms do shader. O personagem não é remontado nem o GLB recarregado (`recolorir` no `Rig`, `soCores` em `heroi.ts`).
- **Shader:** a suavização de claridade agora é por região (forte na pele, leve nas outras). Assim um cabelo escuro pode virar loiro.
- **Interface:** categorias em coluna lateral nas telas largas. Botões **Restaurar aparência original** e **Salvar personagem**.
- **Salvamento:** os campos novos `cores` e `expressao` em `CharacterAppearance` guardam apenas cores (#rrggbb) e identificadores. Valores inválidos vindos do armazenamento são descartados. Perfis antigos mantêm a mesma chave visual.
- **Lógica do editor:** fica em `src/services/game/aparencia.ts` (`definirCor`, `definirExpressao`, `restaurarOriginal`).
- **Testes:** 125 no total. Novos:
  - `editor.test.ts`: cabelo, cores, roupas, acessórios, expressão, salvamento, recuperação, dados corrompidos e restauração;
  - fluxo de ponta a ponta das cores e da expressão.
  - O teste do guarda-roupa passou a usar os novos nomes dos botões.
- **Ainda falta:** cor dos olhos e formatos de olhos, cortes de cabelo, roupas e calçados como peças 3D estilizadas. Dependem do corpo base estilizado (veja o plano).

### 0.8.5 — 13/11/2026 — Plano do editor de personagens modular

- `docs/EDITOR-3D-PLANO.md`: análise do que já existe, arquitetura proposta e lista dos modelos 3D necessários para o editor modular pedido (Etapas 1 a 3). Nenhuma mudança no jogo.

### 0.8.4 — 13/11/2026 — Interface em tons quentes

- O azul-marinho da interface virou marrom-terra quente (variáveis `--navy-*` e as cores fixas equivalentes em `global.css`), combinando com o estilo de animação. O texto continua claro sobre fundo escuro, com o mesmo contraste. O modo de alto contraste não mudou.
- Cantos mais arredondados (cartões com 18 px, botões e campos com 12 px).
- Palco 3D com luz quente: o contraluz azulado virou âmbar, e a luz principal ficou mais quente.
- `theme-color` do navegador acompanha o novo fundo.

### 0.8.3 — 13/11/2026 — Um modelo por personagem

- O jogo agora carrega o modelo próprio de cada personagem (`heroi-<base>.glb`), quando existir, listado em `MODELOS_POR_BASE` (`src/character3d/heroi.ts`). Se o jogador trocar o corpo, ou se o arquivo faltar ou falhar, usa o modelo do corpo, como antes. Novo teste.
- Referências em pose neutra (braços um pouco abertos, mãos vazias) de 6 personagens, geradas no Canva a partir dos desenhos do dono do projeto, em `tools/personagem/estilizado/referencias/`. Os modelos 3D saem um por dia (cota gratuita).

### 0.8.2 — 13/11/2026 — Referências dos outros personagens

- Folha com os 8 personagens enviada pelo dono do projeto: cada figura foi recortada para `tools/personagem/estilizado/referencias/` (com `LEIA-ME.md`), para virar modelo 3D, um por dia, conforme a cota gratuita. Nenhuma mudança no jogo.

### 0.8.1 — 13/11/2026 — Tons de pele do herói estilizado

- O tingimento usa a luminância da textura sobre a cor escolhida, com a diferença de claridade suavizada (expoente 0,5).
- Os tons claros de pele ganham saturação proporcional à claridade (`saturacaoPele`), porque a luz azulada do palco os deixava acinzentados. Os tons médios e escuros ficam como estão.

### 0.8.0 — 13/11/2026 — Herói masculino no estilo de animação 3D

- **Novo herói masculino** publicado: modelo gerado de imagem com o TRELLIS.2 (gratuito), com esqueleto, as seis animações, quatro expressões e acessórios de mão.
- `tools/personagem/estilizado/acabar.py`: separa seis regiões de cor pela textura e pela posição (pele, cabelo, túnica, manto, faixa, couro), aumenta um pouco os olhos, cria as expressões e exporta. O piscar fecha o olho para cima, com a pele da bochecha cobrindo. `montar.sh` faz o processo inteiro.
- **Jogo:** `heroi.ts` reconhece o modelo estilizado (`estilo: animacao` nos extras da cena) e tinge cada região por um shader. Só mudam os texels parecidos com a cor de base; a claridade da cor nova é suavizada, para tons muito claros não estourarem. A cor de base de cada material agora é preservada na conversão para MeshStandardMaterial.
- **Limitações:** a estrutura feminina continua com o modelo v0.7 até a referência feminina ser gerada (a cota gratuita diária do Hugging Face permite poucos modelos por dia). Troca de corte de cabelo, manto, cinto, calçado e barba não aparece no herói estilizado.
- **Testes:** o teste do GLB publicado aceita o modelo estilizado (regiões com cor de base e acessórios); novo teste das cores por região.

### 0.7.4 — 13/11/2026 — Esqueleto e animações no personagem estilizado

- Primeiro modelo estilizado (masculino) gerado da imagem de referência aprovada.
- `tools/personagem/estilizado/preparar.py`: une vértices, reduz para 40 mil faces e põe a malha em metros.
- `tools/personagem/estilizado/rigar.py`: esqueleto com os mesmos nomes de ossos do modelo v0.7 (juntas em `juntas-m.json`), pesos calculados numa cópia fechada da malha e transferidos, saia dividida entre tronco e pernas, braços baixados para a pose de repouso e os mesmos clipes (Idle, Walk, Run, Victory, Greeting, Discovery).
- Correção em `animacoes.py`: canais constantes só são removidos quando estão no valor de repouso (antes, um braço erguido o clipe inteiro podia perder parte da rotação).
- Ainda não integrado ao jogo.

### 0.7.3 — 13/11/2026 — Primeiro teste de imagem para 3D

- `gerar3d.py` agora usa a chave do Hugging Face injetada pelo ambiente (cabeçalho `x-hf-authorization`), sem guardar a chave no código. Teste completo: modelo 3D com textura gerado em cerca de 37 segundos, de graça. O modelo de teste fica fora do Git; nenhuma mudança no jogo.

### 0.7.2 — 13/11/2026 — Início do personagem no estilo de animação

- Regra de imagens do `CLAUDE.md` atualizada, com autorização do dono do projeto: além das obras em domínio público, também são permitidos recursos gerados por IA e recursos CC0, com origem e licença registradas.
- `tools/personagem/estilizado/gerar3d.py`: gera um modelo 3D a partir de uma imagem com o TRELLIS.2 (Microsoft, licença MIT), pela demonstração gratuita do Hugging Face. Precisa de uma chave gratuita de leitura do Hugging Face. Nenhuma mudança no jogo.

### 0.7.1 — 13/11/2026 — Plano do estilo de animação 3D

- Registrado em `docs/PROXIMOS-PASSOS-3D.md` o plano para deixar personagens e interface no estilo de filme de animação 3D, pelo caminho gratuito (imagens de referência, TRELLIS, Blender), com as decisões pendentes. Nenhuma mudança no jogo.

### 0.7.0 — 12/11/2026 — Personagem 3D reconstruído (modelo GLB)

- **Etapas 1 e 2:** diagnóstico do personagem anterior e escolha da tecnologia (`docs/AUDITORIA-v0.7.md`).
- **Modelo principal:** pipeline reprodutível no Blender (`tools/personagem/`), com recursos CC0 do MakeHuman.
  - Corpo humano contínuo, com targets de sexo, idade, musculatura e proporções.
  - Esqueleto de 163 ossos (com rig facial) e pesos.
  - Olhos, sobrancelhas, cílios, dentes e língua.
  - 7 cabelos texturizados e textura de pele real.
  - Estruturas masculina e feminina.
- **Roupas:**
  - Túnica, com saia longa e curta drapeada por **simulação de tecido**.
  - Mantos (padrão, longo, xale, capuz), também simulados.
  - Cintos de couro, corda e faixa; sandálias simples e de tiras; botas.
  - Barba curta e cheia; lenço.
  - Bolsa, odre e colar.
  - Cajado, pergaminho, lamparina, cesto e coroa de folhas, presos aos ossos.
- **Animações:** Idle, Walk, Run, Victory, Greeting e Discovery. **Expressões:** Piscar, Sorriso, Surpresa e Alegria.
- **No jogo** (`src/character3d/heroi.ts`):
  - Cada peça é ligada ou desligada conforme a aparência salva.
  - Cores e tingimentos por item; cabelo, barba e sobrancelhas tingidos no shader.
  - Listras e barras bordadas desenhadas no shader.
  - Mão fechada ao segurar objetos; piscar automático; expressões combinadas com as animações.
  - O mesmo modelo aparece ao vivo e como imagem (miniaturas) em todas as telas.
- **Criador reformulado:**
  - 9 categorias: Rosto, Cabelo, Cor do cabelo, Barba, Túnica, Manto, Cinto, Sandálias e Acessórios.
  - Cada opção mostra uma prévia no próprio personagem.
  - Botões Confirmar, Cancelar, Restaurar aparência anterior, Remover acessórios e Voltar à aparência padrão.
- **Desempenho:**
  - Compressão meshopt e texturas WebP (cerca de 4,8 MB por corpo, carregado sob demanda).
  - Materiais simplificados para compilar rápido; compilação assíncrona de shaders quando o navegador permite.
  - A renderização por software é detectada e usa a qualidade leve, limitada a 30 quadros por segundo.
  - A recompensa usa imagem do modelo em vez de um segundo visualizador ao vivo.
- **Testes:** 115 automatizados (2 novos: correspondência item → peça do modelo; o GLB publicado contém peças, animações e expressões). Auditoria no navegador com o GLB, em celular e computador.

### 0.6.0 — 12/11/2026 — Acabamento do personagem e lacunas do pedido

- **Cabelo:** centenas de mechas afinando até a ponta, saindo do redemoinho (ou da risca) até a linha do cabelo, que agora é irregular. Mechas soltas nos cabelos longos; cachos em espiral; com manto, o cabelo longo fica por dentro.
- **Rosto:**
  - Lábios com volume e cor que acompanha o tom de pele.
  - Vinco da pálpebra e abertura dos olhos amendoada.
  - Branco dos olhos com sombra e íris maior.
  - Sobrancelhas fio a fio.
  - Barba cheia com mechas e borda suave.
- **Pele e tecidos:** brilho de pele que imita a luz atravessando a pele; sombra nas reentrâncias das dobras da túnica e do manto; gola enrolada; luz principal mais lateral, para dar volume ao rosto.
- **Lacunas do pedido:**
  - Boas-vindas com o personagem do jogador acenando.
  - **Contexto histórico** nas fichas de personagens (eventos da linha do tempo, com o tipo de datação).
  - Partículas discretas no acerto e tremor no erro.
  - Transição suave entre telas. Tudo respeita "reduzir animações".
- 2 testes novos (113 no total).

### 0.5.0 — 11/11/2026 — Personagem 3D

- **Etapa 1:** auditoria e decisão técnica em `docs/AUDITORIA-v0.5.md` (Three.js puro, modelo construído no código, sem arquivos de terceiros).
- **Etapa 2 — personagem 3D:**
  - Cabeça esculpida com nariz, lábios, maçãs do rosto e queixo; olhos com íris, pálpebras que piscam e cílios.
  - Sobrancelhas, orelhas e três expressões.
  - 7 estilos de cabelo com volume e mechas (cachos, coque, trança e cortina de fios); barba curta ou cheia.
  - Mãos com cinco dedos e pés com dedos.
  - Túnica com dobras e trama, mangas largas, mantos (com capuz e xale), cintos, sandálias e botas.
  - Todos os acessórios do jogo em 3D.
  - Iluminação de três pontos e sombras.
  - Animações: espera, caminhada, comemoração, descoberta, saudação e piscar.
- **Etapa 3 — integração:**
  - Ao vivo na Home, no guarda-roupa (rotação 360°, zoom e vistas), na chegada (entra caminhando e acena), na recompensa e no resultado.
  - Como imagem do mesmo modelo nos mapas, no topo, nos cartões, nas fases, nas conquistas e no perfil.
- **Novas opções:**
  - Estrutura do corpo, barba e 8 tingimentos naturais para túnica e manto.
  - Qualidade gráfica (Automática, Alta, Leve e 2D).
- **Desempenho:**
  - Three.js num pacote separado, carregado só quando o personagem aparece.
  - Um renderizador compartilhado e cache para as miniaturas.
  - Cache de geometrias.
  - A animação pausa fora da tela.
- **Compatibilidade:** perfis antigos continuam iguais (corpo e barba são deduzidos da base e do rosto).
- 3 testes novos (111 no total); auditoria no navegador com WebGL.

### 0.4.0 — 11/11/2026 — Personagem, mapas e progressão

- **Etapas 2 a 5:**
  - **Home em cena** com o personagem em corpo inteiro, nível, XP, progresso geral e os textos dos dois modos.
  - **Modo Quiz** (antigo Modo Livre):
    - Mapa próprio com 4 regiões e 24 desafios, trilha de pedras, estandartes e escudos.
    - Tela de introdução de cada desafio, com bônus de primeira conclusão.
    - O antigo hub virou "Treino livre"; endereços `#/livre` redirecionam.
  - **Tela de recompensa de item** (Equipar / Guardar para depois / Guardar todos), em Home, resultado e mapas.
  - **Estatísticas** (`#/estatisticas`).
  - Biblioteca com **Acontecimentos** e **Temas**.
  - Revisão com **personagens para revisar** e livros com baixo desempenho.
  - Ranking com o mapa do Quiz e aba "Multiplayer (futuro)".
- **Etapa 6:** 15 testes novos (108 no total) e auditoria de consistência da aparência no navegador, inclusive após recarregar.
- **Etapa 0:** auditoria e plano em `docs/PLANO-v0.4.md`.
- **Entrada em 5 passos:** boas-vindas → identificação (nome ou apelido e faixa etária) → escolha do personagem (8 bases diversas) → personalização com prévia em corpo inteiro → chegada ao universo Bible Quest.
- **Personagem único e centralizado:**
  - Aparência (`CharacterAppearance`) com base, pele, rosto, estilo e cor de cabelo e itens equipados (túnica, manto, calçado, cinto e acessórios).
  - Um só renderizador SVG por camadas (`Character`), usado em todas as telas via `PlayerCharacter`.
- **Guarda-roupa** (`/guarda-roupa`): 36 itens de época; itens bloqueados mostram o requisito (nível, estrelas, conquista, livro concluído, baú, região do Quiz). Também é possível descartar alterações e restaurar a aparência anterior.
- **Migração:** personagens da v0.3 são convertidos automaticamente e nenhum progresso é perdido.

### 0.3.0 — 11/11/2026 — A aventura

- **Personagem do jogador:**
  - Aventureiro em SVG por camadas, com 4 estilos, 6 tons de pele, 6 cabelos, 6 cores de cabelo, 4 vestimentas, 6 cores e 5 acessórios.
  - Animações de respiração e caminhada.
  - Obrigatório antes da jornada e editável sem perder progresso.
  - Aparece no mapa, no painel, nas fases, nas cenas e no resultado.
- **Mapa de fases:**
  - Caminho sinuoso por mundo, com cenário desenhado, fases numeradas, estrelas, fase atual em destaque e fases bloqueadas com aviso.
  - O avatar caminha até a nova fase, com animação de desbloqueio.
  - Baús de recompensa finitos, abertura animada dos mundos e navegação entre os 10 mundos.
- **Gênesis em 20 fases** com 5 a 10 perguntas cada: entraram "Noé, um homem justo", "A promessa de Deus" e "Jacó e sua família"; "Moriá" foi unida a "Isaque" e "Os sonhos de Faraó" a "José no Egito". O progresso salvo é migrado.
- **Fases:**
  - Nova tela da fase.
  - Cena narrativa em quadros, com os personagens bíblicos entrando em cena.
  - Novas estrelas: 1 ao concluir, 2 com 70%, 3 com 90%. As fases não têm mais vidas.
  - Resultado com recompensas e os botões "Continuar a jornada" e "Revisar conteúdo".
- **Perguntas:** 19 novas (197 no total), incluindo perguntas com pintura e o novo exercício "Relacione".
- **Biblioteca Bíblica:** 35 personagens, 19 lugares, 66 livros e linha do tempo com 22 marcos e tipo de datação.
- **Revisão inteligente:** histórico de erros, assuntos fracos e dominados, desempenho por livro, evolução e sessões de revisão.
- **Modo Livre:** 10 modalidades (novas: por personagem, por tema e por dificuldade), 4 níveis, escolha da quantidade de perguntas e Especialista com cronômetro.
- **Rankings:** 5 categorias, só com recordes locais reais. O ranking de exemplo foi removido.
- **Conquistas:** 7 novas (26 no total), como Conhecedor das Escrituras, Memória bíblica, Persistência, Desafiante, Tesouro no caminho e Colecionador de histórias.
- Painel inicial redesenhado com o personagem em destaque.
- 93 testes automatizados.

### 0.2.0 — 11/11/2026 — Dois modos de jogo

- **Modo História:**
  - Cânon de 66 livros com mapa por testamento e grupo.
  - Progressão Testamento → Livro → Experiência, começando em Gênesis.
  - Gênesis reorganizado em 19 experiências, 6 delas novas: o homem e a mulher, o Éden, Caim e Abel, a corrupção da humanidade, Babel, Jacó e Esaú.
  - Êxodo com 4 experiências.
  - 7 etapas por experiência (com a nova etapa "Aprendizado").
  - Porcentagens por livro, testamento e jornada; continuar de onde parou; medalhas por livro.
- **Modo Livre:**
  - 7 modalidades, com pistas progressivas em "Quem sou eu?" e cronômetro com bônus de velocidade em "Contra o tempo".
  - 34 novas perguntas de toda a Bíblia.
- **Multiplayer** movido para o Modo Livre, com status de servidor, cronômetro por pergunta, vencedor e ranking da partida (demonstração).
- **Desafio diário:** registro dos desafios, proteção contra relógio retroativo e contrato `DailyService` para validação futura no servidor.
- **Progressão única entre os modos**, com regras contra acúmulo infinito de XP:
  - a repetição só rende pela melhora;
  - limite diário de 300 XP de prática.
- **Painel administrativo:** 8 seções, com editor local de perguntas e de rascunhos de experiências e importação e exportação em JSON.
- **Correções:**
  - O desafio de memória agora tolera um erro por par. O limite antigo (2 erros para 4 pares) reprovava 13% das partidas jogadas com memória perfeita.
  - Ao trocar de modalidade diretamente, a partida anterior não continua mais.
- **Migração automática** do progresso salvo na v0.1, e endereços antigos (`#/mapa`, `#/jornada/...`) redirecionam para o Modo História.
- 7 novas obras em domínio público (Bruegel, Tissot, David Roberts, John Martin). 72 testes automatizados.

### 0.1.0 — 11/11/2026

- Primeira versão jogável: 5 jornadas, 20 capítulos e 113 perguntas em 7 modalidades.
- XP, níveis, estrelas, tentativas, medalhas, 14 conquistas, sequência diária, desafio diário, histórico e desbloqueio progressivo.
- Perfil local com exportação e exclusão de dados; camada de serviços pronta para trocar por Supabase.
- Ranking e multiplayer em modo demonstração; protótipo administrativo somente leitura.
- Acessibilidade: tamanho de texto, alto contraste, redução de animações, leitura em voz alta e atalhos de teclado.
- 22 obras de arte em domínio público, otimizadas em WebP.
- 46 testes automatizados; publicação automática no GitHub Pages via GitHub Actions.

---

© Kzann Tech. Bible Quest é um produto Kzann Tech.
