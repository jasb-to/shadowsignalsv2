-- A³ Markets API key storage and concurrency-safe quota metering.
-- Keys are only stored as HMAC hashes, except for a short-lived encrypted
-- copy retained until the provisioning email is successfully delivered.

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  key_hash text not null unique,
  tier text not null default 'free'
    check (tier in ('free', 'pro')),
  requests_used_today integer not null default 0
    check (requests_used_today >= 0),
  last_reset_date date not null
    default ((now() at time zone 'UTC')::date),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text unique,
  key_ciphertext text,
  key_iv text,
  key_auth_tag text,
  key_delivery_claimed_at timestamptz,
  key_delivered_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_user_id_idx
  on public.api_keys(user_id);

create index if not exists api_keys_subscription_idx
  on public.api_keys(stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.api_keys enable row level security;

revoke all on table public.api_keys from public, anon, authenticated;
grant select, insert, update on table public.api_keys to service_role;

-- Atomically validate the key, roll over the UTC daily counter and consume
-- one request. The row lock serialises concurrent calls for one API key.
create or replace function public.consume_api_key(p_key_hash text)
returns table (
  valid boolean,
  allowed boolean,
  tier text,
  requests_used_today integer,
  daily_limit integer,
  reset_at timestamptz,
  user_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_key public.api_keys%rowtype;
  v_today date := (now() at time zone 'UTC')::date;
  v_limit integer;
  v_reset_at timestamptz;
begin
  v_reset_at := ((v_today + 1)::timestamp at time zone 'UTC');

  select k.*
    into v_key
    from public.api_keys as k
   where k.key_hash = p_key_hash
     and k.revoked_at is null
   for update;

  if not found then
    return query
      select false, false, null::text, 0, 0, null::timestamptz, null::uuid;
    return;
  end if;

  v_limit := case v_key.tier when 'pro' then 10000 else 50 end;

  if v_key.last_reset_date is distinct from v_today then
    update public.api_keys as k
       set requests_used_today = 0,
           last_reset_date = v_today
     where k.id = v_key.id
     returning k.* into v_key;
  end if;

  if v_key.requests_used_today >= v_limit then
    return query
      select true, false, v_key.tier, v_key.requests_used_today,
             v_limit, v_reset_at, v_key.user_id;
    return;
  end if;

  update public.api_keys as k
     set requests_used_today = k.requests_used_today + 1
   where k.id = v_key.id
   returning k.* into v_key;

  return query
    select true, true, v_key.tier, v_key.requests_used_today,
           v_limit, v_reset_at, v_key.user_id;
end;
$$;

revoke all on function public.consume_api_key(text)
  from public, anon, authenticated;
grant execute on function public.consume_api_key(text) to service_role;

-- Idempotently provision one key per Stripe Checkout Session. A repeated
-- webhook returns the original encrypted key rather than issuing a new one.
create or replace function public.provision_api_key_for_checkout(
  p_user_id uuid,
  p_customer_email text,
  p_key_hash text,
  p_tier text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_checkout_session_id text,
  p_key_ciphertext text,
  p_key_iv text,
  p_key_auth_tag text
)
returns table (
  id uuid,
  customer_email text,
  key_ciphertext text,
  key_iv text,
  key_auth_tag text,
  key_delivered_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_tier not in ('free', 'pro') then
    raise exception 'Invalid API tier';
  end if;

  insert into public.api_keys (
    user_id,
    customer_email,
    key_hash,
    tier,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_checkout_session_id,
    key_ciphertext,
    key_iv,
    key_auth_tag
  )
  values (
    p_user_id,
    p_customer_email,
    p_key_hash,
    p_tier,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_checkout_session_id,
    p_key_ciphertext,
    p_key_iv,
    p_key_auth_tag
  )
  on conflict (stripe_checkout_session_id) do nothing;

  return query
    select k.id, k.customer_email, k.key_ciphertext, k.key_iv,
           k.key_auth_tag, k.key_delivered_at
      from public.api_keys as k
     where k.stripe_checkout_session_id = p_stripe_checkout_session_id;
end;
$$;

revoke all on function public.provision_api_key_for_checkout(
  uuid, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.provision_api_key_for_checkout(
  uuid, text, text, text, text, text, text, text, text, text
) to service_role;

-- A short lease prevents simultaneous Stripe retry deliveries from racing.
-- A failed email can be retried after the five-minute claim window.
create or replace function public.claim_api_key_delivery(
  p_checkout_session_id text
)
returns table (
  delivery_state text,
  id uuid,
  customer_email text,
  key_ciphertext text,
  key_iv text,
  key_auth_tag text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_key public.api_keys%rowtype;
begin
  select k.*
    into v_key
    from public.api_keys as k
   where k.stripe_checkout_session_id = p_checkout_session_id
   for update;

  if not found then
    return query
      select 'missing'::text, null::uuid, null::text,
             null::text, null::text, null::text;
    return;
  end if;

  if v_key.key_delivered_at is not null then
    return query
      select 'delivered'::text, v_key.id, v_key.customer_email,
             null::text, null::text, null::text;
    return;
  end if;

  if v_key.key_delivery_claimed_at is not null
     and v_key.key_delivery_claimed_at > now() - interval '5 minutes'
  then
    return query
      select 'busy'::text, v_key.id, v_key.customer_email,
             null::text, null::text, null::text;
    return;
  end if;

  update public.api_keys as k
     set key_delivery_claimed_at = now()
   where k.id = v_key.id
   returning k.* into v_key;

  return query
    select 'claimed'::text, v_key.id, v_key.customer_email,
           v_key.key_ciphertext, v_key.key_iv, v_key.key_auth_tag;
end;
$$;

revoke all on function public.claim_api_key_delivery(text)
  from public, anon, authenticated;
grant execute on function public.claim_api_key_delivery(text)
  to service_role;

-- The REST API exposes this table/function only to service_role.
notify pgrst, 'reload schema';
