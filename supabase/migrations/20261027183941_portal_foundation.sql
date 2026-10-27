-- Vendor portal, Phase 1 foundation.
--
-- Access model
--   * Two roles, stored in public.profiles (never in user-editable auth metadata): admin and vendor.
--   * A vendor login belongs to one or more vendor businesses through public.vendor_members.
--   * Row-level security (RLS) is on for every table. Admins can read and write everything.
--     Vendors can read only their own business's rows, plus the markets, dates, guides, updates
--     and assets addressed to them, and can change only a few fields (enforced by guard triggers).
--   * Helper functions live in the unexposed "private" schema (Supabase security guidance).
--   * New tables are not exposed to the Data API automatically, so grants are explicit.
--   * Fees (Phase 2) and terminal sales (Phase 3) come in later migrations;
--     vendors.stripe_account_id is reserved for Phase 3.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------------------------
-- Types

create type public.user_role as enum ('admin', 'vendor');
create type public.vendor_status as enum ('lead', 'applied', 'approved', 'active', 'inactive', 'declined');
create type public.vendor_source as enum ('application', 'manual');
create type public.market_kind as enum ('summer', 'night', 'popup', 'winter');
create type public.date_status as enum ('scheduled', 'cancelled', 'moved');
create type public.participation_status as enum ('invited', 'confirmed', 'declined');
create type public.application_status as enum ('new', 'approved', 'declined');
create type public.audience_kind as enum ('all', 'market', 'vendors');
create type public.asset_kind as enum ('logo', 'social', 'poster', 'photo', 'other');
create type public.note_kind as enum ('note', 'email', 'call', 'meeting');

-- ---------------------------------------------------------------------------------------------
-- Tables

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'vendor',
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  status public.vendor_status not null default 'lead',
  source public.vendor_source not null default 'manual',
  categories text[] not null default '{}',
  town text,
  email text,
  phone text,
  website text,
  instagram text,
  -- Public profile, shown on the website's Vendors page once an admin publishes it.
  description text,
  products text[] not null default '{}',
  photo_path text,
  profile_published boolean not null default false,
  -- Phase 3: the vendor's Stripe Connect account.
  stripe_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_members (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email_updates boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (vendor_id, user_id)
);

-- People on file for a vendor. An invite is sent to a contact; when they log in they become a member.
create table public.vendor_contacts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  name text,
  email text not null check (position('@' in email) > 1),
  phone text,
  role text,
  is_primary boolean not null default false,
  invited_at timestamptz,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (vendor_id, email)
);

create table public.vendor_notes (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  kind public.note_kind not null default 'note',
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

-- Raw submissions from the public "Apply to sell" form (written server-side with the secret key).
create table public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors (id) on delete set null,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  town text,
  category text,
  products text,
  markets text[] not null default '{}',
  insurance_confirmed boolean not null default false,
  status public.application_status not null default 'new',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  kind public.market_kind not null default 'summer',
  description text,
  created_at timestamptz not null default now()
);

-- Which vendors take part in a market (a season's roster). Drives update audiences and invitations.
create table public.vendor_markets (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  market_id uuid not null references public.markets (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vendor_id, market_id)
);

-- One occurrence of a market: a one-off event, or one week of a recurring market.
create table public.market_dates (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  date date not null,
  opens_at time,
  closes_at time,
  load_in_at time,
  teardown_by time,
  location text,
  address text,
  map_url text,
  contact_name text,
  contact_phone text,
  vendor_notes text,
  status public.date_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market_id, date)
);

create table public.participation (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  market_date_id uuid not null references public.market_dates (id) on delete cascade,
  status public.participation_status not null default 'invited',
  stall text,
  vendor_note text,
  responded_at timestamptz,
  reminded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, market_date_id)
);

-- Setup and teardown instructions and FAQs. market_id null = applies to every market.
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references public.markets (id) on delete cascade,
  title text not null,
  body text not null default '',
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  audience_kind public.audience_kind not null default 'all',
  audience_market_id uuid references public.markets (id) on delete set null,
  pinned boolean not null default false,
  published_at timestamptz,
  emailed_at timestamptz,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The audience resolved when an update is published, with read receipts per vendor.
create table public.update_recipients (
  update_id uuid not null references public.updates (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  read_at timestamptz,
  primary key (update_id, vendor_id)
);

-- Marketing assets; files live in the private "assets" storage bucket. market_id null = all markets.
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  kind public.asset_kind not null default 'other',
  market_id uuid references public.markets (id) on delete set null,
  file_path text not null unique,
  file_size bigint,
  content_type text,
  created_at timestamptz not null default now()
);

-- Emails that become admins on their first login. RLS on with no policies and no grant to logged-in
-- users: only the server (secret key) and SQL can read or change it.
create table public.admin_allowlist (
  email text primary key check (email = lower(email))
);

-- Indexes for foreign keys and common lookups
create index on public.vendor_members (user_id);
create index on public.vendor_contacts (vendor_id);
create index on public.vendor_contacts (lower(email));
create index on public.vendor_notes (vendor_id, created_at desc);
create index on public.vendor_applications (status, created_at desc);
create index on public.vendor_applications (vendor_id);
create index on public.vendor_markets (market_id);
create index on public.market_dates (date);
create index on public.participation (market_date_id);
create index on public.guides (market_id);
create index on public.updates (published_at desc);
create index on public.updates (audience_market_id);
create index on public.update_recipients (vendor_id);
create index on public.assets (market_id);
create index on public.vendors (status);

-- ---------------------------------------------------------------------------------------------
-- Helpers (private schema, security definer so they can read past RLS without recursion)

create or replace function private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin');
$$;

-- The vendor businesses the signed-in user belongs to.
create or replace function private.my_vendor_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select vendor_id from public.vendor_members where user_id = (select auth.uid());
$$;

-- The markets the signed-in user's businesses take part in.
create or replace function private.my_market_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select vm.market_id
  from public.vendor_markets vm
  join public.vendor_members m on m.vendor_id = vm.vendor_id
  where m.user_id = (select auth.uid());
$$;

revoke all on function private.is_admin(), private.my_vendor_ids(), private.my_market_ids() from public;
grant execute on function private.is_admin(), private.my_vendor_ids(), private.my_market_ids() to authenticated;

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;

create trigger touch before update on public.vendors for each row execute function private.touch_updated_at();
create trigger touch before update on public.market_dates for each row execute function private.touch_updated_at();
create trigger touch before update on public.participation for each row execute function private.touch_updated_at();
create trigger touch before update on public.guides for each row execute function private.touch_updated_at();
create trigger touch before update on public.updates for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Guard triggers: what a vendor (non-admin) may change on rows RLS lets them update.
-- The secret-key server client has no auth.uid(), so it's treated like an admin here.

create or replace function private.acting_as_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is null or private.is_admin(); $$;

-- Vendors may edit their public profile and contact details, not their status, publishing or payments.
create or replace function private.guard_vendor_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.status is distinct from old.status
     or new.source is distinct from old.source
     or new.profile_published is distinct from old.profile_published
     or new.stripe_account_id is distinct from old.stripe_account_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Vendors can only edit their profile and contact details.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard before update on public.vendors for each row execute function private.guard_vendor_update();

-- Vendors may respond (status confirmed/declined, note); stalls and reminders are the Market's.
create or replace function private.guard_participation_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.vendor_id is distinct from old.vendor_id
     or new.market_date_id is distinct from old.market_date_id
     or new.stall is distinct from old.stall
     or new.reminded_at is distinct from old.reminded_at
     or new.status = 'invited' then
    raise exception 'Vendors can only confirm or decline, and leave a note.' using errcode = '42501';
  end if;
  new.responded_at := now();
  return new;
end;
$$;
create trigger guard before update on public.participation for each row execute function private.guard_participation_update();

-- Vendors may only mark an update as read.
create or replace function private.guard_recipient_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.update_id is distinct from old.update_id or new.vendor_id is distinct from old.vendor_id then
    raise exception 'Vendors can only mark updates as read.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard before update on public.update_recipients for each row execute function private.guard_recipient_update();

-- Vendors may only change their own email preference.
create or replace function private.guard_member_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.vendor_id is distinct from old.vendor_id or new.user_id is distinct from old.user_id then
    raise exception 'Vendors can only change their email preference.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard before update on public.vendor_members for each row execute function private.guard_member_update();

-- Profiles: nobody but an admin (or the server) changes a role.
create or replace function private.guard_profile_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.role is distinct from old.role or new.user_id is distinct from old.user_id or new.email is distinct from old.email then
    raise exception 'You can only change your name.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard before update on public.profiles for each row execute function private.guard_profile_update();

-- ---------------------------------------------------------------------------------------------
-- New logins: create the profile, make allowlisted emails admins, and link invited contacts
-- to their vendor businesses by email.

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  normalized text := lower(new.email);
begin
  insert into public.profiles (user_id, email, role)
  values (
    new.id,
    normalized,
    case when exists (select 1 from public.admin_allowlist a where a.email = normalized) then 'admin'::public.user_role else 'vendor'::public.user_role end
  )
  on conflict (user_id) do nothing;

  update public.vendor_contacts set user_id = new.id where lower(email) = normalized and user_id is null;

  insert into public.vendor_members (vendor_id, user_id)
  select distinct vendor_id, new.id from public.vendor_contacts where lower(email) = normalized
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------------------------
-- Row-level security

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_members enable row level security;
alter table public.vendor_contacts enable row level security;
alter table public.vendor_notes enable row level security;
alter table public.vendor_applications enable row level security;
alter table public.markets enable row level security;
alter table public.vendor_markets enable row level security;
alter table public.market_dates enable row level security;
alter table public.participation enable row level security;
alter table public.guides enable row level security;
alter table public.updates enable row level security;
alter table public.update_recipients enable row level security;
alter table public.assets enable row level security;
alter table public.admin_allowlist enable row level security;

-- Admins: everything, on every table.
create policy "admins manage profiles" on public.profiles for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage vendors" on public.vendors for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage members" on public.vendor_members for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage contacts" on public.vendor_contacts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage notes" on public.vendor_notes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage applications" on public.vendor_applications for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage markets" on public.markets for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage vendor markets" on public.vendor_markets for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage dates" on public.market_dates for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage participation" on public.participation for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage guides" on public.guides for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage updates" on public.updates for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage recipients" on public.update_recipients for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage assets" on public.assets for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Vendors: their own profile row.
create policy "read own profile" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Vendors: their own businesses (UPDATE also needs the SELECT policy).
create policy "members read their vendor" on public.vendors for select to authenticated using (id in (select private.my_vendor_ids()));
create policy "members update their vendor" on public.vendors for update to authenticated using (id in (select private.my_vendor_ids())) with check (id in (select private.my_vendor_ids()));

create policy "members read their team" on public.vendor_members for select to authenticated using (vendor_id in (select private.my_vendor_ids()));
create policy "members update own preference" on public.vendor_members for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "members read their contacts" on public.vendor_contacts for select to authenticated using (vendor_id in (select private.my_vendor_ids()));

-- Vendors: markets and dates they take part in.
create policy "vendors read their markets" on public.markets for select to authenticated using (id in (select private.my_market_ids()));
create policy "vendors read their market roster rows" on public.vendor_markets for select to authenticated using (vendor_id in (select private.my_vendor_ids()));
create policy "vendors read their dates" on public.market_dates for select to authenticated
  using (market_id in (select private.my_market_ids())
         or id in (select p.market_date_id from public.participation p where p.vendor_id in (select private.my_vendor_ids())));

create policy "vendors read own participation" on public.participation for select to authenticated using (vendor_id in (select private.my_vendor_ids()));
create policy "vendors respond to own participation" on public.participation for update to authenticated
  using (vendor_id in (select private.my_vendor_ids())) with check (vendor_id in (select private.my_vendor_ids()));

-- Vendors: published guides for all markets or theirs.
create policy "vendors read guides" on public.guides for select to authenticated
  using (published and (market_id is null or market_id in (select private.my_market_ids())));

-- Vendors: published updates addressed to them, and their own read receipts.
create policy "vendors read their updates" on public.updates for select to authenticated
  using (published_at is not null and published_at <= now()
         and id in (select r.update_id from public.update_recipients r where r.vendor_id in (select private.my_vendor_ids())));
create policy "vendors read own receipts" on public.update_recipients for select to authenticated using (vendor_id in (select private.my_vendor_ids()));
create policy "vendors mark updates read" on public.update_recipients for update to authenticated
  using (vendor_id in (select private.my_vendor_ids())) with check (vendor_id in (select private.my_vendor_ids()));

-- Vendors: assets for all markets or theirs.
create policy "vendors read assets" on public.assets for select to authenticated
  using (market_id is null or market_id in (select private.my_market_ids()));

-- ---------------------------------------------------------------------------------------------
-- Grants (tables are not exposed to the Data API by default). anon gets nothing: the public site
-- reads published vendor profiles server-side with the secret key, selecting public columns only.

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
revoke all on public.admin_allowlist from authenticated, anon;
grant usage on all sequences in schema public to authenticated, service_role;

-- ---------------------------------------------------------------------------------------------
-- Storage: private bucket for marketing assets (and, later, vendor photos under vendors/<id>/).

insert into storage.buckets (id, name, public, file_size_limit)
values ('assets', 'assets', false, 52428800)
on conflict (id) do nothing;

create policy "admins manage asset files" on storage.objects for all to authenticated
  using (bucket_id = 'assets' and (select private.is_admin()))
  with check (bucket_id = 'assets' and (select private.is_admin()));

-- Vendors can download a file only if they can see its asset row (RLS on public.assets applies).
create policy "vendors read their asset files" on storage.objects for select to authenticated
  using (bucket_id = 'assets' and exists (select 1 from public.assets a where a.file_path = storage.objects.name));
