-- Indexes for foreign keys the database advisor flagged (deletes on auth.users and lookups by author).
create index if not exists event_notes_author_id_idx on public.event_notes (author_id);
create index if not exists event_tasks_created_by_idx on public.event_tasks (created_by);
create index if not exists event_tasks_done_by_idx on public.event_tasks (done_by);
create index if not exists updates_author_id_idx on public.updates (author_id);
create index if not exists vendor_applications_reviewed_by_idx on public.vendor_applications (reviewed_by);
create index if not exists vendor_contacts_user_id_idx on public.vendor_contacts (user_id);
create index if not exists vendor_notes_author_id_idx on public.vendor_notes (author_id);
