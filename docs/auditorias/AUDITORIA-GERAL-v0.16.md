# Auditoria geral e plano oficial de evolução (v0.16)

Data: 14/11/2026. Pedido do dono do projeto: diagnóstico real do Bible Quest antes de novas funcionalidades. **Nada foi implementado nesta etapa.** O plano da seção 11 aguarda aprovação, e o trabalho seguirá uma etapa por vez.

## Como a auditoria foi feita

- **Leitura do código:** rotas (`src/App.tsx`), estado (`src/state/GameContext.tsx`), serviços (`src/services/`), dados (`src/data/`), 3D (`src/character3d/`), estilos e testes.
- **Medições com scripts temporários** (removidos depois): contagem de perguntas por tipo, livro, dificuldade e fase; passagens bíblicas; ossos, malhas, triângulos, animações e expressões de cada modelo GLB; tamanho do build.
- **Varredura no navegador** (Chromium com WebGL por software, celular de 390 px):
  - 23 telas;
  - erros e avisos do console;
  - rolagem lateral;
  - número de títulos `h1`;
  - modelos 3D baixados;
  - tempo até o personagem 3D aparecer.
- **Verificações do projeto:**
  - `npm run typecheck`, `npm test` e `npm run build`;
  - histórico das publicações no GitHub Actions.

**Legenda das classificações:** IMPLEMENTADA E TESTADA · IMPLEMENTADA PARCIALMENTE · APENAS VISUAL · DOCUMENTADA, MAS NÃO VALIDADA · AUSENTE · COM DEFEITO.

---

## 1. Diagnóstico completo

### 1.1 Arquitetura e tecnologias

| Item | Situação | Evidência |
| --- | --- | --- |
| Base | React 19, TypeScript 7, Vite 8, React Router 7 (rotas com `#`), Three.js 0.187. Sem bibliotecas de estado ou de interface | `package.json` |
| Organização | Camadas claras: `data/` (conteúdo), `services/` (regras puras), `state/` (contexto React), `pages/` e `components/` (telas). As telas não acessam o `localStorage` diretamente | `services/storage/repositories.ts` (comentário da linha 5) |
| Tamanho | Cerca de 20,8 mil linhas em `src/`. O CSS é um arquivo único de cerca de 1.900 linhas, com camadas de várias versões sobrepostas | `src/styles/global.css` |
| Classificação | **IMPLEMENTADA E TESTADA** | 144 testes, tipos e build passam |

### 1.2 Rotas e telas

As 40 rotas estão em `src/App.tsx`. A varredura abriu 23 delas no celular: **nenhum erro de JavaScript** e **nenhuma rolagem lateral**. Os únicos avisos do console vêm do driver de vídeo ao gerar as imagens do personagem ("GPU stall due to ReadPixels").

| Tela | Classificação | Observação |
| --- | --- | --- |
| Boas-vindas, cadastro e criação do personagem | IMPLEMENTADA E TESTADA | `flow.test.tsx` |
| Central do acampamento 3D (`/painel`) | IMPLEMENTADA E TESTADA | Cena 3D (`character3d/acampamento.ts`, 981 linhas). Nos testes, só a versão 2D é verificada, porque o ambiente de teste não tem WebGL |
| Mapa do Modo História | IMPLEMENTADA E TESTADA | `JourneyMap.tsx`, `mapas.test.tsx` |
| Mapa do Modo Quiz | IMPLEMENTADA E TESTADA | `QuizMap.tsx`, `mapas.test.tsx` |
| Página antiga da fase (`/historia/:livro/:fase`) | IMPLEMENTADA PARCIALMENTE | Continua com o visual escuro antigo. A apresentação principal agora é a janela do mapa, e esta página virou "Personagens e lugares da fase" |
| Cena narrativa, perguntas e resultado | IMPLEMENTADA E TESTADA | v0.15 e v0.16 |
| Tela de perguntas (acessibilidade) | **COM DEFEITO (leve)** | A partida **não tem título `h1`** (a varredura achou 0 em `/historia/.../desafio`). Leitores de tela ficam sem o nome da página |
| Resultado de derrota | IMPLEMENTADA, NÃO TESTADA | O código existe (`Result.tsx`, linhas 39 e 49), mas nenhum teste passa pela derrota |
| Biblioteca, linha do tempo, conquistas, perfil | IMPLEMENTADA E TESTADA | Visual novo nas três telas principais (v0.16). Fichas, linha do tempo, estatísticas, configurações e sobre ainda estão no visual antigo |
| Revisão inteligente (`/revisao`) | IMPLEMENTADA E TESTADA | `services/game/review.ts`, `flow.test.tsx` (linha 240) |
| Desafio diário | IMPLEMENTADA E TESTADA | `services/game/daily.ts`, `rules.test.ts` |
| Ranking | IMPLEMENTADA PARCIALMENTE | Só os dados do próprio aparelho. Não existe ranking entre jogadores |
| Multiplayer | **APENAS VISUAL (demonstração)** | Contra "participantes fictícios", sem XP. A própria tela diz "Servidor online: desconectado" (`pages/free/Multiplayer.tsx`, linha 136) |
| Supabase (contas e nuvem) | DOCUMENTADA, MAS NÃO VALIDADA | Só lê a configuração (`services/supabase/config.ts`) e há um esquema em `docs/supabase/schema.sql`. Não existe backend ligado |
| Painel administrativo (`/admin`) | IMPLEMENTADA PARCIALMENTE | É um protótipo e grava só no navegador. Fica aberto a qualquer pessoa, mas não altera nada para outros jogadores |

### 1.3 Estado global e persistência

| Item | Classificação | Evidência |
| --- | --- | --- |
| Estado | IMPLEMENTADA E TESTADA | `GameContext.tsx` (241 linhas) concentra perfil, progresso e ações (concluir fase, abrir baú, salvar personagem) |
| Persistência local | IMPLEMENTADA E TESTADA | `repositories.ts`: leitura protegida (`try/catch`) e migração de perfis antigos (`migrateProgress`, `migrateCharacter`) |
| Configuração única do personagem | IMPLEMENTADA E TESTADA | Uma fonte só (`usePlayerCharacter`). O teste "a mesma aparência aparece em todas as telas" percorre 7 telas e recarrega a página |
| Sincronização entre aparelhos | AUSENTE | Depende do backend (seção 1.2) |
| Exportar e excluir dados (LGPD) | IMPLEMENTADA E TESTADA | Perfil e `services.test.ts` |

### 1.4 Mapas

| Item | Classificação | Evidência |
| --- | --- | --- |
| Progressão (uma fase por vez, baús a cada 5 fases) | IMPLEMENTADA E TESTADA | `services/game/progression.ts`, `journeyMap.ts`, `aventura.test.ts` |
| Cenário em camadas (SVG em código) | IMPLEMENTADA E TESTADA | `aventura/Cena.tsx` e `Elementos.tsx` (41 tipos de elemento desenhados) |
| Regiões por mundo | IMPLEMENTADA PARCIALMENTE | Gênesis (8 regiões) e Êxodo (4) têm cenário próprio. Os outros mundos usam o genérico (`cenarioGenerico`), mas eles ainda não têm fases |
| Quiz com identidade própria | IMPLEMENTADA E TESTADA | Lajes de pedra, templos e bibliotecas (`CENARIO_QUIZ`) |
| Personagem andando no mapa | IMPLEMENTADA (sem teste da animação) | `StoryMap.tsx`. O personagem aparece como imagem gerada do 3D (`char3d is-image`) |
| Ilustração pintada | AUSENTE | Tudo é desenhado em SVG. Fica nítido e leve, mas é menos rico que a referência pintada (já anotado em `AUDITORIA-v0.14.md`) |

### 1.5 Personagens 3D

Medido diretamente nos arquivos GLB:

| Modelo | Origem | Tamanho | Ossos | Triângulos | Malhas | Animações | Expressões |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `heroi-masculino.glb` (usado no jogo) | TRELLIS.2 (estilo animação) | 1,7 MB | 24 | 44 mil | 6 | Idle, Walk, Run, Victory, Greeting, Discovery | Alegria, Piscar, Sorriso, Surpresa |
| `heroi-feminino.glb` (usado no jogo) | MakeHuman (**estilo realista**, v0.7) | **4,6 MB** | 164 | **207 mil** | 35 | as mesmas | as mesmas |
| `corpo-feminino-rig.glb` (fora do jogo) | TRELLIS.2 | 1,3 MB | 22 | 60 mil | 1 | as mesmas | nenhuma |
| `corpo-masculino-rig.glb` (fora do jogo) | TRELLIS.2 | 1,7 MB | 22 | 60 mil | 1 | as mesmas | nenhuma |

| Item | Classificação | Evidência |
| --- | --- | --- |
| Visualizador 3D (giro, zoom, qualidade, reserva 2D) | IMPLEMENTADA E TESTADA (2D nos testes) | `character3d/runtime.ts`. No navegador, ficou pronto em 2,7 s |
| **Estilo único entre os corpos** | **COM DEFEITO** | O masculino é estilo animação e o feminino é realista, com 4,7 vezes mais triângulos e 2,7 vezes o tamanho. Os 8 personagens-base usam um desses dois corpos (`MODELOS_POR_BASE` está vazio em `heroi.ts`, linha 26) |
| **Escolhas do editor no 3D masculino** | **IMPLEMENTADA PARCIALMENTE** | No modelo estilizado, "corpo, cabelo e roupa são uma peça só" (`heroi.ts`, cerca da linha 305). Penteado, manto, cinto e calçado **só mudam a cor** no 3D, embora o editor ofereça formatos diferentes e o 2D os mostre |
| Topologia | Limitação conhecida | O TRELLIS.2 gera uma malha triangulada única, com roupa e cabelo fundidos ao corpo, sem laços de borda nas articulações. Deforma razoavelmente em poses moderadas, mas mal em flexões fortes |
| Esqueleto | IMPLEMENTADA PARCIALMENTE | 22 a 24 ossos próprios, **sem dedos** e com nomes próprios (não seguem um padrão como Mixamo ou VRM) |
| Animações | IMPLEMENTADA E TESTADA (lista de clipes) | 6 clipes criados por script no Blender |
| Materiais | IMPLEMENTADA | Regiões de cor no shader (`tingirRegiao`). O shader é recompilado a cada troca de aparência (já anotado no `EDITOR-3D-PLANO.md`) |
| Cabelos, roupas e acessórios como peças | AUSENTE no estilo novo | Só existem no modelo realista v0.7. As 5 referências de penteado foram geradas (v0.13.3), mas a geração em 3D está pendente (cota do Hugging Face) |
| Desempenho | Aceitável | No guarda-roupa o jogo baixa os dois modelos (cerca de 6,4 MB). Nas demais telas, só o do corpo do jogador |

### 1.6 Conteúdo bíblico

Medido em `src/data/questions` e `src/data/story`:

- **Perguntas:** 197 no total; 142 de Gênesis, 23 de Êxodo e 32 de outros livros (só no treino livre).
- **Tipos:** 70 de múltipla escolha, 32 de verdadeiro ou falso, 28 de completar, 23 de livro, 22 de "quem sou eu", 13 de ordem, 7 de memória e 2 de relacionar.
- **Dificuldade:** 84 fáceis, 87 médias e 26 difíceis.
- **Explicação e referência:** todas as 197 têm explicação e referência.
- **Fases:** 24, sendo 20 de Gênesis e 4 de Êxodo. Cada fase tem de 5 a 10 perguntas, 1 a 3 passagens e 2 quadros de narrativa.
- **Passagens bíblicas:** 37 trechos de até 131 caracteres, todos com referência e com o aviso "em revisão contra a fonte" (`BIBLE_SOURCE_NOTE`).
- **Personagens na Biblioteca:** 35.

| Item | Classificação | Observação |
| --- | --- | --- |
| Gênesis | IMPLEMENTADA E TESTADA | Cobre o livro inteiro, de 1 a 50, em 20 fases. Há testes de cobertura em `content.test.ts` |
| Êxodo | **IMPLEMENTADA PARCIALMENTE** | 4 fases cobrem só os capítulos 1 a 20. **Faltam os capítulos 21 a 40** (tabernáculo, bezerro de ouro, aliança renovada). Duas fases têm o mínimo de 5 perguntas, então uma partida usa todas e a repetição fica previsível |
| Levítico, Números e Deuteronômio | AUSENTE | Pertencem ao mundo "Êxodo e o deserto", mas não têm fases |
| Narrativa dramatizada separada do texto bíblico | IMPLEMENTADA E TESTADA | Etiqueta "Narrativa dramatizada" e aviso de que não atribui falas (`PhaseScene.tsx`) |
| Revisão das passagens contra a fonte | DOCUMENTADA, MAS NÃO VALIDADA | O aviso existe, mas não há registro de quem revisou nem quando |
| Gênero literário | AUSENTE como dado | As fases não informam se o texto é narrativa, lei, poesia, profecia, evangelho ou carta. Isso será necessário a partir de Levítico e Salmos |
| Documentação | COM DEFEITO (leve) | `ROADMAP.md` (linha 17) diz "Gênesis com 19 experiências", mas são 20 |

### 1.7 Experiência de jogo

| Item | Classificação | Observação |
| --- | --- | --- |
| Apresentação da fase (janela no mapa) | IMPLEMENTADA E TESTADA | |
| Perguntas, feedback e explicação | IMPLEMENTADA E TESTADA | 8 tipos de pergunta, explicação depois da resposta e personagem que reage |
| Vitória | IMPLEMENTADA E TESTADA | |
| Derrota | IMPLEMENTADA, NÃO TESTADA | Mostra "Ainda não foi desta vez", mas não sugere a revisão dos erros |
| XP, níveis e estrelas | IMPLEMENTADA E TESTADA | `scoring.ts`, `levels.ts` e limites diários de XP |
| Baús | IMPLEMENTADA E TESTADA | Abrem numa janela, mas sem animação de abertura com itens saltando |
| Conquistas | IMPLEMENTADA E TESTADA | 26 conquistas. O aviso de conquista nova aparece só na tela de resultado |
| Acampamento evolutivo | IMPLEMENTADA E TESTADA | `services/game/acampamento.ts`, `acampamento.test.ts` |
| Som (efeitos e música) | **AUSENTE** | Só existe a leitura em voz alta (`ReadAloud.tsx`). Não há som de acerto, erro, baú ou vitória |
| Tutorial da primeira partida | AUSENTE | Existe a ajuda do mapa, mas falta o "primeiro passo" guiado |
| Uso sem internet (PWA) | AUSENTE | Há `manifest.webmanifest`, mas não há service worker |

### 1.8 Qualidade técnica

| Item | Situação |
| --- | --- |
| TypeScript | Sem erros (`tsc -b`) |
| Testes | 144 passando em 11 arquivos: `flow` 29, `rules` 24, `content` 18, `personagem` 16, `mapas` 12, `aventura` 11, `engine` 10, `services` 10, `editor` 7, `acampamento` 5 e `icones` 2. **Lacunas:** derrota, 3D real (WebGL), animações e testes de ponta a ponta no navegador |
| Build | Passa. JavaScript principal com 734 kB (223 kB comprimido). O 3D fica num arquivo separado de 784 kB (206 kB comprimido), carregado só quando é preciso. O site inteiro tem 15 MB: 6,8 MB de modelos e 5,4 MB de imagens |
| Console | Sem erros. Só avisos do driver de vídeo |
| Responsividade | Sem rolagem lateral em 390 px nas 23 telas varridas |
| GitHub Pages | **COM DEFEITO.** Os envios ao `main` falham na etapa de publicação (execuções 37 e 39 do workflow). Quando os dois ramos são enviados juntos, a regra `concurrency: cancel-in-progress` cancela a publicação do ramo de desenvolvimento, e o site fica desatualizado até alguém publicar de novo (aconteceu na v0.15) |
| Segurança | Sem `dangerouslySetInnerHTML` nem `eval`. O conteúdo é estático e não há segredos no código. O painel administrativo é público, mas é local. Os riscos reais aparecem com o backend (contas, ranking e multiplayer exigirão regras de acesso no Supabase) |

---

## 2. Pontos fortes a preservar

1. **Regras de jogo puras e testadas:** progressão, pontuação, XP com limites, baús, revisão e diário ficam em `services/game/`, sem depender de tela.
2. **Configuração única do personagem,** com migração de perfis antigos e teste de consistência entre telas.
3. **Mapas funcionais em SVG e React:** progressão real, acessíveis por teclado e leitor de tela, leves e nítidos em qualquer tela.
4. **Separação entre texto bíblico e dramatização,** com referência em cada passagem e explicação em cada pergunta.
5. **Pipeline de 3D por scripts** (`tools/personagem/`): é reproduzível, registra licenças e não depende de cliques manuais.
6. **Reserva em 2D** para aparelhos sem WebGL, e qualidade gráfica ajustável.
7. **Acessibilidade:** tamanhos de texto, alto contraste, reduzir animações e leitura em voz alta.

## 3. Problemas encontrados (por gravidade)

| # | Problema | Gravidade | Onde |
| --- | --- | --- | --- |
| P1 | Personagem feminino em estilo realista e masculino em estilo animação: o jogo fica com duas identidades visuais | Alta | `public/models/personagem/` |
| P2 | O editor oferece formatos de cabelo e de roupa que o 3D masculino não mostra (só troca a cor) | Alta | `character3d/heroi.ts` |
| P3 | Publicação: o `main` falha, e o envio simultâneo dos dois ramos pode deixar o site desatualizado | Média | `.github/workflows/deploy.yml` e ambiente `github-pages` |
| P4 | Êxodo incompleto (capítulos 21 a 40) e fases com apenas 5 perguntas | Média | `data/story/exodo.ts`, `data/questions/moises.ts` |
| P5 | Sem som | Média | — |
| P6 | Tela de perguntas sem `h1` | Baixa | `components/quiz/QuizRunner.tsx` |
| P7 | Derrota sem teste e sem sugestão de revisão | Baixa | `pages/Result.tsx` |
| P8 | CSS único e longo, com regras de várias versões sobrepostas: cresce o risco de uma mudança afetar outra tela | Baixa (cresce com o tempo) | `styles/global.css` |
| P9 | Telas secundárias no visual antigo (fichas, linha do tempo, estatísticas, configurações, sobre e página da fase) | Baixa | `pages/` |
| P10 | Contagem errada de fases de Gênesis no roadmap | Baixa | `ROADMAP.md` |

## 4. Funcionalidades incompletas

- **Multiplayer e ranking entre jogadores:** só demonstração e dados locais. Precisam do backend.
- **Contas e sincronização:** só documentadas.
- **Editor modular 3D:** corpos-base prontos, mas sem peças (cabelo, roupa, acessório) e sem integração (`EDITOR-3D-PLANO.md`, etapas 4 em diante).
- **Os outros 7 personagens-base:** não têm modelo próprio e usam um dos dois corpos.
- **Mundos 3 a 10:** não têm fases (64 livros "em preparação").
- **Uso sem internet, som e tutorial:** ausentes.

---

## 5. Arquitetura recomendada

### 5.1 Mapas ilustrados (manter o SVG funcional e acrescentar arte)

A lógica atual já é a certa. Proposta em camadas, sem trocar a progressão por imagens estáticas:

```
Camada 5  Interface fixa       CabecalhoMapa, PlacaRegiao, ContadorEstrelas (HTML)
Camada 4  Nós e personagem     Medalhao, baús, avatar andando (SVG/HTML, clicáveis, acessíveis)
Camada 3  Caminho              caminhoSuave + escadas + pontes (SVG gerado pelos pontos)
Camada 2  Elementos            Elementos.tsx (SVG) ou ilustrações em WebP por região
Camada 1  Fundo da região      gradiente atual ou pintura em WebP, recortada por região
```

- **Dados:** cada região passa a declarar `fundo?: string` (pintura opcional, gerada por IA ou de domínio público, com licença registrada) e `elementos`. Sem pintura, continua o SVG atual. A troca é gradual, região por região.
- **Caminho e nós continuam vindo dos dados** (`layoutSection`). As pinturas não podem ter caminho desenhado nelas, para não desalinhar dos nós.
- **Bloqueios, estrelas e recompensas:** continuam no `Medalhao` e na `JanelaFase`. Falta só a animação de desbloqueio da próxima fase (o caminho se iluminando até ela).
- **Navegação:** a central leva aos mapas, os mapas abrem a janela da fase e o resultado volta ao mapa, como hoje.
- **Desempenho:** quando houver vários mundos com fases, desenhar só os mundos visíveis (IntersectionObserver, já usado na placa da região) e carregar as pinturas de forma preguiçosa.
- **Identidades:** História usa terra, natureza e marcos de cada livro. Quiz usa pedra, templos e conhecimento. É o que já existe; o plano só aprofunda.

### 5.2 Personagens 3D: o fluxo TRELLIS.2 → Blender → Mixamo → GLB → Three.js

**Compatibilidade com o que existe:**

| Etapa | Compatível? | Observação |
| --- | --- | --- |
| TRELLIS.2 | Sim, já é usado | Gera malha única fundida, de cerca de 2 modelos por dia na cota grátis. Bom para corpos-base, penteados e objetos. Ruim para roupas que precisam se encaixar |
| Blender | Sim, já é usado por scripts | Limpeza, redução de triângulos, regiões de cor e expressões |
| **Mixamo** | **Parcialmente** | Prós: esqueleto humanoide padrão (cerca de 65 ossos, com dedos) e milhares de animações. Contras: <br>• é um site da Adobe, com conta e envio manual do modelo; não dá para automatizar daqui nem com scripts; <br>• não preserva de forma confiável as expressões (morph targets), que teriam de ser refeitas no Blender depois; <br>• os termos de uso permitem usar as animações dentro do jogo, mas **não redistribuir os arquivos de animação soltos**, o que exige cuidado num repositório público; <br>• uma malha com roupa e cabelo fundidos ganha os mesmos pesos automáticos que já temos |
| GLB e gltfpack | Sim, já é usado | |
| Three.js | Sim | Hoje o código espera nomes de clipes (`Idle`, `Walk`, `Victory`, `Discovery`, `Greeting`) e de expressões. O esqueleto Mixamo exigiria mapear esses nomes |

**Recomendação:**
- **Não trocar o sistema atual, e sim padronizar o esqueleto:**
  1. adotar um **esqueleto humanoide padrão**, com nomes compatíveis com o Mixamo, para todos os corpos e peças;
  2. continuar rigando pelos scripts (automático e sem conta);
  3. usar o Mixamo **opcionalmente**, só como fonte de animações: o dono do projeto baixa e eu converto e aplico no esqueleto padrão.
- **Animações num arquivo separado e compartilhado** (`animacoes.glb`), servindo todos os corpos.
- **Peças:**
  - penteados e acessórios saem do TRELLIS.2, presos aos ossos da cabeça e das mãos;
  - roupas são feitas por script no Blender sobre o corpo-base, para encaixarem sem atravessar o corpo;
  - a montagem das peças fica em `montagem.ts`, como no `EDITOR-3D-PLANO.md`.
- **Corpos:** os corpos-base TRELLIS de 60 mil triângulos substituem os dois heróis atuais, o que resolve P1 e reduz o feminino de 4,6 MB para cerca de 1,4 MB.
- **Configuração única** (já existe): `CharacterAppearance` ganha a versão 3, com peças e cores, e migra os perfis da versão 2.

### 5.3 Conteúdo

- **Novo campo `genero`** em cada fase (narrativa, lei, poesia, sabedoria, profecia, evangelho, carta, apocalíptico). Ele orienta o tipo de cena e de pergunta:
  - lei: princípios e contexto, sem decorar normas;
  - poesia: imagens e paralelismos;
  - cartas: argumento e destinatários.
- **Registro de revisão** das passagens (quem revisou, quando, contra qual edição), e um teste que exige esse registro.
- **Mínimo de 8 perguntas por fase.** Isso dá variedade na repetição, já que a partida sorteia até 10.

### 5.4 Organização do código

- **CSS dividido por área** (`styles/aventura/mapas.css`, `jogo.css`, `paginas.css`), sem mudar o visual, para reduzir o risco de efeitos colaterais.
- **Testes de ponta a ponta no navegador** (Playwright) no CI para o fluxo principal e o 3D, usando o Chromium que já está disponível.

---

## 6. Roadmap em etapas (uma por vez, testando antes de avançar)

| Etapa | Conteúdo | Resolve |
| --- | --- | --- |
| **E0. Correções rápidas** | `h1` na partida; teste e sugestão de revisão na derrota; contagem do roadmap; publicação estável (deixar só um ramo publicando, ou separar a regra de concorrência) | P3, P6, P7, P10 |
| **E1. Personagem: estilo único** | Esqueleto padrão; regiões de cor e expressões nos corpos-base; trocar os dois heróis pelos corpos-base estilizados; o 2D continua como reserva | P1 |
| **E2. Personagem: peças** | Penteados (TRELLIS.2), roupas e calçados (script), acessórios; `montagem.ts`; o editor mostra só o que o 3D realmente mostra | P2 |
| **E3. Animações compartilhadas** | `animacoes.glb` único; animações extras (andar no mapa, abrir baú, comemorar); opção Mixamo | — |
| **E4. Experiência de jogo** | Sons (acerto, erro, baú, vitória, com opção de desligar); animação do baú abrindo; desbloqueio animado da próxima fase; tutorial da primeira partida; aviso de conquista na hora | P5 |
| **E5. Conteúdo: Êxodo completo** | Capítulos 21 a 40; mínimo de 8 perguntas por fase; campo `genero`; registro de revisão | P4 |
| **E6. Mapas: pinturas por região** | Camada de fundo pintada opcional, região por região, começando por Gênesis; desenho só dos mundos visíveis | — |
| **E7. Telas secundárias e CSS** | Fichas, linha do tempo, estatísticas, configurações e página da fase no visual novo; divisão do CSS | P8, P9 |
| **E8. Expansão de conteúdo** | Levítico, Números e Deuteronômio (fecham o mundo 2); depois Josué, Juízes e Rute; e assim por diante (seção 6.1) | — |
| **E9. Qualidade e uso sem internet** | Testes de ponta a ponta no CI; service worker (PWA); divisão do JavaScript (conteúdo carregado por mundo) | — |
| **E10. Backend (opcional)** | Contas, nuvem, ranking e multiplayer reais (Supabase), com regras de acesso | Multiplayer e ranking |

### 6.1 Sequência sugerida de livros (respeitando os gêneros)

1. **Mundo 2:**
   - **Êxodo 21–40:** narrativa e lei, com o tabernáculo, o bezerro de ouro e a aliança renovada.
   - **Levítico:** lei e culto, poucas fases, foco em santidade e ofertas, sem decorar normas.
   - **Números:** narrativa no deserto.
   - **Deuteronômio:** discursos.
2. **Mundo 3:** Josué e Juízes (narrativa) e Rute (narrativa curta).
3. **Mundo 4:** 1 e 2 Samuel e 1 e 2 Reis (narrativa). Crônicas entra como revisão, para não repetir os mesmos acontecimentos.
4. **Mundo 8:** os Evangelhos (Marcos primeiro, por ser o mais curto). São muito pedidos pelos jogadores e dariam variedade.
5. **Mundos de poesia, profetas e cartas:** fases mais curtas e perguntas de compreensão. **Salmos e Provérbios** em seleções temáticas, não capítulo por capítulo.

## 7. Dependências entre as etapas

```
E0 ──► (todas)
E1 ──► E2 ──► E3
E1 ──► E4 (animação do baú e da comemoração usam o personagem novo)
E5 ──► E8 (o campo `genero` e o registro de revisão vêm antes da expansão)
E6, E7: independentes; podem entrar entre outras etapas
E9: melhor antes de E8 crescer muito (divisão do conteúdo por mundo)
E10: independente; só depois de decidir o custo do servidor
```

## 8. Critérios de aceitação (por etapa)

Valem para todas as etapas: typecheck, testes e build passando; varredura no navegador sem erros de JavaScript e sem rolagem lateral (celular de 390 px e computador de 1280 px); documentação atualizada; publicação conferida no site.

| Etapa | Aceite |
| --- | --- |
| E0 | A partida tem `h1`. Um teste cobre a derrota, e ela oferece a revisão. O site publicado mostra a versão do último envio, sem ação manual |
| E1 | Os 8 personagens-base aparecem no mesmo estilo. Corpo feminino com no máximo 2 MB e 80 mil triângulos. O guarda-roupa troca de corpo em menos de 3 s no celular de teste. A aparência salva é a mesma em todas as telas (teste existente) |
| E2 | Cada opção de cabelo, roupa, calçado e acessório muda a forma no 3D. Nenhuma peça atravessa o corpo nas 6 animações (prévia em imagem). Trocar só a cor não recarrega o modelo. Perfis antigos migram sem perder itens |
| E3 | Um único arquivo de animações serve todos os corpos. As animações novas aparecem no mapa, no baú e no resultado. A opção "reduzir animações" é respeitada |
| E4 | Os sons podem ser desligados e o jogo começa sem som até o primeiro toque. O baú abre com animação e mostra os itens reais. O tutorial aparece só na primeira vez |
| E5 | Êxodo cobre os capítulos 1 a 40. Cada fase tem 8 perguntas ou mais, todas com explicação e referência. Toda passagem tem registro de revisão (verificado por teste). Toda fase tem `genero` |
| E6 | Pelo menos 3 regiões de Gênesis com pintura. Nós e caminho continuam alinhados e clicáveis. O mapa carrega em menos de 2 s no celular de teste. Sem pintura, o SVG continua funcionando |
| E7 | Todas as telas no padrão de aventura. CSS dividido sem diferença visual (comparação de capturas de tela antes e depois) |
| E8 | Mesmos critérios de E5 em cada livro novo |
| E9 | O jogo abre sem internet depois da primeira visita. Fluxo principal testado de ponta a ponta no CI |
| E10 | Login, sincronização entre dois aparelhos e ranking real, com regras de acesso testadas |

## 9. Estimativa de esforço relativo

P = pequeno (uma sessão), M = médio (2 a 3 sessões), G = grande (4 a 6 sessões), GG = muito grande (contínuo).

| Etapa | Esforço | Observação |
| --- | --- | --- |
| E0 | P | |
| E1 | M | Depende só de scripts que já existem |
| E2 | G | Limitada pela cota do TRELLIS.2: cerca de 15 gerações, ou seja, 1 a 2 semanas na cota grátis |
| E3 | M | Pode exigir a ajuda do dono do projeto se usar o Mixamo |
| E4 | M | |
| E5 | M | Escrita de conteúdo com revisão cuidadosa |
| E6 | G | Depende das imagens geradas (Canva) e do envio manual delas |
| E7 | M | |
| E8 | GG | Cerca de 1 sessão por livro narrativo médio |
| E9 | M | |
| E10 | G | Também exige decisão de custo (servidor) |

## 10. Riscos técnicos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Cota do TRELLIS.2 atrasa E2 | Alta | Médio | Agendar 2 gerações por dia; roupas por script (sem cota); Hugging Face PRO, se o dono do projeto quiser |
| Malhas do TRELLIS.2 deformam mal nas articulações | Média | Médio | Corpos com braços afastados; pesos por script com suavização; animações moderadas |
| Termos do Mixamo num repositório público | Média | Alto | Não guardar arquivos de animação do Mixamo soltos; usar só embutidos no GLB do jogo; registrar a origem em `LICENCAS.md` |
| Pinturas desalinhadas com caminho e nós (E6) | Média | Médio | Pinturas sem caminho; caminho sempre em SVG por cima |
| O conteúdo cresce e o JavaScript principal fica pesado | Alta (com E8) | Médio | E9: carregar o conteúdo por mundo |
| Erro de texto bíblico | Baixa | Alto | Só ARC 1911, trechos curtos, registro de revisão e teste |
| Publicação instável | Média | Médio | E0 |
| 3D lento em celulares fracos | Média | Médio | Qualidade automática e reserva 2D (já existem); meta de tamanho em E1 |
| CSS com efeitos colaterais entre telas | Média | Baixo | E7 e comparação de capturas de tela |

## 11. Decisões pedidas ao dono do projeto

1. **Aprovar a ordem das etapas** (E0 → E1 → E2 → ...) ou reordenar. Por exemplo, trazer E4 (som e baú) ou E5 (Êxodo) para antes do personagem.
2. **Mixamo:** usar só como fonte opcional de animações, com o envio manual feito por você? Ou ficar só com as animações por script?
3. **Publicação:** liberar o `main` no ambiente `github-pages` ou deixar só o ramo de desenvolvimento publicando?
4. **Backend (E10):** manter fora do plano por enquanto?
