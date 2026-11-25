# Bible Quest — Plano de reformulação visual

**Auditoria técnica e planejamento** · versão 2 (25/11/2026: referências oficiais e decisões incorporadas) · branch `claude/bible-quest-android` (base: 0.17.9)

**Folha de estilo oficial:** [`IDENTIDADE_VISUAL_BIBLE_QUEST.md`](IDENTIDADE_VISUAL_BIBLE_QUEST.md). Em caso de dúvida de arte, ela prevalece.

> **Natureza deste documento.** Esta etapa é **só de auditoria e planejamento**. Nada foi alterado no código, no APK, nas configurações do Android, nas funcionalidades, no progresso, nas perguntas, nas recompensas ou nas fases. Nenhuma implementação começa sem autorização expressa do dono do projeto.

## 0. Referências usadas

- `docs/relatorios/APONTAMENTOS_VISUAIS_2026-11-25.md`: imagens 01 a 10, com os comentários do dono do projeto.
- **Duas referências oficiais** enviadas pelo dono do projeto em 25/11/2026. Elas são **o padrão visual desejado**, e não inspirações genéricas, e estão descritas em detalhe na seção 1 da folha de estilo. Não foram publicadas no repositório, por direitos de terceiros.
  - **Referência 1 (Central):** cena 3D de aventura em luz do dia, com materiais pintados à mão e interface integrada ao mundo (retrato do jogador, botões grandes coloridos por modo, placa de madeira, cartões de missão).
  - **Referência 2 (mapa):** mapa ilustrado em vista aérea inclinada, com caminho orgânico marcado por pontos, fases como estandartes com três estrelas, floresta densa, água, penhascos e marcos.
- Decisões aprovadas da versão 1.0 (`docs/planos/VERSAO_1_0_DIRETRIZES.md`), especialmente:
  - A2: preservar a Central 3D;
  - A3 e A28: dois personagens com o mesmo padrão, e personagem feminina obrigatória para a 1.0;
  - A4 e A5: manter a personalização e a progressão;
  - A14: melhorias visuais de Perfil, Quiz e História podiam ficar para depois da 1.0;
  - A27: não alterar o código nesta fase.
- Plano anterior do editor modular (`docs/planos/EDITOR-3D-PLANO.md`) e relatórios da Etapa 2 (Central, auditoria visual e base comum).
- Teste físico no Moto G75 5G (`docs/relatorios/ANDROID_TESTE_FISICO_MOTO_G75.md`).

---

## 1. Resumo executivo

| Pergunta | Resposta curta |
|---|---|
| Precisa trocar de tecnologia? | **Não.** React + Three.js + SVG atende à direção pedida e já funciona no Android sem ANR. O problema é de **arte e de recursos gráficos**, não de motor. |
| O que mais limita a qualidade hoje? | 1) O **personagem masculino estilizado é uma peça única**: cabelo, barba e rosto não trocam, só mudam de cor (imagens 04 a 06). 2) A **personagem feminina usa outro modelo e outro estilo** (v0.7, MakeHuman), de qualidade inferior e 2,7 vezes mais pesado. 3) Os **mapas são desenhados em formas simples de SVG**, em faixas retas (imagem 09). |
| O que preservar? | Toda a lógica de jogo e os dados salvos, a cena da Central e sua estrutura, o renderizador compartilhado de miniaturas, a qualidade adaptativa (alta, leve, 2D), os botões acessíveis sobre a cena e o mapa, os tokens de cor, o alto contraste e o carregamento sob demanda do 3D. |
| O que reconstruir visualmente? | Os modelos dos dois personagens (modulares e no mesmo estilo), a arte dos mapas da História e do Quiz, a iluminação e o acabamento da Central, e a identidade das telas internas. Também sai o que o dono pediu para retirar: a tela de chegada e a abertura do mundo. |
| Maior risco | **Dados salvos dos personagens:** reduzir de 8 bases para 2 exige uma migração da aparência, com testes. **Segundo risco:** aparelhos de entrada, porque modelos e texturas novos precisam caber no orçamento de memória. |
| Primeiras entregas | **Personagens** (masculino e feminino), **protótipo do mapa de Gênesis** e **nova Central**, nesta ordem de produção, com o plano técnico detalhado na seção 9. |

---

## 2. Auditoria técnica

### 2.1 Tecnologias em uso

| Camada | Tecnologia | Observação |
|---|---|---|
| Interface | React 19, React Router 7, TypeScript, Vite 8 | Telas em `src/pages/`, componentes em `src/components/` |
| 3D | Three.js 0.187 (WebGL) | Carregado **sob demanda** (`runtime.ts`, pacote separado de cerca de 780 KB), fora do pacote inicial (cerca de 740 KB) |
| Modelos | GLB com compressão meshopt | `public/models/personagem/`, com 6,8 MB no total |
| Mapas e cenários 2D | SVG desenhado em código (React) | `src/components/map/aventura/`, sem arquivos de imagem |
| Pinturas de fundo | WebP de obras em domínio público | `public/images/art/` (58 arquivos, 5,4 MB) |
| Estilos | CSS com tokens (`tokens.css`), ponte de compatibilidade, ambientes por tela e alto contraste | Cerca de 2.900 linhas de CSS |
| Android | Capacitor 8 (WebView do sistema) | Mesma base do site, com o modo `android` no Vite |
| Dados salvos | `localStorage`, com o prefixo `bible-quest:v1:`, por meio de repositórios | As telas não acessam o armazenamento diretamente |
| Testes | Vitest e Testing Library | 21 arquivos, 221 testes |

### 2.2 Central do Jogador (acampamento)

- **Arquivos:**
  - `src/pages/Dashboard.tsx`: HUD, missões e ações;
  - `src/components/camp/CenaAcampamento.tsx`: ponte entre o React e o 3D;
  - `src/character3d/acampamento.ts` (1.296 linhas): a cena inteira;
  - `src/styles/telas/acampamento.css`.
- **Como é feita:** tudo é geometria e textura **geradas em código**: céu, nuvens, cordilheiras com névoa, florestas, rochas, caminho, tendas, fogueira, baú, quadro, mesa e os elementos liberados pelo progresso. Não há arquivo de cenário para baixar.
  - A luz é de fim de tarde: sol direcional, um preenchimento frontal e uma luz hemisférica.
  - Sombras só na qualidade **alta** (mapa de 1024 px).
  - Na qualidade **leve**: sem textura procedural, 30 quadros por segundo e menos partículas.
  - A animação para quando a cena não está visível.
- **Personagem:** **somente o personagem do jogador** aparece na Central. É o mesmo modelo do criador (`montar`). **Isso já atende à direção** "mostrar somente o personagem selecionado" e deve ser preservado.
- **Acessibilidade:** os alvos (tenda, mesa, quadro, baú) são **botões HTML posicionados sobre os objetos 3D**. Funcionam por teclado e leitor de tela, e tocar no objeto 3D tem o mesmo efeito. É um padrão bom, a manter.
- **Limites visuais atuais:**
  - os objetos são formas geométricas simples (caixas, cilindros, cones);
  - não há iluminação "cinematográfica": sem brilho da fogueira no cenário, sem contraluz e sem profundidade de atmosfera além da névoa;
  - a vegetação é de baixa variedade.
- **Desempenho medido (Moto G75 5G):**
  - acampamento pronto em cerca de 3,0 s desde o início do processo;
  - ao voltar para a Central, a cena é **recriada inteira**, o que custa uma tarefa longa de 0,4 a 0,9 s (problema P2 do teste físico).

### 2.3 Personagens 3D

| Item | Masculino | Feminino |
|---|---|---|
| Arquivo | `heroi-masculino.glb`, 1,8 MB | `heroi-feminino.glb`, 4,8 MB |
| Origem | v0.8: imagem gerada por IA, malha pelo TRELLIS.2, esqueleto e animações pelos scripts do projeto | v0.7: malha humana MakeHuman (CC0), roupas simuladas no Blender |
| Estilo | Estilizado, "de animação" | Semirrealista: **estilo diferente** do masculino |
| Estrutura | **Peça única** (corpo, cabelo e roupa juntos). A aparência só troca **cores** por região (`soCores`, `tingirRegiao` em `heroi.ts`) | **Modular**: peças separadas no mesmo esqueleto (7 cabelos, túnicas, mantos, cintos, calçados, acessórios) |
| Rosto e expressão | Expressões por *morph targets* | Expressões por *morph targets* |

- **Descoberta principal (imagens 04, 05 e 06):** no masculino, as opções de cabelo (7), barba (3) e rosto (3) **não podem aparecer**, porque o modelo não tem peças separadas. As miniaturas saem iguais porque o modelo é o mesmo, só com cores diferentes. **Não é falha de tela: é limitação do modelo.**
- **Bases:** há 8 bases (`src/data/character/bases.ts`): Viajante, Pastora, Escriba, Exploradora, Mensageiro, Guardiã, Peregrino e Contadora. Elas são **apenas predefinições** de pele, cabelo e roupa sobre os **dois corpos** (masculino e feminino).
- **Existe base para a solução:** `tools/personagem/estilizado/corpos-base/` já tem corpos-base masculino e feminino **no mesmo estilo**, gerados em 14/11/2026 com esqueleto e animações, mas **ainda não usados no jogo**. O plano do editor modular (`EDITOR-3D-PLANO.md`) já previa:
  - `pecas.ts`, catálogo das peças;
  - `montagem.ts`, encaixe no esqueleto;
  - `cores.ts`, troca de cor ao vivo.
- **Miniaturas:** são geradas por um **renderizador compartilhado** (`snapshot` em `runtime.ts`), o que evita abrir dezenas de contextos WebGL. É bom e deve ser mantido.
- **Reserva:** se o GLB falhar, entra o modelo procedural (`rig.ts` e afins). Na qualidade 2D, entra o desenho em SVG (`Character2D.tsx`).

### 2.4 Mapas de níveis (História e Quiz)

- **Arquivos:**
  - `src/components/map/JourneyMap.tsx`: mapa da História, por mundo;
  - `src/pages/quiz/QuizMap.tsx`;
  - `src/components/map/aventura/Cena.tsx`: terreno, desníveis, lagos e caminho;
  - `src/components/map/aventura/Elementos.tsx`: árvores, arca, torre, sarça e outros 40 elementos;
  - `src/components/map/aventura/Interface.tsx`: cabeçalho, medalhões e contador de estrelas;
  - `src/data/mapas/cenarios.ts`: zonas por mundo.
- **Como é feito:** é SVG **determinístico** (mesma semente, mesmo mapa).
  - A largura é fixa em 400 unidades.
  - O caminho segue uma senoide (`sin(i × 0,95) × 108`), com um passo de 104 unidades entre fases.
  - O terreno é dividido em **faixas horizontais retas**, com "paredões" de pedra entre regiões. Isso dá o aspecto **"quadrado"** apontado na imagem 09.
- **Lógica separada do desenho:**
  - estado de cada fase (bloqueada, disponível, concluída, estrelas), baús, posição do avatar e seções por mundo: `src/services/game/journeyMap.ts` e `quizMap.ts`;
  - fases e baús são **botões de verdade** sobre o desenho;
  - **isso permite trocar toda a arte sem tocar em progressão, estrelas, bloqueios ou recompensas.**
- **Abertura do mundo (imagem 08):** é um diálogo modal dentro de `StoryMap.tsx`, que aparece uma vez por mundo e usa `progress.worldsSeen`. Pode ser retirado da tela. O campo salvo deve **continuar existindo**, para não invalidar perfis antigos.

### 2.5 Entrada (onboarding)

- O fluxo atual é: boas-vindas → identificação → personagem (8 bases) → personalização → **chegada** (`/chegada`, `Arrival.tsx`, o personagem caminha e acena; imagem 07) → Central.
- Retirar a chegada significa: a personalização passa a levar direto para a Central (`Wardrobe.tsx` hoje navega para `/chegada`), e a rota `/chegada` passa a redirecionar para `/painel`, para não quebrar links antigos.

### 2.6 Telas internas (Biblioteca, Perfil, Conquistas, História, Quiz)

- Elas já compartilham:
  - **tokens** (`tokens.css`);
  - **componentes-base** (`src/components/base/index.tsx`, com botão, cartão, painel, janela e abas);
  - **ambientes** por tela (`data-ambiente`);
  - **alto contraste unificado** (passos 1.1 a 1.7 da Etapa 2).
- Somente Conquistas recebeu o visual novo do passo 1.7 (0.17.8). As demais ainda misturam estilos antigos por meio da `ponte.css`.
- Há uma moldura de "aventura" pronta (`PaginaAventura.tsx`: paisagem, placa de pergaminho e painéis) que pode ser a base comum.

### 2.7 Desempenho no Android e aparelhos de entrada

| Recurso | Hoje | Orçamento proposto para a reformulação |
|---|---|---|
| Pacote inicial (JS) | ~740 KB | Não crescer mais de 10 % |
| Pacote 3D (sob demanda) | ~780 KB | Não crescer mais de 10 % |
| Modelo do personagem | 1,8 MB (M) · 4,8 MB (F) | **≤ 2,5 MB cada**, com as peças, no mesmo estilo |
| Triângulos do personagem | variável | **≤ 25 mil** (alta) e ≤ 12 mil (leve) |
| Texturas do personagem | WebP/PNG embutidas | Atlas de **1024 px** (alta) e 512 px (leve) |
| Cena da Central | geometria gerada | **≤ 150 chamadas de desenho** (alta), ≤ 80 (leve), memória de GPU ≤ 120 MB |
| Arte de um mapa | SVG em código | Fundo ilustrado em WebP de **≤ 400 KB por região**, carregado por trecho visível |
| Abertura a frio (Moto G75) | página em 0,7 s · 3D em 3,0 s | Não piorar. Em aparelho de entrada: Central utilizável (2D ou leve) em ≤ 5 s, **sem ANR** |

- **Compatibilidade:**
  - a qualidade **2D** continua obrigatória, para aparelhos sem WebGL e para quem escolher;
  - a **leve** é automática com 4 núcleos ou menos, ou 3 GB de memória ou menos;
  - toda arte nova precisa de versão 2D e de versão leve.

### 2.8 Riscos para o progresso e os dados salvos

| Dado | Onde | Risco na reformulação | Proteção |
|---|---|---|---|
| Aparência (`CharacterAppearance` v2: `base`, `body`, `hairStyle`, `beard`, `face`, `expressao`, `equipped`, `cores`) | `Profile.character` | Passar de 8 bases para 2 e mudar o modelo | **Migração v2 → v3** que preserva corpo, roupas equipadas, cores, cabelo e barba. As bases antigas viram "masculino" ou "feminino" conforme o `body`. Testes com perfis de cada base. |
| Itens desbloqueados e baús | `Progress` | Trocar a arte não pode tocar nas regras | Nenhum arquivo de `services/game/` muda nas entregas visuais |
| Estrelas, fases e Quiz | `Progress.experiences`, mapa do Quiz | A arte nova do mapa pode errar a ordem ou o estado | O mapa novo consome as **mesmas funções** (`phaseState`, `quizNodeState`); teste comparando o estado de cada nó antes e depois |
| `worldsSeen` | `Progress` | Retirar a abertura do mundo | O campo continua sendo lido e gravado, só deixa de abrir o diálogo |
| Configurações (`graphics`, `reduceMotion`, `contraste`) | `Settings` | Novos efeitos podem ignorar a escolha do jogador | Todos os efeitos novos respeitam a qualidade e a redução de movimento |
| Prefixo `bible-quest:v1:` | `localStorage` | — | Não mudar. A migração é por versão do objeto, não por chave |

---

## 3. Arquitetura visual proposta

### 3.1 Direção de arte

> **Atualização (versão 2):** a direção de arte agora segue as duas referências oficiais e está fixada na folha de estilo (`IDENTIDADE_VISUAL_BIBLE_QUEST.md`). Em resumo:
> - **paleta:** tokens atuais, mais cores por modo e cores de cena e mapa (seção 3 da folha);
> - **materiais:** pintados à mão, com textura e bordas chanfradas;
> - **luz:** sol quente com contraluz e brilho da fogueira, assada na qualidade leve;
> - **ambientação:** acampamento bíblico em clareira, com um caminho que conduz o olhar;
> - **personagens:** estilizados, com qualidade equivalente e peças reais;
> - **mapas:** vista aérea inclinada, caminho orgânico com marcadores e estandartes com estrelas;
> - **interface:** dentro do mundo (retrato, botões de modo, placas e cartões de madeira).
>
> O texto abaixo continua válido onde não contradiz a folha.

- **Gênero:** RPG de aventura bíblica, **ilustrado, quente e imersivo**, com o mesmo estilo nos personagens, nos cenários e na interface.
- **Personagens:** estilizados, "de animação", com proporções levemente heroicas. Masculino e feminino com **a mesma** malha-base, esqueleto, acabamento de textura, número de peças e expressões.
- **Cenários 3D (Central):** hora dourada, com contraluz do sol baixo, brilho quente da fogueira sobre a tenda e o personagem, névoa em camadas e silhuetas de montanhas. Vegetação variada e objetos com bordas chanfradas e materiais pintados, em vez de geometria crua.
- **Mapas 2D:** paisagem **ilustrada contínua** (sem faixas retas), com:
  - um **caminho largo e sinuoso**, de bordas arredondadas e com sombra;
  - fases como **"pedras" ou medalhões com volume**, numerados, com 3 estrelas logo abaixo, cadeado quando bloqueadas e brilho na fase atual;
  - baús ao longo do caminho;
  - o avatar do jogador sobre a fase atual;
  - marcos bíblicos de cada região (jardim, arca, torre, tendas de Abraão, Egito, mar, Sinai).
- Inspiração **de design** (formas, profundidade, riqueza de cenário) na referência da imagem 10, **sem copiar** personagens, elementos ou a arte do jogo citado.
- **Interface comum:** pergaminho, madeira e metal envelhecido, com a tipografia atual (Cinzel nos títulos, Crimson Pro na leitura, Inter na interface) e a paleta dos tokens. Os mesmos componentes servem a História, Quiz, Biblioteca, Perfil e Conquistas.

### 3.2 Camadas técnicas (sem trocar tecnologia)

| Camada | Tecnologia | O que muda |
|---|---|---|
| Central 3D | Three.js (mesmo `acampamento.ts`, dividido em módulos) | Objetos de cenário passam a ser **modelos GLB leves** (tenda, fogueira, baú, mesa e quadro), com texturas em atlas e iluminação "assada" nas texturas. A cena é **mantida viva** entre idas e voltas à Central (corrige o P2). Efeitos só na alta: brilho da fogueira por *sprites*, sem pós-processamento pesado. |
| Personagem | Three.js + GLB modular | Corpo-base estilizado por gênero, mais **peças separadas** no mesmo esqueleto: cabelos, barbas, túnicas, mantos, cintos, calçados e acessórios. A troca de cor continua pelo shader de região. Rosto e expressão por *morph targets*. |
| Mapas | **SVG + fundo ilustrado em WebP** | O caminho, as fases, as estrelas, os cadeados, os baús e o avatar continuam vetoriais e acessíveis. O terreno passa a ser uma **ilustração pintada** por região, carregada por trecho visível. Há uma versão vetorial simplificada como reserva (2D, alto contraste ou falha de rede no site). |
| Interface | React + CSS com tokens | Os componentes-base ganham a "pele" de aventura. A `ponte.css` vai sendo esvaziada tela a tela. |

### 3.3 Por que não trocar de tecnologia

| Alternativa | Por que não agora |
|---|---|
| Unity, Godot ou outro motor | Reescreveria o jogo inteiro (telas, lógica, acessibilidade e site). Os APKs ficariam maiores, a versão web seria perdida ou ficaria pesada, e os testes atuais deixariam de valer. O ganho visual vem da **arte**, que pode ser produzida para o Three.js do mesmo jeito. |
| PixiJS ou canvas para os mapas | Perderia os botões acessíveis reais e o alto contraste nativo do SVG e do HTML. O fundo em WebP sob o SVG já dá a riqueza de ilustração. |
| Pós-processamento pesado (bloom, SSAO) | Custo alto em GPU de entrada. O efeito "cinematográfico" vem de luz assada, contraluz e *sprites* de brilho. |

### 3.4 Recursos gráficos e licenças

- **Permitidos** (CLAUDE.md, autorização de 13/11/2026):
  - imagens e modelos **gerados por IA**;
  - recursos **CC0**;
  - pinturas em domínio público do Wikimedia Commons.
- **Registro obrigatório** de origem, ferramenta, data e licença de cada arquivo:
  - personagem: `public/models/personagem/LICENCAS.md`;
  - pinturas: `src/data/images.ts`;
  - cenário e mapas: um novo `public/images/mapas/LICENCAS.md`, no mesmo formato.
- **Ferramentas já usadas no projeto:**
  - imagens de referência pelo gerador do Canva;
  - malhas pelo TRELLIS.2 (MIT);
  - esqueleto, peças e animações pelos scripts Blender de `tools/personagem/`.
- **Nenhuma** imagem de jogo comercial entra no repositório.

---

## 4. Plano por entregas

### Entrega 1 — Central do Jogador

| Item | Conteúdo |
|---|---|
| **Estado atual** | Acampamento 3D gerado em código, que **mostra só o personagem do jogador**. HUD, missões e ações reais. A cena é recriada a cada volta (0,4 a 0,9 s). Objetos geométricos simples e luz plana. |
| **Resultado esperado** | Acampamento de aventura com acabamento de RPG: tenda, fogueira, baú, quadro de missões e mesa como modelos ilustrados; luz de hora dourada com contraluz e brilho da fogueira; atmosfera em camadas; o personagem novo em destaque e **sozinho**. A volta à Central é instantânea. |
| **Arquivos envolvidos** | `src/character3d/acampamento.ts` (dividir em `cenario/` com céu, terreno, objetos e luz); `src/components/camp/CenaAcampamento.tsx`; `src/pages/Dashboard.tsx` (HUD sem mudança de dados); `src/styles/telas/acampamento.css`; `public/models/cenario/*.glb` (novo) |
| **Estratégia** | 1) Separar a cena em módulos sem mudança visual (refatoração testada). 2) Manter a cena viva fora da Central, pausada e sem desenhar, para corrigir o P2. 3) Trocar objeto por objeto pelo GLB novo, mantendo os mesmos alvos clicáveis e os rótulos HTML. 4) Nova luz e atmosfera, por qualidade. |
| **Recursos gráficos** | 5 a 8 modelos GLB de cenário (≤ 300 KB cada), um atlas de texturas de 1024 px e *sprites* de brilho e fumaça. |
| **Riscos** | Memória em aparelhos de entrada; os elementos liberados pelo progresso (jarros, palmeiras, lanternas e outros) precisam continuar aparecendo nas mesmas condições; reintroduzir o ANR. |
| **Testes** | `acampamento.test.ts` e testes de elementos liberados (sem mudança de regra); medição no Moto G75 e em um aparelho de entrada com o APK de diagnóstico (bloqueios, ANR, tempo até o 3D pronto); leitor de tela e teclado nos alvos; alto contraste; redução de movimento; qualidade 2D. |
| **Critérios de aprovação** | 0 ANR; 3D pronto em ≤ 3,5 s no Moto G75; volta à Central sem tarefa longa acima de 200 ms; mesmas ações e destinos; todos os alvos com nome acessível; aprovação visual do dono do projeto por capturas no celular e no computador. |

### Entrega 2 — Mapa de níveis (História e Quiz)

| Item | Conteúdo |
|---|---|
| **Estado atual** | SVG em código, terreno em **faixas retas** com paredões e caminho fino; fases como botões cinza com cadeado; abertura de mundo em diálogo (imagem 08). |
| **Resultado esperado** | Mapa **ilustrado e contínuo**, com caminho largo e sinuoso, fases numeradas com volume, 3 estrelas, cadeados, baús, avatar na fase atual e marcos bíblicos por região. **O mesmo design no Modo História e no Modo Quiz**, cada um com os seus cenários. Sem a tela de abertura do mundo. |
| **Arquivos envolvidos** | `src/components/map/JourneyMap.tsx`, `src/pages/story/StoryMap.tsx` (retirar o diálogo de abertura), `src/pages/quiz/QuizMap.tsx`, `src/components/map/aventura/{Cena,Elementos,Interface,CenarioFundo}.tsx`, `src/data/mapas/cenarios.ts`, `public/images/mapas/` (novo), CSS do mapa. **Sem mudança** em `services/game/journeyMap.ts` e `quizMap.ts`. |
| **Estratégia** | 1) Criar um componente de mapa **comum** às duas telas, que recebe os nós e os estados já calculados. 2) Novo traçado do caminho, com curvas largas e variação de amplitude, e regiões sem limites retos. 3) Fundo ilustrado por região em WebP, sob o SVG, carregado por trecho visível, com reserva vetorial. 4) Novo medalhão de fase (número, volume, estrelas, cadeado, brilho). 5) Retirar o diálogo de abertura do mundo (o campo `worldsSeen` continua). |
| **Recursos gráficos** | Ilustrações por região: Gênesis em 4 a 5 regiões, Êxodo em 3 a 4 e o Quiz em 4 a 5, com ≤ 400 KB cada; medalhões e baús em SVG. |
| **Riscos** | Errar o estado de algum nó; rolagem pesada em aparelho de entrada; contraste do número e das estrelas sobre a ilustração; tamanho do APK (+3 a 5 MB). |
| **Testes** | Teste que compara, para progressos de exemplo, o estado de **cada nó** no mapa antigo e no novo; navegação por teclado na ordem das fases; nomes acessíveis ("Fase 3, concluída, 2 estrelas"); alto contraste; rolagem a 60 quadros por segundo no Moto G75 (sem quadros acima de 50 ms ao rolar). |
| **Critérios de aprovação** | Progressão, estrelas, bloqueios e baús idênticos aos de hoje; mesmo design nos dois modos; nenhuma tela de abertura do mundo; aprovação visual do dono do projeto. |

### Entrega 3 — Personagens

| Item | Conteúdo |
|---|---|
| **Estado atual** | 8 bases na escolha (imagem 03). O masculino é estilizado e de peça única (cabelo, barba e rosto não trocam: imagens 04 a 06). A feminina é de outro estilo e 4,8 MB. |
| **Resultado esperado** | **Dois personagens, masculino e feminino**, com **qualidade equivalente**. Cada opção de cabelo, barba, rosto e expressão mostra e aplica **o modelo do seu nome**. As miniaturas do editor correspondem ao que se aplica. |
| **Arquivos envolvidos** | `tools/personagem/estilizado/` (produção); `public/models/personagem/heroi-{masculino,feminino}.glb` e as peças; `LICENCAS.md`; `src/character3d/heroi.ts` (montagem modular para os dois); `src/character3d/runtime.ts`; `src/data/character/{bases,look,items}.ts`; `src/pages/onboarding/{CharacterBase,Wardrobe}.tsx`; `src/services/storage/repositories.ts` (migração da aparência); `src/types/index.ts` |
| **Estratégia** | 1) Partir dos **corpos-base estilizados** já existentes, no mesmo estilo para os dois gêneros. 2) Produzir as peças separadas no mesmo esqueleto: 7 cabelos, 3 barbas, as túnicas, mantos, cintos, calçados e acessórios atuais, e as variações de rosto por *morph targets*. 3) Implementar a montagem modular (`pecas.ts`, `montagem.ts`, `cores.ts`, conforme o `EDITOR-3D-PLANO.md`). 4) Trocar a escolha de 8 bases por **2 cartões**. 5) Migração **v2 → v3** da aparência. 6) Retirar a tela de chegada (imagem 07): a personalização leva à Central, e `/chegada` redireciona. |
| **Recursos gráficos** | 2 corpos-base; cerca de 30 a 40 peças; atlas de texturas de 1024 e 512 px; imagens de referência geradas por IA (registradas). |
| **Riscos** | **Perfis antigos** (8 bases) se tornarem inválidos; peças que atravessam o corpo nas animações; peso do modelo acima do orçamento; diferença de qualidade entre os gêneros. |
| **Testes** | Migração com um perfil de cada uma das 8 bases e com itens desbloqueados; cada combinação de cabelo, barba, rosto e expressão em captura (frente, lado e costas) para os dois gêneros; animações (espera, comemoração, aceno) sem atravessar a roupa; tamanho do GLB; desempenho do editor no Moto G75. |
| **Critérios de aprovação** | Os critérios C1 a C11 da personagem feminina (planejamento da 1.0) e os mesmos critérios aplicados ao masculino; cada opção com resultado visível e distinto; nenhum item desbloqueado perdido; aprovação visual do dono do projeto. |

### Entrega 4 — História e Quiz (telas de jogo)

| Item | Conteúdo |
|---|---|
| **Estado atual** | Fase da História (`PhaseScene.tsx`), desafio (`StoryChallenge.tsx`, `QuizRunner.tsx`, `QuestionView.tsx`), resultado (`Result.tsx`) e treino do Quiz, com estilos mistos. |
| **Resultado esperado** | Mesma identidade da Central e do mapa: cartões de pergunta em pergaminho, respostas grandes e legíveis, retorno de acerto e erro com animação curta, e um resultado com estrelas e recompensas no estilo do mapa. |
| **Arquivos envolvidos** | `src/pages/story/*`, `src/pages/quiz/*`, `src/components/quiz/*`, `src/pages/Result.tsx`, `src/pages/Daily.tsx`, CSS das telas. **Sem mudança** em perguntas, pontuação ou regras (`services/game/engine.ts`, `scoring.ts`). |
| **Estratégia** | Aplicar os componentes-base com a pele de aventura e retirar a `ponte.css` dessas telas. |
| **Recursos gráficos** | Molduras, fundos por livro (pinturas já existentes) e ícones. |
| **Riscos** | Legibilidade do texto bíblico; tempo de resposta e acessibilidade do quiz. |
| **Testes** | Testes atuais do quiz e do motor (sem mudança de regra); leitor de tela nas alternativas; contraste AA; fonte grande. |
| **Critérios de aprovação** | Mesmas perguntas, pontuação e recompensas; contraste ≥ 4,5:1; aprovação visual. |

### Entrega 5 — Biblioteca, Perfil e Conquistas

| Item | Conteúdo |
|---|---|
| **Estado atual** | Conquistas já no visual novo (0.17.8). Biblioteca e Perfil em estilo misto. |
| **Resultado esperado** | As três telas com a mesma moldura de aventura (`PaginaAventura`), cartões e painéis comuns, retrato do personagem novo no Perfil e livros "Em preparação" claramente identificados (A11 e A26). |
| **Arquivos envolvidos** | `src/pages/library/*`, `src/pages/Profile.tsx`, `src/pages/Achievements.tsx`, `src/components/base/index.tsx`, CSS. |
| **Estratégia** | Concluir o passo 1.7 da Etapa 2 com a nova pele. Exportar e apagar dados continuam no Perfil sem mudança. |
| **Recursos gráficos** | Ícones e molduras; retrato pelo renderizador compartilhado. |
| **Riscos** | Retirar acidentalmente uma ação do Perfil (exportar, apagar, editar personagem). |
| **Testes** | Testes atuais da Biblioteca e do Perfil; leitor de tela; alto contraste. |
| **Critérios de aprovação** | Mesmas funções e informações; identidade igual à das outras telas; aprovação visual. |

### Entrega 6 — Acabamento, animações e otimização

| Item | Conteúdo |
|---|---|
| **Estado atual** | Transições simples; animações do personagem (espera, gestos); redução de movimento respeitada. |
| **Resultado esperado** | Transições curtas entre telas, desbloqueio de fase e abertura de baú animados, sons opcionais, e entrada e boas-vindas (imagens 01 e 02) com o fundo definido pelo dono do projeto. Tudo dentro do orçamento da seção 2.7. |
| **Arquivos envolvidos** | CSS de transições, `src/pages/onboarding/{Welcome,Login}.tsx`, componentes do mapa e da recompensa, e as ferramentas de medição. |
| **Estratégia** | Medir antes e depois com o APK de diagnóstico; ajustar a qualidade leve e o 2D; texturas comprimidas; carregar só o que a tela usa. |
| **Recursos gráficos** | Pequenas animações (CSS ou SVG), fundo das boas-vindas. |
| **Riscos** | Animações que pioram o desempenho ou a acessibilidade. |
| **Testes** | Teste físico completo (cenários 1 a 10 do roteiro) em 2 aparelhos, incluindo um de entrada; redução de movimento; TalkBack. |
| **Critérios de aprovação** | 0 ANR; orçamento cumprido; todas as animações desligáveis; aprovação final do dono do projeto. |

---

## 5. Riscos gerais

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | Perder dados salvos ao reduzir as bases e mudar o modelo | Alto | Migração v2 → v3 com testes por base, e uma cópia da aparência anterior (`previousCharacter`, que já existe) |
| R2 | ANR ou lentidão em aparelho de entrada | Alto | Orçamento da seção 2.7; medir cada entrega com o APK de diagnóstico; qualidades leve e 2D obrigatórias |
| R3 | Qualidade desigual entre masculino e feminino | Médio | Mesmo corpo-base, mesma ferramenta e mesmos critérios (C1 a C11) para os dois |
| R4 | Arte gerada por IA com estilo inconsistente | Médio | Uma folha de estilo com paleta, traço e luz, e aprovação de referências antes da produção |
| R5 | Mudar a progressão sem querer | Alto | A lógica (`services/game/`) fica congelada nas entregas visuais; testes comparando os estados dos nós |
| R6 | APK maior | Baixo a médio | WebP e GLB comprimidos; meta de até +10 MB no APK |
| R7 | Conflito de escopo com decisões aprovadas (A14: o visual de Perfil, Quiz e História podia ficar para depois da 1.0) | Médio | **Resolvido pela decisão V3:** as entregas 4 e 5 só aplicam a pele visual, ficam depois das três primeiras e não podem atrasar a 1.0 |
| R8 | Direitos autorais da referência visual | Médio | Nenhuma imagem de jogo comercial no repositório; inspiração só de design |

---

## 6. Ordem recomendada e primeiras tarefas

**Ordem:** a numeração das entregas segue o pedido. A ordem de execução recomendada é esta (o detalhamento técnico das três primeiras está na seção 9):

1. **Preparação, sem mudança visível:**
   - folha de estilo artística (paleta, luz, traço) com 3 ou 4 imagens de referência geradas e aprovadas pelo dono do projeto;
   - orçamento de desempenho registrado;
   - testes de proteção dos dados (migração de aparência, estado dos nós do mapa).
2. **Entrega 3 (personagens):** é o recurso que aparece na Central, no mapa e no Perfil. A produção dos modelos é a parte mais longa.
3. **Entrega 2 (mapa)**, em paralelo com a produção dos personagens.
4. **Entrega 1 (Central)**, já com o personagem novo.
5. **Entregas 4 e 5**, sem comprometer a 1.0 (decisão V3).
6. **Entrega 6.**

**Primeiras tarefas propostas (depois da autorização):**

1. Gerar e aprovar a **folha de estilo** e as referências dos dois personagens no mesmo estilo.
2. Escrever os **testes de proteção**: migração da aparência das 8 bases para 2, e estado de cada nó do mapa da História e do Quiz.
3. Produzir o **corpo-base feminino e o masculino** e as peças de cabelo e barba (as que hoje faltam), e medir peso e desempenho no Moto G75.
4. Protótipo do **novo traçado do mapa** em um mundo (Gênesis), com fundo ilustrado em uma região, para aprovação visual.
5. Retirar as telas das **imagens 07 e 08** (chegada e abertura do mundo). É uma mudança pequena, com redirecionamento de `/chegada` e `worldsSeen` preservado.

---

## 7. Critérios de aprovação gerais (todas as entregas)

- `npm run typecheck`, `npm test` e `npm run build` passam.
- Nenhuma mudança em perguntas, fases, recompensas, regras de progressão ou dados salvos, salvo a migração de aparência aprovada.
- 0 ANR no teste físico; orçamento da seção 2.7 cumprido.
- Acessibilidade:
  - todos os controles com nome acessível e alcançáveis por teclado e TalkBack;
  - contraste ≥ 4,5:1 nos textos;
  - alto contraste e redução de movimento funcionando;
  - qualidade 2D completa.
- Licença registrada para cada recurso gráfico novo.
- Aprovação visual do dono do projeto, com capturas no celular e no computador, antes de seguir para a entrega seguinte.

## 8. Decisões do dono do projeto

### 8.1 Aprovadas em 25/11/2026 (incorporadas ao plano)

| # | Decisão | Efeito no plano |
|---|---|---|
| V1 | **Depois da personalização, ir direto para a Central** | A tela de chegada (`/chegada`, imagem 07) sai. `/chegada` redireciona para `/painel`. Faz parte da Entrega 3. |
| V2 | **Ao escolher um mundo, ir direto para o mapa** | O diálogo de abertura do mundo (imagem 08) sai. `worldsSeen` continua salvo. Faz parte da Entrega 2. |
| V3 | **Preservar as funcionalidades** de História, Quiz, Biblioteca, Perfil e Conquistas, e planejar o acabamento visual **sem comprometer a versão 1.0** | As entregas 4 e 5 só aplicam a pele visual nova. Ficam **depois** das três primeiras e só entram na 1.0 se não atrasarem nem arriscarem o lançamento (resolve o R7 e a A14). |
| V4 | **As duas referências são o padrão visual oficial** | Folha de estilo criada (`IDENTIDADE_VISUAL_BIBLE_QUEST.md`) |
| V5 | **Primeiras entregas:** personagens masculino e feminino, protótipo do mapa de Gênesis e nova Central | Seção 9 |

### 8.2 Ainda pendentes

1. **Fundo das boas-vindas e da identificação** (imagens 01 e 02 dos apontamentos): o estilo está fixado na folha (seção 5.5), mas falta escolher a cena.
2. **Aprovação da folha de estilo** (paleta, cores por modo e padrões) antes do início da produção.
3. **Autorização para implementar** a primeira entrega.

---

## 9. Plano técnico das primeiras entregas

Ordem de produção: **9.1 Personagens → 9.2 Protótipo do mapa de Gênesis → 9.3 Nova Central**. O mapa pode começar em paralelo à produção dos modelos, porque não depende deles. A Central vem por último, porque exibe o personagem novo. Cada entrega termina com o teste físico no Android e a aprovação visual do dono do projeto antes da seguinte.

### 9.1 Personagens masculino e feminino

**Produção da arte (sem tocar no jogo):**
1. **Imagens de referência:** frente, lado e costas dos dois gêneros, no mesmo estilo e com a mesma luz, geradas por IA conforme a folha (seção 5.2). Aprovação do dono do projeto antes de seguir.
2. **Corpos-base:** partir de `tools/personagem/estilizado/corpos-base/` (masculino e feminino no mesmo estilo, já com esqueleto). Refazer a malha só se a referência aprovada exigir.
3. **Peças separadas no mesmo esqueleto:**
   - cabelos: os 7 estilos do catálogo, para cada gênero;
   - barbas: 2, além de "sem barba";
   - túnicas, mantos, cintos e calçados do catálogo atual;
   - acessórios atuais.
4. **Rosto:** *morph targets* para Suave, Sobrancelhas marcantes e Sardas (sardas por máscara de textura) e para as expressões Serena, Sorriso, Alegre e Curiosa.
5. **Exportação:** um GLB por gênero, com o corpo e todas as peças (meshopt), mais texturas de 1024 e 512 px. Registro em `LICENCAS.md`.

**Integração (depois da autorização):**
- `src/character3d/pecas.ts` (catálogo), `montagem.ts` (mostrar e esconder peças no mesmo esqueleto, sem recarregar) e `cores.ts` (troca de cor ao vivo), conforme o `EDITOR-3D-PLANO.md`.
- `heroi.ts` passa a tratar os dois gêneros da mesma forma. Sai o caminho "estilizado de peça única".
- `CharacterBase.tsx`: dois cartões (Masculino e Feminino). `Wardrobe.tsx` vai direto para a Central (V1).
- **Migração da aparência v2 → v3** em `repositories.ts`:
  - `base` antiga → `masculino` ou `feminino`, pelo `body`;
  - preserva `equipped`, `cores`, `dyes`, `hairStyle`, `hairColor`, `beard`, `face`, `expressao` e `skin`;
  - mantém `previousCharacter`.
- 2D: `Character2D.tsx` ganha os cabelos e barbas que faltam, para a escolha valer também na qualidade 2D.

**Critérios visuais objetivos:**

| # | Critério | Como medir |
|---|---|---|
| P1 | Cada opção de cabelo, barba, rosto e expressão produz uma miniatura **diferente** das outras da mesma categoria | Comparação automática das miniaturas: diferença de pixels > 3 % na região do rosto ou da cabeça |
| P2 | Masculino e feminino com o mesmo estilo e a mesma densidade de detalhe | C1 e C2 (altura da cabeça ±5 %) e avaliação lado a lado |
| P3 | Nenhuma peça atravessa o corpo nas 4 animações | C4 e C5, com inspeção em 360° por capturas |
| P4 | Mesma luz e enquadramento nas miniaturas dos dois gêneros | Capturas padronizadas (frente, lado, costas, retrato) |
| P5 | Peso do modelo | ≤ 2,5 MB por gênero; ≤ 25 mil triângulos na alta |

**Desempenho, acessibilidade e qualidades:**
- **Tempos:** editor aberto e personagem visível em ≤ 2 s no Moto G75; trocar uma peça em ≤ 100 ms, sem recarregar o modelo; retrato do topo no mesmo tempo para os dois (C6).
- **Aparelho modesto:** a qualidade leve usa as texturas de 512 px e no máximo 12 mil triângulos.
- **Acessibilidade:** opções com nome acessível ("Cabelo: Trança, selecionado"), navegação por teclado e TalkBack, e foco visível.
- **Qualidades:** alta, leve e 2D, todas mostrando a escolha.
- **Testes:** migração das 8 bases (C9), miniaturas diferentes (P1), aparência salva e restaurada, e `/chegada` redirecionando.

### 9.2 Protótipo do mapa de Gênesis

**Escopo:** só o mundo **Gênesis** do Modo História (20 fases e os baús atuais), com o novo padrão. O Quiz recebe o mesmo componente depois da aprovação do protótipo.

**Produção:**
1. **Ilustração por região** (4 a 5 regiões em vista aérea inclinada, seção 5.3 da folha), com transições naturais:
   - jardim e rios (criação, Éden);
   - campos e altar (Caim e Abel);
   - montes e arca (Noé);
   - planície e torre (Babel);
   - tendas, poço e celeiro (patriarcas e José).
   - Cada uma em WebP de ≤ 400 KB, gerada por IA conforme a folha e registrada.
2. **Traçado do caminho:** curva orgânica (spline) desenhada sobre a ilustração. As posições das 20 fases ficam num arquivo de dados por mundo (`src/data/mapas/`), e não mais na senoide fixa.
3. **Componente comum** `MapaDeNiveis`: recebe nós já calculados (`phaseState`, baús e avatar, sem mudar `journeyMap.ts`) e desenha marcadores, estandartes numerados, estrelas, cadeados, baús e o avatar em SVG por cima da ilustração.
4. Retirada do diálogo de abertura do mundo (V2).

**Critérios visuais objetivos:**

| # | Critério | Como medir |
|---|---|---|
| M1 | Nenhuma faixa reta de terreno nem paredão horizontal | Revisão das capturas |
| M2 | Caminho com curvas de raio variável; nenhum trecho reto com mais de 2 fases alinhadas | Análise dos pontos do traçado |
| M3 | Toda fase visível por inteiro (nenhuma copa ou rocha cobre o estandarte, o número ou as estrelas) | Teste automático da área livre em volta de cada fase |
| M4 | Número da fase legível: ≥ 18 px e contraste ≥ 4,5:1 com o contorno | Captura no celular de 360 px de largura |
| M5 | Estados distinguíveis sem cor: cadeado, estrelas e brilho | Captura em escala de cinza |
| M6 | Estado de **cada** fase e baú idêntico ao do mapa atual | Teste automático com 5 progressos de exemplo |

**Desempenho, acessibilidade e qualidades:**
- **Rolagem:** sem quadros acima de 50 ms no Moto G75 e no aparelho modesto.
- **Carregamento:** só as regiões visíveis e a seguinte; mapa utilizável em ≤ 1,5 s com a ilustração da região atual.
- **Acessibilidade:** nomes acessíveis ("Fase 3, concluída, 2 de 3 estrelas"); ordem de teclado da fase 1 em diante; áreas de toque de 48 px; o alto contraste usa a versão vetorial; a redução de movimento desliga o brilho e as estrelas voando.
- **Qualidades:** o mapa é igual em alta, leve e 2D. Na leve, sem animações contínuas.

### 9.3 Nova Central

**Produção:**
1. **Modelos de cenário** (GLB ≤ 300 KB cada) no estilo da folha, com luz assada:
   - tenda;
   - fogueira;
   - baú (fechado, pronto, aberto);
   - quadro de missões;
   - mesa de estudos;
   - os 8 elementos liberados pelo progresso.
2. **Ambiente:** terreno com o caminho que conduz ao horizonte, vegetação em instâncias (oliveiras, ciprestes, palmeiras, flores), montanhas e céu de dia com névoa em camadas.
3. **Ilustração 2D** da Central para a qualidade 2D.

**Integração:**
- `acampamento.ts` dividido em módulos (céu, terreno, objetos, luz, personagem), primeiro sem mudança visual e com testes.
- A cena **fica viva** entre idas e voltas à Central: pausada, sem desenhar, e retomada (corrige o P2 do teste físico).
- HUD da folha (seção 5.1): retrato com nível e XP; estrelas, sequência e configurações; **botões de modo coloridos**; painel de missões em madeira; rótulos dos objetos como placas. **Os mesmos dados e destinos de hoje.**

**Critérios visuais objetivos:**

| # | Critério | Como medir |
|---|---|---|
| C-1 | Só o personagem do jogador na cena | Revisão da cena e teste da lista de objetos |
| C-2 | Personagem com 35 a 45 % da altura útil no celular, com o rosto iluminado | Captura de 360 × 780 px |
| C-3 | Todos os objetos interativos com textura e acabamento, sem geometria crua na alta | Revisão das capturas |
| C-4 | Botões de modo com cor própria, ícone, título e subtítulo, com contraste ≥ 4,5:1 | Captura e medição |
| C-5 | O mesmo clima (cor e luz) nas qualidades alta e leve | Capturas lado a lado |

**Desempenho, acessibilidade e qualidades:**
- **Moto G75:** 3D pronto em ≤ 3,5 s desde o início do processo; volta à Central sem tarefa longa acima de 200 ms; 0 ANR.
- **Aparelho modesto:** Central utilizável em ≤ 5 s (leve), ≤ 80 chamadas de desenho e ≤ 70 MB de memória de GPU.
- **Acessibilidade:** os rótulos dos objetos e os botões de modo são botões HTML com nome acessível e foco visível; a ordem de leitura segue HUD → modos → missões.
- **Movimento:** com redução de movimento, sem câmera em movimento nem partículas.
- **Qualidades:** alta (sombras e brilho), leve (luz assada, 30 quadros por segundo) e 2D (ilustração com os mesmos botões).

### 9.4 Riscos específicos das primeiras entregas

| Risco | Entrega | Mitigação |
|---|---|---|
| Arte gerada por IA inconsistente entre os gêneros ou entre as regiões | 9.1 e 9.2 | Aprovar as referências antes da produção; usar as mesmas instruções e a mesma paleta |
| Peças que não encaixam no esqueleto | 9.1 | Testar um cabelo e uma barba antes de produzir todas as peças |
| Migração da aparência perder itens | 9.1 | Testes C9 antes de integrar; `previousCharacter` preservado |
| Ilustração do mapa pesar demais no APK | 9.2 | Orçamento de 400 KB por região; medir o APK a cada região |
| Cena viva consumir memória fora da Central | 9.3 | Liberar as texturas grandes ao sair; medir a memória no aparelho modesto |
| Regressão do ANR | 9.3 | Teste físico com o APK de diagnóstico antes da aprovação |
