# Bible Quest — publicação oficial da versão 0.17.7 (Fase 1, passo 1.6)

Registro da integração da 0.17.7 ao `main` e da verificação do site publicado, em 23/11/2026.

## Integração

- **Origem:** `claude/loving-carson-8mrbjo`.
- **Destino:** `main`.
- **Forma:** fast-forward de `ad92ca2` para `9dacff7`.
  - Não houve commit de merge, conflito nem reescrita de histórico.
  - Antes de integrar, o `main` não tinha nenhum commit que faltasse na branch: 0 commits exclusivos, e `ad92ca2` é ancestral de `9dacff7`.
- **Commits integrados:**

  | Commit | Descrição |
  | --- | --- |
  | `d0678f7` | Passo 1.6: alto contraste unificado (preservado no histórico, ancestral de `9dacff7`) |
  | `9dacff7` | Foco não para mais atrás do painel de missões aberto (verificação final aprovada) |

- **Escopo:**
  - nenhuma funcionalidade, rota, dado ou progressão nova;
  - nenhuma paleta de ambiente aplicada;
  - os passos 1.7 e 1.8 e a Etapa 3 não foram iniciados;
  - nenhuma versão além da 0.17.7 foi criada.

## Testes e build

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Sem erros |
| `npm test` | 190 de 190 testes passando, em 17 arquivos |
| `npm run build` | Concluído; `assets/index-CLE677Uq.js` e `assets/index-BVuaq63J.css` |
| Versão no pacote | 0.17.7 |
| Fluxo oficial pelo `main` (run 92, "Verificação e publicação no GitHub Pages") | Sucesso: tipos, testes, build e publicação |
| Arquivos servidos pelo site | `assets/index-CLE677Uq.js` e `assets/index-BVuaq63J.css`, com SHA-256 igual ao do build local |

Run 92: <https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/45195061281>

## Verificação no site publicado

Site: <https://theuzxl13-oss.github.io/Bible-Quest/>

| Item | Resultado |
| --- | --- |
| Versão e rodapé | "Versão 0.17.7" no rodapé de todas as telas com rodapé (celular e computador) e no texto da página Sobre |
| Erros e rolagem | Nenhum erro de JavaScript, nenhuma falha de carregamento (HTTP ≥ 400) e nenhuma rolagem horizontal: 26 rotas conferidas e 176 capturas |
| Modo normal: 88 capturas, site × build local | 85 idênticas; 3 variações de carregamento (prévia 3D do Guarda-roupa e tela de carregamento da Central). **Mudança de estilo: 0** |
| Alto contraste: 88 capturas, site × build local | 84 idênticas; 4 variações (prévia 3D do Guarda-roupa, tela de carregamento da Central, 9/255 na janela da fase e 2 pixels de 3/255 na Biblioteca). **Mudança de estilo: 0** |
| Central sem foco, modo normal (3D e 2D, celular e computador) | Cada vista idêntica pixel a pixel a pelo menos uma captura da 0.17.6 aprovada |
| Central sem foco, alto contraste | Celular 3D e 2D e computador 3D idênticos à 0.17.6; computador 2D (ver a observação 1) |
| Central com o painel de missões aberto (computador 3D, normal e alto contraste) | Idêntica pixel a pixel à 0.17.6 |
| Teclado, painel fechado | Ordem do Tab idêntica à aprovada, Shift+Tab inverso exato e anel duplo nos 10 elementos, nas 4 combinações |
| Teclado, painel aberto | Nenhum foco em elemento encoberto, em 8 combinações (celular e computador, 3D e 2D, normal e alto contraste) |
| Janelas dos mapas (fase e ajuda, História e Quiz) | O foco não sai da janela, e o Esc fecha |
| Ambientes (`data-ambiente`) | Corretos nas 13 rotas conferidas |

**Observações:**
1. **Central em alto contraste, computador 2D:** o site difere das capturas locais numa faixa dos rótulos (y 280–341), com 2.765 pixels e no máximo 14/255 de diferença. É a suavização das bordas dos rótulos, que nessa vista tem dois estados possíveis:
   - duas rodadas da própria 0.17.6, no modo normal, diferem na mesma faixa (2.783 pixels, máximo 11/255);
   - no modo normal, o site ficou idêntico a três capturas da 0.17.6.

   Não é mudança de estilo.
2. **Faixa escura acima do painel de missões aberto, no alto contraste:** aparece na Central publicada, mas já existia na 0.17.6. A captura com o painel aberto é idêntica pixel a pixel nas duas versões. Ficou registrada como observação, sem alteração, porque a Central está protegida.
3. **Comparações:** foram feitas produção contra produção, com data fixa, sorteio com semente e animação reduzida.

## Capturas e registros do site publicado

Em `publicacao/`:

| Arquivo | Conteúdo |
| --- | --- |
| `central-{celular,computador}-{3d,2d}.jpg` | Central no site, modo normal |
| `central-alto-contraste-{celular,computador}-{3d,2d}.jpg` | Central no site, alto contraste |
| `alto-contraste-cel-*.jpg` | Perfil, Biblioteca, resposta errada e Configurações em alto contraste, no site |
| `foco-painel-aberto-alto-contraste.jpg` | Painel de missões aberto, com o foco no botão de Configurações (visível) |
| `sobre-celular-versao-0.17.7.jpg` | Página Sobre com a versão |
| `versao-erros-site.txt` | Versão, `data-ambiente`, rolagem e erros em 13 rotas, no celular e no computador |
| `tab-central-site.json` | Tab e Shift+Tab com o painel fechado |
| `tab-painel-aberto-site.json` | Tab e Shift+Tab com o painel aberto, com a porcentagem visível de cada foco |
| `teclado-mapas-site.txt` | Foco preso e Esc nas janelas dos mapas |

## Limitações de compatibilidade

- **Navegador:** só Chromium (Playwright), com vídeo por software.
- **Não testados:**
  - celulares e tablets reais;
  - Safari e Firefox;
  - leitores de tela.
- **Não tratados:**
  - a preferência de contraste do sistema (`prefers-contrast`);
  - as cores forçadas do Windows (`forced-colors`).

  Ligar o alto contraste pela preferência do sistema seria uma funcionalidade nova e ficou como sugestão.
- **Modo normal:** continua com 103 textos abaixo de 4,5:1 (sobretudo as descrições de Conquistas e o Guarda-roupa). O alto contraste tem 0.
- **Resposta errada no alto contraste:** 6,83:1, acima de AA e um pouco abaixo de AAA.
- **Exceções que continuam:**
  - 2 links dentro de frases ("Ver a linha do tempo" e "Perfil", nas Configurações) ficam abaixo de 44 px, pela exceção da WCAG;
  - o `<select>` nativo de dificuldade pode ser desenhado de outra forma por navegadores que usam o seletor do sistema.
