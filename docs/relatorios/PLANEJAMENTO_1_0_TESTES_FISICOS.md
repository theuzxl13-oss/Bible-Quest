# Bible Quest — Planejamento da 1.0: testes físicos, conflitos e decisões

**Data:** 24/11/2026. **Atualizado no mesmo dia**, depois da "Avaliação do planejamento e decisões preliminares".
**Branch consultada:** `claude/bible-quest-android` (commits `3495fcb` e `eeb53bd`).
**Etapa:** planejamento. Nada foi implementado nem alterado no jogo, nos fluxos ou nos documentos oficiais.
**Diretrizes registradas em:** `docs/planos/VERSAO_1_0_DIRETRIZES.md`.

## 0. Atualização: decisões preliminares de 24/11/2026

O que foi aprovado, o que é proposta e o que está pendente está separado em `docs/planos/VERSAO_1_0_DIRETRIZES.md`, nas seções 1, 2 e 3. Os códigos A, PR e P usados abaixo são os daquele documento.

**O que mudou neste planejamento:**
- **Conflitos resolvidos:**
  - personalização mantida, sem retirar nada (A4);
  - os outros 64 livros e as perguntas gerais preservados (A11 e A12);
  - "completo" passa a exigir todos os capítulos (A9).
- **Testes complementares A a D** passam a fazer parte do plano (A16), com prioridade antes do vencimento do APK (A15).
- **Novas seções:**
  - **seção 12**, plano de revisão bíblica: trechos, referências, narrativas, perguntas por capítulo e perguntas gerais;
  - **seção 13**, estimativa para completar Gênesis e Êxodo.
- **Roteiro de teste físico:** continua pronto e sem alteração. O APK de diagnóstico está disponível até 01/12/2026, 15h39 (UTC).

## 1. Resumo (primeira versão deste planejamento)

- **Diretrizes registradas** num documento novo de planejamento, sem tocar em ROADMAP, README, CHANGELOG nem no índice de documentos (seção 8).
- **Kit de teste físico disponível e conferido:** o APK de diagnóstico vale até **01/12/2026**, e o roteiro, o analisador e o fluxo continuam na branch (seção 2).
- **Os 10 cenários do roteiro ainda não foram feitos** em nenhum aparelho. Faltam também quatro grupos de testes que o roteiro não cobre: compatibilidade com Android 7 a 9, acessibilidade, telas e persistência dos dados (seção 3).
- **Há 6 conflitos entre as diretrizes e o que existe hoje** (seção 5). Os principais:
  - **Êxodo não está completo:** cobre os capítulos 1 a 20 de 40;
  - o cadastro tem **8 personagens-base**, e o feminino tem estilo diferente;
  - a **personalização** (guarda-roupa e itens de recompensa) já faz parte do jogo e da progressão.
- **Os outros livros:** três opções, com o impacto de cada uma (seção 6).

## 2. Kit de teste físico: situação em 24/11/2026, 16h10 (UTC)

| Item | Onde | Situação |
|---|---|---|
| APK de diagnóstico `0.17.9-diagnostico` | artefato `bible-quest-0.17.9-diagnostico-NAO-DISTRIBUIR`, execução 45423371828 (https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45423371828/artifacts/14936504425) | **Disponível até 01/12/2026, 15h39 (UTC)**, 17,5 MB |
| Roteiro de teste | `docs/relatorios/ANDROID_TESTE_APARELHOS_FISICOS.md` e `.pdf` | disponível |
| Analisador do registro | `tools/android/diagnostico/analisar-logcat.cjs` | disponível; conferido de novo hoje com o registro do emulador (15 aberturas lidas) |
| Instrumentação e fluxo do build de diagnóstico | `tools/android/diagnostico/` e `.github/workflows/android-diagnostico.yml` | disponíveis; geram outro APK se for preciso, sem mudar o jogo |
| Referência do emulador | `docs/relatorios/evidencias/android-diagnostico-central/tabela-emulador.md` | disponível |

**Atenção ao prazo:** se os testes passarem de 01/12/2026, o APK precisa ser gerado de novo. É a mesma instrumentação, com mais 7 dias de validade, sem nenhuma mudança no jogo. Fazer isso depende da autorização de vocês.

## 3. Testes físicos que faltam e evidências a coletar

### 3.1 Roteiro principal (ainda não executado)

Nos **dois aparelhos** (entrada, com 2 a 3 GB, e intermediário, com 4 a 6 GB), os 10 cenários de `ANDROID_TESTE_APARELHOS_FISICOS.md`, seção 6:

| # | Cenário | Responde a |
|---|---|---|
| 1 | primeira abertura e criação do perfil | abertura até as boas-vindas; primeira Central |
| 2 e 3 | Central com internet (2 vezes) | abertura da Central, cena 3D pronta, resposta aos toques |
| 4 | toques durante a abertura, com internet | se os toques provocam o ANR |
| 5 e 6 | Central em modo avião (2 vezes) | funcionamento offline |
| 7 | toques durante a abertura, em modo avião | ANR sem internet |
| 8 | volta do segundo plano | travamento ao voltar |
| 9 e 10 | qualidade gráfica **2D**, com e sem toques | **separa o WebView da cena 3D** |

### 3.2 Testes complementares (fora do roteiro atual)

**APROVADO (A16): incluir estes quatro grupos no plano de testes.** Eles ficam descritos aqui, porque o roteiro oficial não foi alterado (A21). Devem ser feitos na mesma sessão dos cenários 1 a 10, antes do vencimento do APK (A15).

| Grupo | O que fazer | Evidência |
|---|---|---|
| **A. Compatibilidade** (decide a versão mínima) | **Num terceiro aparelho com Android 7, 8 ou 9**, se houver: instalar, abrir e jogar uma fase | se abre ou fica em tela branca; a versão do WebView (`adb shell dumpsys package com.google.android.webview \| grep versionName`); o texto "Em uso agora" em Configurações → Qualidade gráfica (mostra se o 3D está ativo ou se caiu no 2D); o registro do logcat |
| **B. Acessibilidade** | com o **TalkBack**: criar o perfil, chegar à Central e jogar uma fase. Com a **fonte e o tamanho de exibição do sistema no máximo**: percorrer boas-vindas, Central, uma fase, Biblioteca e Perfil. Ligar o **alto contraste** do jogo | capturas de textos cortados ou sobrepostos; anotar onde o TalkBack não lê ou não alcança um botão |
| **C. Telas** | no aparelho de entrada (normalmente tela menor) e, se houver, num **tablet** nas duas orientações. Alternar entre a navegação por **gestos** e por **3 botões** | capturas de cada tela com problema |
| **D. Persistência** | com o perfil criado: **reiniciar o celular**; **instalar o mesmo APK por cima** (`adb install -r`); conferir se o progresso continua. Em Perfil → **Exportar meus dados**: anotar se o arquivo é salvo e onde | se o progresso foi mantido; onde ficou o arquivo exportado |

### 3.3 Evidências por aparelho (lista de entrega)

1. `registro-entrada.txt` e `registro-intermediario.txt` (seção 5 do roteiro), com os **rótulos de cenário**.
2. Anotações da seção 7 do roteiro, incluindo o `TotalTime` de cada abertura.
3. Dados do aparelho: modelo, versão do Android, memória e versão do WebView.
4. Se as animações do sistema estavam ligadas ou desligadas.
5. Capturas de qualquer aviso "não está respondendo", tela branca, texto cortado ou cena 3D incompleta.
6. Resultado dos grupos A a D da seção 3.2 (quando for possível fazer).

## 4. Roteiro de análise dos resultados

1. **Conferir o registro:**
   - se tem as linhas `BQDiag` de `onCreate`, os marcos da página e os rótulos de cenário;
   - se faltar algo, anotar a lacuna antes de concluir.
2. **Gerar a tabela por aparelho:** `node tools/android/diagnostico/analisar-logcat.cjs registro-<aparelho>.txt "<aparelho>"`.
3. **Comparar com o emulador** e entre os aparelhos: abertura, Central visível, cena pronta, travamentos, ANR e toques.
4. **Separar as causas do ANR:**

   | Situação | Conclusão |
   |---|---|
   | O travamento acontece **no 2D também** (cenários 9 e 10), entre o início do processo e as boas-vindas ou a Central visível | **inicialização do WebView** |
   | O travamento **só acontece no 3D**, entre "Central visível" e "cena pronta" (cenários 2 a 7), e some no 2D | **criação da cena 3D** |
   | Aparece nos dois | as duas causas somadas; medir quanto cada uma acrescenta |

5. **Toques e ANR:**
   - cruzar o horário de cada ANR com os travamentos e os toques (cenários 4, 7 e 10);
   - anotar se o aviso só aparece quando há toque durante a abertura.
6. **Offline e segundo plano:** comparar os cenários 2 e 3 com o 5 e o 6, e analisar o 8.
7. **Compatibilidade, acessibilidade, telas e persistência:** consolidar os grupos A a D.
   - A versão mínima do Android só é **proposta** com base no aparelho mais antigo que funcionou.
8. **Relatório de diagnóstico físico,** com:
   - a tabela comparativa (entrada, intermediário e emulador);
   - o diagnóstico separado (WebView e cena 3D);
   - as possíveis soluções, com riscos e esforço.

   **Nenhuma implementação antes da aprovação de vocês.**

**Critérios de leitura (propostos, para vocês confirmarem):**
- **ANR confirmado:** linha `ANR in com.kzanntech.biblequest` ou o aviso visto na tela.
- **Travamento grave:** bloqueio de 5 s ou mais.
- **Meta de abertura da Central:** até cerca de 3 s no intermediário (a confirmar).

## 5. Conflitos entre as diretrizes e a implementação atual

| # | Diretriz | Como está hoje (evidência) | Impacto |
|---|---|---|---|
| 1 | **Dois personagens, com a mesma identidade artística e as mesmas proporções** | **8 personagens-base** (`src/data/character/bases.ts`): 4 masculinos e 4 femininos sobre dois corpos. O masculino é estilizado (`heroi-masculino.glb`, versão 0.8); o feminino é o realista da versão 0.7 (`heroi-feminino.glb`, MakeHuman). Na Central, o cabelo do feminino não aparece e o cajado atravessa o braço (`evidencias/auditoria-1.0/personagens-na-central.png`) | Será preciso um modelo feminino novo, que **ainda não deve começar**. Também será preciso reduzir a seleção a 2 e decidir o que fazer com os perfis que já usam as outras 6 bases (convertê-los para o corpo correspondente) |
| 2 | **Novas personalizações ficam para o futuro** | A **personalização já existe e faz parte do jogo**: <br>• guarda-roupa no cadastro (`/personagem/personalizar`) e depois (`/guarda-roupa`); <br>• itens de roupa como recompensa dos baús (`src/data/character/items.ts`, `Wardrobe.tsx`); <br>• cores de pele e de cabelo | Se "personalizações para o futuro" quer dizer **remover o que existe**, isso mexe com a progressão (os baús de recompensa entregam itens) e com o cadastro. Se quer dizer só **não criar novas**, não há conflito. **Precisa de confirmação** |
| 3 | **Gênesis e Êxodo completos** | **Êxodo:** 4 fases, cobrindo **só os capítulos 1 a 20** (`src/data/story/exodo.ts`). Ficam de fora os capítulos 21 a 40: as leis, o bezerro de ouro e o tabernáculo. <br>**Gênesis:** 20 fases, da criação ao reencontro de José. Alguns capítulos não aparecem nas referências: 20, 23, 24 (a esposa de Isaque), 26, 30, 31, 34, 36, 38, 48 e 49 | "Completo" pede **conteúdo novo** de Êxodo (e talvez de Gênesis), que é trabalho de conteúdo com revisão. **Precisa de definição** |
| 4 | **Gênesis e Êxodo revisados** | Os textos estão marcados "Em revisão contra a fonte" (`BIBLE_SOURCE_NOTE`), e **nenhuma das 197 perguntas tem `reviewed_by`**. Há também **34 perguntas gerais de outros livros** (Salmos, João…) no Modo Livre (`src/data/questions/geral.ts`) | A revisão precisa de um revisor e de um critério definidos. As perguntas gerais **também** precisam de revisão se continuarem na 1.0 |
| 5 | **Visual de Perfil, Quiz e História depois da 1.0** | Conquistas (0.17.8) e Biblioteca (0.17.9) já têm a paleta nova; Perfil, Quiz e História seguem no visual anterior. A 0.17.8 e a 0.17.9 **aguardam avaliação** e **não estão no `main`** | Não há conflito de funcionamento. Haverá **duas linguagens visuais** convivendo na 1.0. Falta decidir se a 0.17.8 e a 0.17.9 entram na 1.0 |
| 6 | **Não definir a versão mínima do Android antes dos testes** | O projeto já declara o **mínimo de API 24 (Android 7)** (`android/variables.gradle`). O pacote usa JavaScript ES2022 (`vite.config.ts`), e o Three.js 0.187 exige WebGL2 para o 3D | A API 24 é só o **valor atual**, e não uma decisão. Sem um aparelho com Android 7 a 9 no teste, a compatibilidade com ele continua desconhecida |

**Situação depois das decisões preliminares:**

| # | Conflito | Situação |
|---|---|---|
| 1 | Dois personagens | **Aprovado** (A3): mesmo padrão artístico e técnico. A implementação do feminino **não começa** ainda (A6). Falta decidir o que fazer com as outras 6 bases quando o feminino vier |
| 2 | Personalização | **Resolvido** (A4): guarda-roupa, roupas e baús mantidos, com a progressão atual |
| 3 | Gênesis e Êxodo completos | **Aprovado** (A9, A10): não são completos enquanto houver capítulo sem conteúdo. Estimativa na seção 13 |
| 4 | Revisão | **Aprovado** (A13): revisão humana de todos os trechos e perguntas. Plano na seção 12 |
| 5 | Visual de Perfil, Quiz e História | **Aprovado com condição** (A14). A 0.17.8 e a 0.17.9 continuam aguardando avaliação (A20) |
| 6 | Versão mínima do Android | **Aprovado** (A18): só depois dos testes |

**Sem conflito:**
- Central 3D preservada;
- sem monetização;
- multiplayer desativado no aplicativo (a demonstração continua só no site);
- leitura em voz alta oculta no aplicativo;
- sem sincronização;
- funcionamento offline;
- progresso local.

## 6. Os outros 64 livros: impacto de cada opção

**Hoje há conteúdo de outros livros em três lugares:**
- **Modo História:** os 64 livros aparecem como "em preparação" (`src/pages/story/BooksIndex.tsx`, cânon em `src/data/bible/canon.ts`);
- **Biblioteca:** a aba Livros tem um resumo de cada um dos 66 livros (`src/data/library/books.ts`). Personagens (35) e lugares (19) são só de Gênesis e Êxodo;
- **Modo Livre:** 34 perguntas gerais de vários livros (`src/data/questions/geral.ts`).

| Opção | O que muda para o jogador | Impacto técnico | Riscos |
|---|---|---|---|
| **A. Manter como está** (64 livros "em preparação") | Vê a Bíblia inteira como jornada futura e joga Gênesis e Êxodo | Nenhum | Expectativa de mais conteúdo. A página da loja precisa dizer claramente "começa por Gênesis e Êxodo". As 34 perguntas gerais precisam de revisão |
| **B. Ocultar só no Modo História** os livros sem fases (manter Biblioteca e Modo Livre) | O mapa de livros mostra só Gênesis e Êxodo; os resumos dos 66 livros continuam na Biblioteca | Pequeno: o filtro na lista de livros e os testes do índice de livros | Pode parecer que o jogo só tem dois livros. Precisa de um texto que explique que haverá mais. As perguntas gerais continuam (com revisão) |
| **C. Remover tudo** o que não é Gênesis e Êxodo | Só Gênesis e Êxodo em todo o jogo | **Maior:** <br>• Biblioteca (aba Livros); <br>• Modo Livre (34 perguntas a menos; o "Identifique o livro" perde sentido); <br>• testes de conteúdo e do cânon; <br>• conquistas e estatísticas que contam livros (verificar) | Perde conteúdo útil e já pronto. Voltar com ele exige o trabalho inverso. Mais risco de regressão |

**Recomendação para avaliação:** **A** ou **B**. As duas preservam o conteúdo existente e custam pouco. A escolha entre elas é de produto: mostrar a jornada inteira ou só o que é jogável. Nos dois casos, a revisão das 34 perguntas gerais precisa entrar no plano.

**Decisão de 24/11 (A11 e A12):**
- os 64 livros continuam na Biblioteca como conteúdo em preparação;
- as 34 perguntas gerais ficam (e entram na revisão).

**Falta confirmar (P8)** se os livros também continuam na lista do **Modo História** (opção A, como está hoje) ou se aparecem só na Biblioteca (opção B).

## 7. Decisões que dependem de vocês

**Atualização de 24/11:**
- os itens 2 (personalização), 3 (outros livros, com a ressalva P8) e 8 (testes A a D) foram decididos;
- o item 1 foi decidido em parte: "completo" exige todos os capítulos, e falta aprovar as fases sugeridas (P3).

A lista atualizada está em `docs/planos/VERSAO_1_0_DIRETRIZES.md`, seção 3 (P1 a P10). Abaixo, a lista original, para registro.

1. **"Êxodo completo":**
   - criar fases para os capítulos 21 a 40;
   - ou considerar completas as 4 fases atuais (capítulos 1 a 20);
   - e o mesmo critério para os capítulos de Gênesis que não aparecem.
2. **Personalização na 1.0:** manter o guarda-roupa e os itens de recompensa (só sem novidades) ou retirá-los. Ver o conflito 2.
3. **Os outros livros:** opção A, B ou C (seção 6).
4. **Revisão bíblica:**
   - quem revisa;
   - o critério de "revisado";
   - se as 34 perguntas gerais entram.
5. **Aparelhos:**
   - quais serão usados;
   - se haverá um terceiro com Android 7 a 9 (necessário para decidir a versão mínima);
   - se haverá um tablet.
6. **Versões 0.17.8 e 0.17.9:** avaliar e decidir se entram na 1.0, e qual será a branch de lançamento.
7. **Critérios de leitura dos testes** (seção 4): a meta de abertura e o que conta como travamento grave.
8. **Testes complementares A a D:** fazê-los já na mesma sessão? E incluí-los no roteiro oficial depois?
9. **Documentos oficiais:** quando atualizar o ROADMAP, o README, o CHANGELOG e o índice de documentos com estas diretrizes (seção 8).
10. **Prazo do APK de diagnóstico:** gerar de novo se os testes passarem de 01/12/2026.

## 8. Documentos oficiais não alterados

Por orientação desta etapa, **não atualizei** o `CHANGELOG.md`, o `README.md`, o `ROADMAP.md` nem o `docs/README.md` (índice de documentos).

A regra do projeto (`CLAUDE.md`) pede essa atualização a cada mudança. Ela fica **pendente da autorização de vocês**, junto com a inclusão destes dois documentos no índice.

## 9. Riscos

| Risco | Probabilidade | Efeito | Mitigação |
|---|---|---|---|
| ANR confirmado no aparelho de entrada | média (emulador: 5 de 15 aberturas) | a nota de qualidade na Google Play cai; usuários desistem | diagnóstico separado (WebView × 3D) antes de qualquer correção |
| Tela branca no Android 7 a 9 (JavaScript ES2022 e WebView antigo) | desconhecida | o aplicativo não abre nesses aparelhos | testar num aparelho antigo (grupo A); só então definir a versão mínima |
| APK de diagnóstico vencer antes dos testes | média | atraso de 1 dia | gerar de novo, com autorização |
| "Êxodo completo" exigir conteúdo novo | alta, se a definição for a Bíblia inteira | o cronograma da 1.0 cresce bastante | definir o escopo cedo (decisão 1) |
| Revisão bíblica sem revisor definido | média | não dá para tirar o aviso "em revisão" | definir revisor e critério (decisão 4) |
| Modelo feminino com o mesmo acabamento do masculino | média | atraso no visual da 1.0 | planejar depois dos testes, sem começar agora |
| Remover a personalização ou outros livros | baixa, se a escolha for A ou B | regressão e perda de conteúdo | não remover sem a análise da seção 6 |

## 10. Próximos passos (depois da avaliação de vocês)

1. Vocês fazem os testes físicos (seções 3.1 e 3.2, incluindo os grupos A a D) **antes de 01/12/2026, 15h39 (UTC)** e enviam as evidências (seção 3.3).
   - Em paralelo, se aprovarem, a revisão bíblica do conteúdo existente pode começar (seção 12).
2. Eu analiso pelo roteiro da seção 4 e entrego o diagnóstico físico com as possíveis soluções. Sem implementar.
3. Com as decisões da seção 7, monto o plano detalhado da 1.0 (conteúdo, personagens, estabilidade, privacidade e loja). Também sem implementar.

## 12. Plano de revisão bíblica (PROPOSTO: PR3)

### 12.1 O que será revisado (inventário de 24/11/2026)

| Lote | Conteúdo | Quantidade | Onde está |
|---|---|---|---|
| 1 | **Trechos citados** (Almeida Revista e Corrigida 1911, ortografia atualizada) | **37** (Gênesis 30, Êxodo 7) | campo `passages` das fases, em `src/data/story/genesis.ts` e `exodo.ts` |
| 1 | **Referências** das fases (incluindo as de outros livros, como Hebreus e Atos) | **75** (Gênesis 63, Êxodo 12) | campo `references` |
| 2 | **Textos das fases:** introdução, narrativa dramatizada (identificada como tal) e "o que aprender" | **24 fases** (Gênesis 20, Êxodo 4) | campos `intro`, `narrative` e `learning` |
| 3 | **Perguntas por capítulo** (ligadas às fases): enunciado, alternativas, resposta, explicação e referência | **161** (Gênesis 138, Êxodo 23) | `src/data/questions/` (criação, Noé, Abraão, José, Moisés, Gênesis extra e fases) |
| 4 | **Perguntas gerais** do Modo Livre (vários livros) | **36** (as 34 de `geral.ts` e mais 2 sem fase) | `src/data/questions/geral.ts` e outras |
| 5 | **Fases novas** (seção 13), quando forem escritas | cerca de 9 fases | a criar |
| 6 (proposto, opcional) | **Conteúdo de apoio:** <br>• Biblioteca (35 personagens, 19 lugares, resumos dos 66 livros); <br>• linha do tempo (23 marcos); <br>• contexto histórico | — | `src/data/library/` e `src/data/timeline.ts` |

As 197 perguntas já têm referência. Hoje nenhuma tem `reviewed_by`, e os trechos aparecem como "Em revisão contra a fonte".

### 12.2 Papéis

| Papel | Confere |
|---|---|
| **Revisor textual** | trecho idêntico ao exemplar da Almeida 1911 escolhido (P1); ortografia atualizada; referência (livro, capítulo, versículo); recorte sem mudar o sentido |
| **Revisor teológico** | fidelidade do enunciado, da resposta e da explicação ao texto bíblico; narrativa dramatizada sem atribuir falas aos personagens (regra do projeto) e marcada como dramatização; afirmações históricas debatidas indicadas como tal |
| **Revisor pedagógico** | linguagem adequada à faixa etária, que inclui crianças; dificuldade coerente; alternativas erradas plausíveis, mas não enganosas; nenhum detalhe impróprio |

Uma pessoa pode ter mais de um papel. O número de aprovações exigido por item é decisão de vocês (P1).

### 12.3 Como funciona

1. **Preparar as fichas de revisão.** Gero uma planilha por lote a partir dos dados do jogo, com:
   - identificador, tipo e texto atual;
   - referência, resposta e explicação;
   - decisão: aprovado, corrigir ou remover;
   - correção sugerida;
   - nome do revisor e data.

   Isso só será feito com autorização, porque cria arquivos novos.
2. **Revisores preenchem** cada lote. Nada é mudado no jogo durante a revisão.
3. **Aplicar as correções** aprovadas, numa versão de conteúdo, com autorização:
   - preencher `reviewed_by` (nome ou papel e data) em cada pergunta;
   - registrar a revisão de cada trecho e referência.
4. **Conferir:**
   - os testes de conteúdo passam;
   - todos os itens do lote estão revisados.
5. **Retirar o aviso "Em revisão contra a fonte"** só quando todos os trechos estiverem aprovados.

**Ordem sugerida:** lote 1, lote 3 (Gênesis e depois Êxodo), lote 2, lote 4. O lote 5 entra quando as fases novas existirem. O lote 6 é opcional.

### 12.4 Critério de "revisado"

**Um item está revisado quando:**
- tem as aprovações definidas em P1;
- não tem pendência aberta;
- a correção, se houve, foi aplicada e conferida.

**O conteúdo da 1.0 está revisado quando todos os itens dos lotes 1 a 5 estiverem revisados.**

### 12.5 Esforço estimado (revisão do conteúdo existente)

| Lote | Itens | Tempo por item (estimado) | Total por papel |
|---|---|---|---|
| 1. Trechos e referências | 37 + 75 | 3 min e 1 min | cerca de 3 h |
| 2. Textos das 24 fases | 24 | 15 min | cerca de 6 h |
| 3. Perguntas por capítulo | 161 | 4 min | cerca de 11 h |
| 4. Perguntas gerais | 36 | 5 min | cerca de 3 h |
| **Total** | | | **cerca de 23 h por papel** (46 a 70 h com 2 ou 3 papéis) |

**Do meu lado:**
- preparar as fichas: cerca de 0,5 a 1 dia;
- aplicar as correções e conferir: cerca de 1 a 2 dias, conforme o volume.

O lote 5 (fases novas) soma cerca de 1,5 h por fase e por papel.

## 13. Estimativa para completar Gênesis e Êxodo (PROPOSTO: PR1 e PR2)

### 13.1 Capítulos sem conteúdo hoje

Calculado pelas referências de cada fase, considerando os intervalos.

| Livro | Cobertos | Sem conteúdo |
|---|---|---|
| **Gênesis** (50 capítulos) | 39 | **11:** 20, 23, 24, 26, 30, 31, 34, 36, 38, 48 e 49 |
| **Êxodo** (40 capítulos) | 19 | **21:** 18 e de 21 a 40 |

### 13.2 Fases sugeridas (para aprovação; P3)

**Gênesis: 4 fases novas e 2 ampliações**

| Proposta | Capítulos | Observação |
|---|---|---|
| Nova: "Uma esposa para Isaque" | 23 e 24 | morte de Sara e a caverna de Macpela; Rebeca |
| Nova: "Abraão e Isaque em Gerar" | 20 e 26 | os dois episódios com Abimeleque; os poços de Isaque |
| Nova: "Jacó e Labão" | 30 e 31 | os filhos de Jacó; a saída da casa de Labão |
| Nova: "As bênçãos de Jacó" | 48 e 49 | Efraim e Manassés; a bênção das doze tribos |
| Ampliação de "Jacó e sua família" | 34 e 36 | **sensível** (34) e genealogia (36): resumo adequado à faixa etária (P2) |
| Ampliação de "José e seus irmãos" | 38 | **sensível**: resumo adequado à faixa etária (P2) |

**Êxodo: 5 fases novas e 1 ampliação**

| Proposta | Capítulos | Observação |
|---|---|---|
| Ampliação de "O mar e o monte Sinai" | 18 | Jetro e a escolha dos juízes |
| Nova: "As leis da aliança" | 21 a 24 | leis do dia a dia; a confirmação da aliança |
| Nova: "O tabernáculo e os sacerdotes" | 25 a 31 | as instruções do tabernáculo; Arão e os sacerdotes; o sábado |
| Nova: "O bezerro de ouro" | 32 | o pecado do povo e a intercessão de Moisés |
| Nova: "A glória de Deus e a nova aliança" | 33 e 34 | a presença de Deus; as novas tábuas |
| Nova: "A construção do tabernáculo" | 35 a 40 | Bezalel; a obra pronta e a nuvem da glória |

### 13.3 O que cada fase nova exige (mesmo padrão das 24 atuais)

| Parte | Esforço por fase |
|---|---|
| Introdução, narrativa dramatizada (identificada), "o que aprender", personagens e lugares | 0,5 dia |
| Trechos da Almeida 1911 (1 a 3, com referência, marcados para revisão) e referências | 0,25 dia |
| Perguntas (5 a 10; média atual de 7 por fase), com explicação e referência | 0,5 dia |
| Imagem da fase (obra em domínio público do Wikimedia Commons, com crédito em `src/data/images.ts`) | 0,25 dia |
| Integração: ordem da fase, Biblioteca (personagens e lugares novos, como Abimeleque, Labão, Efraim, Manassés e Bezalel), linha do tempo, conquistas que contam fases e testes | 0,25 a 0,5 dia |
| **Total por fase nova** | **1,75 a 2 dias** |
| **Ampliação** de uma fase existente (texto, referências e 1 a 3 perguntas) | 0,5 a 1 dia |

### 13.4 Totais estimados (produção, sem contar a revisão humana)

| Livro | Fases | Mapas e cenários | Conferência (testes e visual no Android) | **Total** |
|---|---|---|---|---|
| **Gênesis** | 4 × 1,75–2 = 7 a 8 dias, mais 2 ampliações = 1 a 2 dias | reorganizar o mapa ilustrado (hoje com 20 posições): 1 a 2 dias | 1 dia | **10 a 13 dias** |
| **Êxodo** | 5 × 1,75–2 = 9 a 10 dias, mais 1 ampliação = 0,5 a 1 dia | o mapa do Êxodo passa de 4 para 9 fases, talvez com nova região ilustrada: 2 a 3 dias | 1 a 2 dias | **12 a 16 dias** |
| **Gênesis e Êxodo** | | | | **cerca de 22 a 29 dias de trabalho** |

**Revisão humana das fases novas** (lote 5): cerca de 9 fases × 1,5 h por papel, ou seja, cerca de 14 h por papel.

**Fatores de incerteza:**
- as decisões sobre os capítulos sensíveis e as genealogias (P2);
- encontrar no Commons uma imagem em domínio público adequada para cada fase;
- o redesenho dos mapas;
- o tempo dos revisores.

A estimativa é feita **sem começar** a produção. A ordem proposta (PR4) coloca o conteúdo depois do diagnóstico físico, e a revisão do conteúdo existente pode correr em paralelo.

## 14. Arquivos desta etapa

**Arquivos desta etapa** (os mesmos dois documentos, atualizados em 24/11, mais o PDF deste relatório):
- `docs/planos/VERSAO_1_0_DIRETRIZES.md`: decisões aprovadas, propostas e pendências;
- `docs/relatorios/PLANEJAMENTO_1_0_TESTES_FISICOS.md` e `.pdf`: este relatório, com as seções 0, 12 e 13 novas.

**Nenhum outro arquivo foi criado ou alterado:**
- o roteiro de teste físico está igual;
- os documentos oficiais estão iguais;
- o código está igual.
