# Bible Quest 0.17.6 — Etapa 2, Fase 1, passos 1.4 e 1.5

**Data:** 21/11/2026 (finalização da Central na mesma data, seção 14)
**Branch:** `claude/loving-carson-8mrbjo`
**Situação:** aprovada e publicada em 21/11/2026 (fast-forward para `389468c`, run 87). Registro: `evidencias/etapa-2-fase1-0.17.6/VERIFICACAO_PUBLICACAO.md`.

## 1. Resumo

- **Passo 1.4, acessibilidade base:**
  - áreas de toque de 44 × 44 px, com área invisível sempre que possível;
  - foco visível com contraste, inclusive sobre pergaminho;
  - foco preso nas janelas dos mapas, do baú, da introdução do mundo e da recompensa;
  - Esc fecha a ajuda do mapa.
- **Passo 1.5, identificação dos ambientes:**
  - a aplicação recebe `data-ambiente` conforme a rota;
  - os fundos, cores, gradientes e componentes temáticos novos **não** foram ativados.
- **Central:**
  - primeira entrega: só as duas correções autorizadas, o foco do painel de missões e o contraste do selo de aviso;
  - finalização (autorização adicional, seção 14): anel duplo no foco dos rótulos da cena, do Perfil e das Configurações no topo, das placas dos modos e do "Continuar", e área de toque invisível de 46 px nos rótulos;
  - sem foco, a comparação pixel a pixel mostra diferença apenas nos selos.
- **O que não mudou:**
  - funcionalidades, rotas, dados e progressão;
  - estilos antigos (nenhum foi removido);
  - os dois sistemas de alto contraste (não foram unificados);
  - a Etapa 3 não começou.
- **Medições** (Chromium, celular 390 px e computador 1280 px):

  | Medição | 0.17.5 | 0.17.6 |
  | --- | --- | --- |
  | Elementos abaixo de 44 × 44 | 417 de 815 | 4 de 815 (links dentro de frases, exceção da WCAG) |
  | Elementos sem foco com contraste suficiente | 73 | 13 na primeira entrega; **0** depois da finalização da Central (seção 14) |

## 2. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/styles/acessibilidade.css` (novo) | Áreas de toque invisíveis, altura do seletor de dificuldade, cor do foco por tipo de fundo, contorno dos campos e anel duplo dos controles sobre cenários. Só tokens, sem HEX. |
| `src/main.tsx` | Importa `acessibilidade.css` logo depois de `ponte.css`. |
| `src/components/usePrenderFoco.ts` (novo) | Hook que prende o Tab dentro de uma janela aberta e, opcionalmente, fecha com Esc. |
| `src/components/map/aventura/Interface.tsx` | Janela da fase e ajuda do mapa usam o hook; a ajuda passa a fechar com Esc. |
| `src/components/character/ItemReward.tsx` | A janela de recompensa de item usa o hook. |
| `src/pages/story/StoryMap.tsx` | As janelas do baú e da introdução do mundo usam o hook. |
| `src/components/layout/ambiente.ts` (novo) | Função `ambienteDaRota`, que mapeia rotas para ambientes. |
| `src/components/layout/Layout.tsx` | Marca a aplicação (`.app`) com `data-ambiente`. |
| `src/styles/componentes/painel.css` | Central, autorizado: foco do botão Missões, do botão de fechar e dos itens do painel. |
| `src/styles/componentes/placa.css` | Central, autorizado: fundo do selo de aviso (`--aviso` → `--feedback-selo`); na finalização, anel duplo no foco dos rótulos, das placas dos modos e do "Continuar", e área invisível dos rótulos ampliada. |
| `src/styles/componentes/hud.css` | Central, finalização autorizada: anel duplo no foco do Perfil e das Configurações no topo. |
| `src/test/acessibilidade.test.tsx` (novo) | 9 testes: 8 dos passos 1.4 e 1.5 e 1 da finalização da Central. |
| `src/test/ponte.test.ts` | `acessibilidade.css` entra na lista de arquivos sem HEX; comentário atualizado. |
| `package.json`, `package-lock.json` | Versão 0.17.6. |
| Documentação | CHANGELOG, README, ROADMAP, `docs/README.md`, `docs/planos/ETAPA_2_DECISOES_OFICIAIS.md`, este relatório e `docs/relatorios/evidencias/etapa-2-fase1-0.17.6/`. |

## 3. Correções realizadas

1. **Foco sobre pergaminho e fundos claros.**
   - **Antes:** o contorno dourado (`--gold-strong`) ou azul-claro (`--foco`) ficava entre 1,2:1 e 2,9:1 sobre o pergaminho.
   - **Agora:** o contêiner define `--foco-local`.
     - Janelas, avisos, cartão da cena, topo da partida e topo do resultado: azul de foco sobre claro (`--foco-sobre-claro`, 5,4:1).
     - Páginas de aventura (Biblioteca, Perfil, Conquistas): tinta escura, porque o contorno encosta ao mesmo tempo em pergaminho, céu e grama.
     - Faixas e placas de madeira dentro dessas páginas: marfim.
     - Sobre fundos escuros, o dourado de antes continua valendo e segue o alto contraste antigo.
2. **Controles sobre cenários.** Os botões redondos, os medalhões das fases, os atalhos, o baú do topo e o "Pular" da cena ganharam anel duplo: marfim junto ao controle e tinta por fora. O anel fica visível sobre céu, grama, madeira ou fundo escuro.
3. **Campos de formulário.** Além do brilho de antes, um contorno sólido de 3 px.
4. **Foco preso nas janelas.**
   - **Antes:** nas janelas do mapa (fase, ajuda, baú e introdução do mundo) e na recompensa de item, o Tab saía para os elementos escondidos atrás.
   - **Agora:** o foco circula só dentro da janela.
5. **Esc na ajuda do mapa.** Antes não fechava; agora fecha, como a janela da fase.
6. **Central, autorizado: foco do painel de missões.**
   - Botão Missões: antes um contorno azul-claro de 2,07:1; agora um anel duplo de tinta e marfim (3,76:1 medido).
   - Botão de fechar e itens do painel: antes 1,75 a 1,85:1; agora azul de foco sobre claro (5,05 a 5,29:1).
7. **Central, autorizado: selo de aviso.** O fundo passa de `--aviso` (#C9452F, marfim sobre ele 4,05:1) para `--feedback-selo` (#A8321F, 5,64:1). Vale para o selo do botão Missões e do rótulo "Desafio diário".
8. **Área de toque roubando o clique** (encontrado e corrigido durante a validação).
   - **Problema:** na primeira versão, a área invisível do `li.chip` (página de um personagem na Biblioteca) ficava por cima do link de dentro. O clique no centro de "Eva", "Caim" e "Abel" caía no `li`, e não no link.
   - **Correção:** a regra vale agora só para elementos clicáveis (`:is(button, label).chip` e `.chip > a`). O link ganhou a própria área de 44 × 44.
   - **Verificação:** em 1.082 elementos interativos, nas 22 rotas e nas duas larguras, a lista de pontos centrais que caem em outro elemento é idêntica na 0.17.5 e na 0.17.6 (`centro-175.txt` e `centro-176.txt`). As 88 ocorrências dessa lista vêm de cabeçalhos fixos e sobreposições que já existiam e não mudaram.

## 4. Áreas de toque ampliadas

Método:
- um pseudo-elemento `::before` transparente e centralizado, com `inset: min(0px, calc((100% − 44px) / 2))`;
- só cresce o que é menor que 44 px;
- o componente mantém o mesmo tamanho e a mesma aparência.

| Elemento | Onde aparece | Antes (caixa) | Depois (área efetiva) |
| --- | --- | --- | --- |
| Links da navegação superior, marca, perfil e Desafio diário no topo | Telas com barra superior | 20–36 px de altura | 44 px |
| "Voltar" (`.back-link`) | Páginas internas | ~20 px | 44 px |
| Botões pequenos (`.btn-sm`), botões de ícone (`.icon-btn`) | Várias telas | 32–40 px | 44 px |
| Fichas (`.chip`) em botões e rótulos, e links dentro de fichas | Guarda-roupa, multiplayer, Biblioteca | 26–40 px | 44 px |
| Amostras de cor (`.swatch`) | Guarda-roupa | 36–40 px | 44 px |
| Links do rodapé e links soltos (`a.link` fora de frases) | Rodapé, janelas e telas | ~20 px | 44 px |
| Interruptores (`.switch`) | Configurações | 30 px de altura | 44 px |
| Baú do topo (`.av-bau-topo`) | Mapas | 40 px | 44 px |
| **Seletor de dificuldade** (`.av-dificuldade select`) | Mapa do Quiz | 36 px | **44 px, mudança visível**: um `<select>` não aceita área invisível |

**Medição** (`elementFromPoint` a partir do centro; limite de 43 px para absorver o arredondamento de 1 px):

| Medição | 0.17.5 | 0.17.6 |
| --- | --- | --- |
| Elementos abaixo de 44 × 44 | 417 de 815 | 4 de 815 |

Os 4 restantes são 2 links dentro de frases, no celular e no computador: "Ver a linha do tempo", na Biblioteca, e "Perfil", nas Configurações. A WCAG (2.5.8) isenta links dentro de texto corrido. Ampliá-los sobreporia as linhas vizinhas.

Os rótulos da cena da Central (`.camp-label`) mediam 42–43 px de altura no celular. Na primeira entrega eles não foram alterados, porque a Central estava congelada. Na finalização autorizada, a área invisível passou a 46 px de altura (medidos 45 px, com 1 px perdido no arredondamento), sem mudar o tamanho visual (seção 14).

## 5. Foco e teclado

**Medição do indicador de foco** (Tab em até 30 elementos por tela, 24 telas, computador):
- o elemento passa se a mediana do contraste do contorno for de pelo menos 3:1, ou se houver área com 3:1 de pelo menos 2 px × perímetro (critério da WCAG 2.4.13);
- o link "Pular para o conteúdo" fica fora da conta, porque o método o captura fora de posição.

| Medição | 0.17.5 | 0.17.6 |
| --- | --- | --- |
| Elementos sem indicador suficiente | 73 | 13 |

- Os 13 restantes estavam todos na Central, fora da autorização da primeira entrega. Foram corrigidos na finalização (seção 14).
- Na 0.17.5 foram medidos mais elementos (455 contra 439) porque o Tab escapava da janela do mapa do Quiz para os nós escondidos do mapa.
- 46 elementos que falhavam passaram a ter contraste suficiente. Alguns exemplos estão na tabela abaixo; a folha completa é `evidencias/etapa-2-fase1-0.17.6/foco-antes-depois.png`.

| Tela | Elemento | 0.17.5 | 0.17.6 |
| --- | --- | --- | --- |
| Mapa da História | Janela da fase: "Começar fase" | 1,17:1 | 3,82:1 |
| Mapa da História | Janela da fase: "Fechar" | 1,42:1 | 5,73:1 |
| Perfil | "Editar perfil" | 1,31:1 | 13,2:1 |
| Biblioteca | Cartão "Adão" | 1,49:1 | 6,59:1 |
| Partida | "Sair da partida" | 1,26:1 | 3,91:1 |
| Cena | "Pular" | 2,67:1 | 8,27:1 |
| Multiplayer | Seletores | 1,75:1 | 3,67:1 |
| Central | Botão Missões | 2,07:1 | 3,76:1 |
| Central | Itens do painel de missões | 1,75–1,82:1 | 5,05–5,24:1 |

**Teclado no navegador** (Chromium, build de produção, `teclado-175.txt` e `teclado-176.txt`): 16 Tabs e Shift+Tabs em cada janela, depois Esc.

| Janela | 0.17.5 | 0.17.6 |
| --- | --- | --- |
| Fase (mapa da História) | 15 de 16 focos fora da janela | 0 fora; Esc fecha |
| Desafio (mapa do Quiz) | 16 de 16 fora | 0 fora; Esc fecha |
| Ajuda (História e Quiz) | 8 de 8 fora; Esc não fecha | 0 fora; Esc fecha |

**Testes automáticos** (`src/test/acessibilidade.test.tsx`):
- foco preso e Esc na janela da fase e na ajuda;
- o hook devolve o foco para dentro.

Os testes da Central (`central.test.tsx`) e dos componentes base (`base.test.tsx`) continuam passando.

## 6. Ambientes identificados

| Ambiente (`data-ambiente`) | Identidade aprovada | Rotas |
| --- | --- | --- |
| `central` | Acampamento de Aventura | `/painel` |
| `historia` | Trilha da Jornada | `/historia` e subrotas; `/resultado` de partida do Modo História |
| `quiz` | Templo do Saber | `/quiz` e subrotas, `/diario`, `/revisao`; `/resultado` dos demais modos |
| `biblioteca` | Sala de Estudos | `/biblioteca` e subrotas, `/linha-do-tempo` |
| `perfil` | Tenda do Personagem | `/perfil`, `/estatisticas`, `/ranking`, `/guarda-roupa` |
| `conquistas` | Sala dos Troféus | `/conquistas` |
| sem atributo (neutro) | — | Boas-vindas, entrada, personagem, chegada, configurações, sobre, página não encontrada e administração |

**Garantia de que o atributo não muda a tela**, conferida por teste:
- só `tokens.css` seleciona `[data-ambiente]`;
- os tokens `--amb-*` só são lidos por `tokens.css` e pelos componentes base (`base-*.css`), que nenhuma tela usa;
- nenhum código, além de `ambiente.ts` e `Layout.tsx`, lê ou escreve o atributo.

A comparação das 88 capturas (seção 7) confirma isso na prática.

## 7. Comparações visuais

**Capturas determinísticas:**
- 44 telas × celular e computador, com hora fixa, sorteio com semente e animação reduzida;
- build de produção contra build de produção, ou desenvolvimento contra desenvolvimento, nunca misturados.

**Comparação da 0.17.6 com a 0.17.5:**

| Diferença | Telas | Explicação |
| --- | --- | --- |
| Texto "Versão 0.17.6" | Rodapé de todas as telas com rodapé, e página Sobre | Esperada |
| Seletor de dificuldade 8 px mais alto | Mapa do Quiz (e o mesmo mapa atrás da janela de desafio) | Esperada: única mudança visível de tamanho |
| Figura 3D do personagem ausente numa captura | Introdução do mundo, no computador | Tempo de carregamento do 3D: com espera maior, a figura aparece igual à 0.17.5 (`f2/av-tri.png` na pasta de trabalho) |
| 2 pixels de antisserrilhado (1 × 2 px) | Guarda-roupa, no computador | Arredondamento de subpixel, invisível |
| Tela de carregamento da Central | Celular e computador | Variação natural, igual entre execuções da 0.17.5 |

- Todas as outras capturas ficaram idênticas.
- Nenhuma diferença inesperada foi encontrada.
- A verificação final, com a correção do `li.chip`, está na seção 7.1.

**Central (pixel a pixel contra a 0.17.3/0.17.5, em 3D e 2D, no celular e no computador):**
- só dois blocos diferentes por captura: o selo do botão Missões (20 × 20 px) e o selo do rótulo "Desafio diário" (19 × 19 px);
- nada mais mudou: cenário, personagem, iluminação, posições, câmera, composição e rótulos;
- imagens: `central-selos-antes-depois.png` e `central-0.17.6-{cel,pc}-{3d,2d}.png`.

### 7.1 Verificação final (depois da correção do `li.chip`)

As 88 capturas foram refeitas com o código final:
- **41 idênticas** à 0.17.5;
- as outras 47 diferem só pelos motivos da tabela acima: rodapé com a versão, seletor de dificuldade, selos da Central (também na tela de carregamento, que mostra a Central por trás) e os 2 pixels do Guarda-roupa.

Duas capturas deram diferença numa rodada por questão de tempo e ficaram iguais ao repetir:
- o personagem 3D do Guarda-roupa ainda carregando;
- a janela da fase aberta numa captura e ainda fechada na outra.

A Central final ficou idêntica pixel a pixel à rodada anterior: só os dois selos diferem da 0.17.3.

## 8. Alto contraste e animação reduzida

- **Alto contraste:**
  - mesmas telas (mapas, livros, desafio, Quiz, Biblioteca, Perfil, Configurações, Conquistas), com alto contraste e animação reduzida ligados, build de produção da 0.17.5 contra o da 0.17.6;
  - 4 telas idênticas;
  - as demais diferem só na faixa da versão no rodapé, no seletor de dificuldade mais alto (que empurra o mapa do Quiz alguns pixels para baixo, como no modo normal) e em 2 pixels isolados na Biblioteca do celular;
  - o contorno de foco nas telas escuras continua usando `--gold-strong`, que o alto contraste antigo redefine.
- **Animação reduzida:**
  - todas as capturas foram feitas com ela ligada;
  - `acessibilidade.css` não acrescenta animação nem transição.

## 9. Testes e build

- `npm run typecheck`: sem erros.
- `npm test`: 182 testes, 16 arquivos, todos passando (9 novos em `acessibilidade.test.tsx`).
- `npm run build`: concluído (`index-D5ccq1Tw.js` e `index-CBDjEZSH.css`).

## 10. Limitações

- As medições de toque, foco e teclado foram feitas só no Chromium (Playwright). Safari e Firefox não foram testados.
- **Medição de toque:**
  - verifica onde o clique chega (`elementFromPoint`) a partir do centro;
  - o limite de 43 px absorve o arredondamento de 1 px;
  - a varredura tem um teto (por isso aparecem larguras como 121 px).
- **Medição de foco:**
  - captura o elemento com e sem foco e compara os pixels;
  - não vale para o link "Pular para o conteúdo", que o método captura fora de posição.
- O seletor de dificuldade ficou visualmente mais alto (36 → 44 px), porque um `<select>` nativo não aceita área invisível.
- Os componentes base e os tokens de ambiente continuam sem uso nas telas: a ativação dos tons aprovados depende de nova autorização.

## 11. Problemas não resolvidos

**Resolvidos na finalização autorizada (seção 14).** Esta tabela registra a situação da primeira entrega. Todos ficavam na **Central**, que só podia receber as duas correções autorizadas:

| Elemento | Problema | Medida |
| --- | --- | --- |
| Rótulos da cena (`.camp-label`), 4 no 3D e 4 no 2D | Foco azul-claro sobre o cenário | 1,5–1,85:1 (2 rótulos do 2D sem indicador medível) |
| Rótulos da cena no celular | Altura de toque | 42–43 px |
| Perfil no topo (`.hud-player`) e Configurações (`.hud-settings`) | Foco azul-claro | 2,36:1 e 2,15:1 |
| Placas dos modos (`.camp-modo`, 2) | Foco azul-claro | 1,51:1 e 1,45:1 |
| "Continuar" (`.camp-continuar`) | Foco azul-claro | 1,43:1 |

A sugestão (anel duplo do botão Missões e área invisível nos rótulos) foi autorizada e aplicada.

Nada da Central fica pendente.

Fora da Central:
- os 2 links dentro de frases ficam como estão, pela exceção da WCAG;
- os dois sistemas de alto contraste continuam separados, como pedido.

## 12. Evidências

Pasta `docs/relatorios/evidencias/etapa-2-fase1-0.17.6/`:

| Arquivo | Conteúdo |
| --- | --- |
| `foco-antes-depois.png` | 8 elementos com foco pelo teclado, na 0.17.5 e na 0.17.6 |
| `seletor-dificuldade-antes-depois.png` | Seletor de dificuldade do mapa do Quiz, nas duas versões |
| `central-selos-antes-depois.png` | Os dois selos da Central (3D no celular e 2D no computador), nas duas versões |
| `central-0.17.6-{cel,pc}-{3d,2d}.png` | A Central inteira na 0.17.6 |
| `teclado-175.txt`, `teclado-176.txt` | Tab, Shift+Tab e Esc nas janelas dos mapas |
| `centro-175.txt`, `centro-176.txt` | Onde cai o clique no centro de cada elemento interativo (listas idênticas) |
| `central-foco-{cel,pc}-{3d,2d}.png` | Finalização: foco dos rótulos, do topo, das placas e do "Continuar", antes e depois |
| `tab-central-aprovada.json`, `tab-central-final.json` | Finalização: ordem do Tab e do Shift+Tab na Central, nas quatro situações |
| `centro-176-final.txt` | Finalização: clique no centro dos 1.082 elementos, igual à 0.17.6 aprovada |

## 13. Verificação final

| Verificação | Resultado |
| --- | --- |
| Tipos, testes e build | Sem erros; 182 testes em 16 arquivos; build concluído |
| 88 capturas | 41 idênticas; as demais só com as diferenças esperadas (seção 7.1) |
| Central (3D e 2D, celular e computador) | Sem foco, só os dois selos diferem da 0.17.3 |
| Alto contraste e animação reduzida | Sem mudança além das diferenças esperadas |
| Toque | 4 de 815 abaixo de 44 × 44, todos links dentro de frases |
| Foco | 0 sem contraste suficiente (depois da finalização da Central) |
| Teclado | Foco preso e Esc nas janelas dos mapas |
| Clique no centro dos elementos | Igual à 0.17.5 (nenhum clique novo desviado) |
| Integração e publicação | Feitas em 21/11/2026, depois da aprovação (ver `VERIFICACAO_PUBLICACAO.md`) |

## 14. Finalização autorizada da Central

Na avaliação técnica, os passos 1.4 e 1.5 foram aprovados, com autorização adicional para corrigir o foco dos elementos que restavam na Central e a área de toque dos rótulos. A correção pertence à 0.17.6; não foi criada uma nova versão.

### 14.1 Mudanças

| Elemento | Foco antes | Foco agora |
| --- | --- | --- |
| Rótulos da cena (`.camp-label`), 3D e 2D | Contorno azul-claro (`--foco`) | Anel duplo: tinta por fora (`outline` 3 px, afastado 3 px) e marfim por dentro (`box-shadow` de 3 px) |
| Perfil (`.hud-player`) e Configurações (`.hud-settings`) no topo | Azul-claro, afastado 2 px | O mesmo anel duplo, afastado 3 px |
| Placas dos modos (`.camp-modo`) | Azul-claro | O mesmo anel duplo |
| "Continuar" (`.camp-continuar`) | Azul-claro | O mesmo anel duplo |

- O anel é o mesmo já aprovado no botão Missões.
- As sombras originais de cada elemento continuam por trás do anel.
- O anel aparece **só** com foco pelo teclado (`:focus-visible`).

**Área de toque dos rótulos:**
- o pseudo-elemento invisível passou de `inset: -7px -4px` para `-8px -5px` (30 + 16 = 46 px);
- no celular, de `-8px -4px` para `-9px -5px` (28 + 18 = 46 px);
- os 2 px de folga cobrem o arredondamento de posição que fazia a medida cair para 42–43 px.

**O que não mudou:** cenário, personagem, câmera, iluminação, posição, composição, textos, tamanho visual e funcionalidades.

### 14.2 Validação

1. **Contraste do foco** (Central com o painel de missões fechado; celular e computador, 3D e 2D; 32 elementos por largura):

   | Situação | Elementos sem indicador suficiente |
   | --- | --- |
   | 0.17.6 aprovada | 13 no celular, 13 no computador |
   | Finalizada | **0 no celular, 0 no computador** |

   Na medição geral (com o painel aberto no computador), os rótulos "Desafio diário" e "Recompensas" ficam atrás do painel e por isso não podem ser medidos ali. Com o painel fechado, todos passam.
2. **Fundos diferentes:**
   - os rótulos ficam sobre céu, folhagem, tenda e madeira;
   - o topo, sobre o céu do 3D (escuro) e do 2D (claro);
   - as placas e o "Continuar", sobre o chão e a madeira.

   Em todos, pelo menos uma das duas cores do anel tem 3:1 com o fundo numa faixa de 2 px em todo o contorno (critério da WCAG 2.4.13). A mediana varia de 1,3:1 a 4,6:1 conforme o fundo, porque, num anel duplo, uma das cores sempre se confunde com o fundo e a outra contrasta. Imagens: `central-foco-{cel,pc}-{3d,2d}.png`.
3. **Tab e Shift+Tab:**
   - nas quatro situações, a ordem é idêntica à da 0.17.6 aprovada;
   - o Shift+Tab percorre exatamente a ordem inversa;
   - os 10 elementos-alvo recebem foco visível, com contorno;
   - arquivos: `tab-central-aprovada.json` e `tab-central-final.json`.
4. **Área de toque dos rótulos:** todos medem 45 px efetivos no celular e no computador (46 px reais). O total geral continua em 4 de 815 abaixo de 44 px, todos links dentro de frases.
5. **Central antes e depois, sem foco:**
   - em 3D e 2D, no celular e no computador, idêntica pixel a pixel à 0.17.6 aprovada;
   - numa rodada apareceu 1 ponto de 1 × 2 px no 3D do computador, que sumiu ao repetir (variação do 3D);
   - em relação à 0.17.3, continuam diferentes só os dois selos.
6. **Sem foco, nada muda:**
   - as regras novas estão todas em `:focus-visible`;
   - a ampliação dos rótulos é transparente;
   - a comparação do item 5 confirma isso.
7. **1.082 elementos interativos:**
   - o clique no centro de cada um chega aonde chegava na 0.17.6 aprovada;
   - as listas são idênticas: 88 ocorrências que já existiam, de cabeçalhos fixos e sobreposições;
   - numa rodada com duas medições em paralelo, 4 elementos não chegaram a carregar; em rodadas separadas, as duas versões deram 1.082.
8. **88 capturas** (comparadas com a 0.17.6 aprovada):
   - 75 idênticas;
   - as 13 restantes vêm do carregamento do personagem 3D, do retrato no topo, da janela da fase aberta ou não na captura, da tela de carregamento e de 1 a 10 pixels de antisserrilhado;
   - as classes alteradas só existem nos componentes da Central (`CenaAcampamento`, `AcoesAcampamento` e a página da Central).
9. **Typecheck, testes e build:** sem erros; 182 testes em 16 arquivos; build concluído (`index-CAU2Jrfx.js` e `index-oSlaMjt9.css`).

### 14.3 Testes novos

Em `acessibilidade.test.tsx`, um teste confere:
- o anel duplo nos rótulos, no topo, nas placas e no "Continuar";
- que nenhum foco da Central usa mais o azul-claro;
- a área invisível dos rótulos (−8 px, e −9 px no celular).

O teste da primeira entrega, que exigia esses focos inalterados, foi atualizado de acordo com a autorização.

