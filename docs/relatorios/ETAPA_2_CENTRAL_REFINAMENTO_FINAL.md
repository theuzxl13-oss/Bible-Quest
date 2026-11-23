# Bible Quest — Central do Jogador: Refinamento Final

**Kzann Tech** · Etapa 2 (tela piloto) · versão 0.17.2 (não publicada no `main`) · 16/11/2026 · aguardando avaliação.

Versão em texto de `ETAPA_2_CENTRAL_REFINAMENTO_FINAL.pdf` (mesmo conteúdo; as capturas de tela estão no PDF).

### Sobre este relatório

- **Refinamento final da Central**, registrado como versão 0.17.2 na branch de desenvolvimento `claude/loving-carson-8mrbjo`.
- **Não publicado:** sem merge e sem publicação no `main`; o GitHub Pages continua na 0.17.0. A Central ** — não** está sendo considerada aprovada: aguarda a sua avaliação.
- **Resultados de execuções reais:** testes, build, medições e capturas no Chromium com vídeo por software. "Antes" é a 0.17.1; "depois" é a 0.17.2. Mesmo perfil de teste, com os 13 elementos desbloqueados, exceto nas capturas de jogador novo.

# 1. Resumo

**13** — elementos presentes, com as mesmas regras, requisitos e dados

**3** — rótulos na cena (eram 4): o "Diário" saiu

**150** — testes passando; typecheck e build sem erros

**0** — rótulos encostando no HUD ou na placa "Missões"

- **Celular:** ganhou uma composição própria em três planos.
  - A fogueira aparece inteira à esquerda e o baú fica à direita.
  - Mesa, jarros e poço foram para o meio da cena, e as tendas, o quadro e os demais elementos, para o fundo.
  - O personagem fica sozinho no centro.
- **Rótulos:** descem sozinhos quando encostariam no HUD ou na placa "Missões". No celular, "Personagem" ficou na altura da porta da tenda, bem abaixo de "Missões".
- **"Diário":** era um atalho ativo, mas para o **Desafio diário**, e não para o antigo "Diário de viagem" (seção 6). Saiu da cena, conforme o pedido. O Desafio diário continua no painel de missões, com a página, a rota e os dados intactos.
- **Computador e notebook:** a composição continua a da 0.17.1. Só o rótulo "Recompensas" desceu, para não ficar sobre o quadro.

# 2. Celular: antes e depois

Celular 390 × 844, com os 13 elementos desbloqueados.

- Captura: Antes (0.17.1): fogueira cortada à esquerda, mesa e jarros colados no personagem, rótulos "Personagem" e "Diário" encostados na placa "Missões" e no contador

- Captura: Depois (0.17.2): fogueira inteira à esquerda, baú à direita, mesa e poço no meio, tendas e quadro ao fundo; 3 rótulos, com folga do HUD

# 3. Tablet, computador e notebook

## Tablet (768 × 1024)

- Captura: Antes (0.17.1)

- Captura: Depois (0.17.2): mistura das composições do computador e do celular; fogueira e baú inteiros

## Computador (1280 × 800)

- Captura: Antes (0.17.1)

- Captura: Depois (0.17.2): mesma composição; sem o rótulo "Diário", e "Recompensas" mais perto do baú

## Notebook (1440 × 900)

- Captura: Antes (0.17.1)

- Captura: Depois (0.17.2)

# 4. Jogador novo, painel de missões e 2D

## Jogador novo (só os 5 elementos iniciais)

- Captura: Computador

- Captura: Celular

## Painel de missões aberto

Com o painel fechado, as capturas são as das seções 2 e 3.

- Captura: Computador: painel à direita, personagem inteiro à vista

- Captura: Celular, antes (0.17.1): a folha cobria metade das ações

- Captura: Celular, depois: a folha termina acima das ações, com o rosto do personagem à vista

## Alternativa 2D

- Captura: Computador, 2D

- Captura: Celular 2D, antes (com "Diário")

- Captura: Celular 2D, depois

A cena 2D continua funcionando. A única mudança nela é a saída do rótulo "Diário".

# 5. O que foi corrigido

<table class="compacta">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Pedido</th>
<th>O que foi feito</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>1. Cena no celular</td>
<td><ul>
<li>Composição própria para telas estreitas, não a do computador comprimida.</li>
<li><strong>Perto, nas laterais:</strong> fogueira à esquerda (inteira) e baú à direita.</li>
<li><strong>Meio:</strong> mesa à esquerda; jarros e poço à direita.</li>
<li><strong>Fundo:</strong> tenda, tenda grande, barris e estandarte à esquerda; quadro, lanternas, palmeiras e ovelhas à direita.</li>
</ul>
O personagem fica sozinho no centro. Na tela estreita, alguns objetos ficam de 15% a 28% menores, o que reforça a sensação de distância entre os planos. Nenhum elemento foi retirado.</td>
</tr>
<tr class="even">
<td>2. Rótulos</td>
<td><ul>
<li>Os rótulos descem automaticamente quando encostariam no HUD ou na placa "Missões", com folga de 14 px. A área ocupada pela interface é medida a cada segundo e quando a tela muda de tamanho.</li>
<li>No celular, o rótulo da tenda fica na altura da porta, e não no topo do mastro.</li>
<li>O rótulo do baú desceu para logo acima da tampa.</li>
<li>A cena passou de 4 para 3 rótulos.</li>
<li>Área de toque de 44 px, foco pelo teclado e nomes acessíveis sem mudança.</li>
</ul></td>
</tr>
<tr class="odd">
<td>3. Atalho "Diário"</td>
<td>Retirado da cena (rótulo e clique no quadro); detalhes na seção 6</td>
</tr>
<tr class="even">
<td>Painel de missões no celular</td>
<td>A folha termina acima das ações, em vez de cobri-las pela metade. Altura máxima de 44% da tela</td>
</tr>
<tr class="odd">
<td>4. Preservação</td>
<td>Os 13 elementos, a progressão, o XP, as conquistas, as recompensas, os mapas, as perguntas, o conteúdo bíblico, as páginas de fases e a estrutura da aplicação não mudaram. Nenhum modelo 3D nem dependência nova. A alternativa 2D foi preservada</td>
</tr>
</tbody>
</table>

# 6. O atalho “Diário”

- **Era um atalho ativo.** O rótulo "Diário" ficava preso ao ** — quadro de missões** da cena. Ele e o clique no próprio quadro levavam à rota `/diario`.
- **Destino:** a rota `/diario` é a página do **Desafio diário** (5 perguntas, +30 XP uma vez por dia). Não é o "Diário de viagem" retirado na 0.17.0, que era uma seção de cartões abaixo da cena (estatísticas, ranking, conquistas e outros).
- **O que foi feito:** como pedido, o atalho saiu da Central. Saíram o rótulo e o clique no quadro, nas cenas 3D e 2D. O quadro continua na cena como elemento visual, com a mesma regra ("sempre").
- **O que foi preservado:**
  - a página e a rota `/diario`;
  - os dados e o bônus;
  - o item "Desafio diário" no painel de missões, que é o primeiro da lista;
  - o aviso numérico na placa "Missões" quando o desafio do dia está pendente.

### Para confirmar na avaliação

Se a intenção era manter um atalho direto para o **Desafio diário** na cena, ele volta com uma linha de código. Nesse caso, sugiro o nome "Desafio diário", para não ser confundido com o "Diário de viagem".

# 7. Verificação dos 13 elementos

Regras conferidas pelo teste automático (valores fixos de antes da Etapa 2). A presença foi medida pela área de cada objeto na tela, que a cena registra a cada segundo. "No quadro" é a fração do objeto que cabe na tela. Essa medida não detecta um objeto cobrindo outro; isso foi conferido nas capturas.

| Elemento          | Regra (sem mudança) | Celular 0.17.1                                                               | Celular 0.17.2 | Tablet | Computador | Notebook |
|-------------------|---------------------|------------------------------------------------------------------------------|----------------|--------|------------|----------|
| Tenda             | sempre              | 60%                                                                          | 59%            | 68%    | 79%        | 78%      |
| Fogueira\*        | sempre              | 31%                                                                          | 57%            | 69%    | 93%        | 92%      |
| Mesa              | sempre              | 65%                                                                          | 90%            | 97%    | 100%       | 100%     |
| Quadro de missões | sempre              | 60%                                                                          | 90%            | 100%   | 100%       | 100%     |
| Baú               | sempre              | 83%                                                                          | 90%            | 100%   | 100%       | 100%     |
| Jarros            | nível 2             | 100%                                                                         | 100%           | 100%   | 100%       | 100%     |
| Palmeiras         | 3 fases             | 68%                                                                          | 53%            | 57%    | 75%        | 74%      |
| Lanternas         | 3 conquistas        | 85%                                                                          | 91%            | 100%   | 100%       | 100%     |
| Tenda grande      | nível 4             | 52%                                                                          | 48%            | 57%    | 75%        | 74%      |
| Estandarte        | 1 baú               | 100%                                                                         | 100%           | 100%   | 100%       | 100%     |
| Poço              | 10 fases            | 88%                                                                          | 92%            | 68%    | 100%       | 100%     |
| Ovelhas           | nível 6             | 100%                                                                         | 84%            | 87%    | 100%       | 100%     |
| Jardim            | 8 conquistas        | flores ao longo do caminho, visíveis em todas as telas (não medido por área) |                |        |            |          |

\* A área da fogueira inclui o brilho no ar e no chão, bem maior que a própria fogueira. Na captura do celular 0.17.2, a fogueira (pedras, lenha e chamas) aparece inteira. Palmeiras e tendas são grandes e atravessam a borda de propósito, sem deixar de ser reconhecíveis. Os barris são decoração fixa e não estão entre os 13 elementos.

Arquivos das regras sem mudança: `src/data/acampamento.ts` e `src/services/game/acampamento.ts`. Com o perfil vazio, são liberados os 5 iniciais; com o perfil completo, os 13. As duas situações estão nos testes.

# 8. Nenhuma funcionalidade removida

| Acesso na Central                                                                      | 0.17.1                              | 0.17.2                                            |
|----------------------------------------------------------------------------------------|-------------------------------------|---------------------------------------------------|
| Personagem (tenda, ou o próprio personagem) → guarda-roupa                             | Sim                                 | Sim                                               |
| Biblioteca (mesa)                                                                      | Sim                                 | Sim                                               |
| Recompensas (baú) → mapa ou conquistas                                                 | Sim                                 | Sim                                               |
| Desafio diário                                                                         | Rótulo "Diário" e painel de missões | Painel de missões (a página e a rota não mudaram) |
| Painel de missões: continuar jornada, baús, revisão, próxima melhoria, progresso geral | Sim                                 | Sim                                               |
| História, Começar/Continuar e Quiz                                                     | Sim                                 | Sim                                               |
| HUD: perfil e configurações                                                            | Sim                                 | Sim                                               |
| Navegação global: Central, História, Quiz, Biblioteca e Perfil                         | Sim                                 | Sim                                               |

O teste 1 de `central.test.tsx` confere que todos os destinos continuam alcançáveis: perfil, configurações, história, quiz, biblioteca, painel, desafio diário e revisão. Também confere os 3 rótulos da cena e o link do Desafio diário no painel. Nenhuma rota, página ou dado foi removido.

# 9. Arquivos alterados

| Arquivo                                       | Mudança                                                                                                                                                                                                                 |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `src/character3d/acampamento.ts`              | Composição própria da tela estreita (posições e escala por objeto), rótulos que evitam o HUD e a placa "Missões", rótulo da tenda mais baixo no celular, rótulo do baú mais baixo e saída do quadro dos alvos clicáveis |
| `src/pages/Dashboard.tsx`                     | Sem o rótulo "Diário" e sem o destino do quadro                                                                                                                                                                         |
| `src/styles/componentes/painel.css`           | Folha de missões no celular termina acima das ações (máximo de 44% da tela)                                                                                                                                             |
| `src/styles/telas/acampamento.css`            | Retiradas as posições do rótulo "Diário" na cena 2D                                                                                                                                                                     |
| `src/test/central.test.tsx`                   | Confere os 3 rótulos, a ausência do "Diário" e o link do Desafio diário no painel                                                                                                                                       |
| `CHANGELOG.md`, `README.md`, `docs/README.md` | Entrada 0.17.2, histórico, funcionalidades da Central e este relatório                                                                                                                                                  |

# 10. Testes e medições

| Verificação         | Resultado                                                                                                                                                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `npm run typecheck` | Sem erros                                                                                                                                                                                                                      |
| `npm test`          | 150 de 150 testes passando, em 12 arquivos                                                                                                                                                                                     |
| `npm run build`     | Concluído sem erros                                                                                                                                                                                                            |
| Capturas            | Celular, tablet, computador e notebook com os 13 elementos; jogador novo no celular e no computador; painel aberto no celular e no computador; 2D no celular e no computador. Sem erros de JavaScript e sem rolagem horizontal |

## Tempo até a cena ficar pronta

Mediana de 3 medições no mesmo ambiente, com vídeo por software.

| Tela       | 0.17.0 | 0.17.1 | 0.17.2 | Quadros/s (0.17.2) |
|------------|--------|--------|--------|--------------------|
| Celular    | 6,5 s  | 6,1 s  | 6,5 s  | 8,0                |
| Tablet     | 7,7 s  | 7,8 s  | 8,1 s  | 5,0                |
| Computador | 8,5 s  | 8,4 s  | 8,6 s  | 4,3                |
| Notebook   | 9,2 s  | 9,5 s  | 9,6 s  | 4,0                |

Nesta revisão não entrou nenhum objeto novo na cena, e as diferenças estão dentro da variação entre medições (até 10% entre execuções da mesma versão). A renderização por software é bem mais lenta que em aparelhos com placa de vídeo, e não houve teste em aparelho real.

# 11. Problemas conhecidos

- **Tablet:** usa uma mistura das duas composições. O poço fica com cerca de dois terços dentro do quadro, à direita, e a tenda grande e os barris passam da borda esquerda.
- **Celular:**
  - a bandeira do estandarte fica logo à direita da placa "Missões", sem encostar nela;
  - as ovelhas e as palmeiras ficam pequenas no fundo, à direita;
  - os rótulos "Personagem" e "Biblioteca" ficam um sobre o outro à esquerda, a cerca de 70 px de distância.
- **O quadro da cena ainda mostra a palavra "Missões"**, mas não é mais clicável. O acesso às missões é a placa "Missões" do HUD.
- **As posições no celular mudaram outra vez.** Só o visual mudou.
- **Limites da validação:** só Chromium, com vídeo por software. Não houve teste em celular ou tablet reais nem em Safari.

# 12. Publicação

- Commit somente na branch de desenvolvimento `claude/loving-carson-8mrbjo`.
- Sem merge e sem publicação no `main`; o GitHub Pages não foi atualizado e continua na 0.17.0.
- Os links deste relatório apontam para a branch de desenvolvimento.

### Aguardando a avaliação

A Central não está sendo considerada aprovada. Nada será publicado antes da sua resposta.

