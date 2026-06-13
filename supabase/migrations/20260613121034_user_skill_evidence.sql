-- Migration: create user_skill_evidence and user_skill_summary
-- Generated: 2026-06-13

create table public.user_skill_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id bigint not null references public.submissions(id) on delete cascade,
  roadmap_id integer references public.roadmaps(id) on delete set null,
  module_number integer,
  
  skill_name text not null,
  evidence_strength numeric not null check (evidence_strength >= 0 and evidence_strength <= 1),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  reason text,
  created_at timestamptz not null default now()
);

create index on public.user_skill_evidence (user_id, skill_name);
create index on public.user_skill_evidence (submission_id);
create index on public.user_skill_evidence (roadmap_id, module_number);

create table public.user_skill_summary (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,

  mastery_score numeric not null default 0,
  evidence_count integer not null default 0,
  last_seen timestamptz,
  updated_at timestamptz not null default now(),

  primary key (user_id, skill_name)
);

create index on public.user_skill_summary (user_id);
