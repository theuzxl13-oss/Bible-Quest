# Bible Quest — Central do Jogador: Plano Técnico Consolidado

**Kzann Tech** · Etapa 2 · versão analisada 0.16.4 · 14/11/2026 · versão final do plano, aguardando aprovação para implementar.

Versão em texto do arquivo `ETAPA_2_CENTRAL_PLANO_TECNICO_FINAL.pdf` (mesmo conteúdo; os esboços de composição só aparecem no PDF).

### Natureza deste documento

- **Versão final do plano técnico** da Central do Jogador (tela piloto da Etapa 2). Incorpora a aprovação das seis decisões pendentes (14/11/2026).
- **Nada foi implementado:** a implementação só começa depois da aprovação deste plano.
- **Sem novos recursos externos:** o plano usa só os modelos 3D e os recursos existentes, sem créditos de geração 3D e sem bibliotecas novas. Mantém a arquitetura atual e a compatibilidade com o GitHub Pages.
- **Evidências conferidas no código** da versão 0.16.4 (commit `fca9658`). Todo arquivo citado como existente foi aberto; os arquivos novos estão marcados como **[NOVO]**.

# 1. Decisões finais

| \#  | Decisão aprovada                                             | Como será aplicada                                                                                                                                                                                        |
|-----|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1   | Barra inferior: Central, História, Quiz, Biblioteca e Perfil | A lista `TABS` de `Layout.tsx` muda; “Início” passa a se chamar “Central”. Personagem e Conquistas continuam acessíveis pela Central e pelo Perfil (seção 5)                                              |
| 2   | Tirar o “diário de viagem” da Central                        | O bloco abaixo da cena (`Dashboard.tsx`, linhas 186–242) sai da Central. Os atalhos vão para o painel de missões e para o Perfil. As telas de revisão, estatísticas, ranking e histórico continuam iguais |
| 3   | Remover as duas cidades                                      | 3D: as duas chamadas de `construirCidade` (`acampamento.ts`, linha 723) saem e entram cordilheiras, florestas e rochas. 2D: a camada `camp-paint-city` sai. Nenhuma construção urbana no lugar            |
| 4   | Preservar os 13 elementos de evolução                        | `src/data/acampamento.ts` e `src/services/game/acampamento.ts` **não serão modificados**. Os elementos ganham só acabamento visual (materiais e luz) na cena                                              |
| 5   | Barra oculta nos mapas                                       | As expressões de `/historia` e `/quiz` continuam em `IMMERSIVE` (`Layout.tsx`, linha 41). Os mapas mantêm o botão próprio de voltar à Central                                                             |
| 6   | Página antiga da fase: decisão adiada                        | `ExperiencePage.tsx` e a rota `/historia/:livro/:fase` **não serão tocadas**                                                                                                                              |

# 2. Arquivos e componentes

## 2.1 Arquivos que serão modificados

| Arquivo (existente)                       | Mudança                                                                                                                                                                                                                                                                                                                                     |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `src/pages/Dashboard.tsx`                 | Nova organização da interface (seção 3). Sai o bloco abaixo da cena; os mesmos dados (nível, XP, estrelas, sequência, missões, baús, próxima melhoria, progresso geral, revisão) passam para o HUD, o painel de missões e a ação principal                                                                                                  |
| `src/character3d/acampamento.ts`          | Sem cidades; mais cordilheiras, florestas e rochas, com `InstancedMesh`; texturas geradas em canvas (terra, madeira, pedra, lona); luz de fim de tarde mais contrastada; luz de contorno no personagem; câmera reenquadrada; nova paleta nos materiais. A lógica dos 13 elementos (o conjunto `tem` e as chamadas `colocar`) continua igual |
| `src/components/camp/CenaAcampamento.tsx` | Versão 2D sem a camada da cidade e com a nova paleta. Rótulos clicáveis e estados (carregando, pronto, 2D) iguais                                                                                                                                                                                                                           |
| `src/components/layout/Layout.tsx`        | Usa o novo componente `NavegacaoGlobal`, com os novos itens. `NAV` (barra superior), `IMMERSIVE`, rodapé e rotas não mudam                                                                                                                                                                                                                  |
| `src/pages/Profile.tsx`                   | Acrescenta links para Estatísticas e Ranking (hoje só existem no rodapé). Os links de guarda-roupa e conquistas, o histórico e o aviso de perfil local continuam iguais                                                                                                                                                                     |
| `src/styles/global.css`                   | Importa os novos arquivos de estilo. O bloco da Central (linhas 1303–1457) e o da barra inferior passam para os arquivos novos. Nenhuma outra tela muda de visual                                                                                                                                                                           |
| `src/test/flow.test.tsx`                  | Atualiza o teste da Central e do menu (linhas 392–416) para os novos itens e a nova organização                                                                                                                                                                                                                                             |
| Documentação                              | `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `docs/README.md` e relatório da tela piloto em `docs/relatorios/`                                                                                                                                                                                                                                |

## 2.2 Arquivos novos

| Arquivo                                                                                       | Conteúdo                                                                                                                                        |
|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **[NOVO]** `src/styles/tokens.css`                                                      | Paleta “Crônicas da Jornada” (único lugar com HEX nos arquivos novos), tokens semânticos, de modo (`[data-modo]`), escalas e alto contraste     |
| **[NOVO]** `src/styles/componentes/navegacao.css`, `hud.css`, `placa.css`, `painel.css` | Estilos dos componentes globais usados pela Central                                                                                             |
| **[NOVO]** `src/styles/telas/acampamento.css`                                           | Layout da Central (zonas e responsividade)                                                                                                      |
| **[NOVO]** `src/components/layout/NavegacaoGlobal.tsx`                                  | Barra inferior: 5 itens, estado ativo, rótulos, foco e área segura                                                                              |
| **[NOVO]** `src/components/camp/PainelMissoes.tsx`                                      | Painel de missões recolhível, extraído do `<details>` atual: diário, continuar jornada, baús, próximo no acampamento, revisão e progresso geral |
| **[NOVO]** `src/components/camp/AcoesAcampamento.tsx`                                   | Ação principal “Continuar” e as placas dos dois modos                                                                                           |
| **[NOVO]** `src/test/central.test.tsx`                                                  | Testes da Central (seção 7)                                                                                                                     |

## 2.3 O que será reutilizado sem mudança

`createCamp` e a estrutura de `CampHandle`, `RotuloAcampamento`, `PlayerCharacter`, `Character` (2D), `ProgressBar`, `Stars`, `GameIcon`, `Icon`, `elementosLiberados`, `bausDisponiveis`, `proximaMelhoria`, `conquistaRecente`, `continueExperience`, `overallProgress`, `quizAvatarNode`, `weakTopics`, `visibleStreak`, `levelProgress`, `resolveQuality` e os modelos `heroi-*.glb`.

## 2.4 O que não será tocado

`src/data/acampamento.ts`, `src/services/game/*`, `src/App.tsx` (rotas), mapas, perguntas, conteúdo bíblico, `ExperiencePage.tsx`, modelos 3D, `public/`, `package.json` (dependências) e o workflow de publicação.

# 3. Organização visual da Central

## 3.1 Zonas da tela

1.  **HUD:** retrato (leva ao Perfil), nome (`h1`), nível, barra de XP, estrelas, sequência e configurações. Uma linha no computador, duas no celular.
2.  **Missões:** placa recolhida no canto, com aviso numérico. Ao tocar, abre o `PainelMissoes` lateral (computador) ou inferior (celular), sem cobrir o personagem.
3.  **Personagem:** zona reservada, sem nenhum elemento de interface (3.2).
4.  **Placas da cena:** os rótulos atuais (Personagem, Biblioteca, Diário, Recompensas), presos aos objetos 3D.
5.  **Ações:** “Continuar” (cor de fogueira) no centro, entre as placas dos dois modos: História em floresta e madeira, Quiz em azul profundo e pedra. Elas ocupam no máximo 12% da altura, contra 14 a 19% dos cartões atuais.
6.  **Barra global** (seção 5).

A cena ocupa a tela inteira menos a barra (`100svh`), sem rolagem. Sem “diário de viagem” abaixo dela.

## 3.2 Personagem

- **Tamanho:** de 40 a 45% da altura útil da cena em todos os tamanhos (hoje cerca de 30% no computador), ajustando `posCamera`, `alvoCamera` e o fator `estreita` em `resize`.
- **Posição:**
  - computador e notebook: um pouco à direita do centro (linha dos terços), com a fogueira à esquerda;
  - tablet e celular: centralizado, com a fogueira em primeiro plano à esquerda.
- **Luz:** sol quente principal, fogueira do lado esquerdo e uma luz de contorno fria atrás, para destacar a silhueta. O preenchimento frontal atual (`frente`) continua, para o rosto não ficar escuro.
- **Área livre:** as zonas A, B, E e F são posicionadas por CSS fora da faixa do personagem. Um teste no navegador confere que nenhum controle cruza o retângulo projetado do personagem.
- **Comportamento mantido:** o mesmo modelo e a mesma aparência do jogador, os gestos (aceno ao chegar, comemoração ao focar no Modo História, reação no Quiz) e o clique no personagem, que leva ao guarda-roupa.

# 4. Elementos do acampamento

## 4.1 Elementos fixos da cena (sem relação com a evolução)

| Elemento           | Hoje                                  | Plano                                                                                                                                             |
|--------------------|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Céu e sol          | `construirCeu` e nuvens               | Gradiente de fim de tarde mais profundo (azul profundo para dourado), sol baixo com halo                                                          |
| Montanhas          | `construirMontanhas`                  | Duas cordilheiras (distante azulada e média em musgo) com névoa: **ocupam o lugar das cidades**                                                   |
| Cidades            | 2 × `construirCidade`                 | **Removidas** (a função também sai do arquivo)                                                                                                    |
| Vegetação e rochas | Ciprestes, arbustos e pedras esparsos | Mais árvores (ciprestes, oliveiras simples, carvalhos), arbustos e formações rochosas emoldurando as laterais, com `InstancedMesh` para não pesar |
| Chão e caminho     | Chão liso e pedras do caminho         | Textura de terra e cascalho gerada em canvas; caminho de pedras saindo para o fundo (a próxima jornada)                                           |
| Barris             | Sempre presentes                      | Sempre presentes, com madeira texturizada                                                                                                         |
| Atmosfera          | Fumaça e faíscas da fogueira          | Brasas mais ricas, fumaça mais suave e vinheta. Tudo desligado com “reduzir animações”, como hoje                                                 |

## 4.2 Os 13 elementos de evolução (preservados)

A definição (`src/data/acampamento.ts`), as regras de desbloqueio (`elementosLiberados`), os requisitos, os dados salvos e as recompensas **não mudam**. A posição de cada um (`POSICOES`) também se mantém; só os materiais e a luz recebem o novo acabamento.

| Elemento           | Condição (inalterada) | Na cena                                                                             |
|--------------------|-----------------------|-------------------------------------------------------------------------------------|
| Tenda do viajante  | Sempre                | Lona com trama e mastros de madeira; rótulo “Personagem”                            |
| Fogueira           | Sempre                | Coração da cena, luz principal quente                                               |
| Mesa de estudos    | Sempre                | Madeira com veios, livros e pergaminhos; rótulo “Biblioteca”                        |
| Quadro de missões  | Sempre                | Moldura de madeira; rótulo “Diário”                                                 |
| Baú de recompensas | Sempre                | Ferragens douradas, brilho quando há baú pronto; rótulo “Recompensas”               |
| Jarros de barro    | Nível 2               | Cerâmica com textura                                                                |
| Palmeiras          | 3 fases concluídas    | Mesma posição, folhagem em tons de musgo                                            |
| Lamparinas         | 3 conquistas          | Luz quente pontual quando liberadas (antes disso, a luz da fogueira cumpre o papel) |
| Tenda da família   | Nível 4               | Mesma lona texturizada                                                              |
| Estandarte         | 1 baú aberto          | Tecido nas cores do jogo                                                            |
| Poço               | 10 fases concluídas   | Pedra texturizada                                                                   |
| Rebanho            | Nível 6               | Mesma animação                                                                      |
| Jardim             | 8 conquistas          | Flores em tons naturais                                                             |

Na versão 2D (`camp-paint`), hoje só aparecem a tenda, a fogueira, a mesa, o quadro e o baú. Isso continua assim. Os elementos de evolução seguem visíveis no 3D e no texto “Próximo no acampamento” do painel de missões.

# 5. Navegação e acessos preservados

## 5.1 Barra inferior global

- **Itens:**
  - Central (`/painel`, ícone de tenda);
  - História (`/historia`, mapa);
  - Quiz (`/quiz`, cérebro);
  - Biblioteca (`/biblioteca`, livros);
  - Perfil (`/perfil`, personagem).

  São só destinos existentes: nenhuma rota nova.
- **Onde aparece:** a mesma regra de hoje (com perfil e fora de `IMMERSIVE`): Central, Biblioteca, fichas, Conquistas, Perfil, guarda-roupa, estatísticas, ranking, revisão, configurações e as outras telas de consulta.
- **Onde não aparece:** mapas, perguntas, cena narrativa, resultado, entrada, treino e diário (lista `IMMERSIVE` inalterada).
- **Estados:** item ativo em ouro envelhecido (`aria-current="page"`, já dado pelo `NavLink`), inativos em marfim suave, foco visível e rótulo sempre escrito.
- **Medidas:** 56 px mais a área segura no celular; no computador, centralizada, com no máximo 560 px de largura. Cada alvo tem pelo menos 44 px.
- **Painel administrativo:** continua como hoje nesta etapa. A separação dele (decisão G7) entra quando as demais telas forem migradas.

## 5.2 Mapa de acessos: nada é perdido

| Destino                       | Acesso hoje a partir da Central               | Acesso depois                                                                        |
|-------------------------------|-----------------------------------------------|--------------------------------------------------------------------------------------|
| Guarda-roupa (Personagem)     | Barra inferior; tenda; clique no personagem   | Tenda; clique no personagem; Perfil (“Personalizar personagem”, já existe)           |
| Conquistas                    | Barra inferior; baú (sem baú pronto); missões | Baú (sem baú pronto); painel de missões; Perfil (“Conquistas e medalhas”, já existe) |
| Modo História / Modo Quiz     | Cartões dos modos; missões (continuar)        | Placas dos modos; “Continuar”; barra inferior; painel de missões                     |
| Biblioteca                    | Barra inferior; mesa                          | Barra inferior; mesa                                                                 |
| Desafio diário                | Quadro; missões                               | Quadro; painel de missões                                                            |
| Revisão inteligente           | Cartão do diário de viagem                    | Painel de missões (novo item, com os mesmos dados de `weakTopics`)                   |
| Estatísticas e Ranking        | Cartões do diário de viagem                   | Perfil (links novos); rodapé das telas de consulta (já existe)                       |
| Partidas recentes e histórico | Lista das 5 últimas e link para o Perfil      | Perfil (“Histórico de partidas”, completo, já existe)                                |
| Progresso geral               | Barra do diário de viagem                     | Painel de missões (mesma barra, mesmo rótulo)                                        |
| Aviso de perfil local         | Final da Central                              | Perfil (aviso “Perfil local”, já existe)                                             |
| Perfil e Configurações        | Retrato e engrenagem no HUD; barra inferior   | Iguais                                                                               |

# 6. Responsividade

| Faixa                            | Cena e personagem                                                                                                                                                     | Interface                                                                                                                             |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Celular (até 599 px)             | Câmera mais fechada (`estreita` = 1); personagem central, de 40 a 45% da altura; elementos laterais mais próximos (posições “estreitas” de `POSICOES`, já existentes) | HUD em 2 linhas; missões como placa (painel abre de baixo); “Continuar” em largura útil; placas dos modos lado a lado; barra de 56 px |
| Tablet (600–1023 px)             | Interpolação da câmera (já contínua pela proporção)                                                                                                                   | HUD em 1 linha; painel de missões lateral estreito                                                                                    |
| Notebook (1024–1439 px)          | Personagem à direita do centro                                                                                                                                        | Painel de missões lateral (280 px), fechado por padrão                                                                                |
| Computador (a partir de 1440 px) | Mais paisagem visível, sem esticar o personagem                                                                                                                       | Interface centralizada com no máximo 1200 px                                                                                          |
| Celular deitado                  | Câmera ajustada pela proporção                                                                                                                                        | HUD compacto; ações em uma linha                                                                                                      |

Regras gerais:

- sem rolagem lateral;
- texto de no mínimo 14 px;
- alvos com pelo menos 44 px;
- respeito às áreas seguras do celular (`env(safe-area-inset-*)`);
- qualidade “leve” sem sombras e com menos vegetação;
- qualidade “2D” e aparelhos sem WebGL com o cenário 2D.

# 7. Testes e critérios de aceitação

## 7.1 Testes automáticos

- **Atualizados** (`flow.test.tsx`):
  - menu inferior com Central, História, Quiz, Biblioteca e Perfil, com “Central” ativo na Central;
  - teste da Central com os mesmos dados reais: `h1` com o nome, barra de nível, rótulo de estrelas, links dos dois modos, desafio diário, “Próximo no acampamento: jarros de barro”, barra “Progresso geral”.
- **Novos** (`central.test.tsx`):
  1.  Todo destino da tabela 5.2 é alcançável a partir da Central ou do Perfil.
  2.  O painel de missões abre e fecha pelo teclado, com o estado anunciado.
  3.  “Continuar” leva à próxima fase calculada por `continueExperience`.
  4.  A barra aparece na Central e no Perfil e some nos mapas, nas perguntas e no resultado.
  5.  Os 13 elementos: `elementosLiberados` devolve o mesmo conjunto para os mesmos dados (comparação com valores fixados agora).
  6.  Nenhuma cor HEX fora de `tokens.css` nos arquivos novos de estilo.
- **Mantidos:** os 144 testes atuais, incluindo o de aparência consistente entre telas, o do acampamento evolutivo e o dos ícones.
- `npm run typecheck`, `npm test` e `npm run build`.

## 7.2 Testes no navegador

- **Capturas da Central** em 390, 768, 1280 e 1440 px, em 3D e em 2D, e com 0, 5 e 13 elementos liberados.
- **Personagem livre de interface:** um script confere que nenhum controle cruza o retângulo do personagem e mede a altura dele em relação à cena.
- **Teclado:** navegação completa (Tab e Enter) na Central e na barra.
- **Varredura das telas:** as 23 telas da auditoria, sem erros de JavaScript e sem rolagem lateral.
- **Desempenho:** tempo até a cena ficar pronta, no mesmo ambiente das medições atuais (6,4 a 8,8 s com vídeo por software), sem piora maior que 15%.
- **Site publicado:** depois da publicação pelo `main`, o arquivo servido precisa ser o do build.

## 7.3 Critérios de aceitação

| Critério                                                                                                      | Como será verificado                                                           |
|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Personagem com 40% da altura da cena ou mais, sem interface por cima, em 390, 768, 1280 e 1440 px             | Script de medição e capturas                                                   |
| Sem cidades nem construções urbanas; com vegetação, árvores, montanhas, pedras, tendas e fogueira em destaque | Capturas e revisão do código (`construirCidade` e `camp-paint-city` removidos) |
| Os 13 elementos de evolução iguais: quantidade, regras, requisitos e dados                                    | Teste 5; nenhum diff em `data/acampamento.ts` e `services/game/acampamento.ts` |
| Barra inferior com os 5 itens, visível só onde deve                                                           | Testes atualizados e teste 4                                                   |
| Nenhuma funcionalidade, rota, tela ou dado removido; todos os acessos funcionais                              | Teste 1; nenhum diff em `App.tsx`                                              |
| Dados reais iguais aos de hoje (nível, XP, estrelas, sequência, missões, baús, progresso)                     | Teste da Central                                                               |
| Acessibilidade: um `h1`, teclado, foco visível, rótulos, contraste AA e animações desligáveis                 | Testes, script de teclado e cálculo de contraste                               |
| Reserva 2D e qualidade “leve” funcionando; desempenho dentro do limite                                        | Capturas e medição                                                             |
| Nenhuma dependência nova nem modelo 3D novo; GitHub Pages funcionando                                         | `package.json` sem diff; publicação conferida                                  |
| Aprovação visual do dono do projeto                                                                           | Capturas, relatório em PDF e site publicado                                    |

# 8. Execução, riscos e entrega

## 8.1 Ordem de execução

1.  **Tokens e estilos base** (`tokens.css` e componentes), sem mudar as outras telas.
2.  **Navegação global** (`NavegacaoGlobal`, novos itens) e links novos no Perfil; testes do menu.
3.  **Interface da Central** (HUD, painel de missões, ações, remoção do diário de viagem); testes da Central.
4.  **Cena 3D:** remoção das cidades, cordilheiras, vegetação, texturas, luz, câmera e personagem.
5.  **Cena 2D:** sem cidade, nova paleta.
6.  **Validação completa** (seção 7) e correções.
7.  **Publicação e apresentação:** versão 0.17.0 pelo `main`, relatório da tela piloto em `docs/relatorios/` com link público, e aguardar a aprovação antes de aplicar a identidade às outras telas.

## 8.2 Riscos e mitigação

| Risco                                                                          | Mitigação                                                                                                                      |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Mais vegetação e luz pesarem no celular                                        | `InstancedMesh`, no máximo 3 luzes pontuais, sombras só na qualidade alta, menos vegetação na “leve”, e medição antes e depois |
| Cena escura demais (contra a diretriz “convidativo”)                           | Exposição e tom conferidos por capturas; meta de céu claro ao entardecer, não noite                                            |
| Estilo diferente entre o personagem feminino realista e o masculino estilizado | Problema já conhecido; será resolvido na Etapa 4. A luz nova trata os dois da mesma forma                                      |
| Mudança de hábito com a nova barra                                             | Todos os acessos antigos seguem disponíveis (tabela 5.2)                                                                       |
| Novos estilos interferirem nas outras telas                                    | Classes com prefixo próprio, arquivos separados e a varredura das 23 telas                                                     |
| Testes sem WebGL não cobrem a cena 3D                                          | Capturas e scripts no navegador a cada passo                                                                                   |

**Recursos:** a implementação usa apenas os modelos `heroi-*.glb` existentes e a cena gerada em código (Three.js 0.187, já instalado), **sem créditos de geração 3D e sem bibliotecas novas**.

**Confirmação:** nenhum arquivo do jogo foi alterado para produzir este plano. A implementação só começa depois da sua aprovação.
