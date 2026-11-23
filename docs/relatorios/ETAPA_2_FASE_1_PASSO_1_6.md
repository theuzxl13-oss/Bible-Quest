# Bible Quest 0.17.7 — Etapa 2, Fase 1, passo 1.6: unificação do alto contraste

**Data:** 23/11/2026
**Branch:** `claude/loving-carson-8mrbjo`
**Situação:** em avaliação. Não foi integrada ao `main` nem publicada.

## 1. Resumo

- **Antes:** o jogo tinha dois sistemas de alto contraste, ligados pela mesma opção:
  - o antigo, em preto e amarelo, em `global.css`;
  - o da Central, em terra e marfim, em `tokens.css` e nos componentes.
- **Agora:** existe um só sistema, na família terra e marfim da Central:
  - todos os valores vêm de `tokens.css`;
  - as regras das telas antigas ficam num único arquivo, `alto-contraste.css`, que só usa tokens;
  - a Central e os componentes `bq-*` mantêm as regras que já tinham, com os mesmos tokens.
- **Principal problema encontrado:** o modo antigo pintava de preto os cartões claros de pergaminho (Perfil, Biblioteca, Conquistas), mas o texto deles continuava escuro. O resultado era texto preto sobre preto.

**Medição do texto** (3.523 textos, 27 telas, celular e computador):

| Modo | Textos abaixo de 4,5:1 (3:1 no texto grande) |
| --- | --- |
| Normal (não muda) | 103 |
| Alto contraste da 0.17.6 | 257 |
| **Alto contraste da 0.17.7** | **0** |

**Medição do foco:**

| Medição | 0.17.6 | 0.17.7 |
| --- | --- | --- |
| Elementos com foco insuficiente no alto contraste | 9 | 0 |

Na primeira medição sobraram 2: rótulos que recebiam foco mesmo encobertos pelo painel de missões aberto. A verificação final (seção 9) mostrou que o problema era real e o corrigiu.

**O que não mudou:**
- a Central: sem foco, em alto contraste, é idêntica pixel a pixel à 0.17.6, em 3D e 2D, no celular e no computador;
- o modo normal: igual ao da 0.17.6;
- a opção, a preferência salva e a redução de animações: iguais às de antes.

## 2. Diagnóstico: como funcionava

### 2.1 Ativação (um só interruptor)

| Etapa | Onde |
| --- | --- |
| Opção "Alto contraste" | `src/pages/Settings.tsx` (interruptor) |
| Preferência salva | `settings.highContrast`, em `localStorage` (`bible-quest:v1:settings`, `src/services/storage/repositories.ts`) |
| Aplicação | `src/state/GameContext.tsx`: `html[data-contrast='alto' \| 'normal']` a cada mudança e ao abrir o jogo |
| Redução de animações | Atributo separado, `html[data-motion='reduzido' \| 'normal']`, pela mesma rotina |

Não havia detecção da preferência do sistema operacional (`prefers-contrast`) nem regras para `forced-colors`.

### 2.2 Os dois sistemas que respondiam ao interruptor

| | Sistema antigo (preto e amarelo) | Sistema da Central (terra e marfim) |
| --- | --- | --- |
| Onde | `global.css`: bloco de variáveis (linhas 43–54) e regras nas linhas 1304–1305 e 1412–1414 | `tokens.css` (2 blocos) e regras em `hud.css`, `navegacao.css`, `painel.css`, `placa.css` e nos 10 `base-*.css` |
| Variáveis | `--navy-900` `#000`, `--navy-850` `#05080f`, `--navy-800` `#0a0f1c`, `--text` `#fff`, `--muted` `#e6dcc6`, `--gold` `#ffd36b`, `--gold-strong` `#ffe39b`, `--border` `rgba(255,211,107,.6)`, `--border-strong` `#ffd36b`, `--panel` `#05080f` | `--superficie-madeira`, `--superficie-leitura`, `--vidro-escuro`, `--moldura`, `--texto-suave-*`, `--foco-sobre-claro`, `--borda-suave` |
| Regras | `.panel`, `.lib-card`, `.mode-card`, `.history-item`, `.btn-outline`, `.chip` e `.topbar` com fundo `#000` e borda `#ffd36b`; `.quiz-body .option` e `.question` com fundo `#000`; `main::before` (cenário do topo) oculto; `.section-title` preto e sem recorte | HUD, navegação inferior, painel de missões, rótulos e placas da Central, e componentes `bq-*` (que nenhuma tela usa ainda) |
| Cores | HEX fixos fora de `tokens.css` | Só tokens |
| Telas | Telas antigas com barra superior: Configurações, Sobre, Treino, Livros, Livro, Fase, perguntas, resultado, multiplayer, revisão, linha do tempo, estatísticas, ranking, entrada, personagem, guarda-roupa e página não encontrada. Também atingia, por engano, os cartões claros de Biblioteca, Perfil e Conquistas | A Central inteira e a navegação inferior de todas as telas que a mostram |

Nenhum dos dois sistemas atingia os mapas (História e Quiz), as cenas nem a maior parte de Conquistas, que usam cores fixas. Na comparação das 88 capturas, essas telas mudavam de 0% a 3% entre o modo normal e o alto contraste.

### 2.3 Conflitos encontrados

1. **Texto preto sobre preto.** As regras antigas (`.panel`, `.lib-card`, `.btn-outline`, `.chip`) pintavam de preto os cartões de pergaminho das páginas de aventura, mas não mudavam a cor do texto, que continuava marrom-escuro:
   - Biblioteca: 136 textos abaixo do mínimo (0 no modo normal);
   - Perfil: 62 (6 no normal);
   - nas Configurações, a ficha selecionada ("Normal") ficava com texto escuro sobre preto (1,4:1).

   **O alto contraste deixava essas telas menos legíveis que o modo normal.**
2. **Duas paletas na mesma tela:** painéis pretos com borda amarela ao lado da navegação inferior em terra e marfim.
3. **HEX fora dos tokens:** o modo antigo trocava as variáveis antigas diretamente, por cima da ponte de compatibilidade (exceção registrada no comentário de `ponte.css`).
4. **Respostas sem preenchimento:**
   - o fundo `#000` em `.quiz-body .option` apagava o verde da resposta certa e o vermelho da errada, que ficavam só com a borda colorida;
   - as alternativas descartadas continuavam com 45% de opacidade.
5. **Foco apagado na Central** (já existia na 0.17.6): no alto contraste, a regra `box-shadow: none` do topo (Perfil, Configurações) e do botão Missões tem especificidade maior que a do foco e apagava o anel marfim. Sobrava só o contorno escuro, que some sobre o céu escuro do 2D (1,35 a 1,68:1).
6. **Ponte e tokens:** não houve conflito de valores. A ponte usa `:root` e o alto contraste usa `html[data-contrast]`, mais específico. O problema era só ter dois lugares com valores diferentes.
7. **Redução de animações:** sem conflito. São atributos independentes, o alto contraste não tem animações, e as duas opções funcionam juntas.

## 3. Proposta e solução adotada

**Um só modo, na família de cores da Central** (direção registrada na auditoria da Fase 1: "terra e marfim, um só modo de alto contraste"), em três peças:

1. **Valores, em `tokens.css`:** um único bloco `html[data-contrast='alto']` define:
   - tokens de significado: `--ac-escuro-*`, `--ac-claro-*`, `--ac-selecionado-*`, `--ac-acerto-*`, `--ac-erro-*` e `--ac-fundo`;
   - as mesmas 10 variáveis antigas que o modo antigo trocava (mais `--ok` e `--err`), agora como `--legado-*` apontando para a paleta. A ponte continua sendo o único mapeamento das variáveis antigas.
2. **Regras, em `alto-contraste.css`** (novo, só tokens, carregado por último). Duas famílias de superfície, sempre sólidas e sem sombra:
   - **escura** (painéis, cartões, botões contornados, fichas, barra superior, perguntas e alternativas das telas antigas): terra-900, texto marfim, borda ouro-300;
   - **clara** (cartões de pergaminho de Biblioteca, Perfil e Conquistas): pergaminho, texto tinta, borda tinta.

   Também nesse arquivo:
   - item escolhido (fichas e abas): ouro-300 com texto tinta;
   - respostas com preenchimento sólido: verde-floresta para a certa, vermelho escuro para a errada. Os ícones ✓ e ✕ continuam;
   - alternativa descartada sem transparência, com texto atenuado legível (9,3:1);
   - cartões bloqueados sem cinza nem transparência no alto contraste;
   - aviso "Próximo mundo" do mapa da História em placa escura sólida (era branco sobre verde, 3,3:1);
   - links e textos soltos sobre o fundo escuro das páginas de aventura em marfim; dentro dos cartões claros, em tinta;
   - botão de perigo sobre pergaminho em vermelho escuro (6,8:1).
3. **Central:** só dentro do alto contraste, o anel marfim do foco volta ao topo e ao botão Missões (`hud.css` e `painel.css`). A aparência normal e a aparência sem foco no alto contraste não mudam.
   - O fundo sólido da página no alto contraste não se aplica à Central, cujo fundo é a cena. Assim, ela continua idêntica pixel a pixel.

**Removido de `global.css`:** o bloco de variáveis e as 5 regras do modo antigo. São só regras de alto contraste, substituídas por equivalentes; nenhuma classe nem estilo normal foi removido.

## 4. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/styles/alto-contraste.css` (novo) | Regras do alto contraste unificado para as telas antigas e as páginas de aventura, só com tokens |
| `src/styles/tokens.css` | Bloco do alto contraste unificado: tokens `--ac-*` e as variáveis antigas (`--legado-*`) no modo alto contraste |
| `src/styles/global.css` | Saem o bloco de variáveis (preto e amarelo) e as 5 regras do modo antigo; fica um comentário apontando para o novo lugar |
| `src/main.tsx` | Importa `alto-contraste.css` como o último estilo |
| `src/styles/componentes/hud.css`, `painel.css` | Central, só no alto contraste: o anel marfim do foco volta |
| `src/styles/acessibilidade.css` | Só o comentário sobre `--gold-strong` |
| `src/test/altoContraste.test.tsx` (novo) | 7 testes do alto contraste unificado |
| `src/test/ponte.test.ts` | O teste do modo antigo passa a conferir o modo unificado; `alto-contraste.css` entra na lista de arquivos sem HEX |
| `src/test/acessibilidade.test.tsx` | Um comentário e o teste do foco com o painel de missões aberto (seção 9) |
| `src/components/usePularEncobertos.ts` (novo) e `src/components/camp/PainelMissoes.tsx` | Com o painel de missões aberto, o Tab pula o que fica encoberto por ele (seção 9) |
| `package.json`, `package-lock.json` | Versão 0.17.7 |
| Documentação | Este relatório, evidências, CHANGELOG, README, ROADMAP, `docs/README.md` e `docs/planos/ETAPA_2_DECISOES_OFICIAIS.md` |

## 5. Medições de contraste dos tokens

| Par | Uso | Contraste |
| --- | --- | --- |
| marfim / terra-900 | Texto sobre superfície escura | 14,90:1 |
| marfim-suave / terra-900 | Alternativa descartada | 9,34:1 |
| ouro-300 / terra-900 | Borda e destaque sobre escuro | 10,80:1 |
| tinta / pergaminho | Texto sobre superfície clara | 13,64:1 |
| tinta / ouro-300 | Item escolhido | 9,98:1 |
| marfim / floresta-700 | Resposta certa | 8,44:1 |
| marfim / vermelho-700 | Resposta errada | 6,83:1 |
| vermelho-700 / pergaminho | Botão de perigo sobre pergaminho | 6,8:1 |
| verde-200 / terra-900 e vermelho-200 / terra-900 | Bordas da resposta certa e da errada | 10,10:1 e 8,52:1 |
| azul de foco / pergaminho | Foco sobre fundo claro | 5,38:1 |

- **Referência do modo antigo:** branco sobre preto, 21:1; amarelo sobre preto, 14,8:1.
- **O que ficou menor:** o contraste máximo cai de 21:1 para 14,9:1, ainda bem acima do nível AAA (7:1).
- **O que melhorou:** o contraste **mínimo**. No modo antigo, os cartões claros chegavam a 1,15:1; agora nenhum texto medido fica abaixo de 4,5:1.
- **Teste automático:** um teste calcula esses pares a partir de `tokens.css` e falha se algum texto ficar abaixo de 4,5:1 ou alguma borda abaixo de 3:1.

## 6. Comparação antes e depois

### 6.1 Texto, por tela (celular + computador)

Método:
- uma captura da página inteira por tela;
- a cor de cada texto contra o fundo real, medido nos pixels da própria caixa (vale para gradientes e imagens);
- critério WCAG 1.4.3.

Ficam fora da conta:
- controles desativados, isentos pela WCAG;
- textos cobertos por elementos fixos, como a barra inferior na captura de página inteira;
- textos atrás de uma janela aberta;
- o link "Pular para o conteúdo", que fica fora da tela.

| Tela | Textos | Normal | Alto contraste 0.17.6 | Alto contraste 0.17.7 |
| --- | --- | --- | --- | --- |
| Biblioteca | 205 | 0 | **136** | 0 |
| Perfil | 172 | 6 | **62** | 0 |
| Conquistas | 218 | 49 | 49 | 0 |
| Guarda-roupa | 123 | 10 | 0 | 0 |
| Linha do tempo | 482 | 7 | 0 | 0 |
| Mapa da História (aviso do próximo mundo) | 14 | 6 | 6 | 0 |
| Configurações | 110 | 4 | 4 | 0 |
| Demais 20 telas (Central 3D e 2D, cena, desafio, diário, entrada, estatísticas, fase, ficha, janela da fase, livro, livros, modalidade, multiplayer, página não encontrada, mapa do Quiz, ranking, revisão, Sobre, treino) | 2.199 | 21 | 0 | 0 |
| **Total** | **3.523** | **103** | **257** | **0** |

Detalhes por texto: `evidencias/etapa-2-fase1-0.17.7/contraste-texto-*.txt`.

### 6.2 Capturas

As 88 capturas foram feitas em produção contra produção, com data fixa, sorteio com semente e animação reduzida:

| Comparação | Resultado |
| --- | --- |
| Modo normal, 0.17.7 × 0.17.6 | 85 idênticas; 3 com as variações conhecidas de carregamento (prévias 3D do Guarda-roupa e janela da fase, no máximo 9/255). **Nenhuma mudança no modo normal.** |
| Alto contraste, 0.17.7 × 0.17.6 | 4 idênticas (mapa do Quiz e janela de desafio, no celular e no computador); as demais com a mudança esperada para terra, marfim e pergaminho. No mapa da História, a diferença é o aviso do próximo mundo, a variação de carregamento do personagem e a tela de carregamento da Central |
| Central em alto contraste, sem foco (3D e 2D, celular e computador) | **Idêntica pixel a pixel** à 0.17.6 |

Folhas em `evidencias/etapa-2-fase1-0.17.7/`:
- `comparacao-*.jpg`: normal, alto contraste da 0.17.6 e alto contraste da 0.17.7;
- `central-alto-contraste-*.jpg`: a Central em alto contraste.

## 7. Testes realizados

1. **Alto contraste em todas as telas relevantes:** 27 telas × celular e computador na medição de texto, e as 88 capturas.
2. **Antes e depois:** seções 6.1 e 6.2.
3. **Fundos claros e escuros:** as duas famílias de superfície foram medidas (pergaminho com tinta e terra com marfim), além do texto sobre os cenários dos mapas e das páginas de aventura.
4. **Foco pelo teclado:**
   - medição geral (24 telas, Tab em até 30 elementos, no computador): 9 elementos com indicador insuficiente na 0.17.6 e 2 na 0.17.7;
   - Central com o painel de missões fechado, no celular e no computador: de 7 para **0**;
   - os 2 restantes eram rótulos da Central que recebiam foco atrás do painel de missões aberto. Isso foi corrigido na verificação final (seção 9), e a medição passou a 0;
   - imagens: `foco-central-alto-contraste.png`; números: `foco-*.txt`.
5. **Formulários, botões, avisos, cartões, mapas e janelas:** cobertos pelas telas de entrada, configurações, multiplayer, perguntas, resultado, Biblioteca, Perfil, Conquistas, mapas e janela da fase, todas com 0 textos abaixo do mínimo.
6. **Central em 3D e 2D:** idêntica sem foco; foco medido nas quatro combinações.
7. **Com redução de animações:** todas as medições e capturas foram feitas com as duas opções ligadas. Um teste confere que, ao abrir o jogo, as duas preferências salvas são aplicadas juntas.
8. **Persistência:**
   - o teste já existente confere que o interruptor grava `highContrast: true`;
   - o teste novo confere que a preferência salva liga o modo ao abrir o jogo;
   - a chave e o formato da preferência não mudaram.
9. **Nenhuma opção antiga sumiu:**
   - o interruptor "Alto contraste" continua nas Configurações;
   - um teste confere que as 10 variáveis e as 11 superfícies que o modo antigo cobria continuam cobertas.
10. **Typecheck, testes e build:**
    - typecheck sem erros;
    - **190 testes em 17 arquivos**, todos passando (7 novos em `altoContraste.test.tsx` e 1 em `acessibilidade.test.tsx`, da seção 9);
    - build concluído (`index-70rtdYm8.js` e `index-BVuaq63J.css`).

## 8. Limitações e pendências

- **Navegador:** só Chromium (Playwright), com vídeo por software. Safari, Firefox, aparelhos reais e leitores de tela não foram testados.
- **Medição de texto por pixels:** usa a mediana do fundo dentro da caixa do texto. Pode errar em textos com contorno grosso ou sobre imagens muito variadas. Os casos duvidosos foram conferidos nas imagens.
- **Modo normal:** continua com 103 textos abaixo do mínimo, sobretudo as descrições de Conquistas e o Guarda-roupa. Ele não muda nesta versão; quem precisa de mais contraste tem o alto contraste, que agora não tem nenhum.
- **Preferência do sistema** (`prefers-contrast: more`) e **cores forçadas do Windows** (`forced-colors`): não eram tratadas antes e continuam sem tratamento. Ligar o modo pela preferência do sistema seria uma funcionalidade nova; fica como sugestão.
- **Contraste máximo:** no alto contraste, o texto principal passa de branco sobre preto (21:1) para marfim sobre terra (14,9:1). Os dois estão muito acima do nível AAA, e o mínimo melhorou (seção 5).
- **Resposta errada:** 6,83:1, acima de AA (4,5:1) e um pouco abaixo de AAA (7:1). Não existe um vermelho mais escuro na paleta, e criar um novo tom ficou fora do escopo.
- **Mapas e cenas:** continuam com o cenário ilustrado no alto contraste. Só o aviso do próximo mundo mudou, porque era o único texto abaixo do mínimo.

## 9. Verificação final: foco com o painel de missões aberto

Pedida antes da integração, para explicar os 2 rótulos que a medição geral de foco marcava como insuficientes.

### 9.1 O que foi verificado

O teste abriu a Central (build de produção) e o painel de missões nas 8 combinações:
- celular e computador;
- 3D e 2D;
- modo normal e alto contraste.

Em cada uma, percorreu os elementos com 22 Tabs e 21 Shift+Tabs. Para cada foco, registrou quanto do elemento estava visível, medindo 15 pontos da caixa.

**Resultado: os rótulos encobertos recebiam foco.** O painel de missões não é uma janela modal: é uma seção que abre ao lado do botão, e o resto da Central continua na ordem do Tab. Com ele aberto, o foco parava em elementos escondidos atrás dele, o que fere a WCAG 2.4.11 (foco não encoberto):

| Combinação | Elementos que recebiam foco encobertos pelo painel |
| --- | --- |
| Computador, 3D | Rótulos "Desafio diário" (20% visível) e "Recompensas" (40% visível) |
| Computador, 2D | Os mesmos dois rótulos, 0% visíveis |
| Celular, 3D | Placas "História" e "Quiz", "Começar/Continuar" e o rótulo "Recompensas", 0% visíveis |
| Celular, 2D | Os mesmos, mais o rótulo "Biblioteca" |

Era o mesmo resultado no modo normal e no alto contraste. A medição geral de foco só via os dois rótulos do computador, porque só mede nessa largura.

### 9.2 Correção (só comportamento de foco)

O hook novo `src/components/usePularEncobertos.ts` foi ligado ao painel em `PainelMissoes.tsx`:
- enquanto o painel está aberto, Tab e Shift+Tab pulam os elementos com metade ou mais da área sob o painel e vão ao próximo visível, na mesma ordem de antes;
- os elementos visíveis continuam recebendo foco;
- com o painel fechado, nada muda.

**Não mudaram:** a aparência, a composição, o CSS, a abertura e o fechamento do painel (botão, Esc e "Fechar missões") nem o clique com o mouse.

### 9.3 Resultado

| Verificação | Resultado |
| --- | --- |
| Foco em elemento encoberto, painel aberto (8 combinações, Tab e Shift+Tab) | Antes: de 2 a 5 elementos por combinação. Depois: **0** |
| Elementos visíveis que deixaram de receber foco | Nenhum |
| Ordem do Tab e do Shift+Tab com o painel fechado (4 combinações) | Idêntica à 0.17.6 |
| Medição geral de foco, modo normal | Antes: 2 insuficientes (os rótulos encobertos). Depois: **0** |
| Medição geral de foco, alto contraste | Antes: 2. Depois: **0** |
| Central sem foco, alto contraste (3D e 2D, celular e computador) | Idêntica pixel a pixel à 0.17.6 |
| Central sem foco, modo normal | Idêntica à 0.17.6. No 2D do computador, as três rodadas novas ficaram iguais a uma rodada da própria 0.17.6; a captura desse modo tem dois estados possíveis, os dois já presentes na 0.17.6. Um ponto de 1 × 2 px no 3D do computador, numa rodada, sumiu ao repetir |
| Teste automático novo (`acessibilidade.test.tsx`) | Painel aberto: o Tab pula o botão encoberto nos dois sentidos. Painel fechado: a ordem é a de sempre |
| Typecheck, testes e build | Sem erros; **190 testes em 17 arquivos**; build concluído |

**Evidências** (`evidencias/etapa-2-fase1-0.17.7/painel-aberto/`):
- `antes-foco-encoberto-*.jpg`: o foco parado num rótulo atrás do painel;
- `tab-painel-aberto-antes.json` e `tab-painel-aberto-depois.json`: a sequência completa de Tab e Shift+Tab, com a porcentagem visível de cada foco.
