-- Signed-out visitors (anon) never read portal tables through the Data API: the public site reads
-- published vendor profiles on the server with the secret key. RLS already returns no rows to anon;
-- this removes the table privileges too, now and for tables created later.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;
