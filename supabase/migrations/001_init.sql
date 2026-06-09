-- ==========================================
-- 平行世界 (Parallel World) - Database Schema
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Challenges ────────────────────────────

create table challenges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  challenge_date date not null,
  checkpoints text[] not null,
  template smallint not null check (template in (2, 3, 4, 6, 9)),
  status text not null default 'forming' check (status in ('forming', 'active', 'completed')),
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_challenges_host on challenges(host_id);
create index idx_challenges_status on challenges(status);

-- ─── Participants ──────────────────────────

create table participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tags text[] not null default '{}',
  avatar_seed text not null default '',
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  unique(challenge_id, user_id)
);

create index idx_participants_challenge on participants(challenge_id);
create index idx_participants_user on participants(user_id);

-- ─── Checkins ──────────────────────────────

create table checkins (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  checkpoint text not null,
  photo_url text not null default '',
  caption text not null default '',
  created_at timestamptz not null default now(),
  unique(challenge_id, user_id, checkpoint)
);

create index idx_checkins_challenge on checkins(challenge_id);
create index idx_checkins_user on checkins(user_id);

-- ─── RLS Policies ──────────────────────────

alter table challenges enable row level security;
alter table participants enable row level security;
alter table checkins enable row level security;

-- Challenges: anyone can read; only host can update; authenticated users can insert
create policy "Challenges are readable by all authenticated users"
  on challenges for select
  to authenticated
  using (true);

create policy "Authenticated users can create challenges"
  on challenges for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Host can update their own challenges"
  on challenges for update
  to authenticated
  using (auth.uid() = host_id);

-- Participants: anyone can read; authenticated users can insert themselves
create policy "Participants are readable by authenticated users"
  on participants for select
  to authenticated
  using (true);

create policy "Users can join challenges"
  on participants for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Checkins: users can read own checkins always; can read all checkins only when challenge is completed
create policy "Users can read own checkins"
  on checkins for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read all checkins when challenge is completed"
  on checkins for select
  to authenticated
  using (
    exists (
      select 1 from challenges
      where challenges.id = checkins.challenge_id
      and challenges.status = 'completed'
    )
  );

create policy "Users can create their own checkins"
  on checkins for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own checkins"
  on checkins for update
  to authenticated
  using (auth.uid() = user_id);

-- ─── Storage ───────────────────────────────

-- Create photos bucket (run in Supabase Dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

-- Storage policy: users can upload to their own directory
-- create policy "Users can upload photos"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policy: anyone can read photos (public bucket handles this)
-- create policy "Photos are publicly readable"
--   on storage.objects for select
--   to authenticated
--   using (bucket_id = 'photos');

-- ─── Realtime ──────────────────────────────

-- Enable realtime for challenges and participants tables
alter publication supabase_realtime add table challenges;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table checkins;
