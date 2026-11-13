# Bible Quest v0.4 — Auditoria e plano técnico (Etapa 0)

## Auditoria do projeto atual (v0.3)

- **Tecnologia:** React 19, TypeScript 7, Vite 8 e React Router 7 (HashRouter), CSS próprio e Vitest/Testing Library. A publicação é no GitHub Pages via GitHub Actions, com `base: './'`.
- **Navegação:** `src/App.tsx` (rotas), `components/Layout.tsx` (barra superior, barra de abas e rodapé). `RequireProfile` exige perfil e personagem.
- **Persistência:** `services/storage` (localStorage, chaves `bible-quest:v1:*`). Os repositórios `LocalProfileRepository`, `LocalProgressRepository`, `LocalSettingsRepository` e `LocalContentRepository` já fazem migração (v0.1 → v0.2 → v0.3).
- **Personagem:**
  - A configuração fica centralizada em `Profile.character` (`CharacterConfig`): estilo, pele, cabelo, cor do cabelo, vestimenta, cor e acessório.
  - Um único renderizador SVG (`components/Adventurer.tsx`) é usado em todas as telas.
  - **Lacunas:** não há sistema de itens (manto, sandálias e cinto são parte fixa da vestimenta), não há itens desbloqueáveis, guarda-roupa, tela de recompensa de item nem "restaurar aparência".
- **Modo História:** mapa de fases (`components/map`, `services/game/journeyMap.ts`) com 24 fases, baús, estrelas e avatar. Já atende à maior parte da Etapa 3 para este modo.
- **Modo Livre:** 10 modalidades e 4 níveis (`services/game/freeModes.ts`, `pages/free`).
  - **Lacuna:** não tem mapa próprio nem progressão por regiões, e o nome pedido é "Modo Quiz".
- **Já existem:** XP, níveis, estrelas, conquistas, baús, Biblioteca (personagens, livros, lugares, linha do tempo), revisão inteligente, desafio diário, rankings só com dados locais e multiplayer em demonstração.
- **Fluxo de entrada atual:** Início → Apresentação (3 quadros) → Cadastro (apelido, faixa etária e "selo") → Criação do personagem → Mapa.
  - **Lacunas:** a etapa de boas-vindas não segue o texto pedido; escolha da base e personalização estão juntas; não há transição de chegada; o "selo" é um avatar paralelo, o que contraria a regra de consistência.

## Arquitetura planejada

### Personagem como entidade única (requisito central)

- Um novo `CharacterAppearance` em `Profile.character` contém:
  - `id` e `name`;
  - base: pele;
  - cabelo: `hairStyle` e `hairColor`;
  - `equipped`: túnica, manto, calçado, cinto e acessórios.
- Os itens desbloqueados ficam em `Progress.items`, porque dependem do progresso.
- O catálogo de itens fica em `src/data/character/items.ts`. Cada item tem: id, encaixe, nome, descrição, parâmetros visuais (cor, forma) e requisito de desbloqueio (inicial, nível, estrelas, conquista, mundo concluído, região do Quiz, baú, sequência diária).
- **Renderizador único:** `components/character/Character.tsx`, por camadas (corpo → calçado → túnica → cinto → manto → cabeça → cabelo → acessórios). Ele lê a aparência por um **hook único** (`usePlayerCharacter`). As telas não recebem cópias da configuração: passam apenas tamanho, pose e animação (respirar, andar, comemorar, reagir).
- **Migração** automática da configuração da v0.3 para o novo formato.

### Fluxo de entrada (Etapa 1)

`/boas-vindas` (BIBLE QUEST + mensagem + COMEÇAR JORNADA) → `/entrar` (nome e faixa etária) → `/personagem` (etapa 3: escolha da base) → `/personagem/personalizar` (etapa 4, com prévia em corpo inteiro e FINALIZAR PERSONAGEM) → `/chegada` (transição cinematográfica) → `/painel`.

O "selo" deixa de existir na interface.

### Tela principal (Etapa 2)

A tela vira uma cena:

- cenário em SVG e pintura de fundo;
- personagem em pé, grande, em corpo inteiro;
- nome, nível, XP e barra de evolução;
- progresso geral;
- botões Personalizar, Modo História, Modo Quiz, Conquistas, Biblioteca e Estatísticas.

### Mapas (Etapa 3)

- **Modo História:** mantém o mapa atual.
- **Modo Quiz:** novo mapa independente em `/quiz`, com identidade visual própria (trilha de pedras com estandartes e nós em forma de escudo):
  - **4 regiões:** Vale dos Iniciantes, Planície do Saber, Montanhas dos Sábios e Torre dos Especialistas.
  - **Desafios:** cada região tem desafios que combinam modalidade, dificuldade e quantidade. Cada desafio tem introdução, instruções, perguntas, tempo quando aplicável, resultado, XP, estrelas e recompensas.
  - **Progressão própria** (`Progress.quiz`): a região seguinte abre ao concluir a anterior.
  - O treino livre por modalidade continua acessível pelo mapa do Quiz.

### Progressão e evolução visual (Etapa 4)

- **Desbloqueio de itens:** função pura `unlockedItems(progress)` e registro dos novos itens após cada partida, baú ou conquista.
- **Tela de recompensa:** nome, prévia no personagem, motivo, "Equipar" e "Guardar para depois".
- **Guarda-roupa** (`/guarda-roupa`):
  - prévia em corpo inteiro;
  - itens disponíveis e bloqueados, com os requisitos;
  - equipar e retirar;
  - salvar e restaurar a aparência anterior.

### Complementos (Etapa 5)

- **Biblioteca:** abas Acontecimentos e Temas.
- **Revisão:** personagens que precisam de revisão.
- **Estatísticas:** página dedicada `/estatisticas`.
- **Rankings:** categoria Modo Quiz.

### Validação (Etapa 6)

- **Testes unitários:** catálogo de itens, desbloqueios, migração, mapa do Quiz e progressão independente.
- **Testes de fluxo:** entrada completa, guarda-roupa e consistência.
- **Teste de consistência no navegador:** compara o SVG do personagem em todas as telas, inclusive depois de recarregar.
- Build e verificação no GitHub Pages.

## Arquivos

- **Criados:**
  - `data/character/items.ts`;
  - `components/character/Character.tsx`;
  - `state/usePlayerCharacter.ts`;
  - `services/game/items.ts`;
  - `data/quiz/regions.ts`;
  - `services/game/quizMap.ts`;
  - páginas `Welcome`, `CharacterBase`, `CharacterCustomize`, `Arrival`, `Wardrobe`, `QuizMap`, `QuizChallenge`, `Stats`;
  - componente de recompensa de item.
- **Modificados:**
  - tipos;
  - repositórios (migração);
  - `GameContext`;
  - `engine`;
  - `App`, `Layout`;
  - Dashboard (vira a nova Home);
  - Result, StoryMap, Library, Review, Ranking;
  - `Login` (sem selo);
  - testes, README e ROADMAP.
- **Substituídos:** `Adventurer.tsx` passa a ser só um invólucro do novo `Character`; `CharacterCreator.tsx` é dividido em escolha da base e personalização.
