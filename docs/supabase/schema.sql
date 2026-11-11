-- Bible Quest — esquema proposto para Supabase (PostgreSQL)
-- STATUS: proposta para a próxima fase. Não está em uso na versão estática.
-- Toda a segurança depende das políticas RLS abaixo, nunca do frontend.
-- A chave service_role NUNCA deve ir para o cliente.

-- Perfis (1:1 com auth.users). Dados mínimos (LGPD).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 20),
  avatar text not null default 'lamp',
  age_range text not null check (age_range in ('ate12', '13a17', '18mais')),
  guardian_consent_at timestamptz,           -- obrigatório para 'ate12' antes de recursos online
  nickname_hidden boolean not null default false, -- moderação
  created_at timestamptz not null default now()
);

create table public.progress (
  user_id uuid primary key references public.profiles on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak_current integer not null default 0,
  streak_best integer not null default 0,
  streak_last_day date,
  daily_last_day date,
  daily_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.chapter_progress (
  user_id uuid references public.profiles on delete cascade,
  chapter_id text not null,
  completed boolean not null default false,
  best_stars smallint not null default 0 check (best_stars between 0 and 3),
  best_score integer not null default 0,
  attempts integer not null default 0,
  primary key (user_id, chapter_id)
);

create table public.match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  mode text not null check (mode in ('capitulo', 'diario', 'multiplayer')),
  chapter_id text,
  correct smallint not null,
  total smallint not null,
  score integer not null,
  xp integer not null,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid references public.profiles on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Conteúdo (gerenciado pelo painel administrativo)
create table public.questions (
  id text primary key,
  journey_id text not null,
  chapter_id text not null,
  type text not null,
  difficulty smallint not null check (difficulty between 1 and 3),
  category text not null,
  payload jsonb not null,          -- enunciado, opções, resposta, explicação, referência
  reviewed_by uuid references public.profiles,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Papéis administrativos (atribuídos manualmente via SQL/servidor)
create table public.staff_roles (
  user_id uuid primary key references public.profiles on delete cascade,
  role text not null check (role in ('admin', 'moderador', 'revisor'))
);

-- Multiplayer: salas privadas com código. Sem tabela de chat.
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  host_id uuid not null references public.profiles on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  journey_id text not null,
  question_ids text[] not null,
  max_players smallint not null default 8,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 hours'
);

create table public.room_players (
  room_id uuid references public.rooms on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Respostas são gravadas SOMENTE por Edge Function (service role), que valida a resposta.
create table public.room_answers (
  room_id uuid references public.rooms on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  question_id text not null,
  correct boolean not null,
  points integer not null,
  answered_at timestamptz not null default now(),
  primary key (room_id, user_id, question_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles on delete cascade,
  reported_id uuid not null references public.profiles on delete cascade,
  room_id uuid references public.rooms on delete set null,
  reason text not null check (reason in ('apelido_ofensivo', 'comportamento', 'outro')),
  status text not null default 'aberta' check (status in ('aberta', 'analisada', 'arquivada')),
  created_at timestamptz not null default now()
);

create table public.moderation_log (
  id bigserial primary key,
  staff_id uuid not null references public.profiles,
  action text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ===================== RLS =====================
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.match_history enable row level security;
alter table public.user_achievements enable row level security;
alter table public.questions enable row level security;
alter table public.staff_roles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_answers enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_log enable row level security;

create function public.is_staff(r text default null) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff_roles where user_id = auth.uid() and (r is null or role = r));
$$;

-- Perfil: o dono lê e edita o próprio. Outros só veem apelido via view pública (abaixo).
create policy "perfil proprio" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

-- Progresso: leitura do próprio. Escrita apenas pelo servidor (Edge Function), para evitar XP forjado.
create policy "progresso leitura" on public.progress for select using (user_id = auth.uid());
create policy "capitulos leitura" on public.chapter_progress for select using (user_id = auth.uid());
create policy "historico leitura" on public.match_history for select using (user_id = auth.uid());
create policy "conquistas leitura" on public.user_achievements for select using (user_id = auth.uid());

-- Perguntas: qualquer usuário autenticado lê publicadas; só staff edita.
create policy "perguntas publicadas" on public.questions for select using (published or public.is_staff());
create policy "perguntas staff" on public.questions for all using (public.is_staff('admin') or public.is_staff('revisor'))
  with check (public.is_staff('admin') or public.is_staff('revisor'));

create policy "papeis leitura staff" on public.staff_roles for select using (public.is_staff('admin'));

-- Salas: visíveis apenas aos participantes. Entrada por código via RPC join_room (security definer).
create policy "sala participantes" on public.rooms for select
  using (exists (select 1 from room_players rp where rp.room_id = id and rp.user_id = auth.uid()));
create policy "sala criar" on public.rooms for insert with check (host_id = auth.uid());
create policy "jogadores da sala" on public.room_players for select
  using (exists (select 1 from room_players rp where rp.room_id = room_id and rp.user_id = auth.uid()));
create policy "respostas da sala" on public.room_answers for select
  using (exists (select 1 from room_players rp where rp.room_id = room_id and rp.user_id = auth.uid()));

-- Denúncias: o usuário cria; só moderação lê.
create policy "denunciar" on public.reports for insert with check (reporter_id = auth.uid());
create policy "moderacao le" on public.reports for select using (public.is_staff());
create policy "log staff" on public.moderation_log for select using (public.is_staff('admin'));

-- Ranking público: somente apelido (não oculto), XP e sequência.
create view public.leaderboard with (security_invoker = false) as
  select p.nickname, g.xp, g.streak_current
  from profiles p join progress g on g.user_id = p.id
  where not p.nickname_hidden and p.age_range <> 'ate12'
  order by g.xp desc
  limit 100;
