# Bible Quest 0.17.9 — Etapa 2, Fase 1, passo 1.7, entrega 2: Biblioteca

**Data:** 23/11/2026
**Branch:** `claude/loving-carson-8mrbjo`, sobre a 0.17.8 (Conquistas), também em avaliação
**Situação:** em avaliação. Não foi integrada ao `main` nem publicada.

## 1. Resumo

- **O que entrou:** as cinco telas da Biblioteca receberam a paleta da Sala de Estudos:
  - a Biblioteca (página de aventura);
  - as fichas de personagem, livro e lugar;
  - a linha do tempo.
- **Paleta aplicada:**
  - fichas em papel;
  - placas, abas, faixas de título e etiquetas de data em couro;
  - destaques e progresso em lamparina;
  - moldura terra.
- **Contraste:** textos abaixo de 4,5:1 nas telas da Biblioteca, no modo normal, passaram de **18 para 0**.
- **Mesma metodologia de Conquistas:**
  - toda regra fica em `ambientes.css`, limitada a `[data-ambiente='biblioteca']` e desligada no alto contraste;
  - nenhuma regra antiga foi removida;
  - nada mudou em `:root`, nos tokens, na ponte nem na Central.
- **O que não mudou:**
  - o alto contraste, idêntico à 0.17.8;
  - a Central;
  - Conquistas, Perfil, Quiz, História e as telas neutras;
  - foco, teclado, toque e cliques.
- **Testes:** typecheck sem erros, 197 testes em 18 arquivos (1 novo) e build concluído.

## 2. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/styles/ambientes.css` | Novo bloco `biblioteca` (o de Conquistas não mudou) |
| `src/test/ambientes.test.ts` | Biblioteca na lista de ambientes autorizados, verificação da ponte de cada ambiente e teste de contraste dos pares da Biblioteca |
| `package.json`, `package-lock.json` | Versão 0.17.9 |
| Documentação | Este relatório, evidências, CHANGELOG, README, ROADMAP, `docs/README.md` e decisões oficiais |

**Não alterados:** `:root`, `tokens.css`, `ponte.css`, `global.css` (nenhuma regra removida), `alto-contraste.css`, os arquivos da Central, os componentes e páginas em TSX, os dados, as rotas e a progressão.

## 3. O que mudou na tela

Paleta aprovada da Sala de Estudos:

| Papel | Token | Cor |
| --- | --- | --- |
| Base | `--couro-700` | `#4B2A22` |
| Acento e texto de acento | `--lamparina-300` | `#F0C76E` |
| Leitura | `--papel` | `#F7F0DE` |
| Moldura | `--terra-500` | `#7A5234` |
| Progresso | lamparina | `#F0C76E` |

| Onde | 0.17.8 | 0.17.9 |
| --- | --- | --- |
| Biblioteca: cabeçalho e fichas | Pergaminho em gradiente fixo, borda `#8a5a2a` | Papel liso, moldura terra; texto `--tinta`, secundários `--tinta-suave` (7,8:1) |
| Biblioteca: fichas bloqueadas | Cinza e opacidade 0,9 no cartão todo | Cartão legível; só o disco com cadeado continua cinza |
| Biblioteca: abas | Madeira `#8a5a30`→`#5e3a1c`, aba escolhida em gradiente dourado fixo | Placa de couro com moldura; abas em marfim; link "Linha do tempo" em lamparina; aba escolhida em lamparina com texto `--tinta` (10,2:1) |
| Fichas e linha do tempo: painéis, botões contornados, fichas e itens | Madeira (`--plank`, borda `--wood-edge`) | Couro liso com moldura terra |
| Destaques (sobretítulos, retratos, links, marcador da linha do tempo) | Ouro antigo `#d4af5a` / `#ecc96e` | Lamparina |
| Faixas de título | Vermelho `#8a3427`→`#6a241a` | Couro com moldura, letras em lamparina (7,9:1) |
| Etiquetas do tipo de data | Fundo translúcido (sobre o céu do topo ficavam entre 2,2 e 3,7:1) | Placa de couro, mantendo a cor de cada tipo |
| Textos sobre o céu do topo (subtítulo da ficha, introdução da linha do tempo, aviso de ficha bloqueada) | Ouro ou texto atenuado (3,2 a 4,4:1) | Marfim |
| Referências (pílulas claras) | Pergaminho antigo | Papel |
| Barra de progresso | Gradiente dourado fixo | Lamparina |

**Não mudaram:**
- o cenário ilustrado do topo, os retratos e as pinturas;
- a barra superior, a navegação inferior e o rodapé, que são compartilhados com todas as telas;
- os cantos e as sombras.

**Ponte do ambiente:** `--gold` e `--gold-strong` vão para o texto de acento, `--gold-dim`, `--border-strong` e `--wood-edge` para a moldura, `--parchment` para a leitura, e `--panel` e `--plank` para a base.

## 4. Medições de contraste

**Pares de tokens** (um teste automático confere):

| Par | Uso | Contraste |
| --- | --- | --- |
| tinta / papel | Texto das fichas | 14,37:1 |
| tinta-suave / papel | Textos secundários | 7,78:1 |
| marfim / couro-700 | Texto em painéis, abas e faixas | 10,71:1 |
| lamparina-300 / couro-700 | Destaques e títulos em couro | 7,92:1 |
| tinta / lamparina-300 | Aba e ficha escolhidas | 10,19:1 |
| lamparina-300 / terra-900 | Destaques sobre o fundo escuro | 11,02:1 |
| lamparina-300 / papel | **Não usado como texto** | 1,41:1 |

**Textos reais das telas** (medição por pixels):

| Tela | Textos | 0.17.8 | 0.17.9 |
| --- | --- | --- | --- |
| Biblioteca | 205 | 0 | 0 |
| Ficha de personagem | 145 | 2 | 0 |
| Ficha de livro | 187 | 1 | 0 |
| Ficha de lugar (bloqueada no perfil da medição) | 56 | 8 | 0 |
| Linha do tempo | 482 | 7 | 0 |
| **Total** | **1.075** | **18** | **0** |

Durante a validação, uma regra nova ficou mais específica que a da página de aventura e deixou a introdução da `/biblioteca` em marfim sobre papel (1,04:1). A medição apontou o problema. A regra foi separada, e o resultado final ficou em 0.

## 5. Comparação antes e depois

88 capturas no build de produção, com data fixa, sorteio com semente e animação reduzida. A base é a 0.17.8, capturada de novo com o mesmo rodapé.

| Comparação | Resultado |
| --- | --- |
| Modo normal, 0.17.9 × 0.17.8 | 74 idênticas. **Mudaram só as 10 capturas da Biblioteca.** As outras 4 são variações de carregamento: prévia 3D do Guarda-roupa, tela de carregamento da Central e janela da fase. A janela da fase no celular, repetida, ficou idêntica à 0.17.8 |
| Alto contraste, 0.17.9 × 0.17.8 | **As 10 capturas da Biblioteca idênticas.** 80 idênticas; as outras 8 são variações de carregamento e de 2 a 4 pixels com no máximo 4/255 |
| Conquistas e Perfil | Sem alteração (normal e alto contraste) |
| Central, modo normal | Cada vista idêntica a capturas aprovadas da 0.17.7 e da 0.17.8 |
| Central, alto contraste | Idêntica nas 4 vistas. No 2D do celular, a primeira rodada teve a variação conhecida de suavização dos rótulos (no máximo 15/255); repetida duas vezes, ficou idêntica à 0.17.8 e às capturas aprovadas |

As capturas foram feitas antes da troca do número da versão. O CSS do build final é byte a byte igual ao validado (`index-BOQu1Yf1.css`).

## 6. Testes realizados

| Verificação | Resultado |
| --- | --- |
| Contraste do texto na Biblioteca (5 telas, celular e computador) | 0 abaixo de 4,5:1 (eram 18) |
| Alto contraste | Biblioteca e demais telas idênticas à 0.17.8, fora as variações conhecidas |
| Central | Idêntica: 4 vistas, normal e alto contraste |
| Conquistas e Perfil | Sem alteração |
| Foco (24 telas) | 0 com indicador insuficiente, igual à 0.17.8 |
| Área de toque (815 elementos) | 4 abaixo de 44 × 44, os mesmos links dentro de frases |
| Clique no centro (1.082 elementos) | Lista idêntica (inclusive os links das fichas de relação: Eva, Caim, Abel) |
| Teclado | Tab e Shift+Tab da Central iguais; foco preso e Esc nas janelas; 0 focos atrás do painel aberto |
| Redução de animações | Ligada em todas as medições; nenhuma animação ou transição nova |
| `ambientes.test.ts` (8 testes) | Sem HEX; regras só em ambientes autorizados (Conquistas e Biblioteca) e fora do alto contraste; sem Central nem os outros ambientes; ponte de cada ambiente só com tokens `--amb-*`; ordem de carregamento; contraste dos pares de Conquistas e da Biblioteca |
| Typecheck, testes e build | Sem erros; **197 testes em 18 arquivos**; build concluído (`index-C_70H0Eu.js` e `index-BOQu1Yf1.css`) |

## 7. Evidências

Pasta `docs/relatorios/evidencias/etapa-2-fase1-0.17.9-biblioteca/`:

| Arquivo | Conteúdo |
| --- | --- |
| `celular-biblioteca.jpg` | Biblioteca no celular, 0.17.8 e 0.17.9 |
| `celular-ficha-personagem.jpg`, `celular-ficha-livro.jpg`, `celular-ficha-lugar.jpg` | Fichas no celular, antes e depois |
| `celular-linha-do-tempo.jpg` | Linha do tempo no celular, antes e depois |
| `computador-biblioteca.jpg`, `computador-linha-do-tempo.jpg` | As mesmas telas no computador |

## 8. Limitações

- **Navegador:** só Chromium (Playwright), com vídeo por software. Safari, Firefox, aparelhos reais e leitores de tela não foram testados.
- **Bordas:** a moldura terra sobre o couro tem 1,9:1. É a combinação da folha de amostras aprovada e serve como borda decorativa, sem indicar estado.
- **Etiquetas de data:** mantêm as cores de cada tipo (bíblica, estimada e debatida), agora sobre couro.
- **Partes compartilhadas sem paleta:** a barra superior, a navegação inferior e o rodapé continuam com o visual comum, porque são compartilhados com todas as telas. Aplicá-los por ambiente seria uma decisão separada.
- **Variações de captura:** as variações conhecidas (prévias 3D, tela de carregamento da Central e suavização dos rótulos da Central em 2D) apareceram e foram conferidas com repetição.

## 9. Próximos passos (aguardando autorização)

Entrega 3 do passo 1.7: Perfil, na ordem aprovada.
