# Bible Quest — publicação oficial da versão 0.17.5 (Fase 1, passos 1.1 a 1.3)

Registro da integração da 0.17.5 ao `main` e da verificação do site publicado, em 20/11/2026.

## Integração

- **Origem:** `claude/loving-carson-8mrbjo`. **Destino:** `main`.
- **Forma:** fast-forward de `7e8ab4e` para `63f0277`. Não houve commit de merge nem conflito, e o histórico foi preservado. O `main` não tinha nenhum commit que faltasse na branch de desenvolvimento.
- **Commits integrados:**

  | Commit | Descrição |
  | --- | --- |
  | `960ba82` | Auditoria visual da Fase 1 e proposta da base comum (só documentação) |
  | `41fa1c4` | Passos 1.1 a 1.3: tokens em quatro camadas, ponte de compatibilidade e componentes base (v0.17.5) |
  | `63f0277` | Decisão: cabelos 3D novos ficam para a Etapa 4 (só documentação) |

- **Conferência antes de integrar:** os arquivos de código alterados eram só os aprovados para a 0.17.5:
  - `tokens.css`, `ponte.css` e os 11 `base-*.css`;
  - `components/base/index.tsx` e `main.tsx`;
  - 2 arquivos de teste;
  - `package.json` e `package-lock.json`, só com a versão.
- **Escopo:** nenhuma mudança em funcionalidades, rotas, dados, regras ou progressão. Os passos 1.4 a 1.8 e a Etapa 3 não foram iniciados, a 0.17.6 não foi criada e as cores novas não estão aplicadas nas telas.

## Testes e build (instalação limpa)

| Verificação | Resultado |
| --- | --- |
| `npm ci` + `npm run typecheck` | Sem erros |
| `npm test` | 173 de 173 testes passando, em 15 arquivos |
| `npm run build` | Concluído; `assets/index-BKcrlNjs.js` e `assets/index-gnN6_pAH.css` |
| Arquivos gerados | `dist/index.html` com caminho relativo `./assets/`, os dois modelos `.glb` do personagem e o pacote JS e CSS |
| Publicação pelo `main` (run 82 do fluxo oficial) | Sucesso: tipos, testes, build e GitHub Pages |
| Site publicado | Serve `assets/index-BKcrlNjs.js` e `assets/index-gnN6_pAH.css`, os mesmos arquivos do build local |

## Verificação no site publicado

Site: <https://theuzxl13-oss.github.io/Bible-Quest/>

| Item | Resultado |
| --- | --- |
| Versão | "Versão 0.17.5" no rodapé e na página Sobre, no celular e no computador |
| Central comparada à 0.17.3 (animações reduzidas, 3D e 2D, celular e computador) | Idêntica pixel a pixel nas 4 combinações |
| Central: 13 elementos, jogador novo, painel de missões, Desafio diário pela cena e pelo painel, navegação inferior e 2D | Tudo correto, no celular e no computador |
| Variáveis antigas (39), comparadas ao build de produção da 0.17.4 | Idênticas nos modos normal, alto contraste e animação reduzida |
| Comparação das 88 capturas com o build de produção da 0.17.4 (data fixa, aleatório com semente fixa, animações reduzidas) | Veja abaixo |
| Erros de JavaScript, falhas de carregamento e rolagem horizontal | 0 nas 88 capturas e nas 6 verificações da Central |

### Comparação das 88 capturas (0.17.4 em produção × 0.17.5 publicada)

| Resultado | Capturas |
| --- | --- |
| Idênticas | 44 |
| Só a linha da versão no rodapé (0.17.4 → 0.17.5) | 38 |
| Página Sobre: a versão no rodapé e no texto | 2 |
| Tempo de carregamento do personagem 3D (prévias da guarda-roupa, figura da chegada e retrato da barra), num lado carregado e no outro ainda não | 3 |
| Tela de carregamento da Central (momento da captura) | 1 |
| **Mudança de estilo** | **0** |

**Observações:**

- **Primeiro valor do verificador de variáveis:** ele acusou 10 diferenças em relação ao texto de `global.css`. São só a forma compactada que o build de produção usa para escrever os mesmos valores (`rgba(115, 196, 147, 0.12)` vira `#73c4931f`, `180ms` vira `.18s` e as aspas das fontes mudam). Comparado ao build de produção da 0.17.4, que também é compactado, os 39 valores são idênticos.
- **Comparação com a referência do servidor de desenvolvimento:** também mostrou diferenças nas telas de pergunta. No desenvolvimento, o React executa os componentes duas vezes (modo estrito), o que muda a ordem do sorteio das perguntas. Por isso a comparação válida é produção contra produção, como na tabela acima.

## Capturas do site publicado

Em `publicacao/`:

- a Central em 3D e 2D, no celular e no computador;
- o painel de missões;
- o Desafio diário aberto pela cena;
- a página Sobre com a versão 0.17.5;
- dois recortes que mostram a diferença de tempo de carregamento do personagem 3D, na guarda-roupa e na chegada.

## Limites

- Só Chromium, com vídeo por software. Não houve teste em celulares ou tablets reais, no Safari nem com leitores de tela.
