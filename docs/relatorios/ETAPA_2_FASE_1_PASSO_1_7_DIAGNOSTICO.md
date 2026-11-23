# Bible Quest — Etapa 2, Fase 1, passo 1.7: diagnóstico e planejamento

**Data:** 23/11/2026
**Base analisada:** versão 0.17.7 publicada (`main` em `8432066`)
**Branch:** `claude/loving-carson-8mrbjo`
**Situação:** só diagnóstico e planejamento. **Nenhuma linha de código foi alterada.** Aguarda avaliação.

## 1. Resumo

- **Objetivo do passo 1.7:** levar as telas antigas para as paletas oficiais, ambiente por ambiente.
- **Paletas usadas:** só as aprovadas, ou seja, os tokens de `tokens.css` (`--amb-*` e a paleta da Central) e a folha de amostras (`docs/relatorios/evidencias/etapa-2-fase1-amostras/FOLHA_AMOSTRAS.md`). Nenhuma cor nova.

**Principais conclusões:**

1. **As variáveis antigas alcançam só parte das telas.**
   - **Medição:** as 31 variáveis de cor da ponte foram trocadas por magenta, um teste que não é proposta (seção 3.3).
   - **Onde alcançam:** 12% a 79% dos pixels nas telas com barra superior (livro, fase, treino, multiplayer, revisão, fichas, linha do tempo, estatísticas, ranking, configurações).
   - **Onde quase não alcançam:** 0% a 6% nos mapas, cenas, perguntas, Biblioteca, Perfil e Conquistas. Essas telas usam cores fixas.
   - **Consequência:** trocar só a ponte não leva as paletas a todas as telas, e trocá-la globalmente mudaria tudo de uma vez.
2. **A Central é independente das variáveis antigas.** Com as 31 em magenta, ela continua idêntica pixel a pixel: 3D e 2D, celular e computador, painel fechado e aberto, modo normal e alto contraste.
3. **`data-ambiente` está correto em todas as rotas.**
   - A marcação fica na `div.app`. Nenhum conteúdo é renderizado fora dela por portais.
   - **Hoje nenhuma tela consome os tokens de ambiente.** Só os componentes base `bq-*` usam `--amb-*`, e nenhuma tela usa esses componentes.
4. **O maior risco é o alto contraste.**
   - Ele troca as variáveis antigas no elemento `html`.
   - Se o 1.7 redefinir as mesmas variáveis no `.app[data-ambiente]`, que fica mais perto do conteúdo, o valor do ambiente **venceria o do alto contraste**.
   - **Regra obrigatória:** toda regra de ambiente fica desligada no alto contraste.
5. **Proposta:**
   - um arquivo novo, `src/styles/ambientes.css`, só com tokens;
   - em cada ambiente, uma "ponte por ambiente" (as variáveis antigas apontando para `--amb-*`), mais substituições pontuais das cores fixas, sempre limitadas àquele ambiente;
   - uma entrega por ambiente, na ordem Conquistas → Biblioteca → Perfil → Quiz → História.

## 2. Como as 39 variáveis antigas se ligam à ponte (item 1)

**Caminho de cada variável:**

```
global.css   :root { --gold: #d4af5a; ... }                  (valores originais, carregado 1º)
tokens.css   :root { --legado-gold: #d4af5a; ... }           (paleta legada, mesmos valores)
ponte.css    :root { --gold: var(--legado-gold); ... }       (carregado depois: vence pela ordem)
tokens.css   html[data-contrast='alto'] { --legado-gold: var(--ouro-300); ... }   (alto contraste unificado, 0.17.7)
```

**Uso das 39 variáveis** (ocorrências de `var(--x)` no CSS; nenhuma é usada em TSX):

| Grupo | Variáveis (usos) |
| --- | --- |
| Ouro (destaques, títulos, bordas) | `--gold` (153), `--gold-strong` (86), `--gold-dim` (18) |
| Bordas | `--border` (72), `--border-strong` (29) |
| Texto | `--ivory` (27), `--muted` (27), `--text` (17), `--ink` (14) |
| Leitura | `--parchment` (27), `--parchment-dark` (8) |
| Estados | `--ok` (22), `--err` (19), `--ok-bg` (3), `--err-bg` (4) |
| Superfícies | `--panel` (13), `--navy-900` (9), `--navy-850` (3), `--navy-800` (2), `--navy-950` (1), `--navy-700` (1), `--earth` (16), `--earth-light` (2) |
| Madeira e céu | `--wood` (7), `--wood-shadow` (5), `--plank` (4), `--wood-edge` (2), `--sky-top` (1), `--sky-mid` (1), `--wood-hi` (0), `--wood-lo` (0) |
| Não são cor | `--radius` (46), `--radius-sm` (19), `--font-display` (37), `--font-serif` (9), `--font-body` (6), `--speed` (25), `--shadow` (13), `--tabbar-h` (2) |

**Proporção no CSS antigo** (`global.css`, 1.440 regras):

| Tipo de declaração | Quantidade |
| --- | --- |
| Com cor fixa (HEX ou rgba) | 702 |
| Que passam por variável antiga de cor | 409 |

O tema de madeira da v0.11 e as páginas de aventura da v0.14 sobrescrevem boa parte das regras originais com cores fixas.

## 3. `data-ambiente` e o alcance atual (itens 2 e 3)

### 3.1 Classificação das telas

A marcação vem de `src/components/layout/ambiente.ts`; o `Layout` marca `div.app`.

| Ambiente | Rotas | Situação |
| --- | --- | --- |
| `central` | `/painel` | Correto. Não há bloco de tokens para ele: vale o padrão de `:root`, que é a Central |
| `historia` | `/historia`, `/historia/livros`, `/historia/:livro`, `/historia/:livro/:fase`, `/historia/.../historia` (cena) e `/historia/.../desafio`; `/resultado` de partida da História | Correto |
| `quiz` | `/quiz`, `/quiz/desafio/:id`, `/quiz/treino`, `/quiz/treino/:modo`, `/quiz/multiplayer`, `/diario`, `/revisao`; `/resultado` dos demais modos | Correto |
| `biblioteca` | `/biblioteca`, `/biblioteca/personagem/:id`, `/biblioteca/livro/:id`, `/biblioteca/lugar/:id`, `/linha-do-tempo` | Correto |
| `perfil` | `/perfil`, `/estatisticas`, `/ranking`, `/guarda-roupa` | Correto |
| `conquistas` | `/conquistas` | Correto |
| Neutro (sem atributo) | `/boas-vindas`, `/entrar`, `/personagem`, `/chegada`, `/configuracoes`, `/sobre`, `/admin`, página não encontrada; `/resultado` sem partida | Correto: telas de serviço ficam fora das paletas |

As rotas antigas (`/livre/*`, `/mapa`, `/jornada/*`, `/capitulo/*`, `/desafio/*`, `/multiplayer`) redirecionam para rotas já classificadas. Nenhum componente usa portal, então janelas, mensagens e a recompensa de item herdam o ambiente da tela.

### 3.2 Cores fixas no CSS, por família de componente

| Família (seletores) | Regras | Declarações com cor fixa | Com variável antiga |
| --- | --- | --- | --- |
| Mapas e páginas de aventura (`.av-*`: mapas, Biblioteca, Perfil, Conquistas, cena, partida) | 275 | **304** | **0** |
| Perguntas e partida (`.quiz-body`, `.option`, `.question`, feedback) | 161 | 83 | 63 |
| Base genérica (`.btn`, `.panel`, `.chip`, `.field`, `.notice`, `.tabs`, `.progress`, `.modal`, `.section-title`) | 146 | 89 | 74 |
| Mapa antigo e modos (`.mode-card`, jornada, fase, baú) | 126 | 39 | 34 |
| Personagem e guarda-roupa | 106 | 32 | 24 |
| Biblioteca e linha do tempo (`.lib-*`, `.timeline`) | 56 | 8 | 31 |
| Estrutura (barra superior, rodapé, abas, `body`, `main`) | 50 | 34 | 20 |
| Perfil e estatísticas | 41 | 12 | 12 |
| Cena da fase (`.scene-*`) | 36 | 11 | 11 |
| Conquistas e medalhas | 21 | 13 | 13 |
| Resultado | 9 | 1 | 1 |
| Outros | 413 | 76 | 126 |

**Cores fixas fora do CSS** (404 HEX em TSX/TS, quase todas ilustração):
- cenários dos mapas: `Elementos.tsx` (200), `cenarios.ts` (50), `CenarioFundo.tsx` e `Cena.tsx` (32);
- ícones (`GameIcon.tsx`, 104);
- personagem e acampamento 3D (`acampamento.ts`, `aparencia.ts`, `items.ts`, `textures.ts`);
- cores dos mundos (`worlds.ts`, 40) e das regiões do Quiz (`regions.ts`, 16).

Essas cores são arte, não interface. **Ficam fora do 1.7**: os mapas evoluem na Fase 2 e os personagens na Etapa 4.

### 3.3 Alcance da ponte por tela (medido)

**Método:**
- as 31 variáveis de cor da ponte foram trocadas por magenta num build de produção da 0.17.7 (teste local, nada publicado);
- foram medidos os pixels que mudam em cada uma das 44 telas, no celular e no computador.

Isso mostra o quanto de cada tela uma mudança só na ponte alcançaria. Arquivo: `evidencias/etapa-2-fase1-passo-1.7-diagnostico/alcance-da-ponte-por-tela.txt`.

| Ambiente | Telas e % de pixels alcançados (celular / computador) |
| --- | --- |
| Central | Central (3D, 2D, painel aberto): **0%** |
| História | mapa 0,7/0,2; janela da fase 0/0; livros 4/3; livro 47/51; livro Êxodo 23/26; fase 35/25; cena 0,1/0; pergunta 6/3; feedback 5/3; resultado 23/10 |
| Quiz | mapa 0/0; janela 0/0; início do desafio 60/49; treino 37/32; modalidade 79/62; pergunta 25/10; relacione/ordem 7/3; multiplayer 41/38; diário 5/2; revisão 42/50 |
| Biblioteca | Biblioteca 2/2; ficha de personagem 29/26; livro 21/19; lugar 12/13; linha do tempo 66/47 |
| Perfil | Perfil 1/0,5; estatísticas 43/38; ranking 30/37; guarda-roupa 59/54 |
| Conquistas | Conquistas 0,6/0,3 |
| Neutro | boas-vindas 4/3; entrada 64/42; personagem 72/68; chegada 4/2; configurações 58/48; Sobre 13/11; não encontrada 30/33 |

**O que as variáveis controlam nessas telas:**
- texto claro (`--text`, `--muted`, `--ivory`);
- títulos e destaques dourados (`--gold`, `--gold-strong`);
- bordas;
- fundo de painéis e cartões de fase (`--panel`);
- anéis de retrato.

**O que elas não alcançam:**
- fundos de madeira (`--plank` e gradientes fixos);
- pergaminho das páginas de aventura;
- faixa vermelha dos títulos de seção;
- caixa da pergunta e alternativas da partida (gradientes fixos da v0.11 e da v0.14);
- barra superior;
- cenários.

Imagem de amostra: `evidencias/etapa-2-fase1-passo-1.7-diagnostico/alcance-da-ponte-amostras.jpg`.

## 4. Componentes que já consomem os tokens por ambiente (item 4)

| Componente | Usa `--amb-*`? | Usado por alguma tela? |
| --- | --- | --- |
| `bq-botao`, `bq-painel`, `bq-cartao`, `bq-janela`, `bq-aviso`, `bq-mensagem`, `bq-campo`, `bq-progresso`, `bq-abas`, `bq-cabecalho`, `bq-voltar` (`base-*.css`) | Sim, com contraste medido na folha de amostras | **Não** (a migração para eles é da Fase 2 em diante) |
| Componentes da Central (`hud`, `placa`, `painel`, `navegacao`) | Não: usam a paleta da Central diretamente | Sim (Central e navegação inferior) |
| Componentes antigos (`global.css`) | Não | Sim |

**Conclusão:** hoje nenhuma tela pode receber a paleta do ambiente sem uma camada nova que ligue o CSS antigo aos tokens `--amb-*`. O passo 1.7 cria essa camada; a troca para os componentes `bq-*` continua nas fases seguintes.

## 5. Estilos compartilhados e efeitos colaterais (item 6)

| Estilo compartilhado | Onde aparece | Risco se mudado sem escopo |
| --- | --- | --- |
| `.progress` e `.progress-fill` | Telas antigas **e o painel de missões da Central** (barra "Próximo no acampamento") | Mudaria a Central. Toda mudança precisa ficar dentro de `[data-ambiente]` sem `central` |
| `.modal` (recompensa de item) | Aparece por cima de qualquer tela, inclusive da Central | Herdaria o ambiente da tela de baixo; na Central fica no padrão |
| `.panel`, `.btn-outline`, `.chip`, `.tabs`, `.tab.is-on`, `.section-title`, `.notice`, `.field`, `.topbar`, `.footer` | Todos os ambientes e as telas neutras | Uma mudança global atingiria todos os ambientes ao mesmo tempo (proibido) |
| Regras `.av-pagina` | Biblioteca, Perfil e Conquistas | Uma mudança para um desses três atingiria os outros dois |
| Regras `.av-*` dos mapas e da partida | Mapas da História e do Quiz, cena e partida | Mesmo arquivo e mesmos seletores para os dois modos |
| `.quiz-body` (perguntas) | Partidas da História, do Quiz, do diário, da revisão e do multiplayer | Atinge História e Quiz juntos se não tiver escopo |
| `/resultado` | História ou Quiz, conforme o modo jogado; neutro sem partida | Precisa ser validado nos dois ambientes |
| Variáveis antigas em `:root` | Todas as telas antigas | Mudar em `:root` aplicaria todas as paletas de uma vez (proibido) |
| `acessibilidade.css`: foco em fundo escuro usa `var(--gold-strong)` | Todas as telas antigas | Se `--gold-strong` mudar no ambiente, a cor do foco muda junto; o contraste precisa ser medido de novo |
| `alto-contraste.css` e o bloco de alto contraste de `tokens.css` | Todas as telas | Ver a seção 6 |

## 6. Alto contraste, redução de animações e acessibilidade (item 7)

1. **Alto contraste:** o modo unificado troca as variáveis antigas no `html`, com o atributo `data-contrast='alto'`. Uma regra `.app[data-ambiente='x'] { --gold: ... }` fica num elemento mais interno e **venceria o alto contraste**. Por isso:
   - toda regra de ambiente fica sob `html:not([data-contrast='alto'])`;
   - um teste automático confere isso;
   - critério de cada entrega: as capturas em alto contraste ficam **idênticas pixel a pixel** às da 0.17.7, em todos os ambientes.
2. **Redução de animações:** as mudanças são só de cor e borda, sem animação nem transição nova. As 88 capturas e as medições continuam com as duas opções ligadas.
3. **Contraste do texto:**
   - todo par novo usa os pares já medidos na folha de amostras;
   - nenhum texto usa `--amb-acento` quando o acento não é legível (o verde da História e o vermelho do Perfil): texto usa `--amb-acento-texto`;
   - critério: 0 textos abaixo de 4,5:1 no ambiente migrado (medição por pixels da 0.17.7). Hoje, no modo normal, há 103, concentrados em Conquistas (49), Guarda-roupa (10), linha do tempo (7), Perfil (6) e mapa da História (6). A migração deve zerar os do ambiente que ela tocar.
4. **Foco:** a medição de foco (24 telas) não pode piorar. Se `--gold-strong` mudar num ambiente, o contorno de foco sobre escuro precisa manter 3:1. Se não mantiver, o foco passa a usar um token fixo, sem mudar a aparência nos outros ambientes.
5. **Área de toque e teclado:** nada muda; as medições de toque, do clique no centro e do Tab entram na validação como regressão.

## 7. Como manter a Central idêntica à 0.17.7 (item 8)

- **Prova feita neste diagnóstico:** com as 31 variáveis de cor da ponte em magenta, a Central ficou idêntica nas 4 vistas e com o painel de missões aberto, no modo normal e no alto contraste. Ela não depende da ponte.
- **Regras para toda a migração:**
  - nenhum seletor de ambiente cita `central`;
  - nenhuma regra nova fica fora de `[data-ambiente='historia' | 'quiz' | 'biblioteca' | 'perfil' | 'conquistas']`;
  - nada muda em `:root`, em `tokens.css` (paleta e Central), nos arquivos `componentes/` da Central nem em `telas/acampamento.css`;
  - um teste automático confere isso.
- **Ponto de atenção:** `.progress` aparece no painel de missões da Central. Com o escopo por ambiente, ele não é tocado na Central.
- **Critério de cada entrega:**
  - Central idêntica pixel a pixel à 0.17.7: 3D e 2D, celular e computador, painel aberto e fechado, normal e alto contraste;
  - na vista 2D do computador, vale a variação de captura já documentada, com o mesmo resultado de uma rodada da 0.17.7.

## 8. Matriz por ambiente

Abreviações: "base" é `--amb-base`, "acento" é `--amb-acento`, "texto de acento" é `--amb-acento-texto`, "leitura" é `--amb-leitura`, "moldura" é `--amb-moldura` e "progresso" é `--amb-progresso`. Todos os valores vêm da folha de amostras aprovada.

### 8.1 Central — Acampamento de Aventura

| Item | Conteúdo |
| --- | --- |
| Telas | `/painel` |
| Componentes | HUD, rótulos, painel de missões, placas, "Continuar", navegação inferior |
| Cores e tokens atuais | Paleta da Central (`terra`, `ouro`, `pergaminho`, `marfim`, `tinta`, `fogueira`, `floresta`, `azul`) |
| Destino | **Sem mudança.** É a referência aprovada |
| Alterações | Nenhuma |
| Riscos | Vazamento por estilos compartilhados (`.progress`, `.modal`) |
| Critérios | Idêntica pixel a pixel à 0.17.7 em todas as vistas e modos |
| Esforço | Só a verificação, em cada entrega |

### 8.2 Conquistas — Sala dos Troféus

| Item | Conteúdo |
| --- | --- |
| Telas | `/conquistas` |
| Componentes | `.av-pagina` (cabeçalho, painéis, `.medal-card`, `.ach-card`, `.ach-card.is-on`, `.section-title`), página com cenário |
| Cores atuais | Pergaminho fixo `#fdf3d8`→`#f0dba8`, borda `#8a5a2a`, texto `#3b2414`, descrições `#6b4a2b`; conquista obtida `#fff6d0`→`#f5d77e` com borda `#b47c10`; faixa do título `#8a3427`→`#6a241a` com texto branco; medalhas com ícone em cinza quando bloqueadas |
| Destino | base `--veludo-800` `#3A1622`; acento e texto de acento `--ouro-300`; leitura `--pergaminho`; moldura `--ouro-500`; medalhas `--bronze` `#C08A5B` e `--prata` `#C9CED4` |
| Alterações | Em `[data-ambiente='conquistas']`: cartões em leitura com moldura; faixa do título em base com texto `--marfim`; conquista obtida com destaque em acento; descrições em `--tinta-suave` (hoje 3,8:1, abaixo do mínimo); medalhas bronze e prata nos ícones de medalha, se a estrutura do SVG permitir sem mexer nos dados |
| Riscos | Seletores `.av-pagina` compartilhados com Biblioteca e Perfil (o escopo por ambiente evita o efeito); o cenário ilustrado continua igual |
| Critérios | 49 textos abaixo do mínimo hoje → 0; Biblioteca e Perfil idênticos; alto contraste idêntico à 0.17.7; Central idêntica |
| Esforço | 1 sessão curta. Risco baixo |

### 8.3 Biblioteca — Sala de Estudos

| Item | Conteúdo |
| --- | --- |
| Telas | `/biblioteca` (página de aventura), fichas de personagem, livro e lugar, linha do tempo (telas com barra superior) |
| Componentes | `.av-pagina` (cartões `.lib-card`, `.lib-book`, `.lib-event`, abas `.tabs`); nas fichas e na linha do tempo, `.panel`, `.chip`, `.section-title`, `.notice`, `.tabs`, `.timeline` e as variáveis antigas |
| Cores atuais | Pergaminho fixo e madeira `#8a5a30`→`#5e3a1c` nas abas; nas fichas, madeira (`--plank`) e ouro antigo (`--gold` `#d4af5a`, `--gold-strong` `#ecc96e`), texto `#f1e9d6`/`#b8ad94` |
| Destino | base `--couro-700` `#4B2A22`; acento e texto de acento `--lamparina-300` `#F0C76E`; leitura `--papel` `#F7F0DE`; moldura `--terra-500`; progresso lamparina |
| Alterações | Ponte do ambiente: `--gold` e `--gold-strong` → texto de acento; `--border-strong` e `--gold-dim` → moldura; `--parchment` → leitura; `--panel` → base. Escopo nos cartões e abas da página de aventura (leitura e base) |
| Riscos | Telas mistas (página de aventura e telas com barra superior); a linha do tempo tem 66% dos pixels sob a ponte (mudança grande); `.chip` das fichas tem links |
| Critérios | 7 textos abaixo do mínimo na linha do tempo → 0; outros ambientes idênticos; alto contraste idêntico; clique no centro dos elementos igual |
| Esforço | 1 sessão. Risco médio |

### 8.4 Perfil — Tenda do Personagem

| Item | Conteúdo |
| --- | --- |
| Telas | `/perfil` (página de aventura), estatísticas, ranking, guarda-roupa |
| Componentes | `.av-pagina` (painel, `.stat-grid`, `.history-item`, `.btn-outline`, `.btn-danger`); `.panel`, `.simple-table`, `.table-wrap`; no guarda-roupa, `.creator-*`, `.swatch`, `.chip`, `.tabs` |
| Cores atuais | Pergaminho fixo, madeira nos números, tabela em pergaminho fixo `#fdf3d8`→`#f0dba8`; telas com barra superior em madeira e ouro antigo |
| Destino | base `--terra-600`; acento `--tecido-600` `#7A3A26` (**só visual**, como borda e destaque); texto de acento `--lona` `#EADCC0`; leitura `--lona`; moldura `--terra-500`; progresso tecido |
| Alterações | Ponte do ambiente (texto de acento em lona, nunca o tecido como texto); cartões e tabela em lona; números em base. No guarda-roupa, só as superfícies de interface: prévias e amostras de cor do personagem não mudam |
| Riscos | Tecido-600 sobre escuro é ilegível como texto (a folha já corrigiu com o texto de acento); o guarda-roupa tem prévias 3D e amostras de cor que não podem mudar; estatísticas e ranking têm muitas tabelas |
| Critérios | 6 (Perfil) e 10 (guarda-roupa) textos abaixo do mínimo → 0; amostras de cor do personagem idênticas; outros ambientes idênticos; alto contraste idêntico |
| Esforço | 1 a 1,5 sessão. Risco médio |

### 8.5 Quiz — Templo do Saber

| Item | Conteúdo |
| --- | --- |
| Telas | Mapa do Quiz e janela de desafio, início do desafio, treino e modalidades, perguntas, multiplayer, diário, revisão, resultado (modo Quiz) |
| Componentes | Barra superior, `.panel`, `.mode-card`, `.chip`, `.tabs`, `.section-title`, `.quiz-body` (`.question`, `.option`, estados), `.av-jogo`, `.av-dificuldade`, `.result-*` |
| Cores atuais | Madeira e ouro antigos; pergunta em gradiente fixo `rgba(92,58,34)`→`rgba(40,25,15)` e alternativas `rgba(110,72,42)`→`rgba(70,44,26)`; no mapa, placas de madeira fixas |
| Destino | base `--azul-700` `#1D3554`; acento e texto de acento `--ouro-300`; leitura `--pedra-100` `#E4E8EC`; moldura `--ouro-300`; progresso `--azul-500` |
| Alterações | Ponte do ambiente; caixa da pergunta e alternativas em base com moldura (escopo `[data-ambiente='quiz'] .quiz-body`); acerto e erro mantêm os tokens de feedback; o cenário do mapa (arte) fica igual nesta fase |
| Riscos | `.quiz-body` é o mesmo na História (o escopo separa); estados de resposta (acerto e erro) precisam continuar distintos sobre azul; resultado com dois ambientes; é a maior mudança visual percebida (madeira → azul) |
| Critérios | Contraste das alternativas, dos estados e do feedback ≥ 4,5:1; partidas da História idênticas; alto contraste idêntico; teclado e toque sem regressão |
| Esforço | 1,5 a 2 sessões. Risco médio-alto |

### 8.6 História — Trilha da Jornada

| Item | Conteúdo |
| --- | --- |
| Telas | Mapa da História e janela da fase, livros, livro, fase, cena, desafio (perguntas), resultado (modo História) |
| Componentes | Os mesmos do Quiz, mais `.journey`, `.phase-*`, `.scene-*`, `.av-cena`, `.av-portao` |
| Cores atuais | Madeira e ouro antigos; pergunta e alternativas em gradiente fixo; cena com cartões de pergaminho fixos |
| Destino | base `--floresta-700` `#234A33`; acento `--floresta-500` (**só visual**); texto de acento e leitura `--campo-200` `#DCE6C3`; moldura `--ouro-500`; progresso floresta |
| Alterações | Ponte do ambiente; pergunta e alternativas em base; cartões da cena e da fase em leitura; o cenário do mapa (arte) fica igual nesta fase |
| Riscos | É o ambiente com mais telas e maior variedade; verde sobre verde (o acento nunca vira texto); a cena tem texto narrativo longo em pergaminho; o resultado tem dois ambientes |
| Critérios | Mapa da História: 6 textos abaixo do mínimo → 0; partidas do Quiz idênticas; alto contraste idêntico; Central idêntica |
| Esforço | 2 sessões. Risco médio-alto |

### 8.7 Telas neutras

| Item | Conteúdo |
| --- | --- |
| Telas | Boas-vindas, entrada, criação do personagem, chegada, configurações, Sobre, administração e página não encontrada |
| Destino | **Sem paleta de ambiente** (decisão do passo 1.5). Continuam como hoje |
| Observação | A harmonização comum das variáveis antigas com a paleta da Central (proposta 6.4 da auditoria: `--gold` → `--ouro-500`, `--parchment` → `--pergaminho`, `--muted` → `--marfim-suave`) mudaria **todas** as telas de uma vez. Fica como decisão separada, só com autorização, e não entra nas entregas por ambiente |

## 9. Solução técnica proposta

1. **Arquivo novo `src/styles/ambientes.css`:**
   - só tokens, sem HEX;
   - carregado depois de `ponte.css` e antes de `acessibilidade.css` e `alto-contraste.css`;
   - **nenhuma regra antiga é removida**: as novas sobrepõem dentro do ambiente.
2. **Bloco por ambiente**, ativado um de cada vez:

   ```css
   /* exemplo do formato — NÃO aplicado */
   html:not([data-contrast='alto']) .app[data-ambiente='conquistas'] {
     --gold: var(--amb-acento-texto);
     --gold-strong: var(--amb-acento-texto);
     --border-strong: var(--amb-moldura);
     --parchment: var(--amb-leitura);
     --panel: var(--amb-base);
   }
   html:not([data-contrast='alto']) .app[data-ambiente='conquistas'] .av-pagina .medal-card { background: var(--amb-leitura); border-color: var(--amb-moldura); }
   ```

   Os tokens `--amb-*` já estão definidos em `[data-ambiente='x']` em `tokens.css`. Como o atributo está no próprio `.app`, eles estão disponíveis no mesmo elemento.
3. **Variáveis que não mudam no 1.7:**
   - `--radius`, `--shadow`, as fontes e `--speed`;
   - `--text`, `--ivory` e `--ink`, que já são legíveis.

   Mudar raios e sombras é da padronização dos componentes (Fase 2).
4. **Testes automáticos novos:**
   - nenhum HEX em `ambientes.css`;
   - toda regra começa por `html:not([data-contrast='alto']) .app[data-ambiente=`;
   - nenhuma cita `central`;
   - só os ambientes autorizados aparecem;
   - os pares usados constam da tabela de contraste aprovada;
   - `ponte.css`, `:root` e a paleta legada continuam com os valores exatos.

## 10. Ordem de migração proposta

Começa pelo que é isolado e fácil de validar. Uma entrega por ambiente, cada uma com avaliação antes da próxima:

| Ordem | Ambiente | Por quê | Telas | Esforço |
| --- | --- | --- | --- | --- |
| 1 | **Conquistas** | Uma tela; zera 49 falhas de contraste do modo normal; valida a técnica (escopo, alto contraste, Central) com o menor risco | 1 | 1 sessão curta |
| 2 | **Biblioteca** | Telas de leitura, com mudança moderada; testa a convivência de página de aventura e tela com barra superior | 5 | 1 sessão |
| 3 | **Perfil** | Testa o acento só visual (tecido) e a proteção das cores do personagem no guarda-roupa | 4 | 1 a 1,5 sessão |
| 4 | **Quiz** | Primeiro ambiente com partida; separa `.quiz-body` da História; mudança visual grande (azul) | 8 a 9 | 1,5 a 2 sessões |
| 5 | **História** | O maior e mais variado; aproveita o que o Quiz validou nas partidas | 9 a 10 | 2 sessões |

**Total estimado:** 6,5 a 8 sessões, com avaliação visual entre as entregas.

A numeração das versões fica a seu critério: a auditoria tinha reservado a 0.17.8 para o passo 1.8.

## 11. Riscos de regressão (geral)

| Risco | Probabilidade | Mitigação |
| --- | --- | --- |
| A regra do ambiente vence o alto contraste | Alta sem o cuidado; nula com `html:not([data-contrast='alto'])` | Teste automático e capturas em alto contraste idênticas à 0.17.7 |
| Vazamento para outro ambiente ou para a Central | Média | Escopo obrigatório; capturas dos outros ambientes e da Central idênticas |
| Texto ilegível com o acento (verde e vermelho) | Média | O texto sempre usa `--amb-acento-texto`; medição por pixels com 0 falhas |
| Foco com contraste menor depois da troca de `--gold-strong` | Média | Medição de foco por ambiente; se cair, token de foco fixo |
| Mudança grande demais de uma vez (Quiz e História) | Média | Entregas separadas e folhas antes/depois para avaliação |
| Cores do personagem e da arte alteradas sem querer | Baixa | Arte em TSX fora do escopo; prévias e amostras conferidas no guarda-roupa |
| CSS antigo removido sem prova | Nula | Nenhuma remoção no 1.7 (é o 1.8) |

## 12. Critérios de validação de cada entrega

1. Central idêntica pixel a pixel à 0.17.7 (4 vistas, painel aberto e fechado, normal e alto contraste).
2. Telas dos outros ambientes e telas neutras idênticas às da 0.17.7 (88 capturas).
3. Alto contraste: as 88 capturas idênticas às da 0.17.7.
4. Ambiente migrado:
   - 0 textos abaixo de 4,5:1 (medição por pixels);
   - foco sem regressão (medição das 24 telas);
   - toque, clique no centro e teclado iguais.
5. Folha antes/depois das telas do ambiente, para a sua aprovação visual.
6. Animação reduzida ligada em todas as medições; nenhuma transição nova.
7. Testes automáticos novos (seção 9), typecheck, todos os testes e build.
8. Nenhuma rota, dado, regra, funcionalidade ou classe removida.
9. Documentação atualizada: CHANGELOG, README, ROADMAP, decisões e relatório da entrega.

## 13. Pontos para a sua decisão

1. **Ordem:** aprovar Conquistas → Biblioteca → Perfil → Quiz → História, ou outra.
2. **Escopo do 1.7:**
   - confirmar que fica só nas superfícies de interface;
   - cenários dos mapas, arte e personagem continuam como estão (Fase 2 e Etapa 4);
   - raios e sombras continuam como estão.
3. **Telas neutras:** confirmar que continuam sem paleta, e se a harmonização comum com a paleta da Central (seção 8.7) deve virar uma entrega própria no futuro.
4. **Medalhas:** confirmar o uso de bronze e prata nos ícones de medalha de Conquistas, desde que não exija mudar dados.
5. **Versões:** como numerar as entregas.

## 14. Evidências

Pasta `docs/relatorios/evidencias/etapa-2-fase1-passo-1.7-diagnostico/`:

| Arquivo | Conteúdo |
| --- | --- |
| `alcance-da-ponte-por-tela.txt` | Porcentagem de pixels que mudam em cada tela quando as 31 variáveis de cor da ponte viram magenta (celular e computador) |
| `alcance-da-ponte-amostras.jpg` | 7 telas, na 0.17.7 e com o teste do magenta (o teste não é proposta) |
| `central-com-variaveis-em-magenta-*.jpg` | A Central com as variáveis em magenta: idêntica à 0.17.7 |
| `contraste-texto-modo-normal-0.17.7.txt` | Textos abaixo de 4,5:1 por tela, no modo normal (base para os critérios) |

**Limites do diagnóstico:**
- medições só no Chromium (Playwright), com vídeo por software;
- o teste do magenta mede alcance, não aparência final;
- os pares de contraste de destino vêm da folha de amostras e precisam ser confirmados nas telas reais a cada entrega.
