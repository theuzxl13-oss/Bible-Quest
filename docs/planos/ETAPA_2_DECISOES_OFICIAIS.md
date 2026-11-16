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
| 0 | Correções de legibilidade e navegação | Versão 0.17.4, aguardando aprovação |
| 1 | Base visual comum com os tokens | Começa só depois da aprovação da 0.17.4 |
| 2 a 5 | Conforme o diagnóstico | — |
