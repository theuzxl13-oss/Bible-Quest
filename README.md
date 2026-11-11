# Bible Quest

**Uma jornada pelas Escrituras.** Jogo bíblico educativo, cinematográfico e para todas as idades, desenvolvido pela **Kzann Tech**.

O jogador percorre cinco jornadas do Gênesis e do Êxodo. Em cada capítulo, lê uma introdução narrativa, trechos bíblicos e o contexto histórico, e depois responde a um desafio. Os acertos e a constância rendem XP, níveis, medalhas e conquistas, e cada capítulo concluído libera o seguinte.

- **Jogar agora:** https://theuzxl13-oss.github.io/Bible-Quest/
- **Repositório:** https://github.com/theuzxl13-oss/Bible-Quest
- **Status:** versão 0.1 publicada no GitHub Pages em 11/11/2026, verificada no endereço público em celular e computador.

## Tecnologias

- React 19, TypeScript 7 e Vite 8 (com `@vitejs/plugin-react` 6)
- React Router 7 com `HashRouter`, para que links diretos funcionem no GitHub Pages e num futuro WebView Android
- CSS moderno, sem framework, com tokens de cor, layout responsivo e modos de acessibilidade
- Vitest 5 e Testing Library para testes de regras e fluxos
- Fontes auto-hospedadas via Fontsource: Cinzel, Inter e Crimson Pro
- GitHub Actions para validar, compilar e publicar

## Instalação e execução local

Requisito: Node.js 22 ou superior.

```bash
npm ci
```

```bash
npm run dev
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run typecheck` | Verifica os tipos com TypeScript |
| `npm test` | Roda os testes (regras do jogo, conteúdo, serviços e fluxos de tela) |
| `npm run build` | Faz o typecheck e gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

## Estrutura do projeto

```
public/images/art/     Pinturas em domínio público (WebP, 1280px e 560px)
src/
  admin/               Módulo administrativo (protótipo, carregado sob demanda)
  components/          Layout, ícones SVG, imagens, renderização das perguntas, QuizRunner
  data/                Jornadas, capítulos, 113 perguntas, conquistas, créditos das imagens, ranking de exemplo
  pages/               Telas (início, onboarding, cadastro, painel, mapa, capítulos, desafio, resultado,
                       diário, ranking, conquistas, perfil, multiplayer, configurações, sobre)
  services/
    game/              Regras puras: pontuação, níveis, desbloqueio, sequência, diário, verificação de respostas
    storage/           Abstração chave/valor e repositórios (localStorage hoje, Supabase no futuro)
    multiplayer/       Contratos, serviço de demonstração e ponto de troca para o Supabase
    supabase/          Leitura de configuração pública (sem chaves no código)
    auth.ts            Contrato de autenticação e perfil local
  state/               GameContext: estado global e ações
  styles/              Estilo global e identidade visual
  test/                Testes
docs/supabase/         Esquema SQL proposto, com políticas RLS
.github/workflows/     Build e publicação no GitHub Pages
```

## Funcionalidades implementadas

**Jornadas.** São cinco: Criação, Noé, Abraão, José e Moisés. Cada uma tem 4 capítulos (20 no total), e cada capítulo traz:
- uma narrativa dramatizada, identificada como tal, que não atribui falas aos personagens;
- trechos bíblicos com referência;
- uma explicação histórica e bíblica.

**Desafios.** O banco tem 113 perguntas em sete modalidades:
- múltipla escolha;
- complete o versículo;
- verdadeiro ou falso;
- "Quem sou eu?";
- identifique o livro;
- organize os acontecimentos;
- desafio de memória.

Toda pergunta tem resposta, explicação, referência, dificuldade e categoria.

**Mecânica.**
- **Tentativas:** 3 por capítulo, e é preciso acertar pelo menos 60% para concluir.
- **Estrelas:** de 1 a 3, conforme o aproveitamento.
- **Pontuação:** depende da dificuldade e dá bônus de constância a partir do 3º acerto seguido. O tempo nunca conta pontos; o cronômetro, que é opcional, só informa.
- **XP:** a primeira conclusão ganha um bônus de 50 XP. Repetir um capítulo rende metade, e uma reprovação rende um quarto.
- **Progressão:**
  - níveis com títulos;
  - medalhas de bronze, prata e ouro por jornada;
  - 14 conquistas;
  - sequência diária;
  - histórico das últimas 50 partidas.
- **Desbloqueio:** cada capítulo libera o seguinte, e concluir uma jornada libera a próxima.

**Desafio diário.** São 5 perguntas, iguais para todos no mesmo dia, com bônus de XP uma vez por dia.

**Perfil local.**
- Pede apenas apelido, selo e faixa etária, sem e-mail nem senha.
- Permite editar o perfil, ver estatísticas por modalidade e consultar o histórico.
- Permite exportar os dados em JSON e apagá-los (LGPD).

**Acessibilidade.**
- Três tamanhos de texto, alto contraste e opção de reduzir animações.
- Leitura em voz alta (síntese de voz do navegador, em pt-BR).
- Atalhos de teclado: teclas 1 a 4 escolhem a alternativa.
- Foco visível, link "pular para o conteúdo", rótulos ARIA e alvos de toque com pelo menos 44px.

**Ranking.** É de demonstração: os dados de exemplo são identificados na tela, e só a linha do jogador é real (local).

**Multiplayer.** É uma demonstração visual de salas privadas, com:
- código de convite;
- placar;
- reações predefinidas (sem chat livre);
- participantes fictícios claramente identificados.

Não há conexão online, e as partidas não rendem XP.

**Administração.** É um protótipo somente leitura, carregado sob demanda em `#/admin`. Tem as seções:
- perguntas, com filtros;
- jornadas e capítulos;
- usuários;
- denúncias;
- estatísticas.

## Limitações da versão estática

- **Perfil e dados.** O perfil e o progresso ficam só no navegador atual (`localStorage`), sem sincronização entre dispositivos. Limpar os dados do navegador apaga o progresso.
- **Autenticação.** Não existe autenticação segura. O perfil local não protege nada.
- **Administração.** O módulo administrativo não é seguro e não grava alterações. A versão real exige autenticação e autorização no servidor (Supabase Auth, papéis em `staff_roles` e RLS).
- **Ranking e multiplayer.** O ranking global e o multiplayer online ainda não existem. As telas mostram claramente que estão em modo demonstração.

## Conteúdo bíblico e licenças

- **Texto bíblico.** Os trechos vêm da Almeida Revista e Corrigida, edição de 1911 (domínio público), com ortografia atualizada. São apenas trechos curtos, sempre com referência. **Antes de uma publicação oficial, revise cada trecho contra a fonte**; os textos estão em `src/data/journeys.ts` e nas perguntas "Complete o versículo". Traduções protegidas, como NVI, ARA e NAA, não são usadas.
- **Narrativa.** A narrativa dramatizada aparece com selo próprio e um aviso de que não é texto bíblico.
- **Imagens.** São reproduções de obras em domínio público, de David Roberts, John Martin, Thomas Cole, Aivazovsky, Alma-Tadema, Poynter, Gérôme, Tissot, Edward Hicks e József Molnár, obtidas no Wikimedia Commons. Os créditos com link para a fonte estão na tela Sobre e em `src/data/images.ts`.

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy.yml` roda em pushes para `main`, `master` e `claude/**`, ou manualmente. Ele:

1. instala as dependências com `npm ci`;
2. verifica os tipos;
3. roda os testes;
4. gera o build;
5. publica `dist/` com `actions/deploy-pages`.

O build usa `base: './'` e `HashRouter`, então funciona em qualquer subdiretório (como `/Bible-Quest/`) sem configuração extra.

**Configuração do GitHub (já feita):**

1. Em **Settings → Pages → Build and deployment → Source**, está selecionado **GitHub Actions**.
2. Em **Settings → Environments → github-pages → Deployment branches**, estão permitidas as branches `claude/dazzling-johnson-mig8ai` e `claude/loving-carson-8mrbjo`. Para publicar a partir de outra branch, adicione-a nessa lista; sem isso, a etapa de publicação falha em poucos segundos e sem log.
3. As permissões `pages: write` e `id-token: write` já estão declaradas no workflow.

Cada push nessas branches publica automaticamente. Para publicar manualmente, use **Actions → Build e publicação no GitHub Pages → Run workflow**.

## Variáveis de ambiente futuras

O Supabase será ativado definindo, no momento do build, apenas valores públicos:

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon pública>
```

Nunca coloque a `service_role` key, senhas ou tokens no frontend.

## Testes

São 46 testes automatizados, nas seguintes áreas:

- **Conteúdo** (`content.test.ts`): o banco tem pelo menos 100 perguntas; ids e enunciados são únicos; as respostas são válidas; cada jornada usa as 7 modalidades; cada capítulo tem pelo menos 5 perguntas; a narrativa não tem citações atribuídas; e as imagens existem no disco.
- **Regras** (`rules.test.ts`): pontuação, estrelas, aprovação, XP, níveis, sequência diária (inclusive viradas de mês e ano), desbloqueio, medalhas, verificação de respostas e desafio diário determinístico.
- **Motor** (`engine.test.ts`): aplicação de partidas, bônus de primeira conclusão, repetição, reprovação, diário uma vez por dia, multiplayer demonstrativo sem XP e imutabilidade do progresso.
- **Serviços** (`services.test.ts`): persistência local, tolerância a dados corrompidos, saneamento do apelido, multiplayer de demonstração e configuração do Supabase.
- **Fluxos** (`flow.test.tsx`): o caminho de ponta a ponta (cadastro → capítulo → desafio → resultado → próximo capítulo); erros que consomem tentativas; bloqueio por URL; redirecionamento sem perfil; avisos de demonstração; acessibilidade; e página 404.

## Histórico de atualizações

Este README é atualizado a cada mudança no projeto. A entrada mais recente fica no topo.

### 0.1.0 — 11/11/2026

- Primeira versão jogável: 5 jornadas, 20 capítulos e 113 perguntas em 7 modalidades.
- XP, níveis, estrelas, tentativas, medalhas, 14 conquistas, sequência diária, desafio diário, histórico e desbloqueio progressivo.
- Perfil local com exportação e exclusão de dados; camada de serviços pronta para trocar por Supabase.
- Ranking e multiplayer em modo demonstração; protótipo administrativo somente leitura.
- Acessibilidade: tamanho de texto, alto contraste, redução de animações, leitura em voz alta e atalhos de teclado.
- 22 obras de arte em domínio público, otimizadas em WebP.
- 46 testes automatizados; publicação automática no GitHub Pages via GitHub Actions.

---

© Kzann Tech. Bible Quest é um produto Kzann Tech.
