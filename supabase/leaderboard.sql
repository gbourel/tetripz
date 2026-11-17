-- À exécuter une seule fois dans le SQL Editor du projet Supabase.
-- Aucune connexion requise pour consulter le top 10 ou proposer son propre score.
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  pseudo text not null check (char_length(btrim(pseudo)) between 2 and 20 and pseudo = btrim(pseudo)),
  score integer not null check (score > 0 and score <= 10000000),
  difficulty smallint not null check (difficulty between 0 and 4),
  created_at timestamptz not null default now()
);

create index if not exists scores_top10_idx
  on public.scores (difficulty, score desc, created_at asc);

alter table public.scores enable row level security;

drop policy if exists scores_public_read on public.scores;
create policy scores_public_read on public.scores
  for select to anon using (true);

drop policy if exists scores_optional_publish on public.scores;
create policy scores_optional_publish on public.scores
  for insert to anon with check (true);

-- Pas de modification/suppression anonyme, ni écriture des colonnes id/date.
revoke all on public.scores from anon, authenticated;
grant select (pseudo, score, difficulty, created_at) on public.scores to anon;
grant insert (pseudo, score, difficulty) on public.scores to anon;

-- Important : un navigateur peut falsifier un score. RLS protège l'accès
-- et la structure, mais pas l'authenticité des parties. Prévoir un backend
-- avec validation et anti-abus si le classement devient compétitif.
