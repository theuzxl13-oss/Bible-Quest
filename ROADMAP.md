# Bible Quest — Roadmap

## Fase 1 — Versão estática (concluída)

- **0.1:** primeira versão jogável, com 5 jornadas, perfil local, ranking e multiplayer de demonstração, e protótipo administrativo.
- **0.3:** aventura, com personagem do jogador, mapa de fases com avatar e baús, Gênesis em 20 fases, Biblioteca Bíblica, linha do tempo, revisão inteligente e Modo Livre com 10 modalidades.
- **0.2:** dois modos de jogo.
  - **Modo História:** cânon de 66 livros; Gênesis com 19 experiências e Êxodo com 4.
  - **Modo Livre:** 7 modalidades, desafio diário e multiplayer de demonstração.
  - **Progressão:** única entre os modos, com limites contra acúmulo de XP.
  - **Painel administrativo:** editor local de conteúdo.

## Fase 2 — Conteúdo e qualidade

**Continuação do Modo História na ordem dos livros.** Cada livro novo entra em `src/data/story/<livro>.ts` e é liberado automaticamente depois do anterior. Próximos livros e temas sugeridos:

- **Levítico:** o tabernáculo e os sacrifícios, o Dia da Expiação.
- **Números:** os espias, a serpente de bronze.
- **Deuteronômio:** a renovação da aliança, a morte de Moisés.
- **Livros históricos:** Josué, Juízes, Rute, 1 e 2 Samuel, Reis.
- **Livros poéticos:** Jó, Salmos, Provérbios, Eclesiastes.
- **Profetas.**
- **Novo Testamento:** Evangelhos, Atos, cartas e Apocalipse.

**Critério de qualidade:** cada livro só é publicado com revisão teológica e textual; o jogo não preenche livros com conteúdo superficial.

**Painel administrativo:** o JSON exportado pelo painel (perguntas e rascunhos de experiências) serve como formato de entrada para a revisão.

- Revisão teológica e textual completa dos trechos da Almeida 1911 contra a fonte.
- Revisão das perguntas por especialistas (campo `reviewed_by`).
- Novas jornadas:
  - Jacó;
  - Josué e a conquista;
  - Juízes (Gideão, Sansão);
  - Rute;
  - Samuel, Saul e Davi;
  - Daniel;
  - Ester.
- Jornadas do Novo Testamento: nascimento de Jesus, parábolas, Atos e as viagens de Paulo.
- Mais perguntas por capítulo, com rotação para evitar memorização.
- Narração gravada profissionalmente e legendas sincronizadas.
- Mapas históricos ilustrados (rotas de Abraão e do Êxodo).
- PWA com funcionamento offline (service worker) e testes E2E com Playwright no CI.

## Fase 3 — Integração com Supabase

1. Criar o projeto e aplicar `docs/supabase/schema.sql` (tabelas e RLS).
2. **Supabase Auth.**
   - Login por e-mail com código (OTP), sem senha.
   - Consentimento do responsável para menores de 13 anos (`guardian_consent_at`).
3. **Implementar as interfaces existentes**, sem mudar as telas:
   - `SupabaseAuthService` (`AuthService`);
   - `SupabaseProgressRepository` (`ProgressRepository`);
   - preferências continuam locais ou passam para a tabela.
4. **Edge Function `claim-daily`:** obtém o dia no servidor e grava em `daily_claims`, cuja chave única impede duas recompensas no mesmo dia. Implementa o contrato `DailyService`.
5. **Edge Function `submit-match`.**
   - Valida as respostas e calcula XP e conquistas no servidor.
   - Reutiliza as regras puras de `src/services/game`.
   - Impede que o cliente forje XP.
6. **Migração do progresso local** para a conta, mediante confirmação do jogador.
7. **Ranking global** pela view `leaderboard`, que exclui menores de 13 e apelidos ocultos. Ranking semanal e por jornada.

## Fase 4 — Multiplayer real

- `SupabaseMultiplayerService` implementando `MultiplayerService`. A interface atual já tem salas, código, cronômetro por pergunta, placar, vencedor e ranking da partida.
- RPC `create_room` e `join_room(code)`: gera códigos no servidor e limita a 8 jogadores.
- Realtime: canal `room:<id>` com presença e broadcast do estado.
- Respostas sincronizadas e validadas por Edge Function (`room_answers`).
- **Segurança:**
  - Sem chat livre; apenas reações predefinidas.
  - Apelidos filtrados.
  - Denúncia e bloqueio.
  - Salas que expiram.
  - Menores apenas em salas privadas.
- Modos de jogo: duelo 1x1, sala de família, sala de classe (escola bíblica), com professor como anfitrião.

## Fase 5 — Painel administrativo real

- Aplicação separada (ou rota protegida) com login de equipe, papéis em `staff_roles` e RLS.
- Editor de perguntas, jornadas e capítulos, com fluxo de revisão e publicação.
- Fila de denúncias, ações de moderação e `moderation_log`.
- Estatísticas agregadas e anonimizadas: taxa de acerto por pergunta, para identificar perguntas confusas.

## Fase 6 — Aplicativo Android

- Empacotar com **Capacitor**. O app já usa `base: './'` e `HashRouter`, compatíveis com WebView.
- Ícones, splash screen, notificações locais opcionais para lembrar o desafio diário (com consentimento) e modo offline.
- Publicação na Google Play: classificação etária, política de privacidade e formulário de segurança de dados.
- Avaliar uma versão iOS depois.

## Fase 7 — Monetização (ética e adequada a todas as idades)

- **Gratuito com todo o conteúdo essencial.** Sem anúncios para menores, sem loot boxes e sem pressão de compra.
- **Plano "Família/Igreja" por assinatura:**
  - salas ilimitadas;
  - relatórios de progresso para pais e professores;
  - trilhas temáticas extras;
  - personalização visual.
- **Licenças institucionais** para escolas e igrejas: painel do professor e turmas.
- **Doações e apoio voluntário.**
- Compras apenas por adultos, com confirmação do responsável quando aplicável. Nenhuma vantagem competitiva paga no ranking.
