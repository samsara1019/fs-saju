-- 풋살 사주 FC — Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  birth_date date not null,
  birth_time text,
  position text,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  content text not null,
  member_count int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_members_team on members(team_id);
create index if not exists idx_analyses_team on analyses(team_id, created_at desc);

-- 모든 접근은 서버(service role)에서만 하므로 RLS를 켜고 정책은 만들지 않는다.
-- (anon 키로는 어떤 테이블도 읽거나 쓸 수 없음)
alter table teams enable row level security;
alter table members enable row level security;
alter table analyses enable row level security;
