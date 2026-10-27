-- Event partner access: someone from a partner organisation (The Argo's event manager, say) who
-- co-manages one or more markets. They see their markets' dates, rosters, vendor contacts and
-- updates; they can set stalls, edit date logistics, post updates to their market's vendors, add
-- venue files, and share a task list and notes with the Market. They never see the vendor CRM.

-- ---------------------------------------------------------------------------------------------
-- Tables

-- Partner people per market: their access list and contact record. user_id is set on first login.
create table public.market_partners (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  name text not null,
  email text not null,
  organisation text not null,
  user_id uuid references auth.users (id) on delete set null,
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  unique (market_id, email)
);
create index market_partners_user_id on public.market_partners (user_id);
create index market_partners_email on public.market_partners (lower(email));

create type public.task_owner as enum ('market', 'partner');

-- The shared planning checklist for a market.
create table public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  title text not null,
  notes text,
  owner public.task_owner not null default 'market',
  due_date date,
  done_at timestamptz,
  done_by uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index event_tasks_market_id on public.event_tasks (market_id);

-- The shared notes thread for a market (separate from the admin-only vendor_notes).
create table public.event_notes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  author_org text,
  created_at timestamptz not null default now()
);
create index event_notes_market_id on public.event_notes (market_id);

-- Who wrote an update, shown to vendors as "From The Argo" when a partner posts it.
alter table public.updates
  add column author_role public.user_role,
  add column author_org text;

-- ---------------------------------------------------------------------------------------------
-- Helpers

-- The markets the signed-in user co-manages.
create or replace function private.my_partner_market_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select market_id from public.market_partners where user_id = (select auth.uid());
$$;

-- Whether the signed-in user co-manages the market a date belongs to.
create or replace function private.partners_date(date_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.market_dates d
    join public.market_partners p on p.market_id = d.market_id
    where d.id = date_id and p.user_id = (select auth.uid())
  );
$$;

revoke all on function private.my_partner_market_ids(), private.partners_date(uuid) from public;
grant execute on function private.my_partner_market_ids(), private.partners_date(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Guard triggers

-- Participation: partners may set stalls on their markets' dates and nothing else; vendors may
-- respond as before.
create or replace function private.guard_participation_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;

  if private.partners_date(old.market_date_id) and not (old.vendor_id in (select private.my_vendor_ids())) then
    if new.vendor_id is distinct from old.vendor_id
       or new.market_date_id is distinct from old.market_date_id
       or new.status is distinct from old.status
       or new.vendor_note is distinct from old.vendor_note
       or new.responded_at is distinct from old.responded_at
       or new.reminded_at is distinct from old.reminded_at then
      raise exception 'Event partners can only set stall numbers.' using errcode = '42501';
    end if;
    return new;
  end if;

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

-- Market dates: partners may edit logistics (times, place, contact, notes), not which market or day
-- it is, or whether it's cancelled.
create or replace function private.guard_market_date_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.market_id is distinct from old.market_id
     or new.date is distinct from old.date
     or new.status is distinct from old.status
     or new.created_at is distinct from old.created_at then
    raise exception 'Event partners can only edit times, location, contact and notes.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger guard before update on public.market_dates for each row execute function private.guard_market_date_update();

-- Updates: stamp who wrote them; partners may only address their own market.
create or replace function private.stamp_update_author()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then return new; end if; -- the server, already stamped
  if private.is_admin() then
    new.author_role := 'admin';
    new.author_org := null;
  else
    if new.audience_kind <> 'market' or new.audience_market_id is null
       or new.audience_market_id not in (select private.my_partner_market_ids()) then
      raise exception 'Event partners can only post to their own market''s vendors.' using errcode = '42501';
    end if;
    new.author_role := 'partner';
    new.author_org := (select organisation from public.market_partners
                       where user_id = (select auth.uid()) and market_id = new.audience_market_id limit 1);
  end if;
  new.author_id := (select auth.uid());
  return new;
end;
$$;
create trigger stamp_author before insert on public.updates for each row execute function private.stamp_update_author();

-- Tasks: nobody moves a task to another market; ticking one off records who and when.
create or replace function private.guard_task_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.market_id is distinct from old.market_id or new.created_by is distinct from old.created_by then
    raise exception 'A task stays with its market.' using errcode = '42501';
  end if;
  if new.done_at is not null and old.done_at is null then new.done_by := (select auth.uid()); end if;
  if new.done_at is null then new.done_by := null; end if;
  return new;
end;
$$;
create trigger guard before update on public.event_tasks for each row execute function private.guard_task_update();

-- ---------------------------------------------------------------------------------------------
-- New logins: admins (allowlist) first, then partners, then vendors. Partner rows are linked by email.

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
    case
      when exists (select 1 from public.admin_allowlist a where a.email = normalized) then 'admin'::public.user_role
      when exists (select 1 from public.market_partners p where lower(p.email) = normalized) then 'partner'::public.user_role
      else 'vendor'::public.user_role
    end
  )
  on conflict (user_id) do nothing;

  update public.market_partners set user_id = new.id where lower(email) = normalized and user_id is null;

  update public.vendor_contacts set user_id = new.id where lower(email) = normalized and user_id is null;

  insert into public.vendor_members (vendor_id, user_id)
  select distinct vendor_id, new.id from public.vendor_contacts where lower(email) = normalized
  on conflict do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Row-level security

alter table public.market_partners enable row level security;
alter table public.event_tasks enable row level security;
alter table public.event_notes enable row level security;

create policy "admins manage partners" on public.market_partners for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage tasks" on public.event_tasks for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins manage event notes" on public.event_notes for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Partners: their markets and the people co-managing them.
create policy "partners read their partner rows" on public.market_partners for select to authenticated
  using (market_id in (select private.my_partner_market_ids()));
create policy "partners read their markets" on public.markets for select to authenticated
  using (id in (select private.my_partner_market_ids()));

-- Partners: dates (read and edit logistics; the guard trigger limits the columns).
create policy "partners read their dates" on public.market_dates for select to authenticated
  using (market_id in (select private.my_partner_market_ids()));
create policy "partners edit their dates" on public.market_dates for update to authenticated
  using (market_id in (select private.my_partner_market_ids())) with check (market_id in (select private.my_partner_market_ids()));

-- Partners: the roster for their dates (read; set stalls via the guard trigger).
create policy "partners read their rosters" on public.participation for select to authenticated
  using ((select private.partners_date(market_date_id)));
create policy "partners set stalls" on public.participation for update to authenticated
  using ((select private.partners_date(market_date_id))) with check ((select private.partners_date(market_date_id)));

-- Partners: guides for every market or theirs.
create policy "partners read guides" on public.guides for select to authenticated
  using (published and (market_id is null or market_id in (select private.my_partner_market_ids())));

-- Partners: updates to their market (read, and post), and read receipts for those.
create policy "partners read their market updates" on public.updates for select to authenticated
  using (audience_kind = 'market' and audience_market_id in (select private.my_partner_market_ids()));
create policy "partners post to their market" on public.updates for insert to authenticated
  with check (audience_kind = 'market' and audience_market_id in (select private.my_partner_market_ids()));
create policy "partners read their update receipts" on public.update_recipients for select to authenticated
  using (update_id in (select u.id from public.updates u where u.audience_kind = 'market' and u.audience_market_id in (select private.my_partner_market_ids())));

-- Partners: their markets' files.
create policy "partners read their assets" on public.assets for select to authenticated
  using (market_id in (select private.my_partner_market_ids()));
create policy "partners add assets" on public.assets for insert to authenticated
  with check (market_id in (select private.my_partner_market_ids()));
create policy "partners remove assets" on public.assets for delete to authenticated
  using (market_id in (select private.my_partner_market_ids()));

-- Partners: the shared task list and notes.
create policy "partners manage their tasks" on public.event_tasks for all to authenticated
  using (market_id in (select private.my_partner_market_ids())) with check (market_id in (select private.my_partner_market_ids()));
create policy "partners read event notes" on public.event_notes for select to authenticated
  using (market_id in (select private.my_partner_market_ids()));
create policy "partners add event notes" on public.event_notes for insert to authenticated
  with check (market_id in (select private.my_partner_market_ids()) and author_id = (select auth.uid()));
create policy "authors edit own event notes" on public.event_notes for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "authors delete own event notes" on public.event_notes for delete to authenticated
  using (author_id = (select auth.uid()));

-- Partners get no access to vendors, vendor_contacts, vendor_notes or applications: those rows carry
-- CRM fields. The server reads names and contacts for their rosters with the secret key, after
-- checking they co-manage the market (lib/portal/data.ts).

grant select, insert, update, delete on public.market_partners, public.event_tasks, public.event_notes to authenticated;
grant all on public.market_partners, public.event_tasks, public.event_notes to service_role;

-- ---------------------------------------------------------------------------------------------
-- Storage: partners' venue files live under markets/<market id>/ in the assets bucket.

create policy "partners manage their market files" on storage.objects for all to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = 'markets'
         and (storage.foldername(name))[2] in (select m::text from private.my_partner_market_ids() m))
  with check (bucket_id = 'assets' and (storage.foldername(name))[1] = 'markets'
              and (storage.foldername(name))[2] in (select m::text from private.my_partner_market_ids() m));
