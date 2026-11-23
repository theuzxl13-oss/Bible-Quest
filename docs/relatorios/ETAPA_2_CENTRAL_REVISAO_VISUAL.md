# Bible Quest — Central do Jogador: Revisão Visual

**Kzann Tech** · Etapa 2 (tela piloto) · versão 0.17.1 (não publicada no `main`) · 16/11/2026 · aguardando avaliação visual.

Versão em texto de `ETAPA_2_CENTRAL_REVISAO_VISUAL.pdf` (mesmo conteúdo; as capturas de tela estão no PDF).

### Sobre este relatório

- **Revisão visual da Central 0.17.0**, só na Central do Jogador. Registrada como versão 0.17.1 na branch de desenvolvimento.
- **Não publicada no `main`:** o jogo no ar continua na 0.17.0 até a sua avaliação visual.
- **Todos os resultados vieram de execuções reais:** testes, build, medições e capturas no Chromium com vídeo por software. Nas capturas, o perfil de teste tem os 13 elementos desbloqueados.

# 1. Resumo

**13** — elementos visíveis, com os mesmos ids, regras e dados

**150** — testes passando; typecheck e build sem erros

**0** — sobreposição entre poço e baú no computador

**−6% a +4%** — tempo até a cena ficar pronta, comparado com a 0.17.0

O que a revisão resolveu:

- **Poço e baú:** o poço não fica mais escondido atrás do baú. O baú foi para perto do personagem e o poço para o fundo, à direita, junto das palmeiras.
- **Rótulos:** ficaram menores e translúcidos e não competem mais com o personagem. Recuperam o destaque no foco do teclado e ao passar o mouse, e a área de toque continua com 44 px.
- **Profundidade do cenário:** montanhas, ciprestes em dois tons, tufos de capim, nuvens mais altas e o brilho da fogueira. Nada foi escurecido e não entrou modelo 3D nem dependência nova.
- **Celular:**
  - a câmera ficou mais alta;
  - o painel de missões sobe de baixo, com botão de fechar;
  - o HUD não quebra mais a linha do nível.

### O que ainda não ficou bom (detalhes na seção 8)

- **No celular a cena continua cheia.** A fogueira aparece cortada à esquerda e alguns objetos de perto (mesa, jarros, baú) cobrem parte dos de longe.
- **Posições mudaram de novo.** Só a posição na cena; regras, requisitos e dados dos 13 elementos não mudaram.

# 2. Antes e depois

Mesmo perfil de teste, com os 13 elementos desbloqueados. "Antes" é a versão 0.17.0, publicada; "depois" é esta revisão.

## Computador (1280 × 800)

- Captura: Antes (0.17.0): o poço fica escondido atrás do baú, à direita; rótulos grandes e opacos

- Captura: Depois: baú ao lado do personagem, poço visível no fundo à direita; rótulos discretos

## Celular (390 × 844)

- Captura: Antes (0.17.0)

- Captura: Depois: câmera mais alta e "Missões" abaixo da barra de XP. A cena continua cheia (seção 8)

# 3. Os 13 elementos em cada tela

- Captura: Notebook (1440 × 900), 13 elementos

- Captura: Tablet (768 × 1024), 13 elementos

Para conferir que nada ficou de fora, a cena registra em cada segundo a área que cada objeto ocupa na tela. A tabela mostra quanto de cada objeto cabe no quadro. Essa medida não detecta quando um objeto cobre outro; isso foi conferido nas capturas.

| Elemento           | Regra (sem mudança) | Computador                                                                     | Tablet | Celular |
|--------------------|---------------------|--------------------------------------------------------------------------------|--------|---------|
| Tenda              | sempre              | 79%                                                                            | 66%    | 60%     |
| Fogueira\*         | sempre              | 93%                                                                            | 55%    | 31%     |
| Mesa               | sempre              | 100%                                                                           | 75%    | 65%     |
| Quadro de missões  | sempre              | 100%                                                                           | 86%    | 60%     |
| Baú                | sempre              | 100%                                                                           | 99%    | 83%     |
| Barris (decoração) | —                   | 73%                                                                            | 60%    | 69%     |
| Jarros             | nível 2             | 100%                                                                           | 100%   | 100%    |
| Palmeiras          | 3 fases             | 75%                                                                            | 65%    | 68%     |
| Lanternas          | 3 conquistas        | 100%                                                                           | 100%   | 85%     |
| Tenda grande       | nível 4             | 75%                                                                            | 59%    | 52%     |
| Estandarte         | 1 baú               | 100%                                                                           | 100%   | 100%    |
| Poço               | 10 fases            | 100%                                                                           | 100%   | 88%     |
| Ovelhas            | nível 6             | 100%                                                                           | 95%    | 100%    |
| Jardim             | 8 conquistas        | flores espalhadas pelo caminho, visíveis nas três telas (não medido por caixa) |        |         |

\* A área da fogueira inclui o brilho no ar e no chão, que é bem maior que a fogueira; por isso o número fica baixo mesmo com a fogueira à vista. No celular, porém, a fogueira está de fato cortada à esquerda. Objetos grandes (tendas, palmeiras) podem passar da borda sem deixar de ser reconhecíveis.

## Só os 5 elementos iniciais

- Captura: Computador, jogador novo

- Captura: Celular, jogador novo

# 4. Painel de missões e alternativa 2D

- Captura: Computador: painel aberto à direita, com botão de fechar; o personagem continua inteiro à vista

- Captura: Celular: o painel sobe de baixo, com 46% da altura no máximo; a cabeça e o tronco do personagem continuam à vista

Com o painel fechado, as capturas são as da seção 2. O painel fecha pelo botão "Fechar missões", pela tecla Esc ou pela própria placa, e o foco volta para a placa "Missões".

## Alternativa 2D (aparelhos sem 3D)

- Captura: Computador, cena 2D

- Captura: Celular, cena 2D

A cena 2D não mudou nesta revisão. Ela continua funcionando, com os rótulos novos (mais discretos) e os mesmos acessos.

# 5. O que mudou

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
<td>1. Poço e baú; os 13 elementos visíveis</td>
<td>Baú perto do personagem; poço no fundo à direita; palmeiras atrás do poço. Tenda, mesa, jarros, quadro, lanternas, estandarte, tenda grande e ovelhas também foram reposicionados para não se cobrirem, com posições próprias para tela larga e estreita. Ids, regras, requisitos e dados sem mudança</td>
</tr>
<tr class="even">
<td>2. Rótulos</td>
<td>Fundo escuro translúcido, borda dourada fina, formato de pílula, texto de 12 px, opacidade 88% e seta menor. Destaque total no foco e ao passar o mouse. A área de toque é de 44 px, maior que a placa visível. Os nomes acessíveis não mudaram</td>
</tr>
<tr class="odd">
<td>3. Profundidade do cenário</td>
<td><ul>
<li>Montanhas: menos facetas e neve em tom quente.</li>
<li>Nuvens: mais altas, achatadas e lisas.</li>
<li>Ciprestes: em dois tons.</li>
<li>Chão: tufos de capim em instâncias (60 no modo leve), longe do caminho e da frente da câmera.</li>
<li>Fogueira: brilho no ar e reflexo no chão.</li>
</ul>
Nada escurecido; sem modelo 3D, desbloqueável ou dependência nova</td>
</tr>
<tr class="even">
<td>4. Celular</td>
<td><ul>
<li>Câmera mais alta, para separar planos.</li>
<li>Painel de missões em folha que sobe de baixo, com botão de fechar.</li>
<li>Placa "Missões" abaixo da barra de XP.</li>
<li>Título do nível com reticências em vez de quebrar a linha.</li>
</ul>
A alternativa 2D foi preservada</td>
</tr>
<tr class="odd">
<td>5. Fora do escopo</td>
<td>Mapas, perguntas, conteúdo bíblico, progressão, página antiga da fase e outras telas: nada mudou. Os 13 elementos e seus critérios também não</td>
</tr>
</tbody>
</table>

# 6. Arquivos alterados

| Arquivo                                       | Mudança                                                                                                                                                              |
|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `src/character3d/acampamento.ts`              | Posições dos objetos, câmera no celular, nuvens, montanhas, ciprestes, capim, brilho da fogueira e registro da área de cada objeto (`data-objetos`, só para medição) |
| `src/styles/componentes/placa.css`            | Rótulos discretos com área de toque de 44 px                                                                                                                         |
| `src/styles/componentes/painel.css`           | Cabeçalho do painel com botão de fechar; folha de baixo para cima no celular; posição da placa "Missões"                                                             |
| `src/styles/componentes/hud.css`              | Título do nível em uma linha, com reticências                                                                                                                        |
| `src/components/camp/PainelMissoes.tsx`       | Título "Missões" e botão "Fechar missões" (devolve o foco à placa)                                                                                                   |
| `src/pages/Dashboard.tsx`                     | Texto do nível dentro de um elemento próprio (para as reticências)                                                                                                   |
| `src/test/central.test.tsx`                   | O teste do painel também confere o botão de fechar                                                                                                                   |
| `CHANGELOG.md`, `README.md`, `docs/README.md` | Entrada 0.17.1, histórico e este relatório                                                                                                                           |

Não mudaram: `src/data/acampamento.ts`, `src/services/game/acampamento.ts`, mapas, perguntas, conteúdo, progressão, tokens e as outras telas.

# 7. Testes e medições

| Verificação         | Resultado                                                                                                                        |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `npm run typecheck` | Sem erros                                                                                                                        |
| `npm test`          | 150 de 150 testes passando, em 12 arquivos                                                                                       |
| `npm run build`     | Concluído sem erros                                                                                                              |
| Capturas            | Celular, tablet, computador e notebook em 3D; celular e computador em 2D; painel aberto no celular e no computador; jogador novo |

## Desempenho comparado com a 0.17.0

As duas versões foram medidas no mesmo ambiente e na mesma sessão. Cada valor é a mediana de 3 medições do tempo até a cena 3D ficar pronta.

| Tela       | 0.17.0 | Revisão | Diferença | Quadros/s (0.17.0 → revisão) |
|------------|--------|---------|-----------|------------------------------|
| Celular    | 6,5 s  | 6,1 s   | −6%       | 8,3 → 8,3                    |
| Tablet     | 7,7 s  | 7,8 s   | +1,5%     | 5,3 → 5,0                    |
| Computador | 8,5 s  | 8,4 s   | −2%       | 4,7 → 4,7                    |
| Notebook   | 9,2 s  | 9,5 s   | +3,6%     | 4,3 → 4,0                    |

A renderização por software é muito mais lenta que em aparelhos com placa de vídeo, e não foi possível testar em aparelhos reais. As diferenças entre as versões estão dentro da variação das medições.

# 8. Problemas que continuam

- **Celular com a cena cheia.** Na tela estreita cabem menos objetos lado a lado:
  - a fogueira fica cortada à esquerda;
  - a mesa e os jarros ficam perto do personagem;
  - o baú e o quadro ocupam a direita.

  A câmera mais alta ajudou a separar os planos, mas não resolveu de todo. Para melhorar mais, há duas opções:
  - no celular, colocar alguns elementos desbloqueáveis mais ao fundo;
  - no celular, mostrar menos elementos decorativos (barris, por exemplo), sem mudar as regras.

  Nenhuma das duas foi feita, porque depende da sua avaliação.
- **Rótulos no celular:** "Personagem" fica logo abaixo da placa "Missões", e "Diário" encosta no contador de sequência. Os dois continuam legíveis e clicáveis, mas a parte de cima ficou apertada.
- **Posições:** os elementos mudaram de lugar outra vez. Só o visual mudou, mas quem já jogou vai notar o acampamento rearranjado.
- **Medida de visibilidade:** mostra quanto de cada objeto cabe no quadro, não se um objeto cobre outro. A sobreposição foi conferida olhando as capturas.

# 9. Publicação e próximos passos

- As mudanças estão na branch de desenvolvimento `claude/loving-carson-8mrbjo`, como versão 0.17.1. **O `main` e o site continuam na 0.17.0.**
- Este relatório também está só nessa branch. Por isso, os links apontam para ela, e não para o `main`: publicar no `main` publicaria o jogo junto.
- Depois da sua avaliação visual, posso:
  - publicar como está;
  - ajustar o celular (seção 8) antes de publicar;
  - desfazer partes da revisão.

### Aguardando a sua avaliação visual

Nada será publicado antes da sua resposta.

