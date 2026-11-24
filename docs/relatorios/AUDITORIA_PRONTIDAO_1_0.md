# Bible Quest — Auditoria de prontidão para a versão 1.0 (Android)

**Data:** 24/11/2026
**Base auditada:** branch `claude/bible-quest-android` (commit `0e66506`). Ela contém a 0.17.9 da branch visual (`claude/loving-carson-8mrbjo`) e todo o trabalho Android.
**Modo:** só consulta. Nenhum código foi alterado. Este relatório e uma captura de evidência são os únicos arquivos novos.

**Decisões consideradas:**
- dois personagens selecionáveis no lançamento (masculino e feminino);
- Central 3D preservada;
- versão gratuita, sem monetização;
- offline e progresso local preservados;
- nenhuma funcionalidade nova sem necessidade.

**Classificação:**

| Situação | Significado |
|---|---|
| **Pronto** | funciona e foi verificado |
| **Parcial** | funciona, mas falta algo para a 1.0 |
| **Com problema** | há defeito comprovado |
| **Não implementado** | não existe ainda |
| **Depende de teste físico** | só um celular de verdade responde |

**Prioridade:**

| Nível | Quando é necessário |
|---|---|
| **P0** | antes do teste fechado na Google Play |
| **P1** | antes da produção (1.0 pública) |
| **P2** | desejável na 1.0 |
| **P3** | atualização futura |

**Esforço estimado** (dias de trabalho, aproximados): P = até 1 dia, M = 2 a 4 dias, G = 5 dias ou mais.

## 1. Resumo

**O Bible Quest ainda não está pronto para a 1.0, mas a base é sólida:**
- o jogo funciona inteiro sem internet, sem nenhuma permissão;
- tem 213 testes automáticos e build Android com verificação no emulador;
- o progresso fica salvo no aparelho, com exportação e exclusão;
- não tem anúncios, rastreamento nem envio de dados.

**O que bloqueia o início dos testes na Google Play (P0):**
1. **Personagem feminino com problema** (seção 3.3):
   - o corpo feminino é o modelo realista antigo (versão 0.7), com outro estilo do masculino estilizado (versão 0.8);
   - o cabelo escolhido não aparece;
   - o cajado atravessa o braço;
   - além disso, o cadastro oferece 8 personagens-base, e não os 2 decididos.
2. **ANR e compatibilidade ainda sem confirmação em aparelhos físicos** (seções 3.13 a 3.15):
   - no emulador, a abertura trava de 5 a 9 s;
   - o pacote usa JavaScript moderno (ES2022) e WebGL2, que o WebView de aparelhos Android 7 a 9 desatualizados pode não suportar.
3. **Requisitos da Google Play não feitos** (seção 3.19):
   - AAB assinado e chave de envio;
   - política de privacidade publicada numa página;
   - formulários da Play Console (segurança dos dados, classificação, público-alvo e Famílias);
   - imagens da loja.
4. **Branches a consolidar** (seção 3.21): o `main` está na 0.17.7, a 0.17.8 e a 0.17.9 aguardam avaliação, e o Android está numa terceira branch.

**O que é necessário antes da produção (P1):**
- **revisão do texto bíblico e das perguntas** (seção 3.20): os trechos da Almeida 1911 (cerca de 37) estão marcados "em revisão contra a fonte", e nenhuma das 197 perguntas tem revisão registrada;
- proteção contra telas brancas em caso de erro;
- aviso quando o salvamento falhar;
- textos de privacidade ajustados ao aplicativo.

## 2. Estado das versões

| Onde | Versão | Situação |
|---|---|---|
| `main` (site publicado) | 0.17.7 | publicada |
| `claude/loving-carson-8mrbjo` (visual) | 0.17.9 (Conquistas e Biblioteca) | aguardando avaliação |
| `claude/bible-quest-android` | 0.17.9 + Android | etapa 1 aprovada; diagnóstico e roteiro de teste físico prontos; aguardando os registros dos aparelhos |
| Aplicativo Android | `versionName 0.17.9`, `versionCode 1` | só APK de depuração; nenhum AAB |

## 3. Itens auditados

### 3.1 Cadastro

| | |
|---|---|
| **Evidência** | `src/pages/Login.tsx` (apelido e faixa etária "até 12", "13 a 17", "18 ou mais"); `src/services/auth.ts` (perfil local) |
| **Situação** | **Pronto**. Funciona sem internet; nada é enviado a servidores; sem e-mail, telefone ou data de nascimento |
| **Risco** | Baixo. A faixa etária só é usada no multiplayer, que está desativado no Android. Mas declarar crianças na Play Console traz as regras de Famílias (seção 3.19) |
| **Prioridade · esforço** | — · — |
| **Critério de aceitação** | Criar o perfil sem internet; fechar e reabrir; o perfil continua (já verificado no emulador) |

### 3.2 Boas-vindas

| | |
|---|---|
| **Evidência** | `src/pages/onboarding/Welcome.tsx`, `StepBar.tsx`, `Arrival.tsx` (5 passos) |
| **Situação** | **Pronto**. Verificada no emulador Android 16 com e sem internet |
| **Risco** | Baixo |
| **Prioridade · esforço** | P2 · P (só conferir a primeira abertura nos aparelhos físicos) |
| **Critério de aceitação** | Nos dois aparelhos físicos, a tela de boas-vindas aparece sem tela branca prolongada (tempo medido pelo roteiro) |

### 3.3 Seleção de personagem (masculino e feminino)

| | |
|---|---|
| **Evidência** | `src/data/character/bases.ts`: **8 personagens-base** (Viajante, Pastora, Escriba, Exploradora, Mensageiro, Guardiã, Peregrino, Contadora) |
| | `src/data/character/look.ts`: corpo feminino para 4 delas |
| | `src/character3d/heroi.ts`: só o masculino tem modelo estilizado (`MODELOS_POR_BASE` vazio; `heroi-masculino.glb`, versão 0.8) |
| | `heroi-feminino.glb` (4,6 MB) é a estrutura realista da versão 0.7 (MakeHuman), segundo `public/models/personagem/LICENCAS.md` |
| | Captura: `evidencias/auditoria-1.0/personagens-na-central.png` (Viajante, Pastora e Guardiã na Central) |
| **Situação** | **Com problema** |
| **Risco** | **Alto** para uma 1.0 "bonita". O que a captura mostra no feminino: <br>• estilo visual diferente do masculino (realista × estilizado); <br>• o cabelo do personagem-base (trança, longo) não aparece; fica um cabelo curto; <br>• o cajado atravessa o braço e o corpo; <br>• o retrato no topo carrega mais devagar. <br>A seleção não segue a decisão de 2 personagens. |
| **Prioridade · esforço** | **P0** · G. <br>• Modelo feminino estilizado no mesmo padrão e pipeline do masculino: 5 dias ou mais, com avaliação visual. <br>• Reduzir a seleção a 2 personagens e migrar os perfis que já usam as outras 6 bases: M. |
| **Critério de aceitação** | • Dois personagens selecionáveis, masculino e feminino, no mesmo estilo artístico; <br>• cabelos, roupas e acessórios no lugar, sem atravessar o corpo; <br>• perfis antigos de outras bases continuam abrindo, convertidos para o corpo correspondente; <br>• aprovação visual de vocês |

### 3.4 Central 3D

| | |
|---|---|
| **Evidência** | `src/components/camp/CenaAcampamento.tsx` e `src/character3d/acampamento.ts`; cenário 2D automático sem WebGL ou na qualidade "2D" |
| | `docs/relatorios/ANDROID_DIAGNOSTICO_CENTRAL_3D.md`: a remontagem da cena vista nos testes vem da ferramenta de teste |
| **Situação** | **Pronto** na função, preservada como decidido. **Depende de teste físico** para o desempenho |
| **Risco** | Médio. No emulador (desenho por software): cena pronta entre 11 e 28 s, e travamentos ao abrir (seção 3.14) |
| **Prioridade · esforço** | P0 (medir) · — |
| **Critério de aceitação** | Nos dois aparelhos físicos: <br>• cena 3D completa; <br>• sem fundo vazio; <br>• tempo até a cena pronta registrado; <br>• na qualidade "2D", a Central funciona |

### 3.5 Modo História

| | |
|---|---|
| **Evidência** | `src/data/story/`: **Gênesis com 20 fases e Êxodo com 4**. Os outros 64 livros aparecem "em preparação" (`BooksIndex.tsx`). |
| | O plano visual (passo 1.7) ainda não chegou à História (`ROADMAP.md`). |
| | `BIBLE_SOURCE_NOTE`: "Em revisão contra a fonte". |
| **Situação** | **Parcial** |
| **Risco** | Médio. Pouco conteúdo pode frustrar quem espera a Bíblia inteira. Isso é decisão de escopo, e o jogo já mostra os livros "em preparação" com clareza |
| **Prioridade · esforço** | P1 (revisão do texto, seção 3.20) e P2 (visual 1.7) · M |
| **Critério de aceitação** | • Gênesis e Êxodo jogáveis do começo ao fim no Android, com internet e sem; <br>• textos revisados; <br>• escopo da 1.0 decidido e descrito na loja (por exemplo, "começa por Gênesis e Êxodo") |

### 3.6 Quiz

| | |
|---|---|
| **Evidência** | `src/data/questions/`: **197 perguntas**. Por tipo: 70 múltipla escolha, 32 verdadeiro ou falso, 28 completar, 23 livro, 22 "quem sou eu", 13 ordenar, 7 memória, 2 associar. |
| | **Nenhuma tem `reviewed_by`.** |
| | Mapa do Quiz em `src/data/quiz/regions.ts`. |
| | Visual do passo 1.7 pendente. |
| **Situação** | **Parcial** |
| **Risco** | Médio (exatidão do conteúdo; seção 3.20) |
| **Prioridade · esforço** | P1 (revisão) e P2 (visual) · M |
| **Critério de aceitação** | Todas as perguntas revisadas e marcadas; quiz completo no Android sem erro |

### 3.7 Desafios (desafio diário e Modo Livre)

| | |
|---|---|
| **Evidência** | `src/pages/Daily.tsx`, `src/services/game/daily.ts` (recompensa uma vez por dia, com proteção contra mudar a data) e `src/pages/free/`. |
| | Multiplayer de demonstração desativado no Android. |
| | O teste do desafio diário foi corrigido em 24/11 (o assistente do teste não respondia perguntas "associar"; o jogo estava certo). |
| **Situação** | **Pronto** |
| **Risco** | Baixo |
| **Prioridade · esforço** | — · — |
| **Critério de aceitação** | Desafio diário concluído uma vez por dia nos aparelhos físicos |

### 3.8 Biblioteca

| | |
|---|---|
| **Evidência** | `src/pages/library/`: 35 personagens, 19 lugares, livros, acontecimentos, temas e linha do tempo; paleta da Sala de Estudos (0.17.9) |
| **Situação** | **Pronto** na função. **Parcial** na entrega: a 0.17.9 aguarda avaliação e não está no `main` |
| **Risco** | Baixo |
| **Prioridade · esforço** | P0 (decidir a integração) · P |
| **Critério de aceitação** | 0.17.9 aprovada e na branch de lançamento |

### 3.9 Conquistas

| | |
|---|---|
| **Evidência** | `src/data/achievements.ts`: 26 conquistas; paleta da Sala dos Troféus (0.17.8) |
| **Situação** | **Pronto** na função. **Parcial** na entrega: a 0.17.8 aguarda avaliação |
| **Risco** | Baixo |
| **Prioridade · esforço** | P0 (decidir) · P |
| **Critério de aceitação** | 0.17.8 aprovada e na branch de lançamento |

### 3.10 Perfil

| | |
|---|---|
| **Evidência** | `src/pages/Profile.tsx`: exportar dados (JSON) e apagar perfil e progresso com confirmação. **Não há importação.** Visual do passo 1.7 (Tenda do Personagem) pendente |
| **Situação** | **Parcial** |
| **Risco** | Médio. Quem troca de celular perde o progresso: a exportação existe, mas não há como importar |
| **Prioridade · esforço** | P2 (visual) · M; importação: P3 (funcionalidade nova, para decidir) |
| **Critério de aceitação** | Exportar e apagar funcionando no Android (exportar: conferir se o arquivo é salvo no aparelho; **depende de teste físico**) |

### 3.11 Salvamento do progresso

| | |
|---|---|
| **Evidência** | **Gravação:** `src/services/storage/keyValueStore.ts` grava no `localStorage`; se a gravação falhar (armazenamento cheio, por exemplo), passa a guardar **só na memória, sem avisar**. <br>**Migração:** `migrateProgress` e `migrateCharacter` convertem saves antigos. <br>**Cópia de segurança:** `android:allowBackup="true"` no manifesto, sem regra de backup específica. |
| **Situação** | **Parcial** |
| **Risco** | **Médio-alto**: <br>• se a gravação falhar, o jogador perde o progresso ao fechar, sem saber; <br>• não está verificado se o backup automático do Android inclui os dados do WebView |
| **Prioridade · esforço** | P1 · P/M (aviso visível quando a gravação falhar; verificar o backup) |
| **Critério de aceitação** | • Progresso mantido depois de fechar, reabrir, reiniciar o celular e atualizar o aplicativo (instalar uma versão nova por cima); <br>• aviso claro quando não for possível salvar; <br>• comportamento do backup do Android conhecido e documentado |

### 3.12 Acessibilidade

| | |
|---|---|
| **Evidência** | Passos 1.4 e 1.6: foco visível, alto contraste unificado, tamanho do texto, reduzir animações, link "pular para o conteúdo". Testes `acessibilidade.test.tsx` e `altoContraste.test.tsx`. Leitura em voz alta oculta no Android |
| **Situação** | **Parcial**: pronto no navegador; **depende de teste físico** no Android |
| **Risco** | Médio. Faltam o TalkBack, o tamanho de fonte do sistema Android (não sabemos se o WebView o aplica) e alvos de toque nas telas ainda sem o visual 1.7 |
| **Prioridade · esforço** | P1 · M |
| **Critério de aceitação** | • Com o TalkBack, dá para criar o perfil, chegar à Central e jogar uma fase; <br>• com a fonte do sistema no maior tamanho, os textos não ficam cortados; <br>• o alto contraste funciona no aplicativo |

### 3.13 Responsividade

| | |
|---|---|
| **Evidência** | Retrato nos celulares e rotação livre em tablets (`MainActivity.java`). Capturas só no Pixel 6 do emulador (1080 × 2400) |
| **Situação** | **Depende de teste físico** |
| **Risco** | Médio. Não foram vistos tablets na horizontal, telas pequenas (360 × 640 dp), recortes de câmera nem navegação por três botões |
| **Prioridade · esforço** | P1 · M |
| **Critério de aceitação** | Sem conteúdo cortado nem sobreposto em: <br>• celular pequeno; <br>• celular grande; <br>• tablet nas duas orientações; <br>• navegação por gestos e por botões |

### 3.14 ANR e desempenho

| | |
|---|---|
| **Evidência** | **Emulador:** thread principal travada de 5,2 a 9,3 s ao abrir, e ANR em 5 de 15 aberturas (`ANDROID_DIAGNOSTICO_CENTRAL_3D.md`); só o WebView, sem 3D, já trava de 3,4 a 4,9 s. <br>**Pacote do aplicativo:** `index` com 720 kB e o 3D (Three.js) com 784 kB de JavaScript, sem divisão por tela; modelos de 1,8 MB (masculino) e 4,6 MB (feminino). |
| **Situação** | **Depende de teste físico**. APK de diagnóstico e roteiro prontos (`ANDROID_TESTE_APARELHOS_FISICOS.md`) |
| **Risco** | **Alto** se o ANR se confirmar no aparelho de entrada. A Google Play considera ruim uma taxa de ANR acima de 0,47% |
| **Prioridade · esforço** | **P0** · depende do resultado (M a G) |
| **Critério de aceitação** | • Nenhum ANR nos 10 cenários do roteiro, nos dois aparelhos; <br>• Central visível em até cerca de 3 s no intermediário (meta a confirmar com vocês) |

### 3.15 Compatibilidade Android

| | |
|---|---|
| **Evidência** | `android/variables.gradle`: mínimo API 24 (Android 7), alvo API 36. <br>`vite.config.ts`: `target: 'es2022'`. <br>Three.js 0.187, que só usa WebGL2. <br>Testado só no Android 16 (emulador). |
| **Situação** | **Depende de teste físico** |
| **Risco** | **Alto** no Android 7 a 9: <br>• o WebView desses aparelhos pode estar desatualizado e não executar ES2022, o que daria **tela branca**; <br>• aparelhos sem WebGL2 caem no cenário 2D, que é o comportamento previsto, mas precisa ser verificado |
| **Prioridade · esforço** | **P0** · P/M (decidir entre subir a versão mínima do Android ou compilar o JavaScript para navegadores mais antigos; depende do teste) |
| **Critério de aceitação** | O aplicativo abre e é jogável no Android mais antigo suportado, ou a versão mínima sobe para a mais antiga testada com sucesso |

### 3.16 Funcionamento offline

| | |
|---|---|
| **Evidência** | Sem a permissão INTERNET (`AndroidManifest.xml`); tudo vem de `assets/public`; o fluxo `android.yml` reprova se a permissão voltar. Verificado no emulador em modo avião, com o progresso salvo |
| **Situação** | **Pronto** (falta só confirmar nos aparelhos, pelo roteiro) |
| **Risco** | Baixo |
| **Prioridade · esforço** | — · — |
| **Critério de aceitação** | Cenários 5 a 7 do roteiro sem erro |

### 3.17 Segurança

| | |
|---|---|
| **Evidência** | **Rede e permissões:** nenhuma permissão e nenhuma rede. <br>**Depuração:** a do WebView fica desligada no build de lançamento (verificado). <br>**Código removido do APK:** o painel administrativo fica fora do pacote; o multiplayer de demonstração está desativado. <br>**Segredos:** nenhum segredo no repositório (`ANDROID_ETAPA_1_COMPLEMENTO.md`, seção 5). <br>**Conteúdo do WebView:** `allowMixedContent: false`. |
| **Situação** | **Pronto** no escopo local. **Não implementado:** a chave de envio (chave de assinatura) e o build de lançamento |
| **Risco** | Baixo. As chaves `*.jks` e `*.keystore` estão comentadas no `.gitignore` do Android |
| **Prioridade · esforço** | P0 (com o AAB) · P |
| **Critério de aceitação** | • AAB assinado com a chave guardada pela Kzann Tech, fora do repositório; <br>• `.gitignore` protegendo os arquivos de chave; <br>• nenhum segredo nos fluxos |

### 3.18 Privacidade

| | |
|---|---|
| **Evidência** | `About.tsx`, seção "Privacidade e segurança": dados mínimos, tudo no aparelho e direitos da LGPD. <br>A seção ainda **fala de recursos que o aplicativo não tem**: "na versão online, menores de 13…" e "o multiplayer usará apenas reações predefinidas". <br>**Não existe página de política de privacidade**. |
| **Situação** | **Parcial** (os textos) e **Não implementado** (a política) |
| **Risco** | **Alto** para a loja: a política é obrigatória para apps com público infantil. Textos sobre recursos inexistentes podem confundir a análise |
| **Prioridade · esforço** | **P0** · P/M (redigir a política e publicar numa URL, que pode ser o próprio site; ajustar os textos do aplicativo) |
| **Critério de aceitação** | • Política de privacidade numa URL pública, coerente com o aplicativo (nenhum dado coletado nem enviado; armazenamento local; exportar e apagar); <br>• textos do aplicativo sem recursos inexistentes; <br>• revisão de vocês |

### 3.19 Google Play

| Requisito | Situação | Prioridade · esforço |
|---|---|---|
| Alvo API 36 (exigido desde 31/08/2026) | **Pronto** | — |
| AAB assinado e Play App Signing | **Não implementado** (só APK de depuração) | P0 · P, com a chave criada por vocês |
| Versão `1.0.0` e estratégia de `versionCode` | **Não implementado** (`versionCode 1`, `versionName 0.17.9`) | P0 · P |
| Conta de desenvolvedor verificada | depende de vocês | P0 |
| Teste fechado com 12 testadores por 14 dias (conta pessoal criada depois de 13/11/2023) | **Não implementado** | P0 · 14 dias de calendário |
| Segurança dos dados: "nenhum dado coletado nem compartilhado" | **Não implementado** (falta preencher; o código sustenta essa resposta) | P0 · P |
| Classificação de conteúdo (IARC) | **Não implementado** | P0 · P |
| Público-alvo e política de Famílias: a faixa etária inclui crianças. Sem anúncios e sem coleta de dados, o aplicativo já atende boa parte das regras. **Falta conferir** os links externos ("Fonte no Commons", em Sobre), que abrem o navegador a partir de um app com público infantil | **Parcial** | P0 · P |
| Página da loja: ícone de 512 px, imagem de destaque de 1024 × 500, capturas de celular (e tablet), descrições curta e longa | **Não implementado** | P0 · M |
| Declarar o uso de IA | O modelo 3D masculino veio de imagem gerada por IA (Canva) e de malha gerada pelo TRELLIS.2, com licenças registradas. O aplicativo não gera conteúdo por IA em funcionamento. Conferir se algum formulário pede essa declaração | P1 · P |
| Desempenho medido pela loja (ANR e travamentos) | **Depende de teste físico** (seção 3.14) | P0 |

**Critério de aceitação:**
- Play Console preenchida;
- AAB aceito no teste interno;
- teste fechado iniciado.

Não declaramos cumprimento de nenhuma política sem a análise de vocês.

### 3.20 Revisão do conteúdo bíblico

| | |
|---|---|
| **Evidência** | cerca de 37 trechos com referência (contagem aproximada: cerca de 30 em Gênesis e 7 em Êxodo), marcados "em revisão contra a fonte" (`BIBLE_SOURCE_NOTE`); 197 perguntas, **0 com `reviewed_by`**; narrações dramatizadas identificadas (regra do `CLAUDE.md`) |
| **Situação** | **Não implementado** (a revisão ainda não foi feita) |
| **Risco** | **Alto** para um aplicativo bíblico: um erro de citação ou de resposta afeta a credibilidade |
| **Prioridade · esforço** | **P1** · M a G (revisão humana: teológica e textual) |
| **Critério de aceitação** | • Todos os trechos conferidos com a Almeida 1911; <br>• todas as perguntas revisadas e marcadas (`reviewed_by`); <br>• aviso "em revisão" retirado |

### 3.21 Consolidação das branches e da base de lançamento

| | |
|---|---|
| **Evidência** | `main` na 0.17.7; branch visual na 0.17.9; Android na mesma base mais o aplicativo. Fluxos: `android.yml`, `android-verificacoes.yml`, `android-diagnostico.yml` e `deploy.yml` |
| **Situação** | **Parcial** |
| **Risco** | Médio. Sem uma branch única de lançamento, há risco de publicar no site e no aplicativo versões diferentes. O build do site está protegido: continua idêntico ao da 0.17.9 |
| **Prioridade · esforço** | **P0** · P (depende das aprovações de vocês) |
| **Critério de aceitação** | Uma branch de lançamento definida, com a 0.17.8 e a 0.17.9 avaliadas, o trabalho Android e o site verificados |

### 3.22 Tratamento de erros

| | |
|---|---|
| **Evidência** | Não há nenhum `ErrorBoundary` no `src/`. A cena 3D já tem recuperação própria (cai no 2D se falhar) |
| **Situação** | **Não implementado** |
| **Risco** | **Médio-alto**: um erro em qualquer tela deixa o aplicativo **em branco**, sem saída para o jogador |
| **Prioridade · esforço** | P1 · P |
| **Critério de aceitação** | Um erro numa tela mostra uma mensagem amigável com "Voltar à Central", sem perder o progresso |

### 3.23 Testes e verificação automática

| | |
|---|---|
| **Evidência** | 213 testes (Vitest) em 19 arquivos; typecheck; site conferido contra a 0.17.9; Android: build, `aapt2`, emulador (16 verificações), verificações complementares e diagnóstico |
| **Situação** | **Pronto** para a base atual |
| **Risco** | Baixo. Falta um roteiro manual de regressão para o lançamento (jogar Gênesis inteiro no aparelho) |
| **Prioridade · esforço** | P1 · M (roteiro de teste de aceitação da 1.0) |
| **Critério de aceitação** | Roteiro de aceitação executado nos dois aparelhos sem defeito bloqueante |

## 4. Pode ficar para atualizações futuras (P3)

- **Novos personagens** e mais cabelos e roupas (decisão já tomada).
- **Novos livros do Modo História** (Levítico em diante) e novas jornadas, com revisão.
- **Leitura em voz alta nativa:** a do navegador não funciona bem no WebView; hoje está oculta no Android.
- **Importar progresso** e salvar na nuvem (Supabase, Fase 3 do ROADMAP).
- **Multiplayer online**, com as regras para menores já previstas.
- **Monetização**, que não será feita na 1.0.
- **Passo 1.8** (alto contraste pela preferência do sistema) e as entregas visuais de Perfil, Quiz e História, se não entrarem na 1.0 (seção 5).
- **Painel administrativo** (só no site).
- **Atualizar as ações do GitHub Actions** baseadas no Node 20.

## 5. Plano de entregas (em ordem de prioridade)

Cada entrega depende da aprovação de vocês.

| # | Entrega | Itens | Prioridade | Esforço |
|---|---|---|---|---|
| 1 | **Testes físicos e decisões de base:** <br>• registros dos dois aparelhos (em andamento com vocês); <br>• avaliar a 0.17.8 e a 0.17.9; <br>• definir a branch de lançamento; <br>• decidir o escopo de conteúdo da 1.0 (Gênesis e Êxodo); <br>• decidir se as entregas visuais de Perfil, Quiz e História entram na 1.0 | 3.8, 3.9, 3.14, 3.15, 3.21, 3.5 | P0 | P (do nosso lado) |
| 2 | **Diagnóstico físico:** análise separada (inicialização do WebView × criação da cena 3D) e proposta de correções para ANR e compatibilidade | 3.14, 3.15 | P0 | P |
| 3 | **Personagens do lançamento:** <br>• modelo feminino estilizado no padrão do masculino; <br>• seleção reduzida a masculino e feminino; <br>• migração dos perfis com outras bases | 3.3 | P0 | G |
| 4 | **Estabilidade:** <br>• correções de ANR e compatibilidade aprovadas na entrega 2; <br>• tela de erro amigável; <br>• aviso de falha ao salvar; <br>• verificação do backup do Android | 3.11, 3.14, 3.15, 3.22 | P0/P1 | M a G |
| 5 | **Privacidade e loja (textos):** <br>• política de privacidade publicada; <br>• textos do aplicativo ajustados; <br>• respostas para segurança dos dados, classificação e público-alvo; <br>• revisão dos links externos para Famílias | 3.18, 3.19 | P0 | M |
| 6 | **Build de lançamento:** <br>• versão 1.0.0 e `versionCode`; <br>• `.gitignore` das chaves; <br>• fluxo de AAB assinado (com a chave criada e guardada por vocês); <br>• imagens da loja | 3.17, 3.19 | P0 | M |
| 7 | **Acessibilidade e telas no Android:** TalkBack, fonte do sistema, telas pequenas e tablets | 3.12, 3.13 | P1 | M |
| 8 | **Revisão do conteúdo bíblico** (humana): trechos e perguntas | 3.20 | P1 | M a G |
| 9 | **Teste de aceitação 1.0** nos dois aparelhos, **teste interno**, **teste fechado** (12 testadores × 14 dias) e produção | 3.19, 3.23 | P0/P1 | 14+ dias de calendário |

**Opcional, conforme a decisão da entrega 1:** visual 1.7 do Perfil, do Quiz e da História (P2, cerca de 1 entrega cada, de 2 a 4 dias).

## 6. Decisões necessárias

1. **Base de lançamento:** a 0.17.9 com o Android (e as entregas visuais pendentes antes ou depois da 1.0?).
2. **Escopo de conteúdo da 1.0:** só Gênesis e Êxodo, apresentados como "começo da jornada"?
3. **Personagem feminino:** modelo estilizado novo, no mesmo pipeline do masculino (imagem de referência por IA mais o TRELLIS.2), ou outra origem? E o que fazer com as 6 bases que deixam de ser oferecidas (converter automaticamente)?
4. **Versão mínima do Android:** manter o Android 7 (API 24) se os testes permitirem, ou subir?
5. **Quem fará a revisão teológica e textual**, e qual o prazo.
6. **Política de privacidade:** onde publicar (sugestão: uma página no próprio site) e quem a aprova.

## 7. Arquivos desta auditoria

- `docs/relatorios/AUDITORIA_PRONTIDAO_1_0.md` e `.pdf`: este relatório.
- `docs/relatorios/evidencias/auditoria-1.0/personagens-na-central.png`: Viajante, Pastora e Guardiã na Central (navegador, 412 × 915).
- **Sem mudanças:** nenhum arquivo de código, configuração ou fluxo foi alterado; nada foi integrado nem publicado; nenhum AAB foi gerado.
