# Bible Quest — Roadmap

## Fase 1 — Versão estática (concluída, 0.1)

- 5 jornadas, 20 capítulos e 113 perguntas em 7 modalidades.
- XP, níveis, estrelas, medalhas, conquistas, sequência diária, desafio diário e histórico.
- Perfil local, acessibilidade e publicação no GitHub Pages.
- Ranking e multiplayer em modo demonstração; protótipo administrativo.

## Fase 2 — Conteúdo e qualidade

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
4. **Edge Function `submit-match`.**
   - Valida as respostas e calcula XP e conquistas no servidor.
   - Reutiliza as regras puras de `src/services/game`.
   - Impede que o cliente forje XP.
5. **Migração do progresso local** para a conta, mediante confirmação do jogador.
6. **Ranking global** pela view `leaderboard`, que exclui menores de 13 e apelidos ocultos. Ranking semanal e por jornada.

## Fase 4 — Multiplayer real

- `SupabaseMultiplayerService` implementando `MultiplayerService`.
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
