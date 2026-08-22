create extension if not exists pgcrypto;

create table if not exists public.market_states (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  timeframe text not null,
  captured_at timestamptz not null default now(),
  price numeric not null,
  change_24h numeric,
  trend text not null,
  regime text not null,
  momentum numeric,
  volatility numeric,
  signal text not null,
  confidence numeric,
  indicators jsonb not null default '{}'::jsonb,
  support_resistance jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  invalidation text,
  source text
);
create index if not exists market_states_symbol_time_idx on public.market_states(symbol, timeframe, captured_at desc);

create table if not exists public.market_state_outcomes (
  id uuid primary key default gen_random_uuid(),
  market_state_id uuid not null references public.market_states(id) on delete cascade,
  horizon text not null,
  target_at timestamptz not null,
  price_at_target numeric,
  return_pct numeric,
  direction text,
  created_at timestamptz not null default now(),
  unique(market_state_id, horizon)
);
create index if not exists market_outcomes_horizon_idx on public.market_state_outcomes(horizon, target_at desc);

alter table public.market_states enable row level security;
alter table public.market_state_outcomes enable row level security;
