import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { AdminTable, CountsLine, EmptyState, Flash, PageHeader, Panel, VendorStatusBadge, dateLabel, fmtDateTime, hoursLabel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { logisticsFormFields } from "@/components/portal/logistics";
import { EventPlanning } from "@/components/portal/EventPlanning";
import { Button } from "@/components/wfb";
import {
  addDatesAction, addEventNoteAction, addPartnerAction, addTaskAction, deleteTaskAction, invitePartnerAction, inviteToMarketAction, removePartnerAction, toggleTaskAction,
} from "@/app/admin/actions";
import { getMarket, listEventNotes, listMarketPartners, listTasks, listVendors } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";
import { todayISO } from "@/content/format";

export const metadata = { title: "Market" };

export default async function MarketPage({ params, searchParams }: PageProps<"/admin/markets/[id]">) {
  const user = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [found, allVendors, partners, tasks, notes] = await Promise.all([getMarket(id), listVendors(), listMarketPartners(id), listTasks(id), listEventNotes(id)]);
  if (!found) notFound();
  const partnerOrg = partners[0]?.organisation ?? "The partner";
  const { market, dates, vendors } = found;
  const today = todayISO();
  const upcoming = dates.filter((d) => d.date >= today);
  const past = dates.length - upcoming.length;
  const last = dates.at(-1);
  const invitable = allVendors.filter((v) => !v.marketIds.includes(market.id) && v.status !== "declined" && v.status !== "inactive");

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/markets">
      <PageHeader eyebrow="Market" title={market.name} back={{ href: "/admin/markets", label: "Markets" }} />
      <Flash done={sp.done} demo={isPortalDemo()} />

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          <section aria-labelledby="dates">
            <h2 id="dates" className="mt-0 mb-3 font-display text-[28px] leading-[30px] font-normal uppercase tracking-[.02em]">Dates</h2>
            {upcoming.length ? (
              <AdminTable label={`${market.name} dates`} head={["Date", "Hours", "Replies", ""]}>
                {upcoming.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap">
                      <SmartLink href={`/admin/markets/${market.id}/${d.id}`} className="tap-target font-extrabold text-ink underline decoration-2 underline-offset-2 hover:text-bay">{dateLabel(d)}</SmartLink>
                      {d.dateStatus !== "scheduled" ? <Badge tone={d.dateStatus === "cancelled" ? "danger" : "warning"} className="ml-2">{d.dateStatus === "cancelled" ? "Cancelled" : "Moved"}</Badge> : null}
                    </td>
                    <td className="whitespace-nowrap">{hoursLabel(d)}</td>
                    <td><CountsLine counts={d.counts} /></td>
                    <td className="text-right"><SmartLink href={`/admin/markets/${market.id}/${d.id}`} className="tap-target brand-link font-bold">Roster</SmartLink></td>
                  </tr>
                ))}
              </AdminTable>
            ) : (
              <EmptyState title="No upcoming dates">Add them below.</EmptyState>
            )}
            {past ? <p className="mt-2 mb-0 font-sans text-[14px] text-ink-muted">{past} past {past === 1 ? "date" : "dates"} not shown.</p> : null}
          </section>

          <Panel title="Add dates">
            <AdminForm
              action={addDatesAction}
              submitLabel="Add dates"
              fields={[
                { kind: "hidden", name: "marketId", value: market.id },
                { kind: "date", name: "date", label: "Date", required: true, half: true },
                { kind: "date", name: "until", label: "Repeat weekly until (optional)", hint: "Leave empty for a one-off event.", half: true },
                ...logisticsFormFields(last),
              ]}
            />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Panel title="Event partners" action={partners.length ? <SmartLink href={`/partner/${market.id}`} className="tap-target brand-link font-sans text-[15px] font-bold">See their view</SmartLink> : undefined}>
            <p className="mt-0 font-sans text-[15px] leading-[22px] text-ink-muted">
              People from a partner organisation, like the venue, who co-manage this event. They see its dates, vendors and contacts, set stalls, edit logistics and write to its vendors. They never see the rest of the CRM.
            </p>
            {partners.length ? (
              <ul className="m-0 mb-4 grid list-none gap-3 p-0">
                {partners.map((p) => (
                  <li key={p.id} className="grid gap-2 rounded-md border-2 border-ink bg-canvas px-4 py-3">
                    <div>
                      <p className="m-0 font-sans text-[16px] font-extrabold">{p.name} <span className="font-normal text-ink-muted">· {p.organisation}</span></p>
                      <p className="m-0 font-sans text-[14px] break-all text-ink-muted">{p.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.hasLogin ? <Badge tone="success" icon="check-circle">Has logged in</Badge> : p.invitedAt ? <Badge tone="info" icon="mail">Invited {fmtDateTime(p.invitedAt)}</Badge> : <Badge tone="neutral">Not invited</Badge>}
                      {!p.hasLogin ? (
                        <form action={invitePartnerAction}>
                          <input type="hidden" name="marketId" value={market.id} />
                          <input type="hidden" name="partnerId" value={p.id} />
                          <Button type="submit" variant={p.invitedAt ? "link" : "primary"} size="sm" icon={p.invitedAt ? undefined : "mail"}>{p.invitedAt ? "Resend invite" : "Invite"}</Button>
                        </form>
                      ) : null}
                      <form action={removePartnerAction}>
                        <input type="hidden" name="marketId" value={market.id} />
                        <input type="hidden" name="partnerId" value={p.id} />
                        <Button type="submit" variant="link" size="sm">Remove access</Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <details className="rounded-md border-2 border-dashed border-border-control px-4 py-2 open:pb-4" open={partners.length === 0}>
              <summary className="min-h-[44px] cursor-pointer py-2.5 font-sans text-[15px] font-extrabold">Add a partner</summary>
              <div className="mt-2">
                <AdminForm
                  action={addPartnerAction}
                  submitLabel="Add partner"
                  fields={[
                    { kind: "hidden", name: "marketId", value: market.id },
                    { kind: "text", name: "name", label: "Name", autoComplete: "off" },
                    { kind: "email", name: "email", label: "Email", hint: "Their login and invite go here.", autoComplete: "off" },
                    { kind: "text", name: "organisation", label: "Organisation", placeholder: "e.g. The Argo", hint: "Vendors see updates from them as “From …”.", autoComplete: "off" },
                  ]}
                />
              </div>
            </details>
          </Panel>

          <Panel title={`Vendors (${vendors.length})`}>
            {vendors.length ? (
              <ul className="m-0 mb-5 grid list-none gap-2 p-0">
                {vendors.map((v) => (
                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border-2 border-ink bg-canvas px-4 py-2.5">
                    <SmartLink href={`/admin/vendors/${v.id}`} className="tap-target font-sans text-[16px] font-extrabold text-ink no-underline hover:underline">{v.name}</SmartLink>
                    <VendorStatusBadge status={v.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-0 font-sans text-[15px] text-ink-muted">No vendors yet.</p>
            )}
            {invitable.length ? (
              <AdminForm
                action={inviteToMarketAction}
                submitLabel="Invite to market"
                fields={[
                  { kind: "hidden", name: "marketId", value: market.id },
                  { kind: "checkboxes", name: "vendorIds", label: "Invite more vendors", hint: "They're invited to every upcoming date and can reply in the portal.", options: invitable.map((v) => ({ value: v.id, label: v.name })) },
                ]}
              />
            ) : null}
          </Panel>
        </div>
      </div>

      <section aria-labelledby="planning" className="mt-7">
        <h2 id="planning" className="mt-0 mb-1 font-display text-[36px] leading-[38px] font-normal uppercase tracking-[.02em]">Planning</h2>
        <p className="mt-0 mb-4 max-w-(--prose-max) font-sans text-[16px] leading-[25px] text-ink-muted">
          {partners.length ? `Shared with ${partnerOrg}. Vendors don't see these.` : "Your checklist and notes for this market. Add an event partner to share them."}
        </p>
        <EventPlanning
          marketId={market.id}
          side="market"
          partnerOrg={partnerOrg}
          tasks={tasks}
          notes={notes}
          toggleTask={toggleTaskAction}
          deleteTask={deleteTaskAction}
          addTask={addTaskAction}
          addNote={addEventNoteAction}
        />
      </section>
    </PortalFrame>
  );
}
