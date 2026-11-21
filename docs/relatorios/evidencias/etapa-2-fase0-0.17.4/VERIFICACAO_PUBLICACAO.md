# Bible Quest — publicação oficial da versão 0.17.4 (Fase 0 da Etapa 2)

Registro da integração da 0.17.4 ao `main` e da verificação do site publicado, em 16/11/2026.

## Integração

- **Origem:** `claude/loving-carson-8mrbjo`. **Destino:** `main`.
- **Forma:** fast-forward de `64f2b1f` para `058baa6`. Não houve commit de merge nem conflito, e o histórico e a documentação foram preservados. O `main` não tinha nenhum commit que faltasse na branch de desenvolvimento.
- **Commits integrados:**
  - `9224b52`: Fase 0 da Etapa 2 (v0.17.4);
  - `058baa6`: contagem correta de testes na documentação (155).
- **Conferência antes de integrar:**
  - os arquivos fora de `docs/` eram só os esperados da 0.17.4: `CHANGELOG.md`, `README.md`, `ROADMAP.md`, `package.json`, `package-lock.json`, `Layout.tsx`, `About.tsx`, `global.css`, `fase0.test.tsx`, `versao.ts` e `vite.config.ts`;
  - nenhum arquivo da Central, dos dados ou das regras mudou.
- **Versão:** 0.17.4. Nenhuma 0.17.5 foi criada, e nenhuma funcionalidade mudou durante a publicação.

## Verificações

| Verificação | Resultado |
| --- | --- |
| `npm ci` + `npm run typecheck` | Sem erros |
| `npm test` | 155 de 155 testes passando, em 13 arquivos |
| `npm run build` | Concluído; pacote principal `assets/index-DWTM3Srj.js` |
| Publicação pelo `main` (run 76 do fluxo oficial) | Sucesso: tipos, testes, build e GitHub Pages |
| Site publicado | Serve `assets/index-DWTM3Srj.js`, o mesmo arquivo do build local |

## Verificação no site publicado

Site: <https://theuzxl13-oss.github.io/Bible-Quest/>. A verificação foi automática, no Chromium com vídeo por software, no celular (390 × 844) e no computador (1280 × 800).

| Item | Resultado |
| --- | --- |
| A. Título dos avisos (9 avisos) | 8,2:1 a 8,3:1 (antes 1,2:1) |
| B. Introdução do mundo | 8,1:1 a 14,4:1 (antes 1,07:1 a 4,22:1) |
| C. Tabela do Perfil, em painel próprio | cabeçalho de 7,2:1 a 7,5:1; linhas acima de 11:1 |
| D. Link "Linha do tempo" na Biblioteca | 7,27:1 (antes 1,33:1) |
| E. Barra do computador | Central, História, Quiz, Biblioteca, Perfil + "Desafio diário" como destino secundário |
| Navegação inferior (celular) | Central, História, Quiz, Biblioteca, Perfil |
| Desafio diário pelo rótulo da Central e pelo painel de missões | Abre `#/diario`, no celular e no computador |
| Versão no rodapé e na página Sobre | "Versão 0.17.4", nos dois tamanhos de tela |
| Central em 3D: 13 elementos, jogador novo (5 iniciais) e painel de missões | Correta no celular e no computador |
| Central em 2D | Correta, com os 4 rótulos |
| Central comparada à 0.17.3 (capturas com animações reduzidas) | Celular 3D, celular 2D e computador 2D idênticos pixel a pixel. Computador 3D: 2 pixels com diferença de até 13 em 255 níveis de cor, imperceptível; corresponde à renderização 3D por software do build de produção |
| Varredura de 80 capturas (40 telas e estados, celular e computador) | 0 erros de JavaScript, 0 falhas de carregamento (respostas HTTP 400+ ou pedidos falhos) e 0 casos de rolagem horizontal |

## Capturas do site publicado

Em `publicacao/`: a Central em 3D e 2D, no celular e no computador; o painel de missões; o Desafio diário aberto pela cena; a página Sobre com a versão; e os recortes dos cinco pontos corrigidos (aviso do Ranking, aviso do Desafio diário, introdução do mundo, tabela do Perfil, abas da Biblioteca, barra do computador e rodapé).

## Limites

- Só Chromium, com vídeo por software; não houve teste em celulares ou tablets reais, no Safari nem com leitores de tela.
- O histórico de partidas do Perfil não foi medido, porque o perfil de teste não tem partidas. Ele usa a mesma regra da tabela de recordes.
