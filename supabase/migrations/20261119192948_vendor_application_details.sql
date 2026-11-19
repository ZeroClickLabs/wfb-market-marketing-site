-- The public multi-step application at /apply asks for more than the original form did.
-- Rows are still written only server-side with the secret key; no public policies are added, so the
-- table stays admin-only under row-level security.

alter table public.vendor_applications
  add column instagram text,
  add column website text,
  -- Objects in the private "assets" bucket, under applications/<upload id>/. Admins read them through
  -- the existing "admins manage asset files" storage policy.
  add column photo_paths text[] not null default '{}',
  add column needs_power boolean,
  add column needs_vehicle boolean,
  add column stall_size text,
  add column other_markets text,
  add column years_selling text,
  add column tokens_agreed boolean not null default false;
