-- "partners read their update receipts" looked up public.updates from a policy on update_recipients,
-- while "vendors read their updates" looks up update_recipients from a policy on updates. Postgres
-- reports that loop as infinite recursion. Resolve the partner's update ids in a security definer
-- helper (private schema, not exposed) so the policy no longer re-enters RLS on updates.

create or replace function private.my_partner_update_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select u.id from public.updates u
  where u.audience_kind = 'market'
    and u.audience_market_id in (select market_id from public.market_partners where user_id = (select auth.uid()));
$$;

revoke all on function private.my_partner_update_ids() from public;
grant execute on function private.my_partner_update_ids() to authenticated;

drop policy "partners read their update receipts" on public.update_recipients;
create policy "partners read their update receipts" on public.update_recipients for select to authenticated
  using (update_id in (select private.my_partner_update_ids()));
