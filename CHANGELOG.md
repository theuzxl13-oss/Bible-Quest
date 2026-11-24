# Histórico de atualizações

Todas as versões do Bible Quest, da mais recente para a mais antiga. Cada mudança no projeto ganha uma entrada no topo deste arquivo.

## Android, etapa 1, fechamento — 24/11/2026 — permissão INTERNET, ícone e diagnóstico da Central 3D (em avaliação)

- **Permissão INTERNET removida** do `AndroidManifest.xml`: o aplicativo não declara nenhuma permissão. Nenhuma permissão alternativa foi adicionada. O fluxo do APK passa a falhar se a permissão voltar.
- **Links externos:** a verificação no emulador confere que "Fonte no Commons" abre no navegador do sistema e que o voltar retorna ao jogo.
- **Ícone:** medalhão reduzido a 88 % dentro da área segura do ícone adaptativo, no colorido e no monocromático, com as mesmas cores, cruz e Bíblia.
- **Tela de abertura sem mudança:** passa a usar imagem própria (`ic_splash`, cópia exata da anterior; desenho em `tools/android/icone-abertura.svg`). As imagens `splash.png` não mudaram.
- **Central 3D ao reabrir sem internet:** novo diagnóstico `tools/android/diagnostico-central.cjs`, que só observa e não muda o jogo. Resultado em `docs/relatorios/ANDROID_ETAPA_1_FECHAMENTO.md`.
- O jogo, o conteúdo e o site não mudaram: o build do site continua idêntico à 0.17.9.
- **Testes:** 213, em 19 arquivos.

## Android, etapa 1, complemento — 23/11/2026 — verificações pedidas na avaliação (em avaliação)

- Novo fluxo `android-verificacoes.yml` (iniciado à mão, ou quando ele mesmo muda), com o script `tools/android/verificacoes-complementares.cjs`:
  - capturas da tela de abertura e do ícone no lançador;
  - depuração do WebView ligada no APK de depuração e desligada num build de lançamento de teste (assinado só com a chave de depuração do executor, não publicado);
  - teste do aplicativo sem a permissão INTERNET.
- As capturas do emulador e os resultados ficam em `docs/relatorios/evidencias/android-etapa-1/`.
- Complemento do relatório: `docs/relatorios/ANDROID_ETAPA_1_COMPLEMENTO.md`.
- O jogo, o APK oficial e o site não mudaram.

## Android, etapa 1 — 23/11/2026 — Aplicativo Android com Capacitor 8 (em avaliação)

Branch `claude/bible-quest-android`, criada a partir de `4815afa` (0.17.9). Não foi integrada ao `main` nem publicada na Google Play. Relatório: `docs/relatorios/ANDROID_ETAPA_1.md`.

- **Estrutura:**
  - Capacitor 8.6.2 (`@capacitor/core`, `android`, `cli`) e os plugins oficiais `app` (botão voltar), `splash-screen` e `browser`;
  - `capacitor.config.ts` com o identificador `com.kzanntech.biblequest`;
  - projeto `android/` com mínimo API 24 e alvo API 36;
  - o jogo vem dos arquivos locais de `dist`, sem site remoto, e funciona sem internet.
- **Build do aplicativo separado do site:** `npm run build:android` (modo `android`, constante `__ANDROID__`). O build do site continua **idêntico à 0.17.9**: os 106 arquivos têm o mesmo SHA-256.
- **Experiência nativa:**
  - ícone adaptativo próprio, com versão monocromática;
  - tela de abertura do Android 12+;
  - barras do sistema no tom do jogo, com a página encaixada entre elas;
  - botão voltar;
  - retrato nos celulares e rotação livre em tablets;
  - links externos no navegador do sistema;
  - leitura em voz alta oculta.
- **Só no aplicativo:**
  - painel administrativo fora do pacote;
  - multiplayer de demonstração desativado (sem o atalho, a rota leva ao treino livre);
  - ranking sem a aba das partidas de demonstração;
  - nenhum SDK de anúncios ou de análise.
- **GitHub Actions** (`android.yml`): testes, typecheck, builds, APK de depuração como artefato e verificação num emulador Android 16. Sem chave de assinatura nem segredos.
- **Testes:** 212, em 19 arquivos (15 novos em `android.test.tsx`).

## 0.17.9 — 23/11/2026 — Passo 1.7, entrega 2: Biblioteca (Sala de Estudos) (em avaliação, não publicada)

Desenvolvida só na branch `claude/loving-carson-8mrbjo`, sobre a 0.17.8; não foi integrada ao `main` nem publicada. Relatório: `docs/relatorios/ETAPA_2_FASE_1_PASSO_1_7_BIBLIOTECA.md`; evidências em `docs/relatorios/evidencias/etapa-2-fase1-0.17.9-biblioteca/`.

- **Biblioteca, fichas de personagem, livro e lugar e linha do tempo:**
  - fichas da página de aventura em papel;
  - placas, abas, faixas de título e etiquetas de data em couro;
  - destaques e progresso em lamparina;
  - moldura terra;
  - textos sobre o céu do topo em marfim.
- **Contraste:** textos abaixo de 4,5:1 nas telas da Biblioteca, de 18 para **0**.
- **Mesma metodologia de Conquistas:** regras só em `ambientes.css`, limitadas à Biblioteca e desligadas no alto contraste; nenhuma regra antiga removida.
- **Preservado:**
  - o alto contraste idêntico à 0.17.8;
  - a Central idêntica;
  - Conquistas, Perfil, Quiz e História sem alteração;
  - foco, toque, cliques e teclado iguais.
- **Testes:** 197, em 18 arquivos.

## 0.17.8 — 23/11/2026 — Passo 1.7, entrega 1: Conquistas (Sala dos Troféus) (em avaliação, não publicada)

Desenvolvida só na branch `claude/loving-carson-8mrbjo`; não foi integrada ao `main` nem publicada. Relatório: `docs/relatorios/ETAPA_2_FASE_1_PASSO_1_7_CONQUISTAS.md`; evidências em `docs/relatorios/evidencias/etapa-2-fase1-0.17.8-conquistas/`.

- **Nova camada `src/styles/ambientes.css`:** só tokens, carregada depois da ponte. Toda regra fica limitada ao ambiente e desligada no alto contraste. Nesta entrega, só o bloco de Conquistas.
- **Conquistas:**
  - faixas de título em veludo com letras de ouro;
  - cartões em pergaminho liso com moldura de ouro;
  - conquistas e medalhas obtidas em placa de veludo;
  - louro das medalhas em bronze, prata ou ouro, só pela aparência, sem mudar dados;
  - bloqueadas sem transparência.
- **Contraste:** textos abaixo de 4,5:1 em Conquistas, de 49 para **0**.
- **Preservado:**
  - o alto contraste idêntico à 0.17.7;
  - a Central idêntica;
  - Biblioteca, Perfil, Quiz e História sem alteração;
  - foco, toque, cliques e teclado iguais;
  - nenhuma regra antiga removida.
- **Testes:** 196, em 18 arquivos (7 novos em `ambientes.test.ts`).

## Documentação — 23/11/2026 — Passo 1.7: diagnóstico e planejamento (sem nova versão do jogo)

- **Relatório:** `docs/relatorios/ETAPA_2_FASE_1_PASSO_1_7_DIAGNOSTICO.md` (e `.pdf`), sobre a migração das telas antigas para as paletas aprovadas, ambiente por ambiente.
  - Matriz por ambiente: telas, componentes, cores atuais e de destino, alterações, riscos, critérios e esforço.
  - Ordem proposta: Conquistas → Biblioteca → Perfil → Quiz → História.
- **Medições (teste local, nada mudou no jogo):**
  - a ponte alcança de 12% a 79% das telas com barra superior, mas de 0% a 6% dos mapas, cenas, perguntas, Biblioteca, Perfil e Conquistas, que usam cores fixas;
  - a Central não depende das variáveis antigas.
- **Risco principal:** uma regra de ambiente venceria o alto contraste. Toda regra fica sob `html:not([data-contrast='alto'])`.
- **Código:** nenhuma linha alterada. Aguarda avaliação.

## 0.17.7 — 23/11/2026 — Fase 1 da Etapa 2, passo 1.6: alto contraste unificado (aprovada e publicada)

**Publicação oficial (23/11/2026):**
- Aprovada e integrada ao `main` por fast-forward (`ad92ca2` → `9dacff7`), com `d0678f7` preservado no histórico, sem conflitos.
- O fluxo oficial (run 92) passou e publicou no GitHub Pages. O site serve `assets/index-CLE677Uq.js` e `assets/index-BVuaq63J.css`, os mesmos arquivos do build local (SHA-256 iguais).
- Verificação no site, no celular e no computador:
  - "Versão 0.17.7" no rodapé e na página Sobre;
  - modo normal e alto contraste sem mudança de estilo em relação ao build local (85 e 84 de 88 capturas idênticas; o resto é tempo de carregamento);
  - a Central igual à 0.17.6 sem foco, com o painel aberto e fechado;
  - Tab e Shift+Tab na ordem aprovada, sem foco encoberto com o painel aberto, e foco preso e Esc nas janelas dos mapas;
  - nenhum erro de JavaScript, nenhuma falha de carregamento e nenhuma rolagem horizontal.
- Registro completo: `docs/relatorios/evidencias/etapa-2-fase1-0.17.7/VERIFICACAO_PUBLICACAO.md`.

Relatório: `docs/relatorios/ETAPA_2_FASE_1_PASSO_1_6.md`; evidências em `docs/relatorios/evidencias/etapa-2-fase1-0.17.7/`.

- **Um só alto contraste:** o modo antigo (preto e amarelo, em `global.css`) e o da Central (terra e marfim) viraram um modo só, na família da Central.
  - Valores em `tokens.css`: tokens `--ac-*` e as variáveis antigas pela ponte.
  - Regras das telas antigas em `src/styles/alto-contraste.css`, só com tokens.
  - Saíram de `global.css` só o bloco de variáveis e as 5 regras do modo antigo.
- **Problema corrigido:** o modo antigo pintava de preto os cartões claros de Biblioteca, Perfil e Conquistas, mas deixava o texto escuro. Agora esses cartões ficam em pergaminho sólido com texto e borda em tinta.
  - Medição de 3.523 textos em 27 telas: abaixo de 4,5:1 eram 257 no alto contraste da 0.17.6; agora são **0** (o modo normal continua com 103).
- **Também no alto contraste:**
  - respostas certa e errada com preenchimento sólido;
  - alternativa descartada sem transparência;
  - item escolhido em ouro com texto escuro;
  - aviso do próximo mundo legível;
  - botão de perigo em vermelho escuro sobre pergaminho.
- **Central:**
  - sem foco, continua idêntica pixel a pixel, também no alto contraste;
  - só no alto contraste, o anel marfim do foco volta ao topo e ao botão Missões (ele estava apagado). O foco insuficiente na Central caiu de 7 para 0.
- **Preservado:**
  - a opção "Alto contraste" e a preferência salva (mesma chave e formato);
  - a redução de animações;
  - o modo normal, sem nenhuma mudança;
  - funcionalidades, rotas e dados.
- **Painel de missões aberto (verificação final):** Tab e Shift+Tab estavam parando em rótulos e placas encobertos pelo painel (até 5 por combinação). Agora pulam o que fica embaixo dele (`usePularEncobertos`), sem mudar a aparência. Com o painel fechado, a ordem é a de sempre. A medição geral de foco caiu para 0 insuficientes no modo normal e no alto contraste.
- **Testes:** 190, em 17 arquivos (7 novos em `altoContraste.test.tsx` e 1 em `acessibilidade.test.tsx`).

## 0.17.6 — 21/11/2026 — Fase 1 da Etapa 2, passos 1.4 e 1.5: acessibilidade base e identificação dos ambientes (aprovada e publicada)

**Publicação oficial (21/11/2026):**
- Aprovada e integrada ao `main` por fast-forward (`766d705` → `389468c`), sem conflitos e com o histórico preservado.
- O fluxo oficial (run 87) passou e publicou no GitHub Pages. O site serve `assets/index-CAU2Jrfx.js` e `assets/index-oSlaMjt9.css`, os mesmos arquivos do build local (SHA-256 iguais).
- Verificação no site, no celular e no computador:
  - "Versão 0.17.6" no rodapé e na página Sobre;
  - a Central sem foco idêntica à 0.17.6 aprovada, com o anel duplo pelo teclado;
  - Tab e Shift+Tab na ordem aprovada, e o foco preso e o Esc nas janelas dos mapas;
  - 84 das 88 capturas idênticas ao build local; as outras 4 só por tempo de carregamento;
  - nenhum erro de JavaScript, nenhuma falha de carregamento e nenhuma rolagem horizontal.
- Registro completo: `docs/relatorios/evidencias/etapa-2-fase1-0.17.6/VERIFICACAO_PUBLICACAO.md`.

**Finalização da Central (autorização adicional, 21/11/2026):**
- **Foco:** anel duplo do botão Missões (tinta por fora, marfim por dentro) nos rótulos da cena (3D e 2D), no Perfil e nas Configurações do topo, nas placas dos modos e no "Continuar". Na Central, os elementos sem indicador suficiente passaram de 13 para 0, no celular e no computador.
- **Toque:** a área invisível dos rótulos da cena passou a 46 px de altura; antes media 42–43 px no celular. O tamanho visual não mudou.
- **Validação:**
  - sem foco, a Central é idêntica pixel a pixel à 0.17.6 aprovada;
  - a ordem do Tab e do Shift+Tab é a mesma;
  - os 1.082 elementos interativos mantêm o clique no mesmo lugar;
  - 182 testes passando.
- Relatório atualizado (seção 14).

**Primeira entrega:**

Desenvolvida só na branch `claude/loving-carson-8mrbjo`. Não foi integrada ao `main` nem publicada. Relatório: `docs/relatorios/ETAPA_2_FASE_1_PASSOS_1_4_E_1_5.md`; evidências em `docs/relatorios/evidencias/etapa-2-fase1-0.17.6/`.

- **Passo 1.4 — acessibilidade base** (`src/styles/acessibilidade.css`, só tokens):
  - **Áreas de toque de 44 × 44 px** com área invisível (pseudo-elemento centralizado) em links da barra superior, "Voltar", botões pequenos e de ícone, fichas, amostras de cor, links do rodapé e soltos, interruptores e baú do topo. Elementos abaixo de 44 px: de 417 para 4 de 815. Os 4 restantes são links dentro de frases, isentos pela WCAG.
  - **Única mudança visível de tamanho:** o seletor de dificuldade do mapa do Quiz passa de 36 para 44 px de altura, porque um `<select>` não aceita área invisível.
  - **Foco com contraste:**
    - sobre pergaminho e fundos claros, azul de foco sobre claro (5,4:1);
    - nas páginas de aventura, tinta escura;
    - sobre madeira, marfim;
    - nos controles sobre cenários, anel duplo de tinta e marfim;
    - nos campos, contorno sólido.

    Elementos sem foco suficiente: de 73 para 13, todos na Central e fora da autorização.
  - **Teclado:** o foco fica preso nas janelas da fase, da ajuda, do baú, da introdução do mundo e da recompensa de item (novo hook `usePrenderFoco`). A ajuda do mapa passa a fechar com Esc.
- **Passo 1.5 — identificação dos ambientes:** o Layout marca a aplicação com `data-ambiente`:
  - `central`, `historia`, `quiz`, `biblioteca`, `perfil` e `conquistas` (`src/components/layout/ambiente.ts`);
  - telas de serviço ficam neutras;
  - **nenhum fundo, cor, gradiente ou componente temático foi ativado**: só `tokens.css` seleciona o atributo, e os tokens de ambiente só são lidos pelos componentes base, que nenhuma tela usa.
- **Central:** só as duas correções autorizadas.
  - Foco do painel de missões: anel duplo no botão Missões e azul escuro no botão de fechar e nos itens.
  - Selo de aviso: `--feedback-selo`, com o marfim sobre ele passando de 4,05:1 para 5,64:1.
  - Pixel a pixel, só os dois selos mudaram.
- **Correção durante a validação:** a área invisível do `li.chip` (Biblioteca) cobria o link de dentro. Agora a regra vale só para elementos clicáveis, e o clique no centro de todos os elementos chega aonde chegava na 0.17.5.
- **Preservado:**
  - funcionalidades, rotas, dados e progressão;
  - estilos antigos (nenhum removido);
  - os dois sistemas de alto contraste (separados);
  - a animação reduzida.
- **Testes:** 181, em 16 arquivos (8 novos em `acessibilidade.test.tsx`); 182 depois da finalização da Central.

## Documentação — 20/11/2026 — Cabelos 3D ficam para a Etapa 4 (sem nova versão do jogo)

- **Decisão registrada** no ROADMAP e em `docs/planos/ETAPA_2_DECISOES_OFICIAIS.md`: os cabelos 3D novos ficam para a Etapa 4, sem geração nem prévias na Etapa 2.
- **Pendência:** a sexta imagem de referência (cabelo médio com barba) ainda precisa ser enviada como arquivo.

## 0.17.5 — 16/11/2026 — Fase 1 da Etapa 2, passos 1.1 a 1.3: tokens, ponte e componentes base (aprovada e publicada)

**Publicação oficial (20/11/2026):**
- Aprovada tecnicamente e integrada ao `main` por fast-forward (`7e8ab4e` → `63f0277`), sem conflitos e com o histórico preservado.
- O fluxo oficial (run 82) passou e publicou no GitHub Pages. O site serve `assets/index-BKcrlNjs.js` e `assets/index-gnN6_pAH.css`, os mesmos arquivos do build local.
- Verificação no site, no celular e no computador:
  - "Versão 0.17.5" no rodapé e na página Sobre;
  - a Central idêntica à 0.17.3 pixel a pixel (3D e 2D) e com todas as funções;
  - as 39 variáveis antigas idênticas às do build de produção da 0.17.4;
  - as 88 capturas sem nenhuma mudança de estilo;
  - nenhum erro de JavaScript, nenhuma falha de carregamento e nenhuma rolagem horizontal.
- Registro completo: `docs/relatorios/evidencias/etapa-2-fase1-0.17.5/VERIFICACAO_PUBLICACAO.md`.


Base visual comum, **sem mudança na tela**. A Central continua idêntica à 0.17.3. Não mudaram rotas, navegação, dados, regras, funcionalidades nem dependências, e nenhum CSS antigo foi removido. Detalhes na seção 15 de `docs/relatorios/ETAPA_2_FASE_1_AUDITORIA_VISUAL.md` (e `.pdf`).

- **Passo 1.1 — tokens:** `src/styles/tokens.css` foi ampliado em quatro camadas (paleta, significado, componentes e ambientes). Entraram tokens de:
  - feedback, foco sobre fundo claro, links e bordas;
  - interação (área de toque de 44 px, desativado, passar o mouse e pressionar);
  - camadas (`z-index`), tipografia e raio de janela;
  - ambientes (`[data-ambiente]` para História, Quiz, Biblioteca, Perfil e Conquistas).

  Os tons novos dos ambientes **não estão aplicados**, e nenhuma tela usa `data-ambiente`.
- **Passo 1.2 — ponte de compatibilidade:** `src/styles/ponte.css`, carregado depois de `global.css` e de `tokens.css`, liga as 39 variáveis antigas aos valores legados **exatos** (HEX, opacidade, gradiente, sombra, medida e fonte). O alto contraste e a animação reduzida antigos continuam valendo.
- **Passo 1.3 — componentes base:** 11 componentes em `src/styles/componentes/base-*.css` (prefixo `bq-`, só tokens, sem HEX), com as estruturas reutilizáveis em `src/components/base/index.tsx`:
  - Botão, Painel, Cartão, Janela, Aviso, Mensagem rápida;
  - Campo, Progresso, Abas, Cabeçalho, Voltar.

  Nenhuma tela os usa ainda.
- **Folha de amostras** (só documento): `docs/relatorios/evidencias/etapa-2-fase1-amostras/`, com os seis ambientes, botões, painéis, cartões, abas e títulos e o contraste medido. Ela mostrou que a cor de acento de História e do Perfil não serve como texto, e foi criado o token `--amb-acento-texto`.
- **Testes:** 173, em 15 arquivos (18 novos):
  - `ponte.test.ts`: ponte, valores legados, ordem de importação, tokens da Central, ambientes e ausência de HEX;
  - `base.test.tsx`: teclado e nomes acessíveis dos componentes.
- **Comparação visual** (88 capturas, data fixa e animações reduzidas, contra a referência da 0.17.4):
  - 43 idênticas;
  - 38 só com a linha da versão no rodapé;
  - 2 na página Sobre, com a versão;
  - 5 variações naturais (personagem andando, carregamento e retrato);
  - **0 mudanças inesperadas**.

  Com o código novo e a versão ainda 0.17.4, 84 idênticas e 4 variações naturais. Registro: `docs/relatorios/evidencias/etapa-2-fase1-0.17.5/COMPARACAO.md`.

## Documentação — 16/11/2026 — Fase 1 da Etapa 2: auditoria visual e proposta da base comum (sem nova versão do jogo)

Etapa de análise. Não houve mudança em código, estilos, componentes ou funcionalidades; a versão do jogo continua 0.17.4. A auditoria não foi publicada no `main` e aguarda aprovação.

- `docs/relatorios/ETAPA_2_FASE_1_AUDITORIA_VISUAL.md` (e `.pdf`):
  - **Inventário:** 251 cores HEX diferentes nos estilos (259 pares quase iguais), 57 tamanhos de fonte, 85 sombras, 19 raios, 33 espaços, 20 pontos de quebra, 173 seletores redefinidos e 0 usos dos tokens da Central em `global.css`; 18 variantes de botão medidas nas telas.
  - **Proposta de tokens em quatro camadas:**
    - paleta;
    - significado;
    - componentes;
    - ambientes (`[data-ambiente]` para História, Quiz, Biblioteca, Perfil e Conquistas).

    Inclui a ponte de compatibilidade das variáveis antigas e o contraste calculado de cada combinação.
  - **Componentes a padronizar:** botão, painel, cartão, janela, aviso, mensagem rápida, campo, progresso, abas, cabeçalho e "voltar".
  - **Fechamento:** riscos, ordem de migração (passos 1.1 a 1.8), critérios de aceitação e esforço estimado.
- Pontos de acessibilidade encontrados (a correção depende de aprovação):
  - foco azul claro sobre pergaminho (1,87:1, abaixo de 3:1);
  - selo de aviso da Central (4,05:1);
  - elementos interativos entre 30 e 40 px, abaixo da meta de 44 px;
  - dois sistemas de alto contraste.
- Amostras reais de botões, painéis e outros componentes em `docs/relatorios/evidencias/etapa-2-fase1-auditoria/`.

## 0.17.4 — 16/11/2026 — Fase 0 da Etapa 2: legibilidade e navegação (aprovada e publicada)

**Publicação oficial (16/11/2026):**
- Aprovada e integrada ao `main` por fast-forward (`64f2b1f` → `058baa6`), sem conflitos e com o histórico preservado.
- O fluxo oficial (run 76) passou e publicou no GitHub Pages. O site serve `assets/index-DWTM3Srj.js`, o mesmo pacote do build local.
- Verificação no site publicado, no celular e no computador:
  - as cinco correções, com os mesmos contrastes medidos antes da publicação;
  - a navegação oficial e o Desafio diário pelos dois caminhos;
  - "Versão 0.17.4" no rodapé e na página Sobre;
  - a Central em 3D e 2D preservada;
  - 80 capturas sem erros de JavaScript, sem falhas de carregamento e sem rolagem horizontal.
- Registro completo: `docs/relatorios/evidencias/etapa-2-fase0-0.17.4/VERIFICACAO_PUBLICACAO.md`.


Correções pontuais aprovadas a partir do diagnóstico visual, sem reformular telas. A Central 0.17.3 não mudou: os arquivos dela estão intactos, e as capturas em 3D e 2D, no celular e no computador, são idênticas pixel a pixel. Também não mudaram regras, dados, pontuação, progresso, desbloqueios, rotas, links nem dependências. Relatório: `docs/relatorios/ETAPA_2_FASE_0_CORRECOES.pdf` (e `.md`).

- **Avisos (X4):** o título dos avisos sobre pergaminho estava em marfim, ilegível (cerca de 1,2:1). Agora fica em marrom, de 8,2:1 a 8,3:1 nos 9 avisos conferidos: Ranking, Multiplayer (2), Desafio diário (2), Entrar, Perfil local e painel administrativo.
- **Introdução do mundo (H2):** o subtítulo, a chamada e os nomes dos personagens herdavam o marrom do mapa sobre o fundo escuro (de 1,07:1 a 4,22:1). Agora ficam em texto claro com sombra, de 8,1:1 a 14,4:1. Conteúdo, pintura, botão e a regra `markWorldSeen` não mudaram.
- **Perfil (P1):** as tabelas ganharam um painel próprio de pergaminho, em vez de ficar sobre o cenário. O cabeçalho passou de 2,25:1 para 7,2–7,5:1 e as linhas ficaram acima de 11:1. Dados e categorias não mudaram.
- **Biblioteca (B1):** o link "Linha do tempo" na barra de abas passou de 1,33:1 para 7,27:1. As abas e os destinos não mudaram.
- **Navegação no computador (X5):**
  - a barra superior usa os nomes oficiais: Central, História, Quiz, Biblioteca e Perfil;
  - o "Desafio diário" saiu da fila principal e virou um destino secundário, com esse nome, junto das ações da barra (a Central não recebe esse link);
  - a versão exibida no rodapé e na página Sobre vem do `package.json` (`src/versao.ts` e `define` no `vite.config.ts`); antes era "0.17" fixo no rodapé e "Versão 0.3" na página Sobre.
- **Decisões oficiais registradas** em `docs/planos/ETAPA_2_DECISOES_OFICIAIS.md`:
  - nomes da navegação e personalidade de cada área;
  - papel futuro da página do livro;
  - preservação da página antiga da fase;
  - mapas continuam em 2D;
  - Central intocada.
- **Testes:** 155, em 13 arquivos (4 novos em `src/test/fase0.test.tsx`).
- **Varredura:** 84 capturas (42 telas e estados no celular e no computador), sem erros de JavaScript e sem rolagem lateral.

## Documentação — 16/11/2026 — Diagnóstico visual das demais telas (sem nova versão do jogo)

Etapa de análise. Não houve mudança em código, estilos, componentes ou funcionalidades; a versão do jogo continua 0.17.3.

- `docs/relatorios/ETAPA_2_DIAGNOSTICO_VISUAL_TELAS.pdf` (e `.md`): diagnóstico de 38 telas e funcionalidades (História, Quiz, Biblioteca, Perfil, personagens e conquistas, telas complementares), usando a Central 0.17.3 como referência.
  - **Classificação:** 3 aprovadas, 25 precisam de refinamento, 8 precisam de reformulação e 2 não verificáveis.
  - **Cada item traz:** como funciona, evidências no código, avaliação, problemas, o que preservar, direção visual, prioridade, complexidade e critérios de aceitação.
  - **Sequência de implementação** em 6 fases, de 0 a 5.
- 84 capturas reais (celular 390 × 844 e computador 1280 × 800) e 5 recortes de detalhe em `docs/relatorios/evidencias/etapa-2-diagnostico-visual/`.
- Principais achados:
  - três estilos visuais convivendo, e só a Central usa `tokens.css`;
  - cinco defeitos de leitura de correção simples: título dos avisos, introdução do mundo, tabela do Perfil, link da linha do tempo e nomes da barra do computador.

## 0.17.3 — 16/11/2026 — Ajustes finais da Central (aprovada e publicada)

**Publicação oficial (16/11/2026):**
- A Central 0.17.3 foi aprovada visualmente e integrada ao `main` por avanço direto (fast-forward) de `3a87c93` para `a983e98`, sem conflitos e com o histórico preservado.
- O CI do `main` (run 69) passou e publicou no GitHub Pages. O site serve `assets/index-B16ZFxcQ.js`, o mesmo pacote do build local.
- Verificação no site publicado, no celular e no computador:
  - Central em 3D, 13 elementos, jogador novo e alternativa 2D;
  - painel de missões e navegação inferior;
  - Desafio diário pela cena e pelo painel;
  - sem erros no console e sem rolagem horizontal.

  Registro completo: `docs/relatorios/evidencias/etapa-2-central-0.17.3/VERIFICACAO_PUBLICACAO.md`.
- O número do pacote (`package.json`) passou de 0.17.0 para 0.17.3, para acompanhar a versão oficial. Não houve versão nova.


Só a Central do Jogador. Os 13 elementos continuam com os mesmos ids, requisitos e regras de desbloqueio. XP, níveis, conquistas, recompensas, progressão, mapas, perguntas, conteúdo bíblico e as outras telas não mudaram. Relatório: `docs/relatorios/ETAPA_2_CENTRAL_AJUSTES_FINAIS.pdf` (e `.md`).

- **Desafio diário:** o atalho direto voltou à cena, preso ao quadro, com o nome "Desafio diário" e o aviso numérico quando o desafio do dia está pendente. Ele também está no painel de missões. A rota `/diario`, as 5 perguntas, os 30 XP e a regra de uma conclusão por dia não mudaram, porque o atalho só abre a página existente.
- **Quadro de missões:** o papel não mostra mais a palavra "Missões". No lugar, um sol nascente sobre três bilhetes presos por alfinetes, desenhados em código. O quadro e o seu elemento do acampamento continuam.
- **Tablet (768 × 1024):** o poço, a tenda grande e os barris ganharam uma posição própria para o tablet em pé e agora ficam inteiros no quadro. A posição muda gradualmente entre a tela larga, o tablet e a tela estreita.
- **Rótulos:**
  - dois rótulos não ficam mais colados: se encostarem, um desce, com no mínimo 28 px entre eles;
  - a folga em relação ao HUD e à placa "Missões" passou de 14 para 18 px;
  - no celular, "Personagem" fica no alto da tenda e "Biblioteca" sobre a mesa, a cerca de 95 px de distância;
  - no celular, a área invisível de toque cresceu, e todos os rótulos têm pelo menos 44 px de altura, inclusive o do baú só com ícone no 2D;
  - os rótulos ficam a 12 px da borda, para o número de aviso não ser cortado.
- **2D:** o rótulo "Desafio diário" voltou ao quadro, sem passar da borda no celular.
- **Computador:** a lanterna da frente saiu de diante do quadro e foi para a direita do baú; agora o papel do quadro fica inteiro à vista.
- **Testes:** 151, todos passando. Um teste novo confere o Desafio diário pelos dois caminhos (rótulo na cena e painel de missões).
- **Evidências visuais** (acrescentadas depois, sem mudança no jogo e sem nova versão): as capturas originais do relatório estão em `docs/relatorios/evidencias/etapa-2-central-0.17.3/`, com a galeria `GALERIA_EVIDENCIAS.md`. O relatório em texto aponta para ela.

## 0.17.2 — 16/11/2026 — Refinamento final da Central (aguardando avaliação; não publicada no `main`)

Só a Central do Jogador. Os 13 elementos do acampamento continuam com os mesmos ids, regras, requisitos, dados e desbloqueios (`src/data/acampamento.ts` e `src/services/game/acampamento.ts` sem mudanças). Mapas, perguntas, conteúdo bíblico, progressão, XP, conquistas, recompensas, páginas de fases e a estrutura da aplicação também não mudaram. Relatório: `docs/relatorios/ETAPA_2_CENTRAL_REFINAMENTO_FINAL.pdf` (e `.md`).

- **Celular, composição própria em três planos:**
  - perto, nas laterais: fogueira à esquerda (inteira, sem corte) e baú à direita;
  - meio: mesa à esquerda; jarros e poço à direita;
  - fundo: tendas, barris e estandarte à esquerda; quadro, lanternas, palmeiras e ovelhas à direita.
  
  O personagem fica sozinho no centro. Alguns objetos ficam um pouco menores só na tela estreita. Nenhum elemento foi retirado. O tablet usa uma mistura das duas composições, e o computador não mudou.
- **Rótulos:** descem automaticamente quando encostariam no HUD ou na placa "Missões" (folga de 14 px). No celular, o rótulo da tenda fica na altura da porta, e o do baú, logo acima dele.
- **Atalho "Diário" fora da cena:** era um atalho ativo no quadro de missões, mas levava ao **Desafio diário** (`/diario`), não ao antigo "Diário de viagem". O rótulo e o clique no quadro saíram da cena, que agora tem 3 rótulos. O Desafio diário continua no painel de missões (primeiro item), com a mesma página, rota e dados.
- **Painel de missões no celular:** termina acima das ações, sem cobri-las pela metade; o rosto do personagem continua à vista.
- **Testes:** 150, todos passando. O teste da Central confere os 3 rótulos, a ausência do "Diário" na cena e o link do Desafio diário no painel.

## 0.17.1 — 16/11/2026 — Revisão visual da Central (aguardando avaliação; ainda não publicada no `main`)

Só a Central do Jogador. Mapas, perguntas, conteúdo bíblico, progressão e as outras telas não mudaram. Os 13 elementos do acampamento continuam com os mesmos ids, regras, requisitos e dados (`src/data/acampamento.ts` e `src/services/game/acampamento.ts` sem mudanças); só a posição de alguns na cena mudou. Relatório: `docs/relatorios/ETAPA_2_CENTRAL_REVISAO_VISUAL.pdf` (e `.md`).

- **Poço e baú:** o baú foi para perto do personagem e o poço para o fundo, à direita, junto das palmeiras; no computador os dois não se sobrepõem mais. Outros elementos foram reposicionados para não se cobrirem.
- **Rótulos flutuantes:** mais discretos (fundo escuro translúcido, borda fina, texto de 12 px, opacidade 88%), voltando ao destaque no foco e ao passar o mouse. A área de toque continua com 44 px.
- **Cenário:** nuvens mais altas e achatadas, montanhas com menos facetas e neve quente, ciprestes em dois tons, tufos de capim no chão, brilho da fogueira no ar e no chão. Nada escurecido; nenhum modelo 3D ou dependência nova.
- **Celular:**
  - câmera mais alta, para separar os objetos de perto dos de longe;
  - painel de missões abre de baixo para cima, sem cobrir a cabeça e o tronco do personagem, com botão "Fechar missões" (também no computador);
  - placa "Missões" abaixo da barra de XP, e o título do nível cortado com reticências em vez de quebrar a linha.
- **Cena 2D** (alternativa sem 3D): sem mudanças, conferida.
- **Testes:** 150, todos passando; o teste do painel de missões agora também confere o botão de fechar.
- **Desempenho** (vídeo por software, mediana de 3 medições, comparado com a 0.17.0 no mesmo ambiente): tempo até a cena ficar pronta de −6% (celular) a +4% (notebook); quadros por segundo iguais.
- **Problema conhecido:** no celular a cena ainda fica cheia; a fogueira aparece cortada à esquerda e alguns objetos de perto cobrem os de longe.

## 0.17.0 — 14/11/2026 — Central do Jogador: Acampamento de Aventura (Etapa 2, tela piloto)

Implementação do plano `docs/relatorios/ETAPA_2_CENTRAL_PLANO_TECNICO_FINAL.md`, aprovado. Relatório completo: `docs/relatorios/ETAPA_2_CENTRAL_IMPLEMENTACAO.pdf` (e `.md`).

- **Cena 3D** (`src/character3d/acampamento.ts`):
  - sem as duas cidades; no lugar, uma cordilheira média com névoa, florestas em instâncias (ciprestes e árvores de copa redonda) e formações rochosas;
  - céu de fim de tarde mais profundo e névoa quente;
  - texturas geradas em código (terra com cascalho, veios de madeira, grão em pedra e lona);
  - câmera mais próxima e quase nivelada: o personagem ocupa de 41 a 43% da altura da cena (fica à direita do centro no computador) e a paisagem aparece atrás dele;
  - rótulos presos à borda quando o objeto sai do quadro.
- **Os 13 elementos de evolução** continuam iguais: quantidade, regras, requisitos, dados e recompensas (`src/data/acampamento.ts` e `src/services/game/acampamento.ts` não mudaram). As posições de alguns foram trazidas para dentro do quadro, para continuarem visíveis com a câmera nova.
- **Cena 2D:** sem a cidade; cordilheira, florestas, rochas, brilho da fogueira e vinheta; o personagem passa a ocupar cerca de 41% da altura da cena (medido pela área desenhada); objetos nas bordas no celular, onde o rótulo do baú mostra só o ícone (o nome continua no rótulo acessível) para não encostar no cajado.
- **Interface:**
  - HUD com retrato, nível, XP, estrelas, sequência e configurações;
  - placa "Missões", que abre um painel (`PainelMissoes`) com desafio diário, continuar jornada, baús, revisão inteligente, próximo no acampamento e progresso geral;
  - ações (`AcoesAcampamento`): "Começar/Continuar" (marca a fase como visitada e abre a cena narrativa, como "Começar fase" no mapa) entre as placas do Modo História (floresta) e do Modo Quiz (azul profundo).
- **Diário de viagem** retirado da Central. Revisão no painel de missões; Estatísticas, Ranking, Conquistas e Revisão em novos atalhos do Perfil. Histórico e aviso de perfil local continuam no Perfil. Nenhuma tela, rota ou dado removido.
- **Navegação global** (`NavegacaoGlobal`): Central, História, Quiz, Biblioteca e Perfil; continua oculta nos mapas, perguntas, cenas e resultados.
- **Estilos novos:**
  - `src/styles/tokens.css`, com a paleta "Crônicas da Jornada" (o único arquivo com HEX dos estilos novos);
  - `componentes/` (navegação, HUD, placas e painel);
  - `telas/acampamento.css`.
  
  O bloco antigo da Central e da barra inferior saiu de `global.css`.
- **Testes:** 150 (6 novos em `src/test/central.test.tsx`); o teste da Central e o do menu foram atualizados.
- **Desempenho** (Chromium com vídeo por software, mediana de 3 medições, mesmo ambiente):
  - tempo até a cena ficar pronta: celular −3%, tablet +5%, computador +5%, notebook +8%;
  - quadros por segundo: de 10 a 20% menores.

## 0.16.6 — 14/11/2026 — Plano da Central em texto

Sem mudança no jogo.

- `docs/relatorios/ETAPA_2_CENTRAL_PLANO_TECNICO_FINAL.md`: versão em texto (Markdown) do plano técnico da Central, com o mesmo conteúdo do PDF, para ferramentas que não leem PDF (por exemplo, outro assistente de IA).
- `CLAUDE.md`: os próximos relatórios em PDF também ganham uma versão em texto `.md`.

## 0.16.5 — 14/11/2026 — Plano técnico consolidado da Central do Jogador

Sem mudança no jogo.

- `docs/relatorios/ETAPA_2_CENTRAL_PLANO_TECNICO_FINAL.pdf`: versão final do plano da tela piloto, com as seis decisões aprovadas:
  - barra inferior com Central, História, Quiz, Biblioteca e Perfil;
  - diário de viagem fora da Central;
  - sem cidades na cena;
  - os 13 elementos de evolução preservados;
  - barra oculta nos mapas;
  - página antiga da fase mantida.
- O plano lista arquivos, componentes, organização visual, personagem, elementos, navegação, mapa de acessos preservados, responsividade, testes e critérios de aceitação. Ele aguarda aprovação para ser implementado.

## 0.16.4 — 14/11/2026 — Relatório da Etapa 2 em PDF

Sem mudança no jogo.

- `docs/relatorios/ETAPA_2_DIRECAO_ARTISTICA_E_PLANO.pdf`: decisões G1–G8 aprovadas e plano técnico da Central do Jogador. O plano aguarda aprovação; nada dele foi implementado.
- `CLAUDE.md`: nova regra. Todo relatório em PDF é publicado em `docs/relatorios/`, com um commit só de documentação, inclusive nas etapas de análise (autorização do dono do projeto em 14/11/2026).

## 0.16.3 — 14/11/2026 — Relatórios em PDF no repositório

Sem mudança no jogo.

- Os três relatórios em PDF foram adicionados em `docs/relatorios/`, com acesso público pelo GitHub:
  - `BIBLE_QUEST_AUDITORIA_GERAL.pdf`: auditoria geral da versão 0.16.1;
  - `ETAPA_1_BACKUP_E_PUBLICACAO.pdf`: Etapa 1, concluída;
  - `ETAPA_2A_DIRECAO_ARTISTICA.pdf`: proposta de direção artística, aguardando aprovação; nada dela foi implementado.
- Índice de `docs/` atualizado.

## 0.16.2 — 14/11/2026 — Etapa 1: ponto de retorno e publicação estável

Sem mudança no jogo: personagens, mapas, perguntas e conteúdo bíblico ficaram iguais.

- **Ponto de retorno:** tag anotada `v0.16.1` no commit `5a1a21f`, a versão auditada. Ela foi criada no repositório local da sessão, mas o envio ao GitHub foi recusado pela conexão da sessão; a criação no GitHub fica com o dono do projeto (passo a passo em `docs/planos/PUBLICACAO-E-BACKUP.md`).
- **Causa da falha na publicação:**
  - o ambiente `github-pages` só aceita os ramos `claude/...`, por isso toda publicação pelo `main` era recusada em 2 segundos (execuções 37, 39 e 41);
  - todas as execuções usavam o grupo `pages` com `cancel-in-progress: true`, então o envio ao `main` cancelava a publicação válida do ramo de desenvolvimento (execuções 38 e 40).
- **Correção (não percebida antes):** a versão 0.16.0 nunca foi publicada sozinha. O site ficou na 0.15.0 até a publicação da 0.16.1. A conferência daquela hora procurou um texto (`av-cena`) que já existia na 0.15 e deu falso positivo.
- **Novo workflow** (`.github/workflows/deploy.yml`):
  - produção só pelo `main`;
  - `claude/**` e pull requests só verificam;
  - grupo de publicação `pages-producao` sem cancelamento;
  - permissões de publicação só no job que publica;
  - conferência dos arquivos gerados (`index.html`, scripts, modelos e caminhos relativos).
- **Documentação:** `docs/planos/PUBLICACAO-E-BACKUP.md` (processo, histórico, retorno e limitações); seção de publicação do README.
- **Verificação:**
  - o ramo de desenvolvimento só verificou (execução 44);
  - duas publicações seguidas pelo `main` deram certo: execução 45 (envio) e execução 46 ("Run workflow"), implantações 7790588720 e 7790604371;
  - o site serve os mesmos arquivos da versão auditada;
  - as 23 telas abriram sem erro no site publicado.
- **Tag no GitHub:** `v0.16.1` criada pelo dono do projeto (release pre-release) e conferida: aponta para `5a1a21f`. **Etapa 1 concluída.**

## 0.16.1 — 14/11/2026 — Auditoria geral e plano oficial de evolução

- Novo documento `docs/auditorias/AUDITORIA-GERAL-v0.16.md`, com:
  - diagnóstico de arquitetura, telas, estado, persistência, mapas, personagens, conteúdo, testes, build e publicação, com evidências e classificação de cada funcionalidade;
  - pontos fortes, problemas por gravidade, arquitetura recomendada (mapas em camadas e esqueleto padrão para o 3D), roadmap E0–E10, dependências, critérios de aceitação, esforço e riscos.
- Sem mudança no jogo: o plano aguarda aprovação.
- `ROADMAP.md`: contagem de fases de Gênesis corrigida (20) e referência ao novo plano.

## 0.16.0 — 14/11/2026 — Cena da fase, cenário de Êxodo e telas do acampamento no visual de aventura

- **Cena narrativa da fase** (a história antes das perguntas):
  - acontece sobre a paisagem da região da fase, com faixa de pergaminho no topo (voltar ao mapa, quadros da cena e "Pular");
  - a introdução mostra a pintura da fase numa moldura de madeira;
  - personagens bíblicos em cartões de pergaminho e o personagem do jogador ao lado, também no celular;
  - o texto fica num pergaminho com o título numa faixa; as referências bíblicas parecem um rolo, com as pontas de madeira;
  - os avisos de narrativa dramatizada e a fonte do texto bíblico continuam iguais.
- **Cenário próprio para Êxodo:** quatro regiões no mapa e nas partidas.
  - O rio Nilo: cesto entre os juncos, pirâmide e palmeiras;
  - O deserto de Midiã: a sarça ardente, ovelhas e tenda;
  - As pragas no Egito: porta marcada da Páscoa, obelisco e casas;
  - O mar e o monte Sinai: o mar aberto, o monte com nuvem e relâmpago, as tábuas e a coluna de fogo.
- **Biblioteca, Conquistas e Perfil:** placa de pergaminho no topo, botão de voltar ao acampamento, paisagem ao fundo (biblioteca antiga, salão das conquistas e acampamento) e painéis de pergaminho e madeira. Todo o conteúdo e as funções continuam os mesmos, e o menu inferior continua.
- **Novos arquivos:** `src/components/map/aventura/PaginaAventura.tsx` (moldura das telas) e o cabeçalho `CabecalhoPagina`.
- **Testes:** 144, com 3 novos (regiões de Êxodo, cena da fase e as três telas).

## 0.15.0 — 14/11/2026 — Perguntas e resultado no visual de aventura (etapas 5 e 6)

- **Tela de perguntas:**
  - A partida acontece sobre a paisagem da região da fase: céu, montanhas, chão e marcos. Exemplos: a arca nas fases de Noé, a torre em Babel, pirâmide e celeiro no Egito, e no Quiz a biblioteca, o templo e os pergaminhos do desafio.
  - O cabeçalho virou uma faixa de pergaminho, com botão redondo de sair, progresso, sequência de acertos e moeda de pontos.
  - O cartão da pergunta é de madeira emoldurada.
  - O personagem fica com a fala ao lado também no celular.
  - A barra superior do site some durante a partida.
- **Tela de resultado:**
  - pergaminho sobre a mesma paisagem, faixa com o título e personagem comemorando com raios de luz;
  - estrelas grandes (a do meio maior) e placas de madeira com acertos, erros, aproveitamento e pontos;
  - moeda de XP que gira ao entrar, baú brilhando quando um baú é liberado e confete na vitória;
  - sem o menu inferior, porque os botões levam de volta ao mapa;
  - todos os valores vêm da partida registrada.
- **Novos arquivos:**
  - `src/components/map/aventura/CenarioFundo.tsx`: a paisagem;
  - `src/data/mapas/partida.ts`: o cenário da fase ou do desafio.
- **Animações:** confete e moeda respeitam "reduzir animações".
- **Testes:** 141, com 2 novos (cenário de cada partida e início direto do desafio pela janela). O fluxo completo confere o resultado de vitória.

## 0.14.0 — 14/11/2026 — Mapas de aventura: Gênesis completo e trilha do Quiz

Primeira etapa do redesign de aventura. Antes de mudar o código, foi feita uma auditoria da central e dos mapas: `docs/auditorias/AUDITORIA-v0.14.md`.

- **Modo História:** o mapa virou um mundo de aventura em 2D com camadas.
  - O caminho sobe da fase 1 por regiões ilustradas de Gênesis: criação, Éden, Caim e Abel, Noé, Babel, Abraão, Isaque e Jacó, e José no Egito.
  - O cenário tem paredões de pedra com escadas, lagos e cachoeiras, arca, arco-íris, torre de Babel, tendas, camelo, poço, pirâmide e outros elementos.
- **Fases em medalhão:** ouro quando concluídas, dourada com raios quando é a atual, prata com cadeado quando bloqueadas, e três estrelas embaixo.
- **Cabeçalho em pergaminho:**
  - botões de voltar e de ajuda;
  - placa do mundo visível com as fases concluídas;
  - total de estrelas e botão do baú, que leva até o baú pronto.
- **Janela de apresentação da fase:**
  - número, nome, pintura, descrição, objetivo, referência bíblica, dificuldade, recompensa e estrelas;
  - numa fase bloqueada, explica o requisito e não deixa começar.
- **Modo Quiz:** trilha própria com cenário de templos, biblioteca, pergaminhos, livros, ampulheta, pedras com inscrição, portal e braseiros, em caminho de pedra.
  - Seletor de dificuldade (Iniciante, Intermediário, Avançado e Especialista), uma região por vez.
  - Ícone do tipo de desafio em cada medalhão.
  - Atalhos para o treino livre: por tempo, por tema, avançado e aleatórias.
  - "Começar desafio" na janela já inicia a partida.
- **Sem mudança nas regras de progresso:** os dois modos continuam com desbloqueios separados e compartilham XP, nível e conquistas.
- **Removidos os arquivos do mapa da v0.13:** `Prado.tsx`, `MapaTopo.tsx` e `paletasMapa.ts`.
- **Testes:** 139, com 7 novos em `src/test/mapas.test.tsx`.

## 0.13.3 — 14/11/2026 — Referências dos penteados

- Imagens de referência de 5 peças do editor modular, geradas no Canva no estilo dos corpos base: cabelo longo ondulado, trança, cacheado volumoso e véu (femininos), e cacheado (masculino). Ficam em `tools/personagem/estilizado/referencias/cabelos/`.
- Viram 3D com a cota gratuita do Hugging Face, cerca de 2 por dia. A primeira geração está agendada para 14/11 às 22:45 (Brasília).

## 0.13.2 — 14/11/2026 — Esqueleto e animações nos corpos base

- Os corpos base feminino e masculino ganharam esqueleto (os mesmos nomes de ossos dos personagens do jogo), pesos e as 6 animações: parado, caminhada, corrida, aceno, comemoração e descoberta. Arquivos: `tools/personagem/estilizado/corpos-base/corpo-*-rig.glb` (1,4 MB e 1,8 MB comprimidos).
- **Novo `juntas_auto.py`:** posiciona as juntas de cada corpo. As alturas e a abertura vêm da silhueta de frente, e a profundidade é calculada na malha.
- **Novo `exportar_corpo.py`:** exporta o corpo com esqueleto e animações.
- **`preparar.py`:** novo parâmetro opcional que também reduz o rosto. Nos corpos de cabeça grande, o rosto inteiro tomava quase todo o limite de faces e o resto do corpo ficava quebrado.
- Prévias das poses em `corpos-base/poses-*.png`.
- Ainda não aparecem no jogo. Próximo passo: regiões de cor (pele, cabelo e roupa de baixo) e expressões, e depois as peças.

## 0.13.1 — 14/11/2026 — Corpos base em 3D

- Gerados com o TRELLIS.2 (gratuito, Hugging Face) os modelos 3D dos dois corpos base do editor modular, a partir das imagens `corpo-feminino.png` e `corpo-masculino.png`. Estão em `tools/personagem/estilizado/corpos-base/`, com prévias de frente e de lado.
- Ainda não aparecem no jogo. Próximo passo: esqueleto e animações nos corpos, e depois cabelos, roupas, calçados e acessórios como peças separadas.
- Origem, ferramenta, data e licença registradas em `public/models/personagem/LICENCAS.md`.

## 0.13.0 — 13/11/2026 — Mapas em trilha de fases

- **Modo História e Modo Quiz abrem direto no mapa**, em tela cheia e sem poluição visual. Saíram o cabeçalho com nível e barra de progresso, a lista de mundos, os títulos ao lado das fases, os atalhos e a lista de próximos mundos.
- **Fica só o essencial:**
  - botão redondo para voltar ao acampamento;
  - total de estrelas conquistadas;
  - no Modo Quiz, um botão para o treino livre.
- **Novo visual:**
  - campo claro com céu e montanhas ao longe;
  - caminho sinuoso listrado;
  - ilhas de grama com amendoeiras floridas, árvores, oliveiras, palmeiras, ovelhas, tendas, poço, pirâmide, torre e cidade;
  - flores, borboletas e nuvens.
- **Botões das fases:** redondos e brilhantes, com número grande. As fases concluídas alternam verde, azul, laranja e roxo e têm três estrelas embaixo. A fase atual é dourada e pulsa, e as bloqueadas são cinza com cadeado.
- Cada mundo e cada região tem suas cores e uma fita com o nome (`src/data/paletasMapa.ts`). O cenário é desenhado em código (`src/components/map/Prado.tsx`), sem imagens externas, e fica igual em todas as visitas.
- O título de cada fase continua no nome acessível do botão, lido pelos leitores de tela.
- Testes ajustados ao mapa novo: continuam 132.

## 0.12.0 — 13/11/2026 — Ícones ilustrados

- **Novo componente `GameIcon`** (`src/components/GameIcon.tsx`): 30 ícones coloridos desenhados em SVG, com contorno escuro, brilho e volume, no estilo de jogo de aventura. Exemplos: tenda, túnica, troféu, pilha de livros, pessoa, estrela, chama, baú, pergaminho, mapa, calendário, louros, coroa, escudo, bússola, lamparina, pomba, cérebro, engrenagem, cadeado e coração.
- **Onde aparecem:**
  - menu inferior: o ícone da tela atual sobe e brilha;
  - barra superior;
  - acampamento: estrela, chama, engrenagem e nível no cabeçalho, rótulos dos objetos, botões dos modos e quadro de missões;
  - conquistas, perfil, resultado e modalidades do treino livre.
- Os ícones de ação (setas, fechar, marcar) continuam de traço. Quando não existe versão ilustrada, aparece o ícone de traço.
- **Testes:** 132 (2 novos para os ícones).

## 0.11.0 — 13/11/2026 — Visual de jogo em todas as telas

Todas as telas seguem agora o estilo da central do acampamento:

- **Céu no topo de cada página:** céu azul, pôr do sol, montanhas e colinas que se fundem ao chão escuro. Títulos com sombra para continuar legíveis.
- **Barra superior de madeira:** item ativo em ouro, nível em medalhão e botões redondos de pedra.
- **Painéis como placas de madeira:** borda dourada e relevo nos cartões, estatísticas, fichas da Biblioteca e histórico.
- **Títulos de seção em faixa vermelha com borda dourada.**
- **Botões grandes com relevo:** laranja-dourado (principal) e madeira (secundário), que afundam ao tocar.
- **Abas e opções:** fundo de madeira, com a opção escolhida em ouro.
- **Barras de progresso** douradas e mais grossas.
- **Avisos em pergaminho.**
- **Campos de texto** em papel claro.
- **Rodapé de madeira.**
- **Alto contraste:** desliga as texturas e volta às superfícies lisas.

## 0.10.1 — 13/11/2026 — Organização do repositório

- **README reescrito:** mais curto e com sumário. Reúne como jogar, funcionalidades, tecnologias, como executar, árvore de pastas comentada, como acrescentar conteúdo, testes, publicação, o que depende de servidor e licenças. Saíram as seções repetidas e as informações desatualizadas.
- **Histórico** movido do README para este arquivo (`CHANGELOG.md`). O README mostra só as versões mais recentes.
- **Documentação:**
  - planos em `docs/planos/`;
  - diagnósticos em `docs/auditorias/`;
  - índice em `docs/README.md`.
- **Código:**
  - `Layout` foi para `src/components/layout/`;
  - a tela de perguntas (`QuizRunner` e `QuestionView`) foi para `src/components/quiz/`.
- Nenhuma mudança no funcionamento do jogo.

## 0.10.0 — 13/11/2026 — Central do acampamento

- **Nova tela inicial:** o acampamento do jogador em 3D (Three.js), no lugar do painel.
  - O personagem é o mesmo modelo 3D do criador, no centro. Ele acena ao chegar, faz pequenos gestos, comemora quando há baú pronto e reage ao passar o mouse nos modos.
  - A cena tem tendas, fogueira com chamas, fumaça, faíscas e luz, baú que se abre e brilha quando há baú no mapa, quadro de missões, mesa de estudos, caminho de pedras, montanhas, nuvens e cidades antigas ao fundo.
  - Os objetos são clicáveis (com o mouse, o dedo ou o teclado) e levam às funções reais.
- **Cabeçalho de jogo:** retrato, nome, nível, barra de XP, estrelas, sequência de dias e configurações. Só dados reais: o jogo não tem moedas, então elas não aparecem.
- **Quadro de missões:** desafio diário com contagem regressiva até a meia-noite, próxima fase, baús prontos ou conquista recente, e a próxima melhoria do acampamento com a barra de andamento.
- **Acampamento evolutivo:** 8 elementos novos liberados por nível, fases, conquistas e baús. Não há compras.
- **Botões dos modos:** Modo História ("Explore as Escrituras") em dourado e Modo Quiz ("Teste seu conhecimento") em azul-esverdeado, com o andamento de cada um.
- **Menu inferior:** Início, Personagem, Conquistas, Biblioteca e Perfil, com ícones em medalhões. No acampamento, aparece também no computador.
- **Desempenho:**
  - a cena é gerada por código, sem arquivos extras (cerca de 20 KB, carregados só na tela inicial);
  - um único renderizador;
  - na qualidade leve: sem sombras, 30 quadros por segundo e menos partículas;
  - a animação para quando a tela não está visível;
  - "reduzir movimento" desliga as animações.
- **Testes:** 130 (5 novos para o acampamento; o teste da tela inicial foi refeito).

## 0.9.3 — 13/11/2026 — Novo visual da tela de perguntas

- **Topo:** uma marca por pergunta, verde para acerto e vermelha para erro; pontuação em moeda dourada; contador de acertos seguidos (a partir de 2) com chama.
- **Pergunta:** cartão emoldurado com medalhão do número da pergunta ("3/10").
- **Alternativas:**
  - botões de jogo com relevo e número em moeda dourada;
  - em duas colunas no computador quando as respostas são curtas;
  - animação ao acertar e tremida ao errar.
- **Companheiro:** no computador, o personagem do jogador fica ao lado da pergunta, num pedestal, com um balão de incentivo ("Leia com calma.", "Muito bem!", "Vamos aprender juntos."). O personagem acena quando você acerta e reage quando você erra. As frases são do jogador, não de personagens bíblicos.
- **Explicação:** selo de acerto ou erro e referência em destaque.
- **Acessibilidade:** respeita "reduzir movimento" e o alto contraste; atalhos 1 a 4 continuam valendo.

## 0.9.2 — 13/11/2026 — Novo visual do painel

- **Topo do painel:**
  - pintura de fundo em tom quente, com luz dourada;
  - personagem sobre um pedestal iluminado;
  - cartão translúcido com medalhão do nível, barras de XP mais visíveis e botão **Continuar jornada**, que leva direto à próxima fase.
- **Cartões do Modo História e do Modo Quiz:** botão "Jogar".
- **Atalhos:** ícones em medalhões dourados.
- **Celular:** topo compacto, com o personagem ao lado do cartão e as contagens numa linha só, sem ocupar a tela inteira.

## 0.9.1 — 13/11/2026 — Referências dos corpos base

- Imagens dos corpos base feminino e masculino (roupa justa simples, cabelo preso ou curto, descalços), enviadas pelo dono do projeto, salvas em `tools/personagem/estilizado/referencias/corpo-feminino.png` e `corpo-masculino.png` para virarem os modelos 3D do editor modular. Nenhuma mudança no jogo.

## 0.9.0 — 13/11/2026 — Editor de personagem: cores livres, expressão e troca ao vivo

Primeira entrega do editor modular (`docs/planos/EDITOR-3D-PLANO.md`, Etapas 4 e 6).

- **Cores livres por região:** nova aba **Cores** no guarda-roupa e na criação, para cabelo, túnica, manto, faixa e cinto, e couro.
  - Cada região tem uma paleta de época, a opção "cor original" e um seletor livre (`SeletorDeCor`).
  - A cor livre vale nos dois modelos (estilizado e v0.7) e tem prioridade sobre o tingimento.
- **Expressão de repouso:** Serena, Sorriso, Alegre ou Curiosa, na aba Rosto. Usa os morph targets do modelo.
- **Troca ao vivo:** no modelo estilizado, mudar uma cor só atualiza os uniforms do shader. O personagem não é remontado nem o GLB recarregado (`recolorir` no `Rig`, `soCores` em `heroi.ts`).
- **Shader:** a suavização de claridade agora é por região (forte na pele, leve nas outras). Assim um cabelo escuro pode virar loiro.
- **Interface:** categorias em coluna lateral nas telas largas. Botões **Restaurar aparência original** e **Salvar personagem**.
- **Salvamento:** os campos novos `cores` e `expressao` em `CharacterAppearance` guardam apenas cores (#rrggbb) e identificadores. Valores inválidos vindos do armazenamento são descartados. Perfis antigos mantêm a mesma chave visual.
- **Lógica do editor:** fica em `src/services/game/aparencia.ts` (`definirCor`, `definirExpressao`, `restaurarOriginal`).
- **Testes:** 125 no total. Novos:
  - `editor.test.ts`: cabelo, cores, roupas, acessórios, expressão, salvamento, recuperação, dados corrompidos e restauração;
  - fluxo de ponta a ponta das cores e da expressão.
  - O teste do guarda-roupa passou a usar os novos nomes dos botões.
- **Ainda falta:** cor dos olhos e formatos de olhos, cortes de cabelo, roupas e calçados como peças 3D estilizadas. Dependem do corpo base estilizado (veja o plano).

## 0.8.5 — 13/11/2026 — Plano do editor de personagens modular

- `docs/planos/EDITOR-3D-PLANO.md`: análise do que já existe, arquitetura proposta e lista dos modelos 3D necessários para o editor modular pedido (Etapas 1 a 3). Nenhuma mudança no jogo.

## 0.8.4 — 13/11/2026 — Interface em tons quentes

- O azul-marinho da interface virou marrom-terra quente (variáveis `--navy-*` e as cores fixas equivalentes em `global.css`), combinando com o estilo de animação. O texto continua claro sobre fundo escuro, com o mesmo contraste. O modo de alto contraste não mudou.
- Cantos mais arredondados (cartões com 18 px, botões e campos com 12 px).
- Palco 3D com luz quente: o contraluz azulado virou âmbar, e a luz principal ficou mais quente.
- `theme-color` do navegador acompanha o novo fundo.

## 0.8.3 — 13/11/2026 — Um modelo por personagem

- O jogo agora carrega o modelo próprio de cada personagem (`heroi-<base>.glb`), quando existir, listado em `MODELOS_POR_BASE` (`src/character3d/heroi.ts`). Se o jogador trocar o corpo, ou se o arquivo faltar ou falhar, usa o modelo do corpo, como antes. Novo teste.
- Referências em pose neutra (braços um pouco abertos, mãos vazias) de 6 personagens, geradas no Canva a partir dos desenhos do dono do projeto, em `tools/personagem/estilizado/referencias/`. Os modelos 3D saem um por dia (cota gratuita).

## 0.8.2 — 13/11/2026 — Referências dos outros personagens

- Folha com os 8 personagens enviada pelo dono do projeto: cada figura foi recortada para `tools/personagem/estilizado/referencias/` (com `LEIA-ME.md`), para virar modelo 3D, um por dia, conforme a cota gratuita. Nenhuma mudança no jogo.

## 0.8.1 — 13/11/2026 — Tons de pele do herói estilizado

- O tingimento usa a luminância da textura sobre a cor escolhida, com a diferença de claridade suavizada (expoente 0,5).
- Os tons claros de pele ganham saturação proporcional à claridade (`saturacaoPele`), porque a luz azulada do palco os deixava acinzentados. Os tons médios e escuros ficam como estão.

## 0.8.0 — 13/11/2026 — Herói masculino no estilo de animação 3D

- **Novo herói masculino** publicado: modelo gerado de imagem com o TRELLIS.2 (gratuito), com esqueleto, as seis animações, quatro expressões e acessórios de mão.
- `tools/personagem/estilizado/acabar.py`: separa seis regiões de cor pela textura e pela posição (pele, cabelo, túnica, manto, faixa, couro), aumenta um pouco os olhos, cria as expressões e exporta. O piscar fecha o olho para cima, com a pele da bochecha cobrindo. `montar.sh` faz o processo inteiro.
- **Jogo:** `heroi.ts` reconhece o modelo estilizado (`estilo: animacao` nos extras da cena) e tinge cada região por um shader. Só mudam os texels parecidos com a cor de base; a claridade da cor nova é suavizada, para tons muito claros não estourarem. A cor de base de cada material agora é preservada na conversão para MeshStandardMaterial.
- **Limitações:** a estrutura feminina continua com o modelo v0.7 até a referência feminina ser gerada (a cota gratuita diária do Hugging Face permite poucos modelos por dia). Troca de corte de cabelo, manto, cinto, calçado e barba não aparece no herói estilizado.
- **Testes:** o teste do GLB publicado aceita o modelo estilizado (regiões com cor de base e acessórios); novo teste das cores por região.

## 0.7.4 — 13/11/2026 — Esqueleto e animações no personagem estilizado

- Primeiro modelo estilizado (masculino) gerado da imagem de referência aprovada.
- `tools/personagem/estilizado/preparar.py`: une vértices, reduz para 40 mil faces e põe a malha em metros.
- `tools/personagem/estilizado/rigar.py`: esqueleto com os mesmos nomes de ossos do modelo v0.7 (juntas em `juntas-m.json`), pesos calculados numa cópia fechada da malha e transferidos, saia dividida entre tronco e pernas, braços baixados para a pose de repouso e os mesmos clipes (Idle, Walk, Run, Victory, Greeting, Discovery).
- Correção em `animacoes.py`: canais constantes só são removidos quando estão no valor de repouso (antes, um braço erguido o clipe inteiro podia perder parte da rotação).
- Ainda não integrado ao jogo.

## 0.7.3 — 13/11/2026 — Primeiro teste de imagem para 3D

- `gerar3d.py` agora usa a chave do Hugging Face injetada pelo ambiente (cabeçalho `x-hf-authorization`), sem guardar a chave no código. Teste completo: modelo 3D com textura gerado em cerca de 37 segundos, de graça. O modelo de teste fica fora do Git; nenhuma mudança no jogo.

## 0.7.2 — 13/11/2026 — Início do personagem no estilo de animação

- Regra de imagens do `CLAUDE.md` atualizada, com autorização do dono do projeto: além das obras em domínio público, também são permitidos recursos gerados por IA e recursos CC0, com origem e licença registradas.
- `tools/personagem/estilizado/gerar3d.py`: gera um modelo 3D a partir de uma imagem com o TRELLIS.2 (Microsoft, licença MIT), pela demonstração gratuita do Hugging Face. Precisa de uma chave gratuita de leitura do Hugging Face. Nenhuma mudança no jogo.

## 0.7.1 — 13/11/2026 — Plano do estilo de animação 3D

- Registrado em `docs/planos/PROXIMOS-PASSOS-3D.md` o plano para deixar personagens e interface no estilo de filme de animação 3D, pelo caminho gratuito (imagens de referência, TRELLIS, Blender), com as decisões pendentes. Nenhuma mudança no jogo.

## 0.7.0 — 12/11/2026 — Personagem 3D reconstruído (modelo GLB)

- **Etapas 1 e 2:** diagnóstico do personagem anterior e escolha da tecnologia (`docs/auditorias/AUDITORIA-v0.7.md`).
- **Modelo principal:** pipeline reprodutível no Blender (`tools/personagem/`), com recursos CC0 do MakeHuman.
  - Corpo humano contínuo, com targets de sexo, idade, musculatura e proporções.
  - Esqueleto de 163 ossos (com rig facial) e pesos.
  - Olhos, sobrancelhas, cílios, dentes e língua.
  - 7 cabelos texturizados e textura de pele real.
  - Estruturas masculina e feminina.
- **Roupas:**
  - Túnica, com saia longa e curta drapeada por **simulação de tecido**.
  - Mantos (padrão, longo, xale, capuz), também simulados.
  - Cintos de couro, corda e faixa; sandálias simples e de tiras; botas.
  - Barba curta e cheia; lenço.
  - Bolsa, odre e colar.
  - Cajado, pergaminho, lamparina, cesto e coroa de folhas, presos aos ossos.
- **Animações:** Idle, Walk, Run, Victory, Greeting e Discovery. **Expressões:** Piscar, Sorriso, Surpresa e Alegria.
- **No jogo** (`src/character3d/heroi.ts`):
  - Cada peça é ligada ou desligada conforme a aparência salva.
  - Cores e tingimentos por item; cabelo, barba e sobrancelhas tingidos no shader.
  - Listras e barras bordadas desenhadas no shader.
  - Mão fechada ao segurar objetos; piscar automático; expressões combinadas com as animações.
  - O mesmo modelo aparece ao vivo e como imagem (miniaturas) em todas as telas.
- **Criador reformulado:**
  - 9 categorias: Rosto, Cabelo, Cor do cabelo, Barba, Túnica, Manto, Cinto, Sandálias e Acessórios.
  - Cada opção mostra uma prévia no próprio personagem.
  - Botões Confirmar, Cancelar, Restaurar aparência anterior, Remover acessórios e Voltar à aparência padrão.
- **Desempenho:**
  - Compressão meshopt e texturas WebP (cerca de 4,8 MB por corpo, carregado sob demanda).
  - Materiais simplificados para compilar rápido; compilação assíncrona de shaders quando o navegador permite.
  - A renderização por software é detectada e usa a qualidade leve, limitada a 30 quadros por segundo.
  - A recompensa usa imagem do modelo em vez de um segundo visualizador ao vivo.
- **Testes:** 115 automatizados (2 novos: correspondência item → peça do modelo; o GLB publicado contém peças, animações e expressões). Auditoria no navegador com o GLB, em celular e computador.

## 0.6.0 — 12/11/2026 — Acabamento do personagem e lacunas do pedido

- **Cabelo:** centenas de mechas afinando até a ponta, saindo do redemoinho (ou da risca) até a linha do cabelo, que agora é irregular. Mechas soltas nos cabelos longos; cachos em espiral; com manto, o cabelo longo fica por dentro.
- **Rosto:**
  - Lábios com volume e cor que acompanha o tom de pele.
  - Vinco da pálpebra e abertura dos olhos amendoada.
  - Branco dos olhos com sombra e íris maior.
  - Sobrancelhas fio a fio.
  - Barba cheia com mechas e borda suave.
- **Pele e tecidos:** brilho de pele que imita a luz atravessando a pele; sombra nas reentrâncias das dobras da túnica e do manto; gola enrolada; luz principal mais lateral, para dar volume ao rosto.
- **Lacunas do pedido:**
  - Boas-vindas com o personagem do jogador acenando.
  - **Contexto histórico** nas fichas de personagens (eventos da linha do tempo, com o tipo de datação).
  - Partículas discretas no acerto e tremor no erro.
  - Transição suave entre telas. Tudo respeita "reduzir animações".
- 2 testes novos (113 no total).

## 0.5.0 — 11/11/2026 — Personagem 3D

- **Etapa 1:** auditoria e decisão técnica em `docs/auditorias/AUDITORIA-v0.5.md` (Three.js puro, modelo construído no código, sem arquivos de terceiros).
- **Etapa 2 — personagem 3D:**
  - Cabeça esculpida com nariz, lábios, maçãs do rosto e queixo; olhos com íris, pálpebras que piscam e cílios.
  - Sobrancelhas, orelhas e três expressões.
  - 7 estilos de cabelo com volume e mechas (cachos, coque, trança e cortina de fios); barba curta ou cheia.
  - Mãos com cinco dedos e pés com dedos.
  - Túnica com dobras e trama, mangas largas, mantos (com capuz e xale), cintos, sandálias e botas.
  - Todos os acessórios do jogo em 3D.
  - Iluminação de três pontos e sombras.
  - Animações: espera, caminhada, comemoração, descoberta, saudação e piscar.
- **Etapa 3 — integração:**
  - Ao vivo na Home, no guarda-roupa (rotação 360°, zoom e vistas), na chegada (entra caminhando e acena), na recompensa e no resultado.
  - Como imagem do mesmo modelo nos mapas, no topo, nos cartões, nas fases, nas conquistas e no perfil.
- **Novas opções:**
  - Estrutura do corpo, barba e 8 tingimentos naturais para túnica e manto.
  - Qualidade gráfica (Automática, Alta, Leve e 2D).
- **Desempenho:**
  - Three.js num pacote separado, carregado só quando o personagem aparece.
  - Um renderizador compartilhado e cache para as miniaturas.
  - Cache de geometrias.
  - A animação pausa fora da tela.
- **Compatibilidade:** perfis antigos continuam iguais (corpo e barba são deduzidos da base e do rosto).
- 3 testes novos (111 no total); auditoria no navegador com WebGL.

## 0.4.0 — 11/11/2026 — Personagem, mapas e progressão

- **Etapas 2 a 5:**
  - **Home em cena** com o personagem em corpo inteiro, nível, XP, progresso geral e os textos dos dois modos.
  - **Modo Quiz** (antigo Modo Livre):
    - Mapa próprio com 4 regiões e 24 desafios, trilha de pedras, estandartes e escudos.
    - Tela de introdução de cada desafio, com bônus de primeira conclusão.
    - O antigo hub virou "Treino livre"; endereços `#/livre` redirecionam.
  - **Tela de recompensa de item** (Equipar / Guardar para depois / Guardar todos), em Home, resultado e mapas.
  - **Estatísticas** (`#/estatisticas`).
  - Biblioteca com **Acontecimentos** e **Temas**.
  - Revisão com **personagens para revisar** e livros com baixo desempenho.
  - Ranking com o mapa do Quiz e aba "Multiplayer (futuro)".
- **Etapa 6:** 15 testes novos (108 no total) e auditoria de consistência da aparência no navegador, inclusive após recarregar.
- **Etapa 0:** auditoria e plano em `docs/planos/PLANO-v0.4.md`.
- **Entrada em 5 passos:** boas-vindas → identificação (nome ou apelido e faixa etária) → escolha do personagem (8 bases diversas) → personalização com prévia em corpo inteiro → chegada ao universo Bible Quest.
- **Personagem único e centralizado:**
  - Aparência (`CharacterAppearance`) com base, pele, rosto, estilo e cor de cabelo e itens equipados (túnica, manto, calçado, cinto e acessórios).
  - Um só renderizador SVG por camadas (`Character`), usado em todas as telas via `PlayerCharacter`.
- **Guarda-roupa** (`/guarda-roupa`): 36 itens de época; itens bloqueados mostram o requisito (nível, estrelas, conquista, livro concluído, baú, região do Quiz). Também é possível descartar alterações e restaurar a aparência anterior.
- **Migração:** personagens da v0.3 são convertidos automaticamente e nenhum progresso é perdido.

## 0.3.0 — 11/11/2026 — A aventura

- **Personagem do jogador:**
  - Aventureiro em SVG por camadas, com 4 estilos, 6 tons de pele, 6 cabelos, 6 cores de cabelo, 4 vestimentas, 6 cores e 5 acessórios.
  - Animações de respiração e caminhada.
  - Obrigatório antes da jornada e editável sem perder progresso.
  - Aparece no mapa, no painel, nas fases, nas cenas e no resultado.
- **Mapa de fases:**
  - Caminho sinuoso por mundo, com cenário desenhado, fases numeradas, estrelas, fase atual em destaque e fases bloqueadas com aviso.
  - O avatar caminha até a nova fase, com animação de desbloqueio.
  - Baús de recompensa finitos, abertura animada dos mundos e navegação entre os 10 mundos.
- **Gênesis em 20 fases** com 5 a 10 perguntas cada: entraram "Noé, um homem justo", "A promessa de Deus" e "Jacó e sua família"; "Moriá" foi unida a "Isaque" e "Os sonhos de Faraó" a "José no Egito". O progresso salvo é migrado.
- **Fases:**
  - Nova tela da fase.
  - Cena narrativa em quadros, com os personagens bíblicos entrando em cena.
  - Novas estrelas: 1 ao concluir, 2 com 70%, 3 com 90%. As fases não têm mais vidas.
  - Resultado com recompensas e os botões "Continuar a jornada" e "Revisar conteúdo".
- **Perguntas:** 19 novas (197 no total), incluindo perguntas com pintura e o novo exercício "Relacione".
- **Biblioteca Bíblica:** 35 personagens, 19 lugares, 66 livros e linha do tempo com 22 marcos e tipo de datação.
- **Revisão inteligente:** histórico de erros, assuntos fracos e dominados, desempenho por livro, evolução e sessões de revisão.
- **Modo Livre:** 10 modalidades (novas: por personagem, por tema e por dificuldade), 4 níveis, escolha da quantidade de perguntas e Especialista com cronômetro.
- **Rankings:** 5 categorias, só com recordes locais reais. O ranking de exemplo foi removido.
- **Conquistas:** 7 novas (26 no total), como Conhecedor das Escrituras, Memória bíblica, Persistência, Desafiante, Tesouro no caminho e Colecionador de histórias.
- Painel inicial redesenhado com o personagem em destaque.
- 93 testes automatizados.

## 0.2.0 — 11/11/2026 — Dois modos de jogo

- **Modo História:**
  - Cânon de 66 livros com mapa por testamento e grupo.
  - Progressão Testamento → Livro → Experiência, começando em Gênesis.
  - Gênesis reorganizado em 19 experiências, 6 delas novas: o homem e a mulher, o Éden, Caim e Abel, a corrupção da humanidade, Babel, Jacó e Esaú.
  - Êxodo com 4 experiências.
  - 7 etapas por experiência (com a nova etapa "Aprendizado").
  - Porcentagens por livro, testamento e jornada; continuar de onde parou; medalhas por livro.
- **Modo Livre:**
  - 7 modalidades, com pistas progressivas em "Quem sou eu?" e cronômetro com bônus de velocidade em "Contra o tempo".
  - 34 novas perguntas de toda a Bíblia.
- **Multiplayer** movido para o Modo Livre, com status de servidor, cronômetro por pergunta, vencedor e ranking da partida (demonstração).
- **Desafio diário:** registro dos desafios, proteção contra relógio retroativo e contrato `DailyService` para validação futura no servidor.
- **Progressão única entre os modos**, com regras contra acúmulo infinito de XP:
  - a repetição só rende pela melhora;
  - limite diário de 300 XP de prática.
- **Painel administrativo:** 8 seções, com editor local de perguntas e de rascunhos de experiências e importação e exportação em JSON.
- **Correções:**
  - O desafio de memória agora tolera um erro por par. O limite antigo (2 erros para 4 pares) reprovava 13% das partidas jogadas com memória perfeita.
  - Ao trocar de modalidade diretamente, a partida anterior não continua mais.
- **Migração automática** do progresso salvo na v0.1, e endereços antigos (`#/mapa`, `#/jornada/...`) redirecionam para o Modo História.
- 7 novas obras em domínio público (Bruegel, Tissot, David Roberts, John Martin). 72 testes automatizados.

## 0.1.0 — 11/11/2026

- Primeira versão jogável: 5 jornadas, 20 capítulos e 113 perguntas em 7 modalidades.
- XP, níveis, estrelas, tentativas, medalhas, 14 conquistas, sequência diária, desafio diário, histórico e desbloqueio progressivo.
- Perfil local com exportação e exclusão de dados; camada de serviços pronta para trocar por Supabase.
- Ranking e multiplayer em modo demonstração; protótipo administrativo somente leitura.
- Acessibilidade: tamanho de texto, alto contraste, redução de animações, leitura em voz alta e atalhos de teclado.
- 22 obras de arte em domínio público, otimizadas em WebP.
- 46 testes automatizados; publicação automática no GitHub Pages via GitHub Actions.

---

© Kzann Tech. Bible Quest é um produto Kzann Tech.
