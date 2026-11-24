# Bible Quest — Proposta PR7: livros parciais não aparecem como concluídos

**Data:** 24/11/2026. **Atualizado no mesmo dia** com as decisões D1 a D5 aprovadas e, depois, com as duas regras pendentes aprovadas (conclusão dos capítulos e aviso de novas fases). **O planejamento da PR7 está concluído.**
**Branch consultada:** `claude/bible-quest-android` (commits `4b8af34` e `6354aed`).
**Situação:** **decisões aprovadas e incluídas no escopo da 1.0** (A31 a A36 em `docs/planos/VERSAO_1_0_DIRETRIZES.md`). **A implementação não está autorizada**: será feita no momento adequado, depois dos testes físicos e do diagnóstico do ANR. Nada foi implementado e nenhum código foi alterado.

**Princípio aprovado:** um livro disponível só em parte não pode ser apresentado como integralmente concluído.

**Por que Gênesis e Êxodo são "parciais" hoje:**
- Gênesis tem 39 de 50 capítulos com conteúdo;
- Êxodo tem 19 de 40.

Os outros 64 livros já aparecem como "Em preparação" e não abrem.

## 0. Decisões aprovadas (24/11/2026) e o que elas exigem na implementação

| Decisão | O que foi aprovado | O que a implementação precisará fazer (registro de planejamento; nada foi feito) |
|---|---|---|
| **D1, medalhas** (A32) | **Preservar a maior medalha já conquistada.** Fases novas não retiram medalhas. O jogador pode melhorar a medalha depois. Todo o histórico e o progresso ficam preservados | **Gravar a melhor medalha de cada livro** no salvamento, com um campo novo; hoje a medalha é calculada. A migração **só acrescenta**: na primeira abertura da versão nova, a medalha atual de quem já terminou o livro é gravada. Nenhum dado é apagado. A medalha exibida é a maior entre a gravada e a calculada |
| **D2, novas fases** (A33 e **regra A38**) | Indicação **dentro do jogo**, **discreta e clara**, sem notificações insistentes. **Regra aprovada:** <br>• selo **"Novas fases" só na lista de livros**; <br>• **nenhum aviso no painel de missões da Central**; <br>• o selo some quando o jogador **abre o livro** e vê as fases novas; <br>• o selo **reaparece** sempre que outras fases forem adicionadas, até serem vistas | Guardar **quais fases de cada livro o jogador já viu**, com um campo novo no salvamento que **só acrescenta**. O selo aparece na lista de livros quando o livro tem fase que o jogador ainda não viu. Ao abrir a página do livro, as fases atuais passam a contar como vistas |
| **D3, porcentagens** (A34) | Jornada: **todos os capítulos da Bíblia** (1.189). Testamento: todos os capítulos dele (Antigo 929, Novo 260). Capítulos não disponíveis **não contam**. A página do livro separa as **fases disponíveis concluídas** dos **capítulos em preparação** | Registrar nos dados de cada livro **quais capítulos têm fases** e **quais fases cobrem cada capítulo** (hoje: Gênesis 39 de 50, Êxodo 19 de 40, os outros 0). Passar a calcular as porcentagens por capítulos. **Regra aprovada (A37):** <br>• um capítulo conta como concluído **só quando todas as fases relacionadas a ele** estiverem concluídas; <br>• se houver várias fases no capítulo, todas são exigidas; <br>• uma fase que abrange vários capítulos conta para todos eles; <br>• conteúdo concluído só em parte **não conta**; <br>• dados e histórico preservados. A página do livro mostra, por exemplo, **"Fases disponíveis: 20 de 20 concluídas"** e **"Capítulos: 39 de 50 com fases; 11 em preparação"** |
| **D4, etiqueta** (A35) | **"Fases em dia"** (curta); **"Fases disponíveis concluídas"** onde couber | Etiqueta da lista de livros: **"Fases em dia"**. Página do livro, Perfil e Biblioteca: **"Fases disponíveis concluídas"**. O texto do leitor de tela usa sempre a forma longa |
| **D5, versão** (A36) | **No escopo da 1.0.** Implementar no momento adequado | Entra no plano como **etapa 6**. Só começa com autorização, depois das etapas 1 e 2 (testes físicos e diagnóstico do ANR) |

**Efeito da D3 nos números (estimativa com o conteúdo atual):** quem concluiu todas as 24 fases verá cerca de **4,9% da jornada** (58 de 1.189 capítulos) e cerca de **6,2% do Antigo Testamento** (58 de 929). Hoje esses números são calculados por livro e dão cerca de 3% e 5%. O número novo é maior e reflete o conteúdo real.

## 1. Onde o jogo mostra "concluído" para um livro (ou algo equivalente)

| # | Onde | Arquivo e linha | O que mostra hoje ao terminar todas as fases de Gênesis | Problema? |
|---|---|---|---|---|
| 1 | **Etiqueta de status do livro** na lista de livros do Modo História | `src/pages/story/BooksIndex.tsx`, linhas 78–103; regra em `src/services/game/progression.ts`, linha 49 (`if (c.done === c.total) return 'concluido'`) | **"Concluído"**, com ícone de verificado, também no texto lido pelo leitor de tela (`aria-label`) | **sim** |
| 2 | **Etiqueta de status na página do livro** | `src/pages/story/BookPage.tsx`, linhas 19 e 36 | **"Concluído"** | **sim** |
| 3 | **Mensagem no resultado** da última fase do livro | `src/pages/Result.tsx`, linhas 33 e 101 | **"Você concluiu o livro de Gênesis!"** | **sim** |
| 4 | **Medalha do livro** (ouro, prata ou bronze), dada ao terminar todas as fases | `progression.ts`, `bookMedal`, linhas 89–96; aparece em `BooksIndex.tsx` (80), `BookPage.tsx` (21), `Achievements.tsx` (33) e `Profile.tsx` (137) | medalha "do livro" | **sim**, porque sugere o livro inteiro |
| 5 | **Porcentagem do livro** na Biblioteca (lista e ficha) | `src/pages/library/Library.tsx` (100) e `LibraryDetail.tsx` (134) | **"100%"** | **sim**, porque parece o livro inteiro |
| 6 | **Progresso do livro no Perfil** | `src/pages/Profile.tsx`, linhas 136–145 | "20/20 experiências · 100% · 60/60 estrelas" | **sim**, pelo "100%" |
| 7 | **Porcentagem do Testamento e da jornada** | `BooksIndex.tsx` (66, "% concluído") e `Profile.tsx` (130–132) | cada livro conta pela proporção de fases feitas: Gênesis vale 100% | **menor:** o número cresce mais do que deveria |
| 8 | **Conquista "Conhecedor das Escrituras"** | `src/data/achievements.ts`, linha 34 | "Conclua 2 livros completos (Gênesis e Êxodo, nesta versão)." | **sim** |
| 9 | **Conquistas "Explorador de Gênesis" e "Caminho no mar"** | `achievements.ts`, linhas 32 e 33 | "Conclua todas as experiências de Gênesis / de Êxodo." | **não** (fala das experiências que existem); ajuste opcional, para manter a padronização |
| 10 | **Roupas "Túnica com barra bordada" e "Manto com bordas douradas"** | `src/data/character/items.ts` (74 e 84); requisito em `src/services/game/items.ts`, linhas 52–53 (`requirementLabel`) | "Barra dourada para quem completou Gênesis." / "Para quem completou Êxodo." / "Conclua o livro de Gênesis" | **sim** |
| 11 | **Missão "Continuar jornada"** e botão da Central quando tudo está feito | `src/pages/Dashboard.tsx` (84) e `src/components/camp/AcoesAcampamento.tsx` (43–46) | "Todas as fases publicadas concluídas" | **não**, porque já fala das fases publicadas. Só padronizar o termo |
| 12 | **Resumo da lista de livros** | `BooksIndex.tsx`, linha 48 | "experiências disponíveis concluídas" | **não**: é o modelo de texto que seguimos |

**Não tratam de livros e continuam como estão:**
- "Concluída" na fase (`ExperiencePage.tsx`, 57);
- desafios do Quiz concluídos (`quizMap.ts`);
- "Fase concluída!", "Revisão concluída" e "Desafio diário concluído" (`Result.tsx`).

## 2. Proposta de textos

**Termo padrão:** **"fases disponíveis"**, que hoje convive com "experiências disponíveis" e "fases publicadas". Para livros ainda incompletos, sempre indicar que **há capítulos em preparação**.

| # | Onde | Hoje | Proposta |
|---|---|---|---|
| 1 e 2 | Status do livro (lista e página) | **Concluído** | **Aprovado (D4):** etiqueta curta **"Fases em dia"** na lista; **"Fases disponíveis concluídas"** na página do livro e onde couber. Explicação: "todas as fases disponíveis concluídas; mais capítulos em preparação". O ícone passa a ser o de relógio ou de pergaminho, e não o de "verificado" |
| 1 e 2 | Status de um livro **realmente completo** (no futuro) | Concluído | **Concluído** (sem mudança; só para livros com todos os capítulos) |
| 2 | Página do livro (linha nova, só em livro parcial) | — | **"Livro em preparação: 39 de 50 capítulos disponíveis. Novas fases chegarão em atualizações."** |
| 3 | Resultado da última fase disponível | Você concluiu o livro de Gênesis! | **Você concluiu todas as fases disponíveis de Gênesis! Novos capítulos estão em preparação.** |
| 4 | Medalha | medalha do livro | **Medalha das fases disponíveis.** Na legenda e no texto do leitor de tela: "Medalha de ouro nas fases disponíveis de Gênesis" |
| 5 | Biblioteca (lista e ficha do livro) | 100% | **"20 de 20 fases disponíveis"**. Na ficha, a linha extra: "39 de 50 capítulos com fases" |
| 6 | Perfil | 20/20 experiências · 100% · 60/60 estrelas | **20/20 fases disponíveis · 60/60 estrelas · livro em preparação (39 de 50 capítulos)** |
| 7 | Testamento e jornada | X% concluído | **Aprovado (D3):** calcular pelos capítulos (Bíblia inteira: 1.189; Antigo Testamento: 929; Novo Testamento: 260). Capítulos não disponíveis não contam. Texto: **"X% da jornada percorrida"** |
| 8 | Conquista "Conhecedor das Escrituras" | Conclua 2 livros completos (Gênesis e Êxodo, nesta versão). | **Conclua todas as fases disponíveis de Gênesis e de Êxodo.** O título não muda, e o identificador `conhecedor` também não |
| 9 | "Explorador de Gênesis" / "Caminho no mar" | Conclua todas as experiências de Gênesis / Êxodo. | **Conclua todas as fases disponíveis de Gênesis / de Êxodo.** (padronização) |
| 10 | Roupas de livro | Barra dourada para quem completou Gênesis. / Para quem completou Êxodo. / requisito "Conclua o livro de Gênesis" | **Barra dourada para quem concluiu as fases disponíveis de Gênesis.** / **Para quem concluiu as fases disponíveis de Êxodo.** / requisito **"Conclua as fases disponíveis de Gênesis"** |
| 11 | Central e missões | Todas as fases publicadas concluídas | **Todas as fases disponíveis concluídas** (padronização) |

**Como o jogo saberia se um livro está completo:** acrescentar aos dados de cada livro uma informação explícita de completude. Por exemplo, os capítulos com fases ou um sinal "livro completo". Assim:
- Gênesis e Êxodo ficam como **parciais** até as fases novas (A10);
- os 64 livros continuam "Em preparação";
- um livro só mostra **"Concluído"** quando tiver todos os capítulos.

Os números (39 de 50 e 19 de 40) já foram calculados pelas referências das fases (planejamento, seção 13). Eles teriam de ser mantidos nos dados e conferidos por um teste.

## 3. Impacto sobre recompensas, conquistas e progresso salvo

### 3.1 O que fica gravado e o que é calculado na hora

| Dado | Como funciona hoje | Efeito da PR7 (só textos e regra de status) |
|---|---|---|
| Fases concluídas, estrelas e melhor resultado (`progress.experiences`) | gravado | **nenhum** |
| XP, nível, sequência, desafio diário, histórico e estatísticas | gravado | **nenhum** |
| **Conquistas** (`progress.achievements`, com a data) | gravadas **uma vez** e **nunca retiradas** (`engine.ts`, 165–166: só acrescenta) | **nenhum**: quem já tem "Explorador de Gênesis", "Caminho no mar" ou "Conhecedor das Escrituras" continua com elas. Os identificadores não mudam |
| **Roupas liberadas** (`progress.items.unlocked`, com a data) | gravadas quando o requisito é cumprido (`syncUnlockedItems`, depois de cada partida e ao abrir baús); `isItemUnlocked` também aceita o que já está gravado | **nenhum**: a túnica bordada e o manto dourado continuam de quem já os ganhou |
| **Baús** (`progress.chests`) | gravados | **nenhum** |
| **Elementos do acampamento** | calculados por nível, **quantidade** de fases, quantidade de conquistas e quantidade de baús | **nenhum**: não dependem de livro concluído |
| **Status do livro, porcentagens e medalhas** | **calculados na hora** a partir das fases | **só a apresentação muda**: nada é gravado nem apagado |

**Conclusão:** a PR7, como proposta, **não muda nem apaga nenhum dado salvo** e **não precisa de migração**. Ela troca textos e a regra que decide quando mostrar "Concluído".

### 3.2 Efeito futuro, quando entrarem as fases novas (A10, sem relação direta com a PR7)

| Situação | O que acontece hoje (sem a PR7) | Proposta para avaliação |
|---|---|---|
| Quem tinha terminado Gênesis verá o livro voltar a "em andamento" | acontece | **Aprovado (D2):** selo discreto "Novas fases" no livro, explicando a mudança |
| **Medalha do livro** (calculada) **some** até terminar as fases novas | **acontece**: o jogador "perde" algo visível | **Aprovado (D1):** a maior medalha já obtida fica gravada e continua visível; o jogador pode melhorá-la. Acrescenta um campo ao salvamento, com migração que só acrescenta, e testes (T11 e T12) |
| Conquistas de livro já ganhas | continuam (nunca são retiradas) | sem mudança |
| Quem ainda **não** ganhou a conquista "Conhecedor" precisará terminar também as fases novas | acontece | esperado; o texto "fases disponíveis" deixa isso claro |
| Roupas de livro já ganhas | continuam (gravadas) | sem mudança |

## 4. Testes para garantir que nenhum jogador perca progresso

**Testes automáticos (Vitest)**, feitos antes e junto com a implementação:

| # | Teste | Garante |
|---|---|---|
| T1 | **Salvamentos de exemplo** (fixtures) de vários jogadores: <br>• novo; <br>• Gênesis pela metade; <br>• Gênesis e Êxodo completos com as três conquistas de livro, as duas roupas e as medalhas; <br>• salvamento em formato antigo (`migrateProgress`) | base para os testes seguintes |
| T2 | Carregar cada exemplo, abrir as telas afetadas e **comparar o salvamento antes e depois** (igualdade completa): fases, estrelas, XP, conquistas com as datas, roupas com as datas, baús, sequência, desafio diário e histórico | **nada é alterado nem apagado** |
| T3 | `bookStatus` de um livro parcial com todas as fases feitas **nunca** devolve "concluído"; um livro marcado como completo devolve "concluído"; os 64 em preparação continuam "em preparação" e sem acesso | a regra nova |
| T4 | Nenhuma tela mostra "Concluído" ou "concluiu o livro" para um livro parcial: lista de livros, página do livro, resultado da última fase, Biblioteca (lista e ficha), Perfil, Conquistas, incluindo o texto do leitor de tela | os textos (seção 1) |
| T5 | As conquistas `genesis`, `exodo` e `conhecedor` **continuam com o mesmo identificador**, e as já gravadas continuam presentes depois de carregar | conquistas |
| T6 | As roupas `tunica-bordada` e `manto-dourado` continuam liberadas para quem as tem gravadas, mesmo que o requisito deixe de valer | recompensas |
| T7 | **Simulação de conteúdo futuro:** com uma fase de teste a mais em Gênesis, as conquistas e roupas gravadas continuam; os baús continuam; "Continuar" aponta para a fase nova; o acampamento não perde elementos; e a medalha se comporta como decidido em D1 | atualizações futuras |
| T8 | Os testes atuais (213) continuam passando; os que conferem os textos antigos são atualizados para os novos | sem regressão |

**Testes acrescentados pelas decisões aprovadas:**

| # | Teste | Garante |
|---|---|---|
| T11 | **D1, migração da medalha:** salvamentos de exemplo com Gênesis e Êxodo completos (ouro, prata e bronze) gravam a medalha atual na primeira abertura; **nenhum outro campo muda** (comparação completa como em T2) | a medalha não se perde |
| T12 | **D1, fases novas:** com uma fase de teste a mais, a medalha gravada **continua visível**; ao concluir a fase nova com desempenho melhor, a medalha **sobe**; com desempenho pior, **não desce** | regra da maior medalha |
| T13 | **D2, aviso (regra A38):** com uma fase de teste a mais, o selo "Novas fases" aparece **na lista de livros**; **some depois de abrir o livro**; **reaparece** quando uma segunda fase de teste é acrescentada; **não aparece** no painel de missões da Central; nenhuma janela se abre sozinha | discrição do aviso |
| T16 | **D3, regra de conclusão dos capítulos (A37):** <br>• um capítulo coberto por duas fases não conta com só uma delas concluída e conta com as duas; <br>• uma fase que abrange vários capítulos (por exemplo, "Êxodo 5–11") conta para todos eles ao ser concluída; <br>• uma fase que cita só parte do capítulo (por exemplo, "Gênesis 1:26–31") se relaciona ao capítulo inteiro; <br>• os capítulos sem fases nunca contam | a regra aprovada |
| T14 | **D3, porcentagens:** a jornada e os Testamentos calculados por capítulos (1.189, 929 e 260); um capítulo sem fases **nunca** conta; um livro com todas as fases feitas e capítulos em preparação **não chega a 100%**; a página do livro mostra os dois números separados | regra das porcentagens |
| T15 | **D4, etiqueta:** a lista mostra "Fases em dia", e as telas com espaço mostram "Fases disponíveis concluídas"; o leitor de tela recebe a forma longa | os textos |

**Conferência no Android** (emulador e aparelho):
- **T9:** exportar os dados (Perfil → Exportar) antes e depois de instalar a versão nova por cima, e comparar os dois arquivos. Eles devem ser iguais, exceto pela data da exportação.
- **T10:** capturas das telas da seção 1 com um perfil que tenha Gênesis completo.

**Efeito no site:** a PR7 muda textos do jogo. O site deixa de ser idêntico à 0.17.9 (o que é esperado) e passa a ser conferido pelos testes T4 e T8.

## 5. Decisões (ver a seção 0)

**As duas regras pendentes também foram aprovadas (A37 e A38):**
- conclusão do capítulo só com todas as fases relacionadas concluídas;
- selo "Novas fases" só na lista de livros, sem aviso na Central, reaparecendo a cada inclusão de fases novas.

**Todas as decisões abaixo foram aprovadas em 24/11/2026:**
- D1: gravar a maior medalha;
- D2: selo discreto;
- D3: porcentagens por capítulos;
- D4: "Fases em dia" e "Fases disponíveis concluídas";
- D5: no escopo da 1.0, implementação no momento adequado.

A redação original fica abaixo, para registro.

- **D1. Medalha quando entrarem fases novas:**
  - (a) some até o jogador completar de novo, com aviso;
  - (b) é gravada e mostra a maior já obtida (recomendado).
- **D2. Aviso de "novas fases disponíveis"** quando um livro ganhar conteúdo novo: sim ou não. Se sim, onde: na lista de livros e na Central.
- **D3. Porcentagem do Testamento e da jornada:**
  - manter o cálculo por fases, só mudando o texto;
  - ou calcular pelos capítulos com fases.
- **D4. Texto curto da etiqueta:** "Fases disponíveis concluídas" ou "Em dia".
- **D5. Em que versão entra:** proposta de uma versão própria e pequena, depois do diagnóstico físico (etapa 6 do planejamento).

Nenhuma mudança será feita antes da avaliação desta proposta.
