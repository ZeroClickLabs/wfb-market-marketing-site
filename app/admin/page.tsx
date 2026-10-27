import { requireAdmin } from "@/lib/auth";
import { Button, Icon } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { AdminTable, CountsBar, CountsLine, DateStub, EmptyState, PageHeader, Panel, dateLabel, hoursLabel } from "@/components/portal/ui";
import { dashboard, listTasksDue } from "@/lib/portal/data";
import { formatDate, todayISO } from "@/content/format";

export default async function AdminHome() {
  const user = await requireAdmin();
  const today = todayISO();
  const weekOut = new Date(Date.parse(`${today}T12:00:00Z`) + 7 * 864e5).toISOString().slice(0, 10);
  const [d, due] = await Promise.all([dashboard(today), listTasksDue(weekOut)]);
  const tiles = [
    { n: d.newApplications, label: d.newApplications === 1 ? "new application" : "new applications", href: "/admin/applications" },
    { n: d.pendingProfiles.length, label: d.pendingProfiles.length === 1 ? "profile to review" : "profiles to review", href: "/admin/vendors?review=1" },
    { n: d.invitedNoLogin.length, label: "invited, not logged in yet", href: "/admin/vendors?status=approved" },
    { n: d.leads, label: d.leads === 1 ? "lead to follow up" : "leads to follow up", href: "/admin/vendors?status=lead" },
  ];

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin">
      <PageHeader eyebrow={`Hi, ${user.fullName?.split(" ")[0] ?? "there"}`} title="Dashboard" lead="What needs you this week." />

      <ul className="m-0 mb-6 grid list-none grid-cols-4 gap-4 p-0 max-desktop:grid-cols-2 max-phone:grid-cols-1">
        {tiles.map((t) => (
          <li key={t.href}>
            <SmartLink href={t.href} className="flex h-full items-center gap-4 rounded-lg border-3 border-ink bg-paper px-5 py-4 text-ink no-underline shadow-print-sm hover:bg-kraft">
              <span className="font-display text-[52px] leading-[48px]">{t.n}</span>
              <span className="font-sans text-[15px] leading-[20px] font-bold">{t.label}</span>
            </SmartLink>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          <Panel title="Next market">
            {d.next ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4">
                  <DateStub date={d.next.date} kind={d.next.market.kind} />
                  <div>
                    <p className="m-0 font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink-muted">{d.next.market.name}</p>
                    <p className="m-0 font-sans text-[20px] leading-[28px] font-extrabold">{dateLabel(d.next)}</p>
                    <p className="m-0 font-sans text-[15px] text-ink-muted">{hoursLabel(d.next)} · {d.next.location}</p>
                  </div>
                </div>
                <CountsBar counts={d.next.counts} />
                <div>
                  <Button href={`/admin/markets/${d.next.market.id}/${d.next.id}`} variant="outline" size="sm" iconAfter="arrow-right">Open roster</Button>
                </div>
              </div>
            ) : (
              <EmptyState title="No upcoming dates">Add dates to a market to start inviting vendors.</EmptyState>
            )}
          </Panel>

          <section aria-labelledby="coming-up">
            <h2 id="coming-up" className="mt-0 mb-3 font-display text-[28px] leading-[30px] font-normal uppercase tracking-[.02em]">Coming up</h2>
            {d.needsReply.length ? (
              <AdminTable label="Upcoming market dates" head={["Date", "Market", "Replies", ""]}>
                {d.needsReply.map((x) => (
                  <tr key={x.id}>
                    <td className="font-bold whitespace-nowrap">{dateLabel(x)}</td>
                    <td>{x.market.name}</td>
                    <td><CountsLine counts={x.counts} /></td>
                    <td className="text-right"><SmartLink href={`/admin/markets/${x.market.id}/${x.id}`} className="tap-target brand-link font-bold">Roster</SmartLink></td>
                  </tr>
                ))}
              </AdminTable>
            ) : (
              <EmptyState title="No dates coming up">Add dates on a market&rsquo;s page.</EmptyState>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Panel title="Recent updates" action={<SmartLink href="/admin/updates" className="tap-target brand-link font-sans text-[15px] font-bold">All updates</SmartLink>}>
            <ul className="m-0 grid list-none gap-3 p-0">
              {d.updates.map((u) => {
                const read = u.recipients.filter((r) => r.readAt).length;
                return (
                  <li key={u.id} className="rounded-md border-2 border-ink bg-canvas px-4 py-3">
                    <p className="m-0 font-sans text-[16px] leading-[22px] font-extrabold">{u.title}</p>
                    <p className="m-0 mt-1 font-sans text-[14px] text-ink-muted">{u.audienceLabel} · read by {read} of {u.recipients.length}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <Button href="/admin/updates/new" variant="accent" size="sm" icon="mail">Write an update</Button>
            </div>
          </Panel>
          {due.length ? (
            <Panel title="Event tasks due this week">
              <ul className="m-0 grid list-none gap-2 p-0">
                {due.map((t) => (
                  <li key={t.id}>
                    <SmartLink href={`/admin/markets/${t.marketId}#tasks`} className="block rounded-md border-2 border-ink bg-canvas px-4 py-2.5 text-ink no-underline hover:bg-kraft">
                      <span className="block font-sans text-[15px] leading-[21px] font-bold">{t.title}</span>
                      <span className="block font-sans text-[13px] text-ink-muted">
                        {t.marketName} · {t.owner === "market" ? "The Market" : "Partner"} · {t.dueDate! < today ? "overdue" : "due"} {formatDate(t.dueDate!)}
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
          {d.pendingProfiles.length ? (
            <Panel title="Profiles to review">
              <ul className="m-0 grid list-none gap-2 p-0">
                {d.pendingProfiles.map((v) => (
                  <li key={v.id}>
                    <SmartLink href={`/admin/vendors/${v.id}`} className="flex min-h-[44px] items-center justify-between gap-3 rounded-md border-2 border-ink bg-canvas px-4 py-2 font-sans text-[15px] font-bold text-ink no-underline hover:bg-kraft">
                      {v.name}
                      <Icon name="arrow-right" size={18} />
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </PortalFrame>
  );
}
