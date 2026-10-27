-- Vendor profiles are reviewed before they're public. The vendors row holds the vendor's working copy;
-- published_profile is the approved snapshot the public Vendors page shows. Any vendor edit sets
-- profile_pending_review; an admin approving copies the working copy into published_profile.

alter table public.vendors
  add column published_profile jsonb,
  add column profile_pending_review boolean not null default false;

-- Admin notes show who wrote them.
alter table public.vendor_notes add column author_name text;

-- Vendors may edit their profile and contact details. Their edits always mark the profile for review;
-- they can't publish, approve, or change their status or payments.
create or replace function private.guard_vendor_update()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if private.acting_as_admin() then return new; end if;
  if new.status is distinct from old.status
     or new.source is distinct from old.source
     or new.profile_published is distinct from old.profile_published
     or new.published_profile is distinct from old.published_profile
     or new.stripe_account_id is distinct from old.stripe_account_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Vendors can only edit their profile and contact details.' using errcode = '42501';
  end if;
  new.profile_pending_review := true;
  return new;
end;
$$;
