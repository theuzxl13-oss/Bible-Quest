# Bible Quest

**Uma jornada pelas Escrituras.** Jogo bíblico educativo, cinematográfico e para todas as idades, desenvolvido pela **Kzann Tech**.

O jogo tem **dois modos** que compartilham a mesma evolução do jogador (XP, níveis, medalhas, conquistas, histórico e sequência diária):

- **Modo História — A grande jornada bíblica:** percorra a Bíblia na ordem dos livros, de Gênesis a Apocalipse.
- **Modo Livre — Desafios bíblicos:** sete modalidades para jogar quando quiser, mais o desafio diário e salas multiplayer (em demonstração).

Links e status:

- **Jogar agora:** https://theuzxl13-oss.github.io/Bible-Quest/
- **Repositório:** https://github.com/theuzxl13-oss/Bible-Quest
- **Status:** versão 0.2 (dois modos de jogo). A publicação é verificada no endereço público a cada versão; veja o histórico no fim deste arquivo.

## Como jogar

### Modo História

A jornada segue a estrutura **Testamento → Livro → Experiência → Desafios → Conclusão**, usando o cânon evangélico de 66 livros.

1. Abra o **mapa da jornada**. Ele mostra os 66 livros, agrupados por testamento e por grupo (Pentateuco, livros históricos, poéticos, profetas, Evangelhos, cartas, profecia).
2. Cada livro aparece com um status: concluído, em andamento, disponível, bloqueado ou em preparação.
3. A jornada **começa em Gênesis**. Cada experiência é um acontecimento ou passagem, não necessariamente um capítulo, e tem 7 etapas:
   1. Introdução: o contexto do acontecimento.
   2. Narrativa: dramatização identificada como tal.
   3. Referências bíblicas: trechos curtos da Almeida 1911 e passagens para ler.
   4. Aprendizado: significado e ensinamentos.
   5. Desafio: até 7 perguntas, com 3 tentativas.
   6. Resultado: acertos, erros e pontuação.
   7. Recompensa: XP, estrelas, medalhas e progresso.
4. Para concluir, é preciso acertar **pelo menos 60%** sem perder as 3 tentativas. Concluir uma experiência libera a seguinte; concluir o livro libera o próximo.
5. **Continuar de onde parou** aparece no painel e no mapa.
6. A conclusão é mostrada em porcentagem por livro, por testamento e para a jornada completa. Livros em preparação contam como 0%.
7. Experiências concluídas podem ser revisitadas sem perder o progresso.

### Modo Livre

Independente da jornada. Escolha uma modalidade:

| Modalidade | Como funciona |
| --- | --- |
| Perguntas aleatórias | 10 perguntas de vários livros, da mais fácil para a mais difícil |
| Verdadeiro ou falso | 10 afirmações, com explicação e referência após cada resposta |
| Complete o versículo | 8 trechos da Almeida 1911 (domínio público) com uma palavra faltando |
| Quem sou eu? | As pistas aparecem uma a uma; cada pista não usada vale +5 pontos |
| Contra o tempo | 60 segundos ou 3 erros; respostas em até 4 s valem +10, em até 8 s valem +5 |
| Ordem dos acontecimentos | 4 sequências para organizar, com explicação ao final de cada uma |
| Identifique o livro | 8 passagens ou acontecimentos de toda a Bíblia |

Também fazem parte do Modo Livre:

- **Desafio diário:** 5 perguntas por dia, iguais para todos os jogadores. A recompensa especial (pontos + 30 XP) vale **uma vez por dia**. A tela mostra os desafios realizados e a sequência de dias.
- **Multiplayer:** salas privadas em **modo demonstração** (veja abaixo).

### Evolução compartilhada e regras contra acúmulo infinito

- O XP do Modo História, do Modo Livre e do diário soma no mesmo nível. Há também medalhas por livro, 19 conquistas, histórico das últimas 50 partidas, estatísticas por modalidade e ranking geral.
- **Primeira conclusão** de uma experiência: pontos + 50 XP de bônus.
- **Repetir uma experiência concluída:** só rende XP se você superar sua melhor pontuação (e apenas a diferença).
- **Limite diário de XP de prática: 300 XP.** Vale para o Modo Livre e para tentativas reprovadas no Modo História. Depois do limite você continua jogando e registrando recordes, sem XP extra.
- **Desafio diário:** a recompensa vale uma vez por dia. Se o relógio do aparelho voltar no tempo, a recompensa fica bloqueada.
- **Pontuação:**
  - Fácil 10, médio 15, difícil 20, e +5 por acerto a partir do 3º seguido.
  - A velocidade só conta no Contra o tempo e no multiplayer.

## Tecnologias

- React 19, TypeScript 7 e Vite 8 (com `@vitejs/plugin-react` 6)
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
    story/                Experiências do Modo História, um arquivo por livro (genesis.ts, exodo.ts)
    questions/            Banco de perguntas por livro + perguntas gerais do Modo Livre
    achievements.ts       Conquistas
    images.ts             Catálogo e créditos das obras
    demoRanking.ts        Ranking de exemplo
  services/
    game/                 Regras puras: progression (desbloqueio e porcentagens), scoring (pontos, XP e limites),
                          engine (aplica partidas ao progresso único), daily (desafio diário e serviço de data),
                          freeModes (modalidades), answers, levels, streak
    storage/              Armazenamento local e repositórios, com migração do progresso da v0.1
    content.ts            Conteúdo criado no painel administrativo (local) e validação
    multiplayer/          Contratos, serviço de demonstração e ponto de troca para Supabase Realtime
    supabase/             Leitura de configuração pública (sem chaves no código)
    auth.ts               Contrato de autenticação e perfil local
  state/GameContext.tsx   Estado global e ações
  components/             Layout, ícones SVG, imagens, QuestionView (7 modalidades), QuizRunner
  pages/
    story/                Mapa da jornada, livro, experiência, desafio
    free/                 Central do Modo Livre, partida por modalidade, multiplayer
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

- **Painel:**
  - Continuar jornada.
  - Entradas grandes para o Modo História e o Modo Livre.
  - Atalhos para desafio diário, ranking, perfil e conquistas.
  - Nível, estatísticas e partidas recentes.
- **Modo História:**
  - Mapa dos 66 livros com status e porcentagens.
  - Página do livro com o caminho das experiências.
  - Páginas de experiência com as 7 etapas e desafio.
  - **Conteúdo:**
    - **Gênesis:** 19 experiências (criação, homem e mulher, Éden, queda, Caim e Abel, corrupção da humanidade, arca, dilúvio, aliança com Noé, Babel, chamado de Abraão, Abraão e Ló, Isaque, Moriá, Jacó e Esaú, e quatro experiências de José).
    - **Êxodo:** 4 experiências.
    - **Outros 64 livros:** aparecem como "em preparação".
- **Modo Livre:**
  - 7 modalidades, cada uma com regras próprias.
  - Recordes por modalidade.
  - Limite diário de XP de prática.
- **Perguntas:** 178 no total, em 7 tipos (incluindo ordenação e memória), todas com resposta, explicação, referência, dificuldade e categoria.
  - 144 estão ligadas a experiências.
  - 34 são de toda a Bíblia (Salmos, Provérbios, Daniel, Jonas, Evangelhos, Atos, cartas, Apocalipse e outros).
- **Desafio diário:**
  - Conjunto determinístico por dia.
  - Recompensa uma vez por dia, com proteção contra o relógio do aparelho voltar no tempo.
  - Registro dos desafios feitos e sequência de dias.
- **Perfil local:**
  - Estatísticas dos dois modos e progresso por livro e testamento.
  - Recordes do Modo Livre e histórico.
  - Exportação e exclusão de dados (LGPD).
- **Migração automática** do progresso salvo na versão 0.1 (capítulos viram experiências; XP, histórico e conquistas são preservados).
- **Painel administrativo** (`#/admin`), com 8 seções:
  - Livros.
  - Experiências: rascunhos locais com editor.
  - Perguntas: criar, editar, excluir, importar e exportar JSON, e usar no Modo Livre deste aparelho.
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
| Ranking | Demonstração: dados de exemplo identificados + sua linha real | Ranking online real |
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

São 72 testes automatizados (Vitest e Testing Library):

- **Conteúdo** (`content.test.ts`):
  - O cânon tem 66 livros (39 + 27), em ordem e com 1.189 capítulos.
  - A jornada começa em Gênesis, que tem 15 ou mais experiências, e a sequência segue a ordem dos livros.
  - Cada experiência tem as 4 partes de leitura e pelo menos 5 perguntas.
  - A narrativa não tem falas citadas.
  - O banco tem 150 ou mais perguntas, sem repetição, todas válidas.
  - O Modo Livre tem perguntas de 10 ou mais livros, e as 7 modalidades têm perguntas suficientes.
  - Todas as imagens existem.
- **Regras** (`rules.test.ts`):
  - Pontuação, XP do Modo História, limite de prática, pontos de "Quem sou eu?" e "Contra o tempo", e níveis.
  - Sequência diária.
  - Progressão a partir de Gênesis: desbloqueio na ordem, livro seguinte, reprovação, porcentagens por livro, testamento e jornada, "continuar", medalhas.
  - Montagem das rodadas do Modo Livre.
  - Desafio diário: uma recompensa por dia e relógio retroativo.
- **Motor** (`engine.test.ts`):
  - O XP é compartilhado entre os modos.
  - Repetir sem melhorar não rende XP.
  - O limite diário de prática funciona e reinicia no dia seguinte.
  - O diário paga uma vez por dia e registra o histórico.
  - Estatísticas do Modo Livre e conquistas.
  - O multiplayer demonstrativo não rende XP.
  - Migração do progresso da v0.1.
- **Serviços** (`services.test.ts`): persistência, dados corrompidos, apelido, multiplayer demonstrativo, Supabase sem chaves, e conteúdo local do painel (validação, salvar e recarregar).
- **Fluxos de tela** (`flow.test.tsx`):
  - Cadastro → painel com os dois modos → mapa → Gênesis → experiência com as 7 etapas → desafio (inclusive memória e ordenação) → XP → próxima experiência.
  - Tentativas, bloqueios por URL e livro em preparação.
  - Modo Livre de ponta a ponta, pistas progressivas e Contra o tempo.
  - Recompensa diária única.
  - Multiplayer demonstrativo.
  - Redirecionamentos da v0.1, ranking e acessibilidade.
  - Criação de pergunta no painel administrativo.
  - Página 404.

Além dos testes automatizados, cada versão é auditada no navegador (Playwright), em celular (Pixel 7) e computador:

- todas as telas;
- duas experiências completas;
- as 7 modalidades;
- diário, inclusive a tentativa de receber a recompensa duas vezes;
- uma partida multiplayer;
- todas as abas do painel administrativo;
- todos os links internos.

Em cada tela são verificados erros de console, imagens quebradas, rolagem lateral e botões sem nome.

## Histórico de atualizações

Este README é atualizado a cada mudança no projeto. A entrada mais recente fica no topo.

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
