create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'Asia/Tokyo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  study_minutes int not null default 0,
  exercise_minutes int not null default 0,
  reading_minutes int not null default 0,
  sns_minutes int not null default 0,
  sleep_hours numeric(4,2) not null default 0,
  mood_score int,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

create table if not exists public.ai_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  summary jsonb not null,
  model text not null,
  prompt_version text not null default 'v1',
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);

create table if not exists public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak_days int not null default 0,
  longest_streak_days int not null default 0,
  last_logged_date date,
  updated_at timestamptz not null default now()
);
