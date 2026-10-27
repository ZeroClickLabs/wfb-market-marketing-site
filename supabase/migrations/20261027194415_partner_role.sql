-- Event partners (a venue's event manager, for example) get their own role. This is a migration of
-- its own because Postgres can't use a new enum value in the transaction that adds it.
alter type public.user_role add value if not exists 'partner';
