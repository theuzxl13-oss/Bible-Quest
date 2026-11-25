# Bible Quest — Identidade visual (folha de estilo oficial)

**Versão 1 · 25/11/2026** · complementa o `PLANO_REFORMULACAO_VISUAL_BIBLE_QUEST.md`

> **Natureza deste documento.** É a referência oficial de arte e interface para a reformulação visual. Define padrões, não implementa nada. Nenhum código, modelo, imagem, APK ou configuração foi alterado. A produção de cada item depende de aprovação expressa do dono do projeto.

## 1. Referências oficiais

O dono do projeto enviou duas imagens em 25/11/2026. Elas são **o padrão visual desejado**, não inspirações genéricas. As imagens **não foram publicadas** no repositório: uma traz a marca de outra empresa e a outra é arte de um jogo comercial. Ficam guardadas em privado e descritas abaixo com o detalhe necessário para a produção.

### Referência 1: tela principal (Central do Jogador)

Cena 3D de aventura em plena luz do dia. O que ela mostra:

- **Composição:**
  - cenário em perspectiva, com um caminho de pedras que parte do primeiro plano e leva o olhar a um portal iluminado ao fundo;
  - construções de pedra e madeira dos dois lados;
  - vegetação, flores e barris no primeiro plano;
  - céu azul com nuvens.
- **Interface integrada à cena:**
  - **retrato do jogador** no canto superior esquerdo, com nome, barra de vida e moedas;
  - **pilha de botões grandes** à esquerda, um por modo, cada um com **cor própria**, ícone, título e subtítulo;
  - **placa de madeira** fincada no chão, com opções;
  - **cartões de missão** à direita, em madeira escura com moldura, mostrando o nível atual, a tarefa e o contador;
  - **logotipo** com letras douradas em relevo e faixa azul.
- **Acabamento:**
  - materiais pintados à mão, com textura (pedra, madeira, couro, metal);
  - iluminação solar quente com sombras macias;
  - cores saturadas, mas naturais;
  - contornos e bordas chanfradas na interface;
  - brilho leve nos botões.

**O que adotamos:**
- a qualidade de render e de materiais;
- a luz;
- a interface **dentro** do mundo (placas, cartões de madeira, botões coloridos por modo);
- o retrato com dados do jogador;
- os cartões de missão;
- a profundidade da cena com um caminho que conduz o olhar.

**O que adaptamos:**
- **Cenário:** a Central continua sendo um **acampamento bíblico** (tendas, fogueira, mesa, baú, quadro), e não uma vila ou um castelo. A regra da Etapa 2, "sem cidades nem construções urbanas na Central", continua valendo.
- **Personagem:** em vez da visão em primeira pessoa com espada, fica o **personagem escolhido, em terceira pessoa e sozinho**.
- **Textos:** em português.
- **Indicadores:** sem "vida" nem moedas inventadas; o HUD mostra os dados reais do jogo (nível, XP, estrelas, sequência).
- **Marcas:** nenhum nome, logotipo ou elemento da marca da referência.

### Referência 2: mapa de níveis

Mapa ilustrado em vista aérea inclinada, no estilo cartum pintado. O que ele mostra:

- **Cenário:**
  - **floresta densa** de copas arredondadas;
  - cachoeiras e rios turquesa;
  - penhascos de pedra cinza e de terra;
  - construções-marco (templo, vila, barco no porto);
  - um labirinto de sebe.
  - Tudo com **contorno escuro**, luz vindo do alto à esquerda e sombras pintadas.
- **Caminho:**
  - **trilha de terra clara, orgânica**, que serpenteia entre as árvores e é parcialmente encoberta por elas;
  - **pontos vermelhos** marcando o trajeto entre as fases.
- **Fases:**
  - **estandarte** (bandeira azul com brasão) fincado em uma base;
  - **três estrelas douradas** logo acima;
  - fases distribuídas com espaçamento irregular, acompanhando o terreno.
- **Regiões:**
  - transições naturais (floresta → penhasco → água), **sem faixas retas**;
  - marcos únicos em cada região.

**O que adotamos:**
- o caminho orgânico com marcadores;
- a fase como **marco vertical com estrelas**;
- a densidade de cenário;
- os marcos por região;
- a água e o relevo;
- o contorno e a pintura em tons;
- a vista aérea inclinada.

**O que adaptamos:**
- os marcos são **bíblicos** (jardim do Éden, arca, torre de Babel, tendas de Abraão, Egito, mar Vermelho, Sinai);
- o estandarte e o medalhão são do Bible Quest, numerados;
- cada mundo tem paleta e vegetação próprias (seção 5.6);
- **nenhum desenho é copiado** da referência.

---

## 2. Princípios

1. **Um só universo.** Central, mapas, personagens e telas parecem do mesmo jogo: mesma luz, mesmos materiais, mesma moldura de interface.
2. **A interface pertence ao mundo.** Painéis são madeira, pergaminho, couro e metal envelhecido, e não caixas genéricas.
3. **O jogador é o protagonista.** Só o personagem escolhido aparece na Central e no mapa.
4. **Legível antes de bonito.** O texto nunca fica sobre a arte sem um painel ou uma sombra que garanta o contraste.
5. **Leve por padrão.** Toda arte tem versão alta, leve e 2D, e respeita o orçamento de desempenho (seção 9).
6. **Respeito ao conteúdo bíblico.** A arte ilustra sem caricaturar. Personagens bíblicos não recebem falas inventadas (CLAUDE.md).

---

## 3. Paleta

A paleta parte dos tokens atuais (`src/styles/tokens.css`), que continuam válidos, e ganha cores mais vivas para cena e mapa, conforme as referências. Os valores novos são propostas para aprovação.

### 3.1 Interface (já existentes: manter)

| Papel | Token | Cor |
|---|---|---|
| Madeira escura (painéis) | `--terra-700` / `--terra-800` | #4A2F1C / #2E1E12 |
| Madeira média | `--terra-500` | #7A5234 |
| Pergaminho (leitura) | `--pergaminho` | #F4EAD2 |
| Tinta (texto sobre pergaminho) | `--tinta` | #2B1D10 |
| Marfim (texto sobre madeira) | `--marfim` | #F3EBDA |
| Ouro (molduras, títulos, estrelas) | `--ouro-300` / `--ouro-500` / `--ouro-700` | #E6C77E / #C9A24E / #8C6A2A |
| Ação principal (fogueira) | `--fogueira-300` / `--fogueira-500` | #F2A955 / #E08A2E |
| Foco do teclado | `--foco` | #7FB2E5 |

### 3.2 Cores por modo (botões da Central; novas, inspiradas na Referência 1)

Cada modo tem uma cor própria, usada no botão da Central, no cabeçalho do mapa e nos ícones. O texto é sempre marfim sobre a cor **base** do botão. Contraste conferido: de 4,9:1 (couro) a 6,7:1 (azul). Na fogueira, o texto é tinta (6,1:1).

| Modo | Base (fundo do texto) | Claro (só brilho, nunca sob texto) | Escuro (borda) |
|---|---|---|---|
| Modo História | #2F5378 (azul, `--azul-500`) | #4A78A8 | #13253D |
| Modo Quiz | #3E6B47 (verde, `--floresta-500`) | #5C8F64 | #234A33 |
| Desafio diário | #7A3E8C (púrpura) | #9C5FB0 | #45204F |
| Biblioteca | #8B5A2B (couro) | #B07A45 | #4A2F1C |
| Continuar jornada (principal) | #E08A2E (fogueira) | #F2A955 | #6E3A0E |
| Configurações | #3D5A63 (pedra azulada) | #5B7B85 | #1E3036 |

### 3.3 Cena e mapa

| Elemento | Cores |
|---|---|
| Céu de dia (Central) | #8EC1E8 → #CFE6F5 (horizonte) |
| Luz do sol | #FFE2B0, com sombra azulada #5A6E8C a 35 % |
| Vegetação, Gênesis | #2E7D32, #43A047, #7CB342 (copas), contorno #1B3A1E |
| Água | #1FA3A8 → #7FDCD8 (espuma #E6FFFB) |
| Terra do caminho | #E3C48E (centro), #B8925A (borda) |
| Pedra e penhasco | #8A8F96, #B9BEC4, sombras #4E535A |
| Areia e deserto (Êxodo) | #E8C98A, #C99B5A, #8C5E2E |
| Marcadores do caminho | #9E3326 (vermelho tijolo, 4,2:1 sobre a terra do caminho) com contorno #2B1D10 |

---

## 4. Tipografia

| Uso | Fonte | Regra |
|---|---|---|
| Logotipo e títulos de tela | **Cinzel** 700 | Dourado em relevo (gradiente `--ouro-300` → `--ouro-700`, contorno #3B2414 de 2 px e sombra). Só em títulos curtos. |
| Títulos de painéis e botões | **Cinzel** 600 | Marfim sobre madeira; tamanho mínimo de 18 px |
| Texto da interface | **Inter** 500/600 | Mínimo de 14 px (16 px em botões); nunca em caixa alta corrida com mais de 3 palavras |
| Leitura bíblica e narrativa | **Crimson Pro** 400/600 | Mínimo de 18 px no celular, sempre sobre pergaminho |
| Números (estrelas, XP, fases) | **Inter** 700, algarismos tabulares | Com contorno escuro quando estão sobre arte |

---

## 5. Padrões por área

### 5.1 Central 3D (acampamento bíblico)

- **Cenário:** acampamento em clareira, ao fim da manhã ou em hora dourada suave, cercado por:
  - oliveiras, ciprestes e palmeiras;
  - rochas e flores;
  - montanhas ao fundo.
- O **caminho de terra e pedra** nasce no primeiro plano e segue para o horizonte (composição da Referência 1). Ele simboliza "seguir a jornada" e leva ao botão principal.
- **Objetos interativos** (os mesmos de hoje): **tenda** (personagem e roupas), **mesa de estudos** (Biblioteca), **quadro de missões** (Desafio diário) e **baú** (Recompensas). A **fogueira** é o centro visual.
- **Elementos liberados pelo progresso** (jarros, palmeiras, lanternas, tenda grande, estandarte, poço, ovelhas, jardim): mesmas condições de hoje, com a nova arte.
- **Personagem:** **somente o escolhido pelo jogador**, em pé perto da fogueira, de frente para a câmera, ocupando cerca de 35 a 45 % da altura útil no celular. Fica animado em espera e faz gestos ao tocar nos modos. Nenhum outro personagem humano na cena.
- **Câmera:** fixa, levemente elevada (10 a 15°), em perspectiva com campo de visão de 32 a 38°. Faz um movimento sutil de "respiração" apenas na qualidade alta e sem redução de movimento.
- **Luz:**
  - sol quente vindo de trás e de lado, com contraluz no personagem e sombras macias (só na alta);
  - preenchimento frontal suave, para o rosto ficar sempre legível;
  - **brilho da fogueira** sobre o chão, a tenda e o personagem;
  - névoa em camadas no fundo;
  - luz assada nas texturas dos objetos, para a qualidade leve ter o mesmo clima sem luzes dinâmicas.
- **Materiais:** pintados à mão, com textura (lona listrada, madeira com veios, couro, metal envelhecido, pedra) e bordas chanfradas. Nada de geometria crua sem textura na alta.
- **Interface (HUD) integrada:**
  - **canto superior esquerdo:** retrato do personagem em moldura circular dourada, nome, nível, título e barra de XP;
  - **canto superior direito:** estrelas, sequência de dias e configurações, em "fichas" de madeira com ícone;
  - **esquerda (paisagem) ou faixa inferior (retrato):** **botões de modo** da seção 3.2, com ícone, título e subtítulo de uma linha (por exemplo "Modo História · Fase 3 de Gênesis");
  - **direita:** **painel de missões** em madeira com moldura, recolhível (o atual), com o Desafio diário, Continuar jornada, Baús e Revisão;
  - **rótulos** dos objetos: placas pequenas de madeira com ícone, sobre os objetos, que são botões reais.

### 5.2 Personagens

- **Dois personagens:** **masculino** e **feminino**, com **qualidade equivalente** (critérios C1 a C11 do planejamento da 1.0, aplicados aos dois).
- **Estilo:** 3D estilizado, "de animação", com cabeça cerca de 1/6 da altura, olhos expressivos, mãos bem definidas e textura pintada à mão com luz suave. O mesmo traço da Referência 1 no retrato do jogador.
- **Construção:** mesmo esqueleto, mesmas animações (espera, comemoração, descoberta, aceno) e mesma densidade de detalhe. Corpo-base por gênero, **mais peças separadas** que se encaixam.
- **Personalização real**, em que cada opção mostra e aplica o que o nome diz:

| Categoria | Opções (as de hoje, todas visíveis de verdade) |
|---|---|
| Cabelo | Os 7 do catálogo: Curto, Bem curto, Médio, Longo, Cacheado, Preso e Trança (`curto`, `raspado`, `ondulado`, `longo`, `cacheado`, `coque` e `tranca` nos dados) |
| Cor do cabelo | Paleta atual mais a cor livre |
| Barba (masculino) | Sem barba, Curta, Cheia |
| Rosto | Suave, Sobrancelhas marcantes, Sardas |
| Expressão | Serena, Sorriso, Alegre, Curiosa |
| Pele | 6 tons (os atuais) |
| Roupas | Túnicas, mantos, cintos e sandálias do catálogo atual, com os mesmos desbloqueios |
| Acessórios | Cajado, pergaminho, bolsa, lamparina, lenço e os demais, um por posição (mão, cintura, cabeça, pescoço) |

- **Miniaturas do editor:** são geradas do **mesmo modelo** com a opção aplicada (renderizador compartilhado), enquadradas no rosto ou no corpo conforme a categoria. Elas mostram diferença visível entre as opções.
- **Escolha do personagem:** dois cartões grandes, "Masculino" e "Feminino", com o modelo girando devagar e a mesma iluminação.

### 5.3 Mapas de níveis (História e Quiz: o mesmo padrão)

- **Vista:** aérea inclinada (cerca de 35°), pintada com contorno escuro (#2B1D10, de 2 a 3 px na escala do celular) e luz do alto à esquerda.
- **Caminho:**
  - **trilha orgânica** de terra clara (seção 3.3), com largura de 18 a 26 px no celular e bordas irregulares;
  - parcialmente encoberta por copas e rochas **sem nunca esconder uma fase**;
  - **marcadores** (pontos) a cada 14 a 18 px entre fases: tom tijolo nos trechos liberados e cinza nos bloqueados.
- **Fase (marco):**
  - **estandarte ou medalhão vertical** fincado numa base, com o **número da fase** grande (Inter 700, de 18 a 22 px, contorno escuro);
  - **três estrelas** logo acima, douradas quando conquistadas e com só o contorno quando vazias;
  - **área de toque de no mínimo 48 × 48 px.**

| Estado da fase | Aparência |
|---|---|
| Concluída | Estandarte na cor do mundo, estrelas conquistadas |
| Atual | Estandarte maior (+15 %), brilho dourado pulsante (estático com redução de movimento), **avatar do jogador** ao lado |
| Disponível | Estandarte na cor do mundo, sem brilho |
| Bloqueada | Estandarte acinzentado (`--bloqueado`), **cadeado** sobre o número, marcadores cinza |

- **Baús:** ao lado do caminho, entre fases, nos pontos atuais. São três estados com o mesmo desenho: fechado e bloqueado (cinza, cadeado), pronto (dourado, brilho, salta de leve) e aberto (tampa aberta, vazio).
- **Recompensas:** ao concluir uma fase, as estrelas "voam" até a fase, o próximo trecho de marcadores se acende e o baú seguinte é indicado. Sem animação quando há redução de movimento.
- **Regiões:**
  - transições **naturais** (floresta → rio → penhasco → deserto), **sem faixas retas nem paredões horizontais**;
  - cada região tem **um marco grande** do episódio bíblico e uma **placa de região** de madeira com o nome.
- **Cabeçalho:** placa de madeira com o nome do modo e do mundo, contador de estrelas ("0/72") e botões de voltar e ajuda, nas cores do modo.
- **Rolagem:** vertical, de baixo (fase 1) para cima, como hoje. A tela abre já na fase atual.

### 5.4 Interface geral (História, Quiz, Biblioteca, Perfil, Conquistas)

- **Moldura comum:** paisagem do mundo ao fundo (desfocada ou escurecida em 40 a 55 %), **placa de título** em madeira no topo e conteúdo em **painéis de madeira** (navegação, listas) ou **pergaminho** (leitura, perguntas).
- **Botões:**
  - principal: fogueira com texto em tinta, bordas chanfradas de 2 px, brilho no topo, sombra de 3 px, cantos de 12 px;
  - secundário: madeira com texto marfim;
  - de modo: cores da seção 3.2.
  - Altura mínima de 48 px.
- **Cartões:** madeira escura com moldura dourada fina (1 a 2 px, `--ouro-500`), cantos de 12 a 16 px e ícone à esquerda.
- **Ícones:** os atuais (`GameIcon`), com volume (claro, médio e escuro) e contorno, iguais em todas as telas.
- **Perguntas (História e Quiz):** cartão de pergaminho centralizado; alternativas como botões grandes de madeira clara; acerto com borda verde (`--acerto`) e ícone ✓; erro com borda vermelha (`--erro`) e ícone ✗, **nunca só pela cor**.
- **Biblioteca, Perfil e Conquistas:**
  - mesma moldura;
  - livros "Em preparação" com selo neutro, **sem aparência de concluído** (A11 e A26);
  - Perfil com o retrato do personagem novo.

### 5.5 Fundos das boas-vindas e da identificação (imagens 01 e 02 dos apontamentos)

- Seguem o padrão de paisagem ilustrada no estilo da Central, mais claros e convidativos que a pintura escurecida atual.
- **A decisão final do fundo continua pendente com o dono do projeto.** Este documento só fixa o estilo.

### 5.6 Mundos bíblicos (paleta e marcos de cada um)

| Mundo | Ambiente | Paleta dominante | Marcos |
|---|---|---|---|
| Gênesis | Jardim, rios, montanhas verdes, depois planícies e tendas | Verdes vivos, água turquesa, terra clara | Jardim do Éden (árvore e rios), altar de Abel, arca no monte, torre de Babel, tendas de Abraão, poço, celeiro do Egito |
| Êxodo | Nilo e juncos, deserto, mar, montanha | Ocre, areia, azul profundo, vermelho do pôr do sol | Cesto nos juncos, sarça ardente, pirâmides, mar aberto, coluna de fogo, monte Sinai e tábuas |
| Quiz | Caminho do saber: bosques, bibliotecas e templos de pedra | Verde-oliva, pedra clara, dourado | Biblioteca, pergaminho no pedestal, ampulheta, portal de pedra, obelisco |
| Livros futuros | Mesmo padrão, paleta própria | — | Definidos quando cada livro tiver fases |

---

## 6. Qualidades gráficas

| Recurso | Alta | Leve | 2D |
|---|---|---|---|
| Central | 3D completo, sombras macias, brilho da fogueira, partículas, 60 quadros por segundo | 3D com luz assada, sem sombras dinâmicas, menos vegetação e partículas, 30 quadros por segundo | Ilustração da Central em imagem pintada, com os mesmos botões e rótulos |
| Personagem | Modelo completo, texturas de 1024 px | Mesmo modelo, texturas de 512 px | Desenho 2D do personagem com as mesmas escolhas principais (cabelo, barba, roupas) |
| Mapa | Ilustração e SVG; animações de estrelas e brilho | Ilustração e SVG; sem animações contínuas | Ilustração e SVG (o mapa já é 2D); o alto contraste usa a versão vetorial simplificada |

---

## 7. Acessibilidade (obrigatório em toda arte)

- Contraste de texto ≥ **4,5:1** (≥ 3:1 em títulos de 24 px ou mais e em ícones essenciais).
- Nenhuma informação **só pela cor**: estados de fase têm ícone (cadeado, estrelas, brilho) e nome acessível ("Fase 3, concluída, 2 de 3 estrelas").
- Áreas de toque de **48 × 48 px** no mínimo.
- Foco visível (`--foco`, contorno de 3 px) em todos os controles, inclusive os rótulos sobre a cena 3D.
- **Alto contraste:** desliga as pinturas de fundo, usa as cores sólidas do tema e mantém tudo funcionando.
- **Redução de movimento:** sem câmera em movimento, sem brilho pulsante e sem estrelas voando. Os estados finais aparecem direto.
- Textos com fonte grande do sistema (até 200 %) sem cortes nas telas principais.
- TalkBack: a ordem de leitura segue a ordem visual (HUD → modos → missões; mapa da fase 1 para cima).

---

## 8. O que não fazer

- Copiar personagens, elementos, logotipos ou composições exatas das referências ou de qualquer jogo comercial.
- Cidades, castelos ou construções urbanas na Central.
- Mais de um personagem humano na Central.
- Texto sobre a arte sem painel ou sombra.
- Opções de personalização que não mudam nada visível.
- Faixas retas de terreno ou paredões horizontais nos mapas.
- Inventar indicadores (vida, moedas) que o jogo não tem.
- Atribuir falas aos personagens bíblicos.

---

## 9. Orçamento técnico (Android, inclusive aparelhos modestos)

| Item | Limite |
|---|---|
| Modelo do personagem (corpo + peças) | ≤ 2,5 MB cada gênero; ≤ 25 mil triângulos na alta, ≤ 12 mil na leve |
| Modelos de cenário da Central | ≤ 300 KB cada, ≤ 2,5 MB no total; ≤ 150 chamadas de desenho na alta, ≤ 80 na leve |
| Texturas | Atlas de 1024 px na alta e 512 px na leve; memória de GPU da Central ≤ 120 MB na alta e ≤ 70 MB na leve |
| Ilustração de mapa | WebP ≤ 400 KB por região; carregar só as regiões próximas da tela |
| Pacotes JS | Inicial e 3D sem crescer mais de 10 % |
| Aumento do APK | ≤ 10 MB no total da reformulação |
| Tempos (Moto G75) | Página ≤ 1,0 s; Central 3D pronta ≤ 3,5 s; volta à Central sem tarefa longa > 200 ms |
| Aparelho modesto (2 a 3 GB de RAM) | Central utilizável ≤ 5 s (leve ou 2D); **0 ANR**; rolagem do mapa sem quadros > 50 ms |

---

## 10. Registro de recursos e licenças

- Toda arte nova registra **origem, ferramenta, data e licença**:
  - personagem: `public/models/personagem/LICENCAS.md`;
  - cenário da Central: `public/models/cenario/LICENCAS.md`;
  - mapas: `public/images/mapas/LICENCAS.md`.
- **Permitido:** arte gerada por IA, CC0 e domínio público (autorização de 13/11/2026).
- **Proibido:** imagens ou recursos de jogos comerciais, incluindo as duas referências deste documento.
