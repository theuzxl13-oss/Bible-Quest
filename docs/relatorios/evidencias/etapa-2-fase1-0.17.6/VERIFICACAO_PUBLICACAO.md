# Bible Quest — publicação oficial da versão 0.17.6 (Fase 1, passos 1.4 e 1.5)

Registro da integração da 0.17.6 ao `main` e da verificação do site publicado, em 21/11/2026.

## Integração

- **Origem:** `claude/loving-carson-8mrbjo`.
- **Destino:** `main`.
- **Forma:** fast-forward de `766d705` para `389468c`.
  - Não houve commit de merge, conflito nem reescrita de histórico.
  - Antes de integrar, o `main` não tinha nenhum commit que faltasse na branch de desenvolvimento: era ancestral de `389468c`.
- **Commits integrados:**

  | Commit | Descrição |
  | --- | --- |
  | `a8ab6f9` | Passos 1.4 e 1.5: acessibilidade base e `data-ambiente` |
  | `389468c` | Finalização autorizada do foco e do toque na Central |

- **Escopo:**
  - nenhuma funcionalidade, rota, dado ou progressão nova;
  - nenhum CSS antigo removido e nenhuma paleta de ambiente aplicada;
  - os passos 1.6 a 1.8 e a Etapa 3 não foram iniciados, e a 0.17.7 não foi criada.

## Testes e build

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Sem erros |
| `npm test` | 182 de 182 testes passando, em 16 arquivos |
| `npm run build` | Concluído; `assets/index-CAU2Jrfx.js` e `assets/index-oSlaMjt9.css` |
| Versão no pacote | 0.17.6 |
| Fluxo oficial pelo `main` (run 87, "Verificação e publicação no GitHub Pages") | Sucesso: tipos, testes, build e publicação |
| Arquivos servidos pelo site | `assets/index-CAU2Jrfx.js` e `assets/index-oSlaMjt9.css`, com SHA-256 igual ao do build local |

Run 87: <https://github.com/theuzxl13-oss/Bible-Quest/actions/runs/44921583169>

## Verificação no site publicado

Site: <https://theuzxl13-oss.github.io/Bible-Quest/>

| Item | Resultado |
| --- | --- |
| Versão | "Versão 0.17.6" no rodapé (celular e computador) e no texto da página Sobre ("Bible Quest é desenvolvido pela Kzann Tech. Versão 0.17.6.") |
| `data-ambiente` | Correto nas 13 rotas conferidas; Configurações e Sobre neutras |
| Central sem foco (3D e 2D, celular e computador) | Idêntica pixel a pixel à 0.17.6 aprovada (ver a observação 1); em relação à 0.17.3, mudaram só os dois selos |
| Tab e Shift+Tab na Central | Ordem idêntica à aprovada, Shift+Tab inverso exato e anel duplo nos 10 elementos, nas 4 situações |
| Janelas dos mapas (fase e ajuda, História e Quiz) | O foco não sai da janela e o Esc fecha |
| 88 capturas: site × build local de produção (mesmos arquivos; data fixa, sorteio com semente fixa, animação reduzida) | 84 idênticas. As 4 restantes vêm do tempo de carregamento: as prévias 3D do Guarda-roupa (celular e computador), a tela de carregamento da Central e uma diferença de no máximo 9/255 na janela da fase. **Mudança de estilo: 0** |
| Erros de JavaScript, falhas de carregamento (HTTP ≥ 400) e rolagem horizontal | 0 nas 88 capturas e nas 26 verificações de rota |

**Observações:**
1. **Central:** o site ficou idêntico a três rodadas locais da 0.17.6. Uma quarta rodada local teve uma oscilação de carregamento no 2D do computador, e outra teve um ponto de 1 × 2 px no 3D do computador. São variações conhecidas da captura do 3D.
2. **Comparação das 88 capturas:** foi feita produção contra produção. No servidor de desenvolvimento, o modo estrito do React muda a ordem do sorteio das perguntas, e a comparação deixaria de valer.

## Capturas e registros do site publicado

Em `publicacao/`:

| Arquivo | Conteúdo |
| --- | --- |
| `central-{celular,computador}-{3d,2d}.jpg` | Central no site, sem foco |
| `foco-central-computador-camp-continuar.jpg` | Anel duplo no "Começar"/"Continuar", pelo teclado |
| `foco-central-celular-camp-label.jpg` | Anel duplo num rótulo da cena, no celular |
| `sobre-celular-versao-0.17.6.jpg` | Página Sobre com a versão |
| `versao-erros-site.txt` | Versão, `data-ambiente`, rolagem e erros em 13 rotas, no celular e no computador |
| `teclado-site.txt` | Foco preso e Esc nas janelas dos mapas |
| `tab-central-site.json` | Ordem do Tab e do Shift+Tab na Central, nas 4 situações |

## Limitações de compatibilidade

- **Navegador:** só Chromium (Playwright), com vídeo por software.
- **Não testados:**
  - celulares e tablets reais;
  - Safari e Firefox;
  - leitores de tela.
- **Seletor de dificuldade:** o `<select>` nativo do mapa do Quiz tem altura visível de 44 px. Navegadores que desenham o seletor do próprio sistema podem mostrá-lo de outra forma.
- **Exceções que continuam:**
  - 2 links dentro de frases ("Ver a linha do tempo" e "Perfil", nas Configurações) ficam abaixo de 44 px, pela exceção da WCAG;
  - os dois sistemas de alto contraste continuam separados, como decidido.
