# Bible Quest — Diretrizes da versão 1.0 (Android): versão consolidada

**Registros:**
- primeiro registro em 24/11/2026;
- atualizado em 24/11/2026 com as "Decisões preliminares";
- **consolidado em 24/11/2026** com os "Ajustes finais do planejamento" (avaliação do commit `a4dd3f2`);
- **atualizado em 24/11/2026** com a "Aprovação da direção e próximas providências" (avaliação do commit `4b8af34`);
- **atualizado em 24/11/2026** com a "Avaliação e aprovação das decisões da PR7" (D1 a D5, avaliação do commit `6354aed`);
- **atualizado em 24/11/2026** com a "Conclusão das duas regras pendentes da PR7" (avaliação do commit `e4b6083`).

**Situação:** documento de planejamento. **Não altera** os documentos oficiais (ROADMAP, README, CHANGELOG, índice de documentos).

**Documentos relacionados:**
- planejamento detalhado: `docs/relatorios/PLANEJAMENTO_1_0_TESTES_FISICOS.md` (etapas, revisão bíblica, estimativas, personagem feminino);
- auditoria: `docs/relatorios/AUDITORIA_PRONTIDAO_1_0.md`;
- roteiro de teste físico: `docs/relatorios/ANDROID_TESTE_APARELHOS_FISICOS.md`.

**Categorias:**

| Categoria | Significado |
|---|---|
| **APROVADO** | decidido por vocês |
| **PROPOSTO** | sugestão minha, aguardando avaliação |
| **PENDENTE** | depende de uma decisão de vocês |

## 1. Decisões APROVADAS

### 1.1 Direção do lançamento e personagens

| # | Decisão |
|---|---|
| A1 | Versão 1.0 **enxuta, bonita, estável e bem testada** |
| A2 | **Preservar a Central 3D** |
| A3 | **Dois personagens selecionáveis** (masculino e feminino), com **o mesmo padrão artístico e técnico** |
| A4 | **Manter a personalização existente:** guarda-roupa, roupas e baús, **preservando a progressão atual** |
| A5 | **Não criar** novos personagens nem novos sistemas de personalização nesta etapa |
| A6 | **Não iniciar a implementação do personagem feminino** sem autorização |
| A28 | **A reformulação do personagem feminino é requisito OBRIGATÓRIO da versão 1.0**, com todos os critérios visuais e técnicos registrados (C1 a C11 e avaliação visual, no planejamento, seções 15.3 e 15.4). A produção **não começa** sem autorização (A6) |
| A23 | **Incluir no plano uma etapa de reformulação do personagem feminino.** Objetivo: qualidade visual equivalente à do masculino, com o mesmo estilo, as mesmas proporções e o mesmo acabamento, corrigindo o cabelo, os acessórios e o posicionamento. Tem critérios de aceitação e avaliação visual (planejamento, seção 15) |

### 1.1.1 Direção e prioridade

| # | Decisão |
|---|---|
| A29 | **A direção do planejamento consolidado (`4b8af34`) está aprovada como base da versão 1.0** |
| A30 | **Prioridade imediata:** executar os testes físicos e diagnosticar o ANR (etapas 1 e 2 do planejamento) |

### 1.2 Funcionalidades fora da 1.0

| # | Decisão |
|---|---|
| A7 | Sem monetização: anúncios, compras internas e assinatura Premium ficam para o futuro |
| A8 | Multiplayer online, sincronização na nuvem e leitura em voz alta nativa ficam para atualizações |

### 1.3 Conteúdo

| # | Decisão |
|---|---|
| A9 | **Gênesis e Êxodo não são completos** enquanto houver capítulos sem conteúdo |
| A10 | **Planejar** a conclusão dos capítulos ausentes (estimativa no planejamento, seção 13) |
| A25 | **Não iniciar a produção** das fases novas de Gênesis e Êxodo |
| A11 | **Manter os outros 64 livros** como "Em preparação" **na Biblioteca e também no Modo História** |
| A31 | **Princípio da PR7 aprovado:** um livro disponível só em parte **não pode ser apresentado como integralmente concluído**. A **implementação não está autorizada**. Antes dela, a proposta detalhada precisa ser avaliada: locais, textos, impacto e testes (`docs/relatorios/PROPOSTA_PR7_LIVROS_PARCIAIS.md`) |
| A32 | **PR7 · D1, preservação de medalhas:** <br>• preservar a **maior medalha já conquistada** pelo jogador; <br>• a inclusão de fases novas **não retira** medalhas já conquistadas; <br>• o jogador pode **melhorar** a medalha depois de concluir as fases novas, conforme o desempenho; <br>• preservar todo o histórico e o progresso existente |
| A33 | **PR7 · D2, novas fases:** indicar **dentro do jogo**, de maneira **discreta e clara**, quando um livro receber fases novas. **Sem notificações insistentes** |
| A34 | **PR7 · D3, porcentagens:** <br>• a porcentagem geral da jornada considera **todos os capítulos da Bíblia**; <br>• a de cada Testamento considera **todos os capítulos daquele Testamento**; <br>• capítulos ainda não disponíveis **não contam como concluídos**; <br>• na página de cada livro, **diferenciar claramente** as fases disponíveis concluídas dos capítulos em preparação; <br>• **não confundir** a conclusão do conteúdo publicado com a conclusão do livro inteiro |
| A35 | **PR7 · D4, etiqueta:** etiqueta curta **"Fases em dia"**; **"Fases disponíveis concluídas"** onde houver espaço suficiente |
| A36 | **PR7 · D5, versão:** a PR7 faz parte do **escopo da versão 1.0**. A implementação será feita **no momento adequado**, depois da prioridade atual (testes físicos e diagnóstico do ANR). **Não está autorizada agora** |
| A37 | **PR7, regra de conclusão dos capítulos:** <br>• um capítulo só conta como concluído quando **todas as fases relacionadas a ele** estiverem concluídas; <br>• se o capítulo tiver **mais de uma fase**, **todas** precisam estar concluídas; <br>• se **uma fase abranger vários capítulos**, sua conclusão **conta para todos eles**; <br>• **nenhum capítulo** conta como concluído porque **só parte** do seu conteúdo foi concluída; <br>• os dados e o histórico existentes são preservados |
| A38 | **PR7, aviso de novas fases:** <br>• selo discreto **"Novas fases" só na lista de livros**; <br>• **nenhum aviso no painel de missões da Central**; <br>• o selo **some quando o jogador abre o livro** e vê as fases novas; <br>• quando outras fases forem adicionadas no futuro, o selo **reaparece** até que sejam vistas. Substitui a parte de "linha na página do livro" e "painel de missões" da proposta inicial de D2 |
| A26 | **Nenhum conteúdo incompleto deve aparecer ou dar acesso como se estivesse concluído.** Os livros em preparação continuam sem acesso a fases. Ver o conflito novo sobre "Concluído" na seção 4 e a pendência P11 |
| A12 | **Preservar as perguntas gerais do Modo Livre.** São as 34 de `geral.ts`. As 2 perguntas temáticas sem fase (`cr-05` e `jo-16`) também continuam no jogo (planejamento, seção 16) |
| A13 e A24 | **Revisão humana obrigatória** de todos os trechos bíblicos, referências e perguntas. O conteúdo **só é considerado revisado** depois das revisões **textual, teológica e pedagógica** |

### 1.4 Telas

| # | Decisão |
|---|---|
| A14 | As melhorias visuais de **Perfil, Quiz e História** podem ficar para depois da 1.0, desde que não prejudiquem a experiência nem o funcionamento |

### 1.5 Testes físicos

| # | Decisão |
|---|---|
| A15 | **Prioridade:** testes em aparelhos reais **antes do vencimento do APK de diagnóstico**, em 01/12/2026 às 15h39 (UTC) |
| A16 | **Incluir os grupos complementares** A (compatibilidade), B (acessibilidade), C (telas) e D (persistência) |
| A17 | **ANR:** separar a inicialização do WebView da criação da Central 3D. **Não alterar o código** para ANR ou compatibilidade **antes da análise das evidências** |
| A18 | **Não definir a versão mínima do Android** antes dos resultados |

### 1.6 Branches, documentação e lançamento

| # | Decisão |
|---|---|
| A19 | **Não integrar branches nem modificar o `main`** |
| A20 | **Branch de lançamento em aberto** até a avaliação das versões 0.17.8, 0.17.9 e Android |
| A21 | **Não atualizar documentos oficiais** por enquanto |
| A22 | **Não gerar AAB, não publicar** e não iniciar procedimentos de lançamento |
| A27 | **Não alterar código** nesta fase de planejamento. Toda implementação depende de autorização |

## 2. PROPOSTAS (aguardando avaliação)

| # | Proposta | Onde |
|---|---|---|
| PR1 | **Livro "completo":** todo capítulo coberto por pelo menos uma fase (que pode reunir capítulos vizinhos). Genealogias e capítulos sensíveis entram com resumo adequado à faixa etária | planejamento, seção 13 |
| PR2 | **Fases novas:** Gênesis com 4 novas e 2 ampliações; Êxodo com 5 novas e 1 ampliação (produção **não iniciada**, A25) | planejamento, seção 13 |
| PR3 | **Revisão bíblica** em lotes, com fichas e registro por item | planejamento, seção 12 |
| PR4 | **Ordem das etapas da 1.0** | planejamento, seção 0 |
| PR5 | **Critérios de leitura dos testes:** <br>• ANR confirmado: `ANR in` no registro ou o aviso visto na tela; <br>• travamento grave: 5 s ou mais; <br>• Central visível em até cerca de 3 s no aparelho intermediário | planejamento, seção 4 |
| PR6 | **APK vencido:** gerar de novo o APK de diagnóstico se os testes passarem de 01/12/2026 | planejamento, seção 2 |
| PR7 (**aprovada**: A31 a A36) | **Livro parcial terminado:** quando o jogador terminar todas as fases disponíveis, mostrar algo como **"Fases disponíveis concluídas, mais capítulos em preparação"** em vez de "Concluído". O texto das conquistas de livro também deve deixar de falar em "livros completos" | seção 4 deste documento; P11 |
| PR8 | **Classificar `cr-05` e `jo-16` no lote 4** da revisão (perguntas do Modo Livre), junto com as 34 gerais | planejamento, seção 16 |
| PR9 | **Escopo, critérios e esforço da reformulação do personagem feminino** | planejamento, seção 15 |

## 3. PENDÊNCIAS (dependem de vocês)

| # | Pendência |
|---|---|
| P1 | **Revisão bíblica:** <br>• quem faz cada papel (textual, teológico, pedagógico); <br>• qual exemplar da Almeida 1911 é a fonte; <br>• quantas aprovações por item; <br>• quando começa (pode correr em paralelo com os testes) |
| P2 | **Capítulos sensíveis e genealogias** (Gênesis 34, 36 e 38): como tratar para um público que inclui crianças |
| P3 | **Fases novas:** aprovar a lista e a divisão por capítulos (PR1 e PR2). A produção continua **não iniciada** (A25) |
| P4 | **Aparelhos de teste:** quais modelos; se haverá um terceiro com Android 7 a 9 (grupo A) e um tablet (grupo C) |
| P5 | **Critérios de leitura dos testes** (PR5) |
| P6 | **Versões 0.17.8 e 0.17.9 e branch de lançamento:** quando avaliar |
| P7 | **Documentos oficiais:** quando atualizar CHANGELOG, README, ROADMAP e o índice com estas diretrizes |
| P9 | **Personagem feminino:** <br>• quando começar a etapa (depois dos testes físicos?); <br>• com que origem: o mesmo pipeline do masculino (imagem de referência gerada por IA e malha pelo TRELLIS.2, com licenças registradas) ou outra; <br>• o que fazer com os perfis que usam as 6 bases que deixam de ser oferecidas: converter para o corpo correspondente, mantendo cores e roupas (proposta da seção 15) |
| P10 | **Ações do GitHub Actions** baseadas no Node 20: quando atualizar |
| P11 | **PR7: planejamento concluído.** D1 a D5 (A32 a A36) e as duas regras pendentes (A37 e A38) estão aprovadas. **Falta só a autorização para implementar**, na **etapa 6** da versão 1.0, depois dos testes físicos e do diagnóstico do ANR |

A antiga P8 (livros em preparação no Modo História) foi resolvida por A11.

## 4. Conflito novo identificado nesta consolidação

**O que acontece hoje:** quando o jogador termina todas as fases disponíveis de Gênesis (20) ou de Êxodo (4), o livro aparece como **"Concluído"**.
- A regra está em `src/services/game/progression.ts`, linha 49: `if (c.done === c.total) return 'concluido'`.
- A conquista **"Conhecedor das Escrituras"** diz "Conclua 2 livros completos (Gênesis e Êxodo, nesta versão)" (`src/data/achievements.ts`, linha 34).
- As conquistas "Explorador de Gênesis" e "Caminho no mar" dizem "Conclua todas as experiências de…", o que está correto para as fases que existem.

**Conflito com:** A9 e A26. O livro ainda tem capítulos sem conteúdo, mas aparece como concluído.

**O que já está de acordo:** os 64 livros sem fases já aparecem como **"Em preparação"** e **não abrem** (`BooksIndex.tsx`, linha 81). Isso não muda.

**Proposta (PR7):** em livro parcial, trocar "Concluído" por "Fases disponíveis concluídas" e ajustar o texto da conquista. Isso só será feito com autorização (P11).

**Efeito colateral a considerar:** quando as fases novas entrarem (A10), um jogador que tinha terminado o livro volta a vê-lo "em andamento". As conquistas já ganhas continuam.
