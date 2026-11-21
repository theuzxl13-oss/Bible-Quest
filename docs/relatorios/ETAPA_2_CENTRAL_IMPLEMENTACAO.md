# Bible Quest — Central do Jogador: Relatório de Implementação

**Kzann Tech** · Etapa 2 (tela piloto) · versão 0.17.0 · 14/11/2026 · aguardando avaliação visual.

Versão em texto de `ETAPA_2_CENTRAL_IMPLEMENTACAO.pdf` (mesmo conteúdo; as capturas de tela estão no PDF).

### Sobre este relatório

- **Implementação** do plano aprovado `ETAPA_2_CENTRAL_PLANO_TECNICO_FINAL.md`, versão 0.17.0. Commits `c055569` e `31937ec`, publicados pelo `main`.
- **Todos os resultados vieram de execuções reais:** testes, build, medições e capturas no Chromium. As limitações do ambiente de medição estão descritas onde se aplicam.
- **Nada além da Central foi migrado:** as demais telas aguardam a sua avaliação visual.

# 1. Resumo

**41–43%**altura do personagem na cena 3D (41% no 2D)

**150**testes passando (144 anteriores + 6 novos)

**13**elementos do acampamento preservados, regras intactas

**0**erros de JavaScript nas 23 telas varridas

A Central do Jogador virou um **Acampamento de Aventura ao entardecer**:

- sem cidades, com cordilheiras e névoa, florestas, rochas e texturas desenhadas em código;
- o personagem como protagonista;
- um HUD enxuto e um painel de missões recolhível;
- uma ação principal ("Começar/Continuar") entre as placas dos dois modos;
- a nova navegação global com Central, História, Quiz, Biblioteca e Perfil.

O "diário de viagem" saiu da Central, e os atalhos dele foram para o painel de missões e para o Perfil. Nenhuma rota, tela, dado ou regra foi removido. Não houve dependência nova, modelo 3D novo nem crédito de geração.

### Pontos de atenção (detalhes na seção 7)

- **Quadros por segundo:** caíram de 10 a 20% no ambiente de medição sem placa de vídeo. O tempo de carregamento ficou dentro do limite do plano (de −3% a +8%).
- **Posições:** mudei a posição de alguns elementos do acampamento (não as regras) para que continuassem visíveis. O plano previa manter as posições.
- **Luz de contorno:** foi retirada para recuperar desempenho.

# 2. Antes e depois

## Computador (1280 × 800)

*\[Captura no PDF\] Antes (v0.16): cidades ao fundo, cartões saturados, personagem com cerca de 30% da altura, quadro de missões aberto sobre a cena*

*\[Captura no PDF\] Depois (v0.17): cordilheiras, florestas e rochas, personagem com 42,7% à direita do centro, missões recolhidas, ações e navegação global*

## Celular (390 × 844) e outros tamanhos

*\[Captura no PDF\] Celular, antes*

*\[Captura no PDF\] Celular, depois (3D)*

*\[Captura no PDF\] Celular, depois (2D)*

*\[Captura no PDF\] Tablet, depois (3D)*

*\[Captura no PDF\] Notebook (1440 × 900), 3D*

*\[Captura no PDF\] Computador, 2D (reserva para aparelhos sem 3D)*

# 3. O que foi implementado

Na ordem da seção 8.1 do plano:

| Passo                     | Entrega                                                                                                                                                                                                                                                                                                                                                                                     |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1\. Tokens e estilos base | `src/styles/tokens.css` (paleta "Crônicas da Jornada", tokens semânticos, de modo, escalas, alto contraste e reduzir animações) e `src/styles/componentes/` (navegação, HUD, placas, painel). As outras telas não mudaram de visual                                                                                                                                                         |
| 2\. Navegação global      | `NavegacaoGlobal` com Central, História, Quiz, Biblioteca e Perfil. A regra de onde aparece (`IMMERSIVE`) não mudou. No Perfil entraram atalhos para Conquistas, Estatísticas, Ranking e Revisão                                                                                                                                                                                            |
| 3\. Interface da Central  | HUD com os mesmos dados reais; `PainelMissoes` (placa recolhida, abre e fecha pelo teclado, Esc devolve o foco); `AcoesAcampamento` ("Começar/Continuar" no meio, placas do Modo História em floresta e do Modo Quiz em azul profundo); o diário de viagem saiu da Central                                                                                                                  |
| 4\. Cena 3D               | Cidades removidas; cordilheira média com névoa; florestas em instâncias (110 árvores, 60 na qualidade "leve"); formações rochosas; céu e névoa de fim de tarde; texturas geradas em canvas (terra com cascalho, veios de madeira, grão em pedra e lona); câmera mais próxima e quase nivelada; rótulos presos à borda quando o objeto sai do quadro; medição do personagem para conferência |
| 5\. Cena 2D               | Sem a cidade; cordilheira, florestas, rochas, brilho da fogueira e vinheta; personagem com cerca de 41% da altura; objetos nas bordas no celular                                                                                                                                                                                                                                            |
| 6\. Validação e correções | Seções 5 e 7                                                                                                                                                                                                                                                                                                                                                                                |
| 7\. Publicação            | Versão 0.17.0 pelo `main` (seção 9)                                                                                                                                                                                                                                                                                                                                                         |

## Painel de missões e atalhos do Perfil

*\[Captura no PDF\] Painel de missões aberto (computador): desafio diário, continuar jornada, baús, revisão inteligente, próximo no acampamento e progresso geral*

*\[Captura no PDF\] Painel de missões no celular*

*\[Captura no PDF\] Perfil: atalhos Conquistas, Estatísticas, Ranking e Revisão; nova barra inferior*

# 4. Arquivos

Diferença total dos dois commits da implementação: 23 arquivos no primeiro (1.001 linhas incluídas e 414 removidas) e 3 no segundo.

| Arquivo                                                                                                   | Mudança                                                                             |
|-----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `src/character3d/acampamento.ts`                                                                          | Paisagem, texturas, luz, câmera, posições e medição (seções 3 e 7)                  |
| `src/pages/Dashboard.tsx`                                                                                 | Nova organização; os mesmos cálculos de dados                                       |
| `src/components/camp/CenaAcampamento.tsx`                                                                 | Cenário 2D sem cidade; tamanho do personagem 2D                                     |
| `src/components/layout/Layout.tsx`                                                                        | Usa `NavegacaoGlobal`; rodapé com "Versão 0.17"                                     |
| `src/pages/Profile.tsx`                                                                                   | Atalhos do perfil (4 links para telas existentes)                                   |
| `src/main.tsx`                                                                                            | Importa os novos arquivos de estilo depois de `global.css`                          |
| `src/styles/global.css`                                                                                   | Saíram o bloco antigo da Central e da barra inferior (178 linhas)                   |
| `src/test/flow.test.tsx`                                                                                  | Teste da Central e do menu atualizados                                              |
| \[NOVO\] `src/styles/tokens.css`, `componentes/{navegacao,hud,placa,painel}.css`, `telas/acampamento.css` | Estilos com tokens                                                                  |
| \[NOVO\] `NavegacaoGlobal.tsx`, `PainelMissoes.tsx`, `AcoesAcampamento.tsx`                               | Componentes                                                                         |
| \[NOVO\] `src/test/central.test.tsx`                                                                      | 6 testes                                                                            |
| Documentação                                                                                              | `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `package.json` (0.17.0) e este relatório |

**Não alterados** (conferido com `git diff`): `src/data/` (inclusive `acampamento.ts`), `src/services/` (inclusive `game/acampamento.ts`), `src/App.tsx` (rotas), `src/pages/story/` e `src/pages/quiz/` (mapas, cena da fase e página antiga da fase), `src/components/map/`, `public/` (modelos e imagens) e as dependências.

# 5. Testes executados e resultados

## 5.1 Automáticos

| Comando ou teste                          | Resultado                                                                                                                                                                                                                                 |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `npm run typecheck`                       | <span class="st ok">SEM ERROS</span>                                                                                                                                                                                                      |
| `npm test`                                | <span class="st ok">150 DE 150</span> em 12 arquivos                                                                                                                                                                                      |
| `npm run build`                           | <span class="st ok">PASSOU</span>: JavaScript principal com 733,3 kB (222,7 kB comprimido); 3D separado com 783,9 kB, sem mudança relevante                                                                                               |
| `central.test.tsx` 1: acessos preservados | <span class="st ok">PASSOU</span>: Perfil, Configurações, História, Quiz, Biblioteca, Central, Diário e Revisão a partir da Central; os 4 objetos da cena; Conquistas, Estatísticas, Ranking, guarda-roupa e histórico a partir do Perfil |
| 2: painel de missões pelo teclado         | <span class="st ok">PASSOU</span>: `aria-expanded`, Enter abre, Esc fecha e devolve o foco                                                                                                                                                |
| 3: "Continuar"                            | <span class="st ok">PASSOU</span>: abre a cena da fase 2 e marca a fase como visitada                                                                                                                                                     |
| 4: visibilidade da navegação              | <span class="st ok">PASSOU</span>: visível na Central, no Perfil e na Biblioteca; oculta nos dois mapas e na partida                                                                                                                      |
| 5: os 13 elementos                        | <span class="st ok">PASSOU</span>: identificadores e condições iguais aos fixados antes da etapa; 5 liberados no início e 13 com o progresso completo                                                                                     |
| 6: cores só nos tokens                    | <span class="st ok">PASSOU</span>: nenhuma cor HEX nos 5 arquivos de `componentes/` e `telas/`                                                                                                                                            |

## 5.2 No navegador

Chromium com WebGL por software (sem placa de vídeo), servidor local e site publicado.

| Tela                  | Personagem 3D          | Personagem 2D | Interface sobre o personagem | Ações (altura) | Rolagem lateral |
|-----------------------|------------------------|---------------|------------------------------|----------------|-----------------|
| Celular 390 × 844     | 41,2% (centro)         | 41,0%         | Nenhuma\*                    | 8,0%           | Não             |
| Tablet 768 × 1024     | 40,9%                  | 40,9%         | Nenhuma                      | 7,1%           | Não             |
| Computador 1280 × 800 | 42,7% (63% da largura) | 40,8%         | Nenhuma                      | 9,3%           | Não             |
| Notebook 1440 × 900   | 42,7% (63% da largura) | 40,9%         | Nenhuma                      | 8,2%           | Não             |

\* No celular em 3D, o rótulo "Recompensas" (preso à borda direita) termina exatamente no limite da área estimada do personagem: começa em x = 260 px, onde a área termina. A área estimada já tem folga lateral, e não há sobreposição visível na captura. A altura do personagem no 3D vai do chão ao topo da cabeça, sem o cajado; no 2D, é a área desenhada.

- **Teclado** (computador): a ordem do Tab é rótulos da cena → Perfil → Configurações → Missões → Modo História → Começar → Modo Quiz → os 5 itens da navegação. **Todos com contorno de foco visível.**
- **Varredura das 23 telas** (celular): sem erros de JavaScript e sem rolagem lateral, com resultado igual ao da auditoria. Os únicos avisos são do driver de vídeo. A partida segue sem `h1`, um problema já conhecido e fora desta etapa.
- **Telas não migradas:** continuam com o visual anterior. No celular, mostram a nova barra; no computador, mantêm a barra superior.

## 5.3 Desempenho

Mediana de 3 medições por tamanho, com a versão anterior servida ao lado (cópia do commit `72100f7`), no mesmo ambiente sem placa de vídeo.

| Tamanho    | Cena pronta, antes | Cena pronta, depois | Diferença | Quadros/s antes → depois |
|------------|--------------------|---------------------|-----------|--------------------------|
| Celular    | 6.295 ms           | 6.126 ms            | −2,7%     | 11,0 → 9,3               |
| Tablet     | 7.309 ms           | 7.706 ms            | +5,4%     | 6,7 → 5,3                |
| Computador | 8.547 ms           | 8.994 ms            | +5,2%     | 5,3 → 4,3                |
| Notebook   | 9.252 ms           | 10.002 ms           | +8,1%     | 4,7 → 4,0                |

O critério do plano (no máximo 15% de piora no tempo até a cena ficar pronta) foi cumprido. Os quadros por segundo caíram de 10 a 20%. Esses números vêm de renderização por software e são muito mais baixos que em aparelhos reais com placa de vídeo, que não puderam ser testados aqui. A versão 2D abre em 0,5 a 1 s.

# 6. Os 13 elementos do acampamento

- **Sem mudança nas regras:** `src/data/acampamento.ts` e `src/services/game/acampamento.ts` não mudaram (nenhuma diferença no Git).
- **Teste 5 confirma** a lista fixada antes da etapa:
  - sempre liberados: tenda, fogueira, mesa, quadro e baú;
  - jarros no nível 2, palmeiras com 3 fases e lamparinas com 3 conquistas;
  - tenda da família no nível 4, estandarte com 1 baú e poço com 10 fases;
  - rebanho no nível 6 e jardim com 8 conquistas.
- **Cena com tudo liberado:** abriu sem erros no computador e no celular.

*\[Captura no PDF\] Computador, os 13 elementos liberados: estandarte, lamparinas, jardim, palmeira, rebanho, jarros e a tenda da família (atrás da tenda do viajante) aparecem; o poço fica em parte atrás do baú neste ângulo*

*\[Captura no PDF\] Celular, os 13 elementos liberados (o quadro estreito mostra parte deles; os rótulos ficam presos à borda)*

# 7. Problemas encontrados e desvios do plano

## 7.1 Problemas encontrados e corrigidos

| Problema                                                                                                                                      | Como foi resolvido                                                                                                                                            |
|-----------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primeira versão da câmera perto demais: o chão tomava a tela e a paisagem sumia                                                               | Câmera quase nivelada (horizonte perto do meio), com distância calibrada por medição                                                                          |
| Personagem 2D pequeno no celular                                                                                                              | Uma regra antiga da Home (v0.4) fixava 120 px; ela foi sobrescrita só na Central e o tamanho passou a ser calculado sobre a altura da cena                    |
| Nome acessível dos modos grudado ("ModoHistóriaExplore…")                                                                                     | Rótulos acessíveis explícitos nas placas e em "Começar/Continuar"                                                                                             |
| Com a câmera nova, 4 elementos de evolução ficaram fora do quadro no computador, e os rótulos "Biblioteca" e "Recompensas" sumiram no celular | Posições trazidas para dentro do quadro (7.2) e rótulos presos à borda quando o objeto sai pelos lados                                                        |
| Desempenho: carregamento até +16% e quadros −25% na primeira versão                                                                           | Testes isolando cada parte; a luz de contorno era a mais cara e foi retirada; grão só em pedra e lona; 110 árvores; rochas sem sombra. Resultado na seção 5.3 |
| No 2D do celular, os rótulos "Recompensas" e "Personagem" encostavam no personagem maior                                                      | O rótulo do baú mostra só o ícone (o nome segue no rótulo acessível) e o rótulo da tenda subiu acima da cabeça                                                |

## 7.2 Desvios do plano (com motivo)

| Plano                                               | O que foi feito                                                                                                                                                      | Motivo                                                                                                                                            |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| "A posição de cada elemento (`POSICOES`) se mantém" | Novas posições para tenda da família, palmeiras, poço e rebanho (tela larga), e para vários elementos na tela estreita                                               | Com a câmera mais próxima (exigida pelo destaque do personagem), eles sairiam do quadro. Quais elementos existem e quando são liberados não mudou |
| Luz de contorno fria atrás do personagem            | Retirada; a luz hemisférica mais fria faz parte do papel                                                                                                             | Custava cerca de 10% dos quadros e levava o carregamento acima do limite de 15%                                                                   |
| "`global.css` importa os novos arquivos"            | Os novos arquivos são importados em `main.tsx`, depois de `global.css`                                                                                               | Garante que os estilos novos prevaleçam sobre as regras antigas                                                                                   |
| "Continuar" leva à próxima fase                     | Faz o mesmo que "Começar fase" no mapa: marca a fase como visitada e abre a cena narrativa. O item "Continuar jornada" das missões continua levando à página da fase | Leva direto à experiência, sem passar pela página antiga                                                                                          |
| (não previsto)                                      | Saiu o estandarte decorativo "Bible Quest" (só visual, oculto para leitores de tela) que ficava sobre a cena no computador                                           | Competia com o HUD e o personagem; não era uma função                                                                                             |
| Barra global também no computador                   | No computador, aparece só na Central; as outras telas mantêm a barra superior até serem migradas                                                                     | Não mexer no visual das telas ainda não aprovadas                                                                                                 |

## 7.3 Limitações que continuam

- **Desempenho em aparelhos reais e leitores de tela reais:** não testados nesta sessão.
- **Problemas conhecidos de outras telas, fora do escopo:** a partida sem `h1` e o link "Linha do tempo" com pouco contraste na Biblioteca.
- **Personagem feminino:** continua no estilo realista antigo (Etapa 4).

# 8. Critérios de aceitação

| Critério do plano                                                                                 | Situação                                 | Evidência                                                                                                                                  |
|---------------------------------------------------------------------------------------------------|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Personagem com 40% da altura da cena ou mais, sem interface por cima, em 390, 768, 1280 e 1440 px | <span class="st ok">ATENDIDO</span>      | 40,8 a 42,7% (seção 5.2); nenhum controle sobre o personagem (o caso limite está explicado na nota)                                        |
| Sem cidades nem construções urbanas; vegetação, árvores, montanhas, pedras, tendas e fogueira     | <span class="st ok">ATENDIDO</span>      | `construirCidade` e `camp-paint-city` removidos; capturas                                                                                  |
| Os 13 elementos iguais (quantidade, regras, requisitos e dados)                                   | <span class="st ok">ATENDIDO</span>      | Teste 5; nenhuma diferença nos arquivos de regras. Só a posição de alguns mudou (7.2)                                                      |
| Barra inferior com os 5 itens, visível só onde deve                                               | <span class="st ok">ATENDIDO</span>      | Teste do menu e teste 4                                                                                                                    |
| Nenhuma funcionalidade, rota, tela ou dado removido                                               | <span class="st ok">ATENDIDO</span>      | Teste 1; nenhuma diferença em `App.tsx`                                                                                                    |
| Dados reais iguais aos de hoje                                                                    | <span class="st ok">ATENDIDO</span>      | Teste da Central (mesmos cálculos)                                                                                                         |
| Acessibilidade: `h1`, teclado, foco, rótulos, contraste AA e animações desligáveis                | <span class="st ok">ATENDIDO</span>      | Testes, Tab completo com foco visível, paleta conferida na Etapa 2A, animações ligadas aos tokens de duração e ao `prefers-reduced-motion` |
| Reserva 2D e qualidade "leve"; desempenho dentro do limite                                        | <span class="st ok">ATENDIDO</span>      | 2D medido; carregamento de −3% a +8%. Ressalva: quadros 10 a 20% menores (5.3)                                                             |
| Nenhuma dependência nova nem modelo 3D novo; GitHub Pages funcionando                             | <span class="st ok">ATENDIDO</span>      | Sem diferença em `package.json` nas dependências; publicação conferida (seção 9)                                                           |
| Aprovação visual do dono do projeto                                                               | <span class="st parcial">PENDENTE</span> | Aguardando a sua avaliação                                                                                                                 |

# 9. Publicação e próximos passos

- **Commits:** `c055569` ("Central do Jogador: Acampamento de Aventura e navegação global (v0.17.0)") e `31937ec` ("Central 2D: personagem com 41% da altura e rótulos sem encostar no personagem"), no ramo de desenvolvimento e no `main`.
- **Publicação pelo `main`:** execuções 60 e 62 com sucesso; implantações 7793731703 e 7793775862 em `success`. O site serve `assets/index-C_v_W8yL.js`, o mesmo arquivo do build local.
- **No site publicado:** a Central foi aberta nos 4 tamanhos, em 3D e 2D, com as mesmas medidas do servidor local.
- **Endereço:** https://theuzxl13-oss.github.io/Bible-Quest/ (recarregue com Ctrl+F5).

**Parado aqui, como pedido:** a identidade não foi aplicada a nenhuma outra tela. Aguardo a sua avaliação visual da Central e a autorização antes de seguir para as próximas telas da Etapa 2.
