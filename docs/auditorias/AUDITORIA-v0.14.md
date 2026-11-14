# Auditoria da v0.14: central, mapas e redesign de aventura

Data: 14/11/2026. Pedido: redesign completo da experiência (central, mapas, fases, desafios e recompensas) a partir de duas referências visuais. Por decisão do dono do projeto, a implementação foi feita por etapas. Nesta etapa entraram **o mapa completo de Gênesis** e **a trilha inicial do Quiz**, para avaliar os dois estilos antes de expandir.

## 1. O que existia antes desta etapa

| Área | Situação | Arquivos |
| --- | --- | --- |
| Central do acampamento | Cena 3D (Three.js) com o personagem do jogador, tendas, fogueira, baú, mesa e quadro. HUD com dados reais (nível, XP, estrelas, sequência), quadro de missões, botões dos dois modos e menu inferior. Funciona e está aprovada. | `pages/Dashboard.tsx`, `components/camp/`, `character3d/acampamento.ts` |
| Mapa do Modo História | Trilha clara e colorida (v0.13): caminho listrado, botões redondos e ilhas de grama. De cima para baixo, sem cabeçalho, ao tocar ia direto para a tela da fase. | `components/map/JourneyMap.tsx`, `Prado.tsx` |
| Mapa do Modo Quiz | O mesmo estilo do História, com as 4 regiões empilhadas. | `pages/quiz/QuizMap.tsx` |
| Apresentação da fase | Página separada (`/historia/:livro/:fase`) com pintura, introdução e personagens. No Quiz, introdução dentro da página do desafio. | `pages/story/ExperiencePage.tsx`, `pages/quiz/QuizChallenge.tsx` |
| Perguntas | Tema de madeira escura (v0.9.3/v0.11), com progresso, sequência de acertos, pontos e personagem que reage. | `components/quiz/QuizRunner.tsx`, `QuestionView.tsx` |
| Resultado | Estrelas, XP, acertos, itens e próxima fase. | `pages/Result.tsx` |

## 2. Progressão (conferida no código)

- **Modo História:** `services/game/progression.ts` e `journeyMap.ts`. Libera uma fase por vez e abre um baú a cada 5 fases e no fim do mundo.
- **Modo Quiz:** `services/game/quizMap.ts`. Tem 4 regiões de 6 desafios. A região seguinte abre quando a anterior é concluída.
- **O que os dois modos compartilham:** XP, nível, conquistas, itens e histórico (`services/game/engine.ts`). **Os desbloqueios de fase não são compartilhados.** Há teste novo garantindo isso.
- **Aparência do personagem:** uma fonte única, `usePlayerCharacter`. Uma mudança no guarda-roupa aparece em todas as telas (teste existente).

## 3. Reaproveitado

- **Regras de progresso, baús, estrelas e pontuação:** nada mudou nas regras.
- **Componentes:** `PlayerCharacter` (avatar no caminho), `ChestIcon`, `GameIcon` (ícones ilustrados), `ArtImage` (pinturas de domínio público na apresentação) e `roundRules` (regras do desafio).
- **Rotas:** todas continuam, inclusive `/historia/:livro/:fase` (agora "Personagens e lugares da fase") e `/quiz/desafio/:id`.

## 4. Problemas de consistência encontrados

1. As telas de pergunta e de resultado seguem o tema escuro de madeira, enquanto os mapas novos são claros e ilustrados. **Fica para as etapas 5 e 6.**
2. A apresentação da fase existia em dois lugares (página da fase e introdução do desafio). Agora a apresentação abre no mapa. As páginas antigas continuam funcionando, sem repetir passos: "Começar desafio" no mapa já inicia a partida.
3. O mapa anterior era de cima para baixo. As referências sobem a partir da fase 1, e o novo mapa segue as referências.
4. Gênesis tem 20 fases, e o pedido lista 12 acontecimentos. As 20 fases foram mantidas (o pedido permite dividir) e agrupadas em 8 regiões ilustradas que seguem os 12 acontecimentos.
5. Restam regras de CSS do mapa antigo (`.map-*`) que outras telas ainda usam (`map-toast`, `map-hero`). Os arquivos da v0.13 sem uso foram removidos.

## 5. O que foi feito nesta etapa

### Mapa do Modo História (Gênesis completo)

- **Cenário 2D em camadas:**
  - terreno pintado por região, com manchas de textura;
  - paredões de pedra entre as regiões, com escada onde o caminho passa;
  - lagos com cachoeira e caminho de terra e pedras;
  - céu e montanhas no topo.
- **Regiões de Gênesis e seus elementos:**
  - A criação: árvores com frutos, flores e lago;
  - O jardim do Éden: cachoeira e árvores frutíferas;
  - Caim e Abel: altar com fumaça, ovelhas e trigo;
  - Noé e o dilúvio: arca, arco-íris, pomba e cachoeira;
  - A torre de Babel: zigurate, ruínas e casa de pedra;
  - Abraão: tendas, camelo, altar e oliveira;
  - Isaque e Jacó: poço, pilar de Betel e ovelhas;
  - José no Egito: pirâmide, celeiro, palmeiras e lago.
- **Êxodo:** usa um cenário genérico de deserto até ganhar cenário próprio.
- **Fases em medalhão:**
  - concluídas em ouro;
  - a atual dourada, com raios girando e pulsação;
  - bloqueadas em prata com cadeado;
  - três estrelas numa plaquinha embaixo.
- **Cabeçalho:**
  - faixa de pergaminho com "Modo História / Explore as Escrituras";
  - botão de voltar ao acampamento e botão de ajuda;
  - placa com o mundo visível e as fases concluídas nele;
  - total de estrelas e baús prontos (o botão leva até o baú).
- **Janela de apresentação** ao tocar numa fase:
  - número, nome, pintura e descrição;
  - objetivo, referência bíblica, dificuldade, recompensa e estrelas anteriores;
  - botão "Começar fase";
  - fase bloqueada: mostra o requisito e não tem o botão.

### Trilha do Modo Quiz

- **Cenário próprio:**
  - caminho de lajes de pedra;
  - pergaminhos em pedestal, pilhas de livros, ampulheta, pedras com inscrição e obelisco;
  - biblioteca antiga, templo, portal e braseiros com chama.
- **Seletor de dificuldade:** Iniciante, Intermediário, Avançado e Especialista, uma região por vez. Uma região bloqueada mostra o requisito.
- **Medalhões:** levam o ícone do tipo de desafio. O atual fica em turquesa, como na referência.
- **Janela de apresentação:** tipo, dificuldade, número de perguntas e tempo, objetivo, recompensa e estrelas.
- **Atalhos embaixo:** desafio por tempo, por tema, avançado e perguntas aleatórias, que levam ao treino livre.

## 6. Testes

- 139 testes passam: os 132 anteriores, sendo dois fluxos ajustados ao mapa novo, e 7 novos em `src/test/mapas.test.tsx`.
- **O que os testes novos cobrem:**
  - as regiões cobrem as 20 fases sem buracos;
  - cabeçalho e placa com dados reais;
  - a ajuda abre;
  - a troca de dificuldade e o bloqueio de região funcionam;
  - os atalhos levam ao treino livre;
  - concluir um desafio do Quiz não libera fases do História.
- **Conferido no navegador** (Chromium, celular de 390 px e computador de 1280 px):
  - os dois mapas e as duas janelas;
  - o início direto do desafio;
  - o retorno à central.

## 7. Limitações e próximas etapas

- **Etapas 5 e 6: feitas na v0.15.0.** As perguntas e o resultado passaram para o visual de aventura, com a paisagem da região da fase. O resultado tem faixa de vitória, personagem comemorando, moeda de XP, baú e confete.
- **Êxodo e os mundos seguintes:** recebem cenário próprio quando tiverem fases.
- **Cenário:** é desenhado em código (SVG), sem pinturas. É leve e nítido, mas menos detalhado que a referência pintada.
