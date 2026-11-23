# Bible Quest 0.17.8 — Etapa 2, Fase 1, passo 1.7, entrega 1: Conquistas

**Data:** 23/11/2026
**Branch:** `claude/loving-carson-8mrbjo`
**Situação:** em avaliação. Não foi integrada ao `main` nem publicada.

## 1. Resumo

- **O que entrou:** a tela de Conquistas recebeu a paleta da Sala dos Troféus:
  - placas de veludo e letras de ouro nas faixas de título;
  - cartões em pergaminho liso com moldura de ouro;
  - conquistas e medalhas obtidas em placa de veludo;
  - folhas do louro na cor do metal: bronze, prata ou ouro.
- **Contraste:** textos abaixo de 4,5:1 em Conquistas, no modo normal, passaram de **49 para 0**.
- **Bloqueadas e obtidas:**
  - as bloqueadas deixaram de ficar transparentes (era isso que derrubava o contraste das descrições). Agora ficam em pergaminho legível, com o ícone em cinza;
  - as obtidas passaram a ser placas de veludo, bem diferentes das bloqueadas.
- **O que não mudou:**
  - o alto contraste, idêntico à 0.17.7;
  - a Central, idêntica à 0.17.7 (normal e alto contraste, painel aberto e fechado);
  - Biblioteca, Perfil, Quiz, História e as telas neutras;
  - foco, teclado, toque e cliques;
  - medalhas e conquistas funcionam como antes (mesmas classes, textos e regras).
- **Testes:** typecheck sem erros, 196 testes em 18 arquivos (7 novos em `ambientes.test.ts`) e build concluído.

## 2. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/styles/ambientes.css` (novo) | Camada das paletas por ambiente, conforme o diagnóstico. Só tokens e só o bloco de Conquistas |
| `src/main.tsx` | Importa `ambientes.css` logo depois de `ponte.css` (antes de `acessibilidade.css` e `alto-contraste.css`) |
| `src/test/ambientes.test.ts` (novo) | 7 testes da camada de ambientes |
| `src/test/acessibilidade.test.tsx` | A regra "só `tokens.css` seleciona `data-ambiente`" passa a aceitar `ambientes.css` (passo 1.7) |
| `src/test/ponte.test.ts` | `ambientes.css` entra na lista de arquivos sem HEX (16 arquivos) |
| `package.json`, `package-lock.json` | Versão 0.17.8 |
| Documentação | Este relatório, evidências, CHANGELOG, README, ROADMAP, `docs/README.md` e decisões oficiais |

**Não alterados:**
- `:root`, `tokens.css`, `ponte.css` e os valores da ponte;
- `global.css`, nenhuma regra antiga removida;
- `alto-contraste.css`;
- os arquivos da Central;
- componentes e páginas em TSX, dados, rotas e progressão.

## 3. O que mudou na tela

Todas as regras ficam sob `html:not([data-contrast='alto']) .app[data-ambiente='conquistas']`.

| Elemento | 0.17.7 | 0.17.8 |
| --- | --- | --- |
| Cabeçalho e cartões | Pergaminho em gradiente fixo (`#fdf3d8`→`#f0dba8`), borda marrom (`#8a5a2a`) | Leitura (`--pergaminho` `#F4EAD2`) liso, moldura `--ouro-500` `#C9A24E` |
| Descrições e textos secundários | `#6b4a2b`; nas bloqueadas, com opacidade 0,75 (3,7–3,8:1) | `--tinta-suave` sem transparência (7,4:1) |
| Sobretítulo | `#8a5a2a` | `--tinta-suave` |
| Faixas de título | Vermelho `#8a3427`→`#6a241a`, letras brancas com sombra | Base `--veludo-800` `#3A1622`, moldura de ouro, letras `--ouro-300` `#E6C77E` (9,7:1) |
| Conquista bloqueada | Opacidade 0,75, ícone em cinza | Pergaminho legível (opacidade 1), ícone em cinza |
| Conquista obtida | Gradiente amarelo fixo, borda `#b47c10` | Placa de veludo com borda `--ouro-300`; título em ouro (9,7:1), texto em marfim (13,4:1); ícone sobre pergaminho |
| Medalha bloqueada | Cinza e opacidade 0,9 no cartão todo | Cartão legível; só o louro em cinza |
| Medalha obtida | Mesmo cartão claro; louro verde nas três medalhas | Placa de veludo, moldura e folhas na cor do metal: `--bronze` `#C08A5B`, `--prata` `#C9CED4`, `--ouro-300` |
| Nota no fim das medalhas | Pergaminho translúcido | Leitura liso, texto `--tinta-suave` |
| Ponte do ambiente | — | `--gold`, `--gold-strong` → `--amb-acento-texto`; `--gold-dim`, `--border-strong` → `--amb-moldura`; `--parchment` → `--amb-leitura`; `--panel` → `--amb-base` |

**Não mudaram:**
- o cenário ilustrado do topo e o personagem;
- a placa de título e o botão de voltar, que são compartilhados com Biblioteca e Perfil;
- os cantos, as sombras, a barra de navegação inferior e o rodapé.

**Medalhas:** a cor vem só do CSS, aplicada às folhas (`ellipse`) do ícone de louro quando o cartão tem a classe `medal-bronze`, `medal-prata` ou `medal-ouro`. O ícone, os dados, os identificadores, as condições e as recompensas não mudaram. Um teste com progresso injetado (Gênesis e Êxodo concluídos) mostrou as mesmas classes e os mesmos textos antes e depois:
- "Medalha de Bronze" e "Medalha de Prata";
- "Medalha de Ouro" nos dois livros;
- "Primeiro passo" obtida.

## 4. Medições de contraste

**Pares de tokens** (calculados; um teste automático confere):

| Par | Uso | Contraste |
| --- | --- | --- |
| tinta / pergaminho | Texto dos cartões | 13,64:1 |
| tinta-suave / pergaminho | Descrições e sobretítulo | 7,39:1 |
| ouro-300 / veludo-800 | Faixas de título e título da conquista obtida | 9,74:1 |
| marfim / veludo-800 | Texto das conquistas e medalhas obtidas | 13,44:1 |
| bronze / veludo-800 | Folhas e moldura da medalha de bronze | 5,33:1 |
| prata / veludo-800 | Folhas e moldura da medalha de prata | 10,06:1 |
| ouro-300 / veludo-800 | Folhas e moldura da medalha de ouro | 9,74:1 |
| ouro-500 / pergaminho | Moldura decorativa dos cartões (não indica estado) | 2,00:1 |

**Textos reais da tela** (medição por pixels, a mesma das entregas anteriores):

| Medição | 0.17.7 | 0.17.8 |
| --- | --- | --- |
| Textos de Conquistas abaixo de 4,5:1, celular e computador | 49 de 218 | **0 de 218** |

## 5. Comparação antes e depois

| Comparação (88 capturas, produção, data fixa, sorteio com semente, animação reduzida) | Resultado |
| --- | --- |
| Modo normal, 0.17.8 × 0.17.7 | 80 idênticas. **Mudaram só as 2 capturas de Conquistas.** As outras 6 são variações de carregamento já conhecidas: prévias 3D do Guarda-roupa, figura da chegada, tela de carregamento da Central e 1 pixel na janela da fase |
| Alto contraste, 0.17.8 × 0.17.7 | **Conquistas idêntica.** 79 idênticas; as outras 9 são as mesmas variações de carregamento e de 1 a 5 pixels com no máximo 4/255 |
| Biblioteca e Perfil (normal e alto contraste) | Idênticos |
| Central (3D e 2D, celular e computador, normal e alto contraste) | Cada vista idêntica a capturas aprovadas da 0.17.7. No computador, as variações de captura já documentadas também aparecem nas rodadas da 0.17.7 |

As capturas foram feitas antes da troca do número da versão, para o rodapé "Versão" não aparecer como diferença. O CSS do build final é byte a byte igual ao do build validado (`index-CsGXImfa.css`).

## 6. Testes realizados

| Verificação | Resultado |
| --- | --- |
| Contraste do texto em Conquistas | 0 abaixo de 4,5:1 (eram 49) |
| Alto contraste | Conquistas e todas as outras telas idênticas à 0.17.7 (fora as variações conhecidas) |
| Central | Idêntica à 0.17.7: 4 vistas, normal e alto contraste |
| Biblioteca e Perfil | Sem alteração |
| Foco (24 telas, Tab em até 30 elementos) | 0 com indicador insuficiente, igual à 0.17.7 |
| Área de toque (815 elementos) | 4 abaixo de 44 × 44, os mesmos links dentro de frases da 0.17.7 |
| Clique no centro (1.082 elementos) | Lista idêntica à da 0.17.7 |
| Teclado na Central, painel fechado | Ordem idêntica, Shift+Tab inverso, anel em 10 de 10 nas 4 vistas |
| Teclado, painel aberto | 0 focos encobertos nas 8 combinações |
| Janelas dos mapas | Foco preso e Esc fecha |
| Medalhas e conquistas | Mesmas classes, textos e conquistas obtidas antes e depois (teste com bronze, prata e ouro) |
| Redução de animações | Ligada em todas as medições; nenhuma animação ou transição nova |
| `ambientes.test.ts` (7 testes) | Sem HEX; toda regra fora do alto contraste e dentro de um ambiente autorizado; sem Central e sem os outros ambientes; ponte e `:root` intactos; ordem de carregamento; pares de contraste; bloqueadas sem transparência e medalhas em bronze e prata |
| Typecheck, testes e build | Sem erros; **196 testes em 18 arquivos**; build concluído (`index-CXhPifL8.js` e `index-CsGXImfa.css`) |

## 7. Evidências

Pasta `docs/relatorios/evidencias/etapa-2-fase1-0.17.8-conquistas/`:

| Arquivo | Conteúdo |
| --- | --- |
| `celular-antes-depois-parte1.jpg` e `-parte2.jpg` | Conquistas no celular, 0.17.7 e 0.17.8 |
| `computador-antes-depois.jpg` | Conquistas no computador, 0.17.7 e 0.17.8 |
| `medalhas-antes-depois.jpg` | Medalhas de bronze, prata e ouro (teste com progresso injetado), no celular |
| `medalhas-computador-antes-depois.jpg` | Bronze e prata no computador |
| `alto-contraste-0.17.8-igual-0.17.7.jpg` | Conquistas em alto contraste (idêntica à 0.17.7) |

## 8. Limitações

- **Navegador:** só Chromium (Playwright), com vídeo por software. Safari, Firefox, aparelhos reais e leitores de tela não foram testados.
- **Medalhas obtidas no perfil de teste:** o perfil de teste das 88 capturas não tem medalhas de livro. Bronze, prata e ouro foram conferidos numa captura própria, com progresso injetado só para o teste.
- **Moldura dos cartões:** o ouro-500 sobre pergaminho tem 2:1. É borda decorativa, como na folha de amostras aprovada, e não indica estado.
- **Partes compartilhadas sem paleta:** a placa de título do topo e o cenário continuam iguais, porque são compartilhados com Biblioteca e Perfil ou são ilustração.
- **Fundo escuro abaixo do cenário:** é o fundo geral da página, fora da camada de ambiente, e não mudou.

## 9. Próximos passos (aguardando autorização)

Entrega 2 do passo 1.7: Biblioteca, na ordem aprovada.
