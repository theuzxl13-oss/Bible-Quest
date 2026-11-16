# Etapa 2 — Decisões oficiais depois do diagnóstico visual

Decisões tomadas pelo dono do projeto em 16/11/2026, depois do diagnóstico
`docs/relatorios/ETAPA_2_DIAGNOSTICO_VISUAL_TELAS.md`. Elas orientam as próximas
fases da Etapa 2. Ambientes e telas novas só serão implementados com aprovação,
fase a fase.

## Navegação

- **Destinos principais:** Central, História, Quiz, Biblioteca e Perfil, com
  esses mesmos nomes no celular e no computador.
- **Desafio diário:** destino secundário, sempre com o nome "Desafio diário".
  Não é um sexto destino principal.
- **Preservação:** nenhum link secundário, rota ou funcionalidade é removido.
- **Aplicação:** feita na 0.17.4 (Fase 0).

## Personalidade visual de cada área

As direções foram aprovadas para orientar as próximas fases. Nenhuma delas foi
implementada ainda.

| Área | Direção aprovada |
| --- | --- |
| Central | Acampamento de Aventura (referência oficial, 0.17.3) |
| História | Trilha da Jornada |
| Quiz | Templo do Saber, com azul profundo e dourado |
| Biblioteca | Sala de Estudos |
| Perfil | Tenda do Personagem |
| Conquistas | Sala dos Troféus |

## Páginas existentes

- **Página do livro** (`/historia/:livro`):
  - a rota e o conteúdo são preservados;
  - função futura: apresentar o livro bíblico, com contexto, resumo, progresso e acesso aos capítulos;
  - o mapa continua sendo a experiência principal de exploração.
- **Página antiga da fase** (`/historia/:livro/:fase`):
  - a rota, o conteúdo e as funcionalidades são preservados integralmente;
  - não será excluída, fundida nem redirecionada;
  - o destino definitivo será decidido depois.
- **Mapas:** continuam em 2D, com evolução artística e integração visual com o
  universo da Central.
- **Central 0.17.3:** não muda. Isso vale para o cenário, o carregamento, o
  personagem, os elementos, a navegação e o funcionamento.

## Sequência

| Fase | O que entra | Situação |
| --- | --- | --- |
| 0 | Correções de legibilidade e navegação | Versão 0.17.4, aprovada e publicada em 16/11/2026 |
| 1 | Base visual comum com os tokens | Passos 1.1 a 1.3 na versão 0.17.5 (sem mudança na tela), aguardando aprovação; passos 1.4 a 1.8 depois |
| 2 a 5 | Conforme o diagnóstico | — |

## Fase 1 — decisões da primeira entrega (16/11/2026)

- **Ponte de compatibilidade:** começa com os valores visuais antigos (HEX, opacidades, gradientes, sombras e medidas preservados).
- **Tons dos ambientes:** ainda não aplicados; dependem da folha de amostras (`docs/relatorios/evidencias/etapa-2-fase1-amostras/FOLHA_AMOSTRAS.md`) e de aprovação.
- **Central 0.17.3:** continua sendo a referência visual e não muda nesta entrega.
- **Tokens:** os novos ampliam o `tokens.css`; não há terceiro sistema visual.
- **Próxima entrega:** as correções do foco sobre pergaminho e do selo de aviso da Central ficam autorizadas para ela, e não foram aplicadas na 0.17.5.
- **Escopo:** só os passos 1.1, 1.2 e 1.3 foram autorizados nesta entrega.
