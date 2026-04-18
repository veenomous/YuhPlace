-- Migration 026: Home Services + Verified Partner
-- Adds the diaspora "home concierge" request flow and a verified-partner
-- attribution on profiles (e.g. the anchor real-estate partner).

-- ── Verified partner columns on profiles ─────────────────────────────────────
alter table public.profiles
  add column if not exists is_verified_partner boolean not null default false,
  add column if not exists partner_name text,
  add column if not exists partner_logo_url text;

comment on column public.profiles.is_verified_partner is
  'Profile is a YuhPlace verified partner (e.g. anchor real-estate company). Shown as a badge on their listings and usable as viewing/service provider.';

-- ── Home service requests ────────────────────────────────────────────────────
create type home_service_type as enum (
  'property_viewing',
  'grocery_delivery',
  'handyman',
  'other'
);

create type home_service_status as enum (
  'new',
  'assigned',
  'in_progress',
  'completed',
  'cancelled'
);

create table if not exists public.home_service_requests (
  id uuid primary key default gen_random_uuid(),

  -- Requester: diaspora users may not have a YuhPlace account yet, so we accept
  -- raw contact details and optionally link to a profile.
  requester_user_id uuid references public.profiles(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  requester_whatsapp text,
  requester_location text,                      -- e.g. "New York, NY" or "Toronto"

  service_type home_service_type not null,
  target_region_id uuid references public.regions(id) on delete set null,
  target_property_id uuid references public.property_listings(id) on delete set null,

  details text not null,

  status home_service_status not null default 'new',
  assigned_partner_id uuid references public.profiles(id) on delete set null,
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_home_service_requests_status
  on public.home_service_requests (status, created_at desc);

create index if not exists idx_home_service_requests_target_property
  on public.home_service_requests (target_property_id);

-- updated_at trigger
create or replace function public.touch_home_service_requests()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_home_service_requests on public.home_service_requests;
create trigger trg_touch_home_service_requests
  before update on public.home_service_requests
  for each row execute function public.touch_home_service_requests();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.home_service_requests enable row level security;

-- Anyone (including anon) can insert a request. This is the diaspora entry
-- point — we don't want to force signup before first contact.
drop policy if exists "home_service_requests_insert_anyone"
  on public.home_service_requests;
create policy "home_service_requests_insert_anyone"
  on public.home_service_requests
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated users can read their own requests.
drop policy if exists "home_service_requests_select_own"
  on public.home_service_requests;
create policy "home_service_requests_select_own"
  on public.home_service_requests
  for select
  to authenticated
  using (
    requester_user_id = auth.uid()
    or assigned_partner_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Admins and the assigned partner can update.
drop policy if exists "home_service_requests_update_partner_admin"
  on public.home_service_requests;
create policy "home_service_requests_update_partner_admin"
  on public.home_service_requests
  for update
  to authenticated
  using (
    assigned_partner_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    assigned_partner_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
