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
| 1 | Base visual comum com os tokens | Passos 1.1 a 1.3 na versão 0.17.5, aprovada e publicada em 20/11/2026; passos 1.4 e 1.5 na versão 0.17.6, aprovada e publicada em 21/11/2026; passo 1.6 na versão 0.17.7, aprovada e publicada em 23/11/2026; passos 1.7 e 1.8 aguardando autorização |
| 2 a 5 | Conforme o diagnóstico | — |

## Fase 1 — decisões da primeira entrega (16/11/2026)

- **Ponte de compatibilidade:** começa com os valores visuais antigos (HEX, opacidades, gradientes, sombras e medidas preservados).
- **Tons dos ambientes:** ainda não aplicados; dependem da folha de amostras (`docs/relatorios/evidencias/etapa-2-fase1-amostras/FOLHA_AMOSTRAS.md`) e de aprovação.
- **Central 0.17.3:** continua sendo a referência visual e não muda nesta entrega.
- **Tokens:** os novos ampliam o `tokens.css`; não há terceiro sistema visual.
- **Próxima entrega:** as correções do foco sobre pergaminho e do selo de aviso da Central ficam autorizadas para ela, e não foram aplicadas na 0.17.5.
- **Escopo:** só os passos 1.1, 1.2 e 1.3 foram autorizados nesta entrega.

## Fase 1 — segunda entrega, versão 0.17.6 (21/11/2026)

- **Escopo:** só os passos 1.4 (acessibilidade base) e 1.5 (identificação dos ambientes).
- **Central:** continua idêntica à 0.17.5, exceto pelas duas correções autorizadas (foco do painel de missões e contraste do selo de aviso).
- **`data-ambiente`:** só identificação; nenhum fundo, cor, gradiente ou componente temático novo foi ativado.
- **Preservado:** funcionalidades, rotas, dados, progressão, estilos antigos e os dois sistemas de alto contraste (não unificados).
- **Entrega:** só na branch de desenvolvimento, sem integração ao `main` nem publicação até a aprovação.
- **Avaliação técnica (21/11/2026):** passos 1.4 e 1.5 aprovados, com autorização adicional na Central. O anel duplo do botão Missões vale também para os rótulos da cena, o Perfil e as Configurações do topo, as placas dos modos e o "Continuar". A área de toque dos rótulos chega a pelo menos 44 × 44 com área invisível. A única mudança visual permitida é o indicador de foco.
- **Publicação (21/11/2026):** a 0.17.6 foi aprovada, integrada ao `main` por fast-forward e publicada (run 87).

## Fase 1 — passo 1.6, versão 0.17.7 (23/11/2026)

- **Alto contraste:** um só modo, na família terra e marfim da Central; o modo antigo (preto e amarelo) foi substituído.
- **Central:** a aparência normal e a aparência sem foco no alto contraste não mudam; o anel do foco foi corrigido só no alto contraste.
- **Preservado:** a opção e a preferência salva, a redução de animações e o modo normal.
- **Publicação (23/11/2026):** aprovada, com a correção do foco com o painel de missões aberto; integrada ao `main` por fast-forward e publicada (run 92).
- **Fora desta versão:** paletas dos ambientes, migração visual das telas, limpeza de estilos, passos 1.7 e 1.8 e Etapa 3.

## Personagens 3D (20/11/2026)

- **Cabelos 3D novos:** ficam para a Etapa 4. Durante a Etapa 2 não há geração de modelos nem prévias de cabelo.
- **Sexta imagem de referência** (cabelo médio com barba): ainda precisa ser enviada como arquivo antes da Etapa 4.
