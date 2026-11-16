# Bible Quest — Central do Jogador: Ajustes Finais

**Kzann Tech** · Etapa 2 (tela piloto) · versão 0.17.3 (não publicada no `main`) · 16/11/2026 · aguardando aprovação.

Versão em texto de `ETAPA_2_CENTRAL_AJUSTES_FINAIS.pdf` (mesmo conteúdo; as capturas de tela estão no PDF).

### Sobre este relatório

- **Ajustes finais da Central**, registrados como versão 0.17.3 na branch de desenvolvimento `claude/loving-carson-8mrbjo`.
- **Não publicado:** sem merge e sem publicação no `main`. O GitHub Pages continua na 0.17.0, e a aprovação final é de vocês.
- **Resultados de execuções reais** (Chromium, vídeo por software). "Antes" é a 0.17.2; "depois" é a 0.17.3.

# 1. Resumo

**2** — caminhos para o Desafio diário: cena e painel de missões

**100%** — do poço, da tenda grande e dos barris no quadro do tablet

**44 px** — de área de toque em todos os rótulos, também no celular

**151** — testes passando; typecheck e build sem erros

- **Desafio diário:** o atalho voltou à cena, com esse nome, e continua no painel de missões. A página, a rota, as 5 perguntas, os 30 XP e a regra de uma vez por dia não mudaram.
- **Tablet:** o poço, a tenda grande e os barris ganharam uma posição própria e ficam inteiros na tela.
- **Celular:**
  - "Personagem" e "Biblioteca" ficaram a cerca de 95 px um do outro;
  - os rótulos têm folga de 18 px do HUD e da placa "Missões";
  - dois rótulos nunca ficam a menos de 28 px.
- **Quadro:** sem a palavra "Missões". No lugar, um sol nascente com três bilhetes presos. No computador, a lanterna saiu da frente do quadro.

# 2. Desafio diário

- **Na cena:** o rótulo "Desafio diário" fica preso ao quadro, com o aviso numérico quando o desafio do dia está pendente. Clicar no rótulo ou no próprio quadro abre `/diario`. O nome acessível do rótulo é "Desafio diário: 5 perguntas, +30 XP, uma vez por dia", ou "Desafio diário: concluído hoje".
- **No painel de missões:** o primeiro item continua sendo "Desafio diário", com a contagem regressiva.
- **Sem mudança na lógica:** o atalho só navega até a página existente.
  - Não houve mudança na rota, nas perguntas, no bônus de 30 XP nem na regra de uma conclusão por dia.
  - Não mudaram os arquivos `Daily.tsx`, `scoring.ts` e os serviços de progresso.
  - Não há recompensa duplicada, porque o bônus é dado ao concluir o desafio, não ao abrir a página.
- **Teste automático novo:** abre o Desafio diário pelo rótulo da cena e, depois, pelo painel de missões. Nos dois casos, chega à página "Desafio diário".

# 3. Tablet

768 × 1024, com os 13 elementos desbloqueados.

- Captura: Antes (0.17.2): poço cortado à direita (68%); tenda grande (57%) e barris (54%) passando da borda esquerda

- Captura: Depois (0.17.3): poço, tenda grande e barris inteiros (100%); a tenda grande aparece atrás da tenda, e os barris, atrás da mesa

Como foi feito: esses três objetos ganharam um ponto intermediário de posição para o tablet em pé. A posição muda gradualmente entre o computador, o tablet e o celular. As composições do computador e do celular não mudaram por causa disso.

# 4. Celular

- Captura: Antes (0.17.2): "Personagem" e "Biblioteca" a cerca de 40 px; sem atalho do Desafio diário

- Captura: Depois (0.17.3): "Personagem" no alto da tenda e "Biblioteca" sobre a mesa (cerca de 95 px entre eles); "Desafio diário" no quadro, abaixo do contador de sequência

| Rótulo (celular) | Posição (topo) | Área de toque |
|------------------|----------------|---------------|
| Personagem       | 207 px         | 44 × 123 px   |
| Biblioteca       | 331 px         | 44 × 107 px   |
| Desafio diário   | 166 px         | 44 × 131 px   |
| Recompensas      | 400 px         | 44 × 132 px   |

Medido no navegador. A área de toque é a placa visível mais uma margem invisível. No celular a placa tem 28 px de altura, e a margem passou de 7 para 8 px de cada lado, chegando a 44 px. Os rótulos continuam sendo botões, alcançáveis pela tecla Tab e com foco visível.

# 5. Quadro de missões

- Captura: Antes: a palavra "Missões" num quadro que não abria nada, e uma lanterna na frente

- Captura: Depois: sol nascente e três bilhetes presos por alfinetes, sem texto; a lanterna foi para a direita do baú

A decoração combina com o Desafio diário (um desafio a cada nascer do sol). É desenhada em código, sem imagem nem modelo novo. O quadro continua no acampamento como elemento "sempre" e volta a ser clicável, levando ao Desafio diário. O acesso às missões continua na placa "Missões" do HUD.

# 6. Computador e notebook

- Captura: Computador, antes (0.17.2)

- Captura: Computador, depois (0.17.3)

- Captura: Notebook (1440 × 900), depois

- Captura: Computador, jogador novo

# 7. Jogador novo, painel e 2D

- Captura: Computador, painel de missões aberto

- Captura: Celular, painel aberto

- Captura: Celular, jogador novo

Com o painel fechado, as capturas são as das seções 3, 4 e 6.

- Captura: Computador, 2D

- Captura: Celular 2D, antes

- Captura: Celular 2D, depois: "Desafio diário" no quadro, sem passar da borda

# 8. Verificação dos 13 elementos

As regras são conferidas pelo teste automático. "No quadro" é a fração de cada objeto dentro da tela.

| Elemento                | Regra (sem mudança) | Celular                                                | Tablet               | Computador | Notebook |
|-------------------------|---------------------|--------------------------------------------------------|----------------------|------------|----------|
| Tenda                   | sempre              | 59%                                                    | 68%                  | 79%        | 78%      |
| Fogueira\*              | sempre              | 57%                                                    | 69%                  | 93%        | 92%      |
| Mesa                    | sempre              | 90%                                                    | 97%                  | 100%       | 100%     |
| Quadro de missões       | sempre              | 90%                                                    | 100%                 | 100%       | 100%     |
| Baú                     | sempre              | 90%                                                    | 100%                 | 100%       | 100%     |
| Jarros                  | nível 2             | 100%                                                   | 100%                 | 100%       | 100%     |
| Palmeiras               | 3 fases             | 53%                                                    | 57%                  | 75%        | 74%      |
| Lanternas               | 3 conquistas        | 91%                                                    | 99%                  | 100%       | 100%     |
| Tenda grande            | nível 4             | 48%                                                    | **100%** (antes 57%) | 75%        | 74%      |
| Estandarte              | 1 baú               | 100%                                                   | 100%                 | 100%       | 100%     |
| Poço                    | 10 fases            | 92%                                                    | **100%** (antes 68%) | 100%       | 100%     |
| Ovelhas                 | nível 6             | 84%                                                    | 87%                  | 100%       | 100%     |
| Jardim                  | 8 conquistas        | flores ao longo do caminho, visíveis em todas as telas |                      |            |          |
| Barris (decoração fixa) | —                   | 53%                                                    | **100%** (antes 54%) | 73%        | 71%      |

\* A área da fogueira inclui o brilho, bem maior que a fogueira; nas capturas ela aparece inteira. Palmeiras e tendas são grandes e atravessam a borda de propósito no celular e no computador. `src/data/acampamento.ts` e `src/services/game/acampamento.ts` não mudaram.

# 9. Arquivos alterados

<table class="compacta">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Arquivo</th>
<th>Mudança</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>src/character3d/acampamento.ts</code></td>
<td><ul>
<li>Quadro de novo como alvo clicável.</li>
<li>Papel do quadro sem texto (sol e bilhetes).</li>
<li>Posições intermediárias do tablet (poço, tenda grande e barris).</li>
<li>Lanterna fora da frente do quadro no computador.</li>
<li>Rótulos: distância mínima entre eles, folga de 18 px do HUD, 12 px da borda e âncoras da tenda e da mesa no celular.</li>
</ul></td>
</tr>
<tr class="even">
<td><code>src/pages/Dashboard.tsx</code></td>
<td>Rótulo "Desafio diário" no quadro, levando a <code>/diario</code></td>
</tr>
<tr class="odd">
<td><code>src/styles/componentes/placa.css</code></td>
<td>Área de toque de 44 px no celular</td>
</tr>
<tr class="even">
<td><code>src/styles/telas/acampamento.css</code></td>
<td>Posição do rótulo "Desafio diário" no 2D; rótulo do baú só com ícone com 44 px de largura</td>
</tr>
<tr class="odd">
<td><code>src/test/central.test.tsx</code></td>
<td>4 rótulos na cena e teste novo do Desafio diário pelos dois caminhos</td>
</tr>
<tr class="even">
<td><code>CHANGELOG.md</code>, <code>README.md</code>, <code>docs/README.md</code></td>
<td>Entrada 0.17.3, histórico, funcionalidades da Central, contagem de testes e este relatório</td>
</tr>
</tbody>
</table>

# 10. Testes e medições

<table class="compacta">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Verificação</th>
<th>Resultado</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>npm run typecheck</code></td>
<td>Sem erros</td>
</tr>
<tr class="even">
<td><code>npm test</code></td>
<td>151 de 151 testes passando, em 12 arquivos (1 novo)</td>
</tr>
<tr class="odd">
<td><code>npm run build</code></td>
<td>Concluído sem erros</td>
</tr>
<tr class="even">
<td>Capturas</td>
<td><ul>
<li>Celular, tablet, computador e notebook com os 13 elementos.</li>
<li>Jogador novo no celular e no computador.</li>
<li>Painel aberto no celular e no computador.</li>
<li>2D no celular e no computador.</li>
</ul>
Sem erros de JavaScript e sem rolagem horizontal.</td>
</tr>
</tbody>
</table>

## Tempo até a cena ficar pronta

As duas versões foram medidas lado a lado, na mesma sessão. Os valores são a mediana de 3 medições, com vídeo por software. O ambiente estava mais lento que nas medições anteriores, por isso os números absolutos são maiores que os dos relatórios passados.

| Tela       | 0.17.2 | 0.17.3 | Quadros/s (0.17.3) |
|------------|--------|--------|--------------------|
| Celular    | 6,9 s  | 6,7 s  | 8,0                |
| Tablet     | 8,8 s  | 8,4 s  | 5,0                |
| Computador | 9,8 s  | 9,5 s  | 4,7                |
| Notebook   | 10,7 s | 9,8 s  | 3,7                |

Sem diferença real: as variações ficam dentro da oscilação entre medições, e nenhum objeto novo entrou na cena.

# 11. Problemas conhecidos e publicação

- **Celular:** o rótulo "Desafio diário" fica logo abaixo do contador de sequência, com a folga mínima de 18 px. Tendas e palmeiras continuam atravessando as bordas de propósito.
- **Computador:** o rótulo "Recompensas" encosta na borda de baixo do quadro, sem cobrir os bilhetes.
- **Limites da validação:** só Chromium, com vídeo por software. Não houve teste em celular ou tablet reais nem em Safari.

### Aguardando a aprovação

- Commit somente na branch de desenvolvimento.
- Sem merge, sem publicação no `main` e sem atualizar o GitHub Pages, que continua na 0.17.0.

