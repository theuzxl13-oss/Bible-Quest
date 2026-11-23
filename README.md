# Bible Quest

**Uma jornada pelas Escrituras.** Jogo bíblico educativo para todas as idades, desenvolvido pela **Kzann Tech**.

O jogador cria o **próprio personagem** (que não representa ninguém da Bíblia), monta seu **acampamento** e escolhe entre dois modos que compartilham a mesma evolução (XP, níveis, estrelas, conquistas e sequência diária):

- **Modo História:** um caminho de fases pela ordem dos livros, de Gênesis a Apocalipse, em 10 mundos.
- **Modo Quiz:** um mapa com 4 regiões e 24 desafios, treino livre com 10 modalidades, desafio diário e multiplayer (em demonstração).

| | |
| --- | --- |
| **Jogar agora** | https://theuzxl13-oss.github.io/Bible-Quest/ |
| **Versão** | 0.17.7 (Central do Jogador, Fase 0 da identidade nas demais telas e, da Fase 1, base visual comum, acessibilidade base, identificação dos ambientes e alto contraste unificado) |
| **Histórico** | [`CHANGELOG.md`](CHANGELOG.md) |
| **Próximos passos** | [`ROADMAP.md`](ROADMAP.md) |
| **Documentação técnica** | [`docs/`](docs/README.md) |

## Sumário

1. [Como jogar](#como-jogar)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Executar no computador](#executar-no-computador)
5. [Organização das pastas](#organização-das-pastas)
6. [Como acrescentar conteúdo](#como-acrescentar-conteúdo)
7. [Testes](#testes)
8. [Publicação no GitHub Pages](#publicação-no-github-pages)
9. [O que depende de servidor](#o-que-depende-de-servidor)
10. [Conteúdo bíblico e licenças](#conteúdo-bíblico-e-licenças)
11. [Histórico de atualizações](#histórico-de-atualizações)

## Como jogar

1. **Boas-vindas e cadastro:** apelido e faixa etária (até 12, 13 a 17, 18 ou mais). O jogo não pede data de nascimento, endereço nem telefone.
2. **Personagem:** escolha um dos 8 personagens-base (Viajante, Pastora, Escriba, Exploradora, Mensageiro, Guardiã da lâmpada, Peregrino e Contadora de histórias) e personalize: pele, rosto, expressão, cabelo, cores livres, roupas, calçados e acessórios.
3. **Acampamento (Central do Jogador):** a tela inicial, um acampamento de aventura ao entardecer. O seu personagem é o destaque da cena, que cresce conforme você joga. No topo ficam o nível, o XP, as estrelas e a sequência; a placa de missões abre o desafio diário, os baús, a revisão e o progresso. Embaixo, "Continuar" leva à próxima fase, e as placas dos dois modos levam aos mapas.
4. **Modo História:** mapa de fases → tela da fase → cena narrativa → desafio de 5 a 10 perguntas → resultado com estrelas e recompensas.
5. **Modo Quiz:** mapa de desafios em regiões, ou treino livre por modalidade, tema, personagem ou dificuldade.

**Regras principais:**

- **Estrelas:** a fase é concluída com 60% de acertos (1 estrela); 70% dá 2 estrelas e 90% dá 3.
- **Primeira conclusão:** pontos + 50 XP de bônus. Repetir só rende XP se você superar sua melhor pontuação.
- **Limite diário de XP de prática:** 300 XP (Modo Quiz e tentativas reprovadas).
- **Desafio diário:** 5 perguntas, com +30 XP uma vez por dia.
- **Baús do mapa:** cada um abre uma única vez.
- **Pontuação:** fácil 10, médio 15, difícil 20, e +5 por acerto a partir do 3º seguido.

## Funcionalidades

**Central do acampamento** (`#/painel`)

- Cenário 3D com tendas, fogueira animada, baú, quadro de missões, mesa de estudos, cordilheiras e florestas. No celular, a cena tem uma disposição própria, em três planos, para nada disputar o espaço do personagem.
- O personagem do jogador no centro, com o mesmo modelo 3D do criador, acenando, esperando, gesticulando e comemorando.
- Cabeçalho com retrato, nível, XP, estrelas e sequência de dias. Só dados reais: não há moedas.
- Painel de missões (placa "Missões"): desafio diário com contagem regressiva, próxima fase, baús prontos, revisão, próxima melhoria do acampamento e progresso geral.
- **Acampamento evolutivo:** jarros, palmeiras, lamparinas, segunda tenda, estandarte, poço, rebanho e jardim são liberados por nível, fases, conquistas e baús. Nada é vendido.
- Quatro objetos clicáveis, com rótulos discretos, levam às funções reais: guarda-roupa (tenda), Biblioteca (mesa), Desafio diário (quadro) e recompensas (baú). O Desafio diário também está no painel de missões.
- Sem WebGL, um cenário ilustrado em 2D.

**Personagem**

- Modelo 3D (GLB) com esqueleto, animações (espera, caminhada, vitória, saudação, descoberta) e expressões.
- Editor com troca de cores ao vivo (pele, cabelo, túnica, manto, faixa e couro), expressão de repouso, "Restaurar aparência original" e "Salvar personagem".
- Guarda-roupa com 36 itens. 12 estão disponíveis desde o início e os demais são conquistados jogando, com tela de recompensa.
- Giro de 360°, zoom, vistas de frente, lado e costas, e qualidade gráfica ajustável (automática, alta, leve ou 2D).
- A mesma aparência aparece em todas as telas.

**Modo História**

- Mapa de aventura em 2D com camadas: o caminho sobe da fase 1 por regiões ilustradas de Gênesis (criação, Éden, Caim e Abel, Noé, Babel, Abraão, Isaque e Jacó, José no Egito), com paredões, escadas, lagos, cachoeiras e marcos de cada história. Fases em medalhão com 3 estrelas, avatar na fase atual e baús.
- Cabeçalho com a placa do mundo visível, o total de estrelas e o botão do baú. Ao tocar numa fase, abre a apresentação: objetivo, referência bíblica, dificuldade, recompensa e estrelas.
- Gênesis (20 fases) e Êxodo (4 fases) têm conteúdo; os outros 64 livros aparecem como "em preparação".
- Cada fase tem cena em quadros (introdução, narrativa dramatizada, trechos bíblicos e aprendizado) e desafio.

**Modo Quiz**

- Mapa de desafios próprio, com cenário de templos, biblioteca, pergaminhos e enigmas. Seletor de dificuldade (Iniciante, Intermediário, Avançado e Especialista), uma região por vez, com 6 desafios cada. Atalhos para o treino livre embaixo.
- Treino livre em 10 modalidades:
  - perguntas aleatórias, verdadeiro ou falso, complete o versículo, quem sou eu?;
  - contra o tempo, ordem dos acontecimentos, identifique o livro;
  - por personagem, por tema e por dificuldade.
- Desafio diário e multiplayer em demonstração.

**Tela de perguntas**

- 8 tipos de exercício, entre eles ordenar, memória e "Relacione".
- Marca de acerto ou erro para cada pergunta e contador de acertos seguidos.
- No computador, o personagem acompanha a partida com frases de incentivo.
- Atalhos de 1 a 4 no teclado.

**Estudo e acompanhamento**

- **Biblioteca:**
  - 35 personagens, os 66 livros e 19 lugares;
  - acontecimentos, temas e linha do tempo, que indica quando uma data é estimada ou debatida.
- **Revisão inteligente:** assuntos para revisar, assuntos dominados, desempenho por livro e últimos erros.
- **Estatísticas, conquistas e perfil:**
  - 26 conquistas, histórico e recordes;
  - exportação e exclusão dos dados (LGPD).
- **Painel administrativo** (`#/admin`): edição local de perguntas e rascunhos de fases, com importação e exportação em JSON.

**Visual**

- Estilo de jogo de aventura em todas as telas: céu e montanhas no topo, madeira, faixas, pergaminho e botões com relevo.
- Ícones ilustrados e coloridos (`src/components/GameIcon.tsx`) no menu, no acampamento, nas conquistas e no treino.
- Telas de jogo (perguntas e resultado) sobre a paisagem da região da fase: a arca nas fases de Noé, a torre em Babel, as pirâmides no Egito, a biblioteca no Quiz. O resultado tem faixa de vitória, personagem comemorando, estrelas grandes, moeda de XP, baú e confete.
- Cena narrativa da fase no mesmo visual: pintura em moldura de madeira, personagens em cartões de pergaminho e referências bíblicas num rolo.
- Êxodo com cenário próprio: o Nilo e o cesto entre os juncos, a sarça ardente, a porta da Páscoa, o mar aberto e o monte Sinai.
- Biblioteca, Conquistas e Perfil com placa de pergaminho, paisagem ao fundo e painéis de pergaminho e madeira.
- Central do Jogador (v0.17, tela piloto da identidade "Crônicas da Jornada"): acampamento ao entardecer, sem cidades, com cordilheiras e névoa, florestas, rochas, texturas geradas em código e a fogueira; o personagem ocupa de 40 a 45% da altura da cena. As cores dos estilos novos vêm de `src/styles/tokens.css`.
- Navegação global inferior: Central, História, Quiz, Biblioteca e Perfil (oculta nos mapas, perguntas, cenas e resultados). No computador, por enquanto, aparece só na Central; as demais telas mantêm a barra superior até serem migradas.

**Acessibilidade**

- Três tamanhos de texto, alto contraste e opção de reduzir animações. Desde a 0.17.7, um só alto contraste em todo o jogo, na família terra e marfim da Central, com superfícies sólidas (`src/styles/alto-contraste.css`).
- Leitura em voz alta.
- Foco visível com contraste também sobre pergaminho e cenários, e alvos de toque com pelo menos 44 px (área invisível, sem mudar o visual; `src/styles/acessibilidade.css`, desde a 0.17.6).
- Foco preso nas janelas dos mapas, do baú e da recompensa; Esc fecha a janela da fase e a ajuda do mapa.

## Tecnologias

- **React 19, TypeScript 7 e Vite 8.**
- **Three.js:**
  - personagem 3D e cena do acampamento;
  - carregado só quando aparece, fora do pacote inicial.
- **React Router 7** com `HashRouter`, para os links funcionarem no GitHub Pages.
- **CSS** próprio, com tokens de cor e layout responsivo.
- **Vitest e Testing Library** para os testes.
- **Fontes auto-hospedadas:** Cinzel, Inter e Crimson Pro.
- **Blender 4 e Python** para gerar os modelos 3D (`tools/`).
- **GitHub Actions** para testar e publicar.

## Executar no computador

Requisito: Node.js 22 ou superior.

```bash
npm ci
```

```bash
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Abre o jogo em modo de desenvolvimento |
| `npm run typecheck` | Verifica os tipos |
| `npm test` | Roda os testes |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção localmente |

## Organização das pastas

```
.
├── README.md                Este arquivo
├── CHANGELOG.md             Histórico de todas as versões
├── ROADMAP.md               Planos futuros
├── CLAUDE.md                Regras do projeto para o assistente de código
├── docs/                    Documentação técnica (índice em docs/README.md)
│   ├── planos/              Planos de cada etapa (v0.4, editor 3D, estilo de animação)
│   ├── auditorias/          Diagnósticos técnicos (v0.5 e v0.7)
│   └── supabase/            Esquema do banco para a versão online
├── public/                  Arquivos servidos como estão
│   ├── images/art/          Pinturas em domínio público (WebP)
│   └── models/personagem/   Modelos 3D (GLB) e licenças (LICENCAS.md)
├── tools/personagem/        Scripts do Blender que geram os modelos 3D
├── .github/workflows/       Publicação automática no GitHub Pages
└── src/
    ├── App.tsx, main.tsx    Rotas e ponto de entrada
    ├── types/               Tipos do jogo (livros, fases, perguntas, progresso, personagem)
    ├── data/                Conteúdo e catálogos
    │   ├── bible/           Cânon de 66 livros
    │   ├── story/           Fases do Modo História, um arquivo por livro
    │   ├── questions/       Banco de perguntas
    │   ├── library/         Personagens, lugares e fichas dos livros
    │   ├── character/       Personagens-base, itens e aparência
    │   ├── quiz/            Regiões e desafios do Modo Quiz
    │   └── acampamento.ts   Elementos do acampamento e como liberá-los
    ├── services/            Regras do jogo (sem interface)
    │   ├── game/            Pontuação, progresso, mapas, baús, diário, itens, aparência, acampamento
    │   ├── storage/         Salvamento local e migração de versões antigas
    │   ├── multiplayer/     Contratos e demonstração
    │   └── supabase/        Configuração da versão online (sem chaves no código)
    ├── state/               Estado global do jogo (GameContext)
    ├── character3d/         Motor 3D: personagem, palco, miniaturas e cena do acampamento
    ├── components/          Peças de interface
    │   ├── layout/          Estrutura das páginas, topo e navegação global (NavegacaoGlobal)
    │   ├── camp/            Cena do acampamento (3D ou 2D)
    │   ├── character/       Personagem, editor e tela de recompensa
    │   ├── map/             Mapas de aventura (aventura/: cenário, elementos, cabeçalho e janelas)
    │   └── quiz/            Tela de perguntas e os 8 tipos de exercício
    ├── pages/               Telas
    │   ├── onboarding/      Boas-vindas, escolha e personalização do personagem
    │   ├── story/           Modo História
    │   ├── quiz/            Mapa do Modo Quiz
    │   ├── free/            Treino livre e multiplayer
    │   ├── library/         Biblioteca e linha do tempo
    │   └── *.tsx            Acampamento (Dashboard), diário, resultado, perfil, configurações e outras
    ├── admin/               Painel administrativo (carregado sob demanda)
    ├── styles/              Visual: global.css (telas antigas), tokens.css (tokens em 4 camadas), ponte.css (variáveis antigas → tokens), acessibilidade.css (áreas de toque e foco), alto-contraste.css (alto contraste unificado), componentes/ (Central e componentes base bq-*) e telas/
    └── test/                Testes automatizados
```

## Como acrescentar conteúdo

**Um livro ao Modo História**

1. Crie `src/data/story/<livro>.ts` seguindo `genesis.ts`.
2. Registre o livro em `src/data/story/index.ts`.
3. Crie as perguntas em `src/data/questions/`, no mínimo 5 por fase, com `experienceId`.
4. Inclua as perguntas em `questions/index.ts`.
5. Rode `npm test`. Os testes de conteúdo conferem a ordem, as referências, as perguntas e as imagens.

**Um elemento ao acampamento**

1. Acrescente o elemento e a condição para liberá-lo (nível, fases, conquistas ou baús) em `src/data/acampamento.ts`.
2. Desenhe-o em `src/character3d/acampamento.ts` e defina a posição dele em `POSICOES`.

**Um personagem ou acessório 3D**

Siga o guia em `tools/personagem/README.md` e o plano em `docs/planos/EDITOR-3D-PLANO.md`. Registre origem, ferramenta, data e licença em `public/models/personagem/LICENCAS.md`.

## Testes

São 190 testes automatizados (Vitest e Testing Library), em 17 arquivos de `src/test/`:

| Arquivo | O que verifica |
| --- | --- |
| `rules`, `engine`, `services` | Pontuação, progresso, diário, limites de XP, salvamento e painel administrativo |
| `content` | Cânon, fases, perguntas, Biblioteca, linha do tempo e imagens |
| `aventura` | Mapas, baús, revisão inteligente e modalidades |
| `personagem`, `editor` | Itens, aparência, cores, expressão, salvamento e restauração |
| `acampamento` | Elementos liberados, próxima melhoria, baús e contagem do diário |
| `icones` | Ícones ilustrados: cobertura, ids únicos e alternativa de traço |
| `central` | Central do Jogador: acessos preservados, painel de missões pelo teclado e pelo botão de fechar, rótulos da cena, o Desafio diário pelos dois caminhos, "Continuar", visibilidade da navegação, os 13 elementos do acampamento e cores só nos tokens |
| `ponte` | Base visual da Fase 1: variáveis antigas com os valores exatos de antes, ordem de importação, tokens da Central intactos, tokens de ambiente e nenhum HEX nos arquivos novos |
| `altoContraste` | Passo 1.6: um só alto contraste (sem HEX nas regras, variáveis e superfícies do modo antigo cobertas, contraste dos pares de tokens, ordem de carregamento, preferência salva com a animação reduzida e anel do foco na Central) |
| `acessibilidade` | Passos 1.4 e 1.5: ambiente de cada rota e marca no Layout, atributo sem efeito na tela (só `tokens.css` o seleciona), foco preso e Esc nas janelas dos mapas, Tab que pula o que o painel de missões aberto encobre, áreas de toque e cor do foco, e, na Central, só as correções autorizadas (painel de missões, selo, anel duplo dos rótulos, topo, placas e Continuar, e toque dos rótulos) |
| `base` | Componentes base (bq-*): botão, painel, cartão, janela (foco preso e Esc), aviso, mensagem rápida, campo, progresso, abas (setas), cabeçalho e voltar |
| `fase0` | Fase 0 da Etapa 2: nomes oficiais da navegação, Desafio diário como destino secundário, versão vinda do pacote e acesso à linha do tempo |
| `mapas` | Regiões dos mapas de aventura, cenário de cada partida, cabeçalho com dados reais, seletor de dificuldade, bloqueios, independência dos modos, cena da fase e telas do acampamento (Biblioteca, Conquistas, Perfil) |
| `flow` | Fluxos de tela completos, do cadastro ao resultado, incluindo o acampamento |

O ambiente de teste não tem WebGL, então as telas usam o personagem e o acampamento em 2D. O 3D é conferido no navegador (Playwright), no celular e no computador, a cada versão.

## Publicação no GitHub Pages

Processo completo, histórico do problema e como voltar a uma versão: [`docs/planos/PUBLICACAO-E-BACKUP.md`](docs/planos/PUBLICACAO-E-BACKUP.md).

- **Produção:** o ramo `main`. Só ele publica no GitHub Pages, e uma versão chega a ele quando é aprovada.
- **Desenvolvimento:** os ramos `claude/**` e os pull requests rodam o workflow `.github/workflows/deploy.yml` só para verificar tipos, testes, build e os arquivos gerados. Não publicam.
- **Concorrência:** uma publicação em andamento nunca é cancelada. As seguintes esperam na fila (grupo `pages-producao`).
- **Publicar de novo:** aba **Actions → Verificação e publicação no GitHub Pages → Run workflow**, escolhendo o `main`.
- **Conferência:** o arquivo `assets/index-*.js` do site deve ser o mesmo gerado no build do commit publicado.
- **Ponto de retorno:** tag `v0.16.1` (commit `5a1a21f`), a versão auditada.

Configuração do GitHub:

- Em **Settings → Pages**, a origem é **GitHub Actions**.
- Em **Settings → Environments → github-pages → Deployment branches and tags**, o ramo `main` precisa estar liberado. Recomendado: deixar só o `main`.

O build usa `base: './'` e `HashRouter`, então funciona em qualquer subpasta.

## O que depende de servidor

Esta é uma versão estática: o progresso fica salvo **só no navegador** (`localStorage`).

| Recurso | Hoje | Com servidor (Supabase) |
| --- | --- | --- |
| Perfil e progresso | Salvo neste navegador | Conta, login e sincronização entre aparelhos |
| Rankings | Seus recordes reais; nenhum jogador inventado | Comparação com outros jogadores |
| Multiplayer | Demonstração local, identificada como tal | Salas por código em tempo real |
| Desafio diário | Data do aparelho, com proteção contra relógio atrasado | Data e recompensa validadas no servidor |
| Painel administrativo | Edição local com exportação em JSON | Publicação para todos, com permissões |

O Supabase será ativado com valores públicos no build: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. O esquema proposto está em `docs/supabase/schema.sql`. Nunca coloque a chave `service_role`, senhas ou tokens no código.

## Conteúdo bíblico e licenças

- **Texto bíblico:**
  - só trechos curtos da Almeida Revista e Corrigida de 1911 (domínio público), sempre com referência;
  - antes de uma publicação oficial, revise cada trecho contra a fonte (`src/data/story/` e perguntas "Complete o versículo").
- **Narrativa:** a narrativa dramatizada é identificada como tal e não atribui falas a Deus, a Jesus ou a personagens bíblicos.
- **Imagens:** 29 obras em domínio público do Wikimedia Commons, com créditos em `src/data/images.ts` e na tela Sobre.
- **Modelos 3D:** origem, ferramenta, data e licença de cada arquivo em `public/models/personagem/LICENCAS.md`.

## Histórico de atualizações

O histórico completo, com todas as versões desde a 0.1, está em [`CHANGELOG.md`](CHANGELOG.md). As mais recentes:

- **0.17.7** (23/11/2026): Fase 1 da Etapa 2, passo 1.6 (alto contraste unificado em terra e marfim, sem texto ilegível nos cartões claros: de 257 textos abaixo do mínimo para 0) e foco que não para atrás do painel de missões aberto; aprovada e publicada no GitHub Pages.
- **0.17.6** (21/11/2026): Fase 1 da Etapa 2, passos 1.4 e 1.5 (áreas de toque de 44 px, foco com contraste, foco preso nas janelas dos mapas e `data-ambiente` só como identificação); na Central, foco do painel de missões, selo de aviso e, na finalização autorizada, anel duplo em todos os controles e toque dos rótulos com 46 px; aprovada e publicada no GitHub Pages.
- **0.17.5** (16/11/2026): Fase 1 da Etapa 2, passos 1.1 a 1.3 (tokens em quatro camadas, ponte de compatibilidade com os valores antigos e 11 componentes base), sem mudança na tela; aprovada e publicada no GitHub Pages.
- **Documentação** (16/11/2026): auditoria visual da Fase 1 da Etapa 2 e proposta da base comum (tokens e componentes), aguardando aprovação (sem nova versão do jogo).
