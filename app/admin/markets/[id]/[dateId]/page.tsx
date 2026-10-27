import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Button, Notice } from "@/components/wfb";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { Flash, PageHeader, Panel, dateLabel, hoursLabel } from "@/components/portal/ui";
import { Roster } from "@/components/portal/Roster";
import { remindAction, saveDateLogisticsAction, setDateStatusAction, setStallAction } from "@/app/admin/actions";
import { AdminForm } from "@/components/portal/AdminForm";
import { logisticsFormFields } from "@/components/portal/logistics";
import { getRoster } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";
import { formatTime } from "@/content/format";

export const metadata = { title: "Roster" };

export default async function RosterPage({ params, searchParams }: PageProps<"/admin/markets/[id]/[dateId]">) {
  const user = await requireAdmin();
  const [{ id, dateId }, sp] = await Promise.all([params, searchParams]);
  const roster = await getRoster(dateId);
  if (!roster || roster.date.market.id !== id) notFound();
  const { date, counts } = roster;
  const back = `/admin/markets/${id}/${dateId}`;

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/markets">
      <PageHeader eyebrow={date.market.name} title={dateLabel(date)} back={{ href: `/admin/markets/${id}`, label: date.market.name }} lead={`${hoursLabel(date)} · load-in from ${formatTime(date.loadInAt)} · ${date.location}`} />
      <Flash done={sp.done} n={sp.n} demo={isPortalDemo()} />
      {date.dateStatus === "cancelled" ? <Notice tone="danger" title="This date is cancelled" className="mb-5">Vendors see it as cancelled in the portal.</Notice> : null}

      <Roster
        date={date}
        rows={roster.rows}
        counts={counts}
        stallAction={setStallAction}
        vendorHref={(vendorId) => `/admin/vendors/${vendorId}`}
        actions={
          <>
            {counts.invited && date.dateStatus !== "cancelled" ? (
              <form action={remindAction}>
                <input type="hidden" name="dateId" value={dateId} />
                <input type="hidden" name="back" value={back} />
                <Button type="submit" variant="primary" size="sm" icon="mail">Remind {counts.invited} {counts.invited === 1 ? "vendor" : "vendors"}</Button>
              </form>
            ) : null}
            <Button href={`${back}/roster.csv`} variant="outline" size="sm">Download CSV</Button>
          </>
        }
      />

      <Panel title="Logistics" id="logistics" className="mt-6 max-w-[820px]">
        <AdminForm
          action={saveDateLogisticsAction}
          submitLabel="Save logistics"
          fields={[{ kind: "hidden", name: "marketId", value: id }, { kind: "hidden", name: "dateId", value: dateId }, ...logisticsFormFields(date)]}
        />
      </Panel>

      <Panel title="Change this date" className="mt-6 max-w-[820px]">
        <p className="mt-0 font-sans text-[15px] leading-[22px] text-ink-muted">Weather, a venue change? Mark it here so vendors see it, then post an update with the details.</p>
        <form action={setDateStatusAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="dateId" value={dateId} />
          <input type="hidden" name="back" value={back} />
          {date.dateStatus !== "cancelled" ? <Button type="submit" name="status" value="cancelled" variant="outline" size="sm" icon="x-circle">Cancel this date</Button> : null}
          {date.dateStatus !== "moved" ? <Button type="submit" name="status" value="moved" variant="outline" size="sm">Mark as moved</Button> : null}
          {date.dateStatus !== "scheduled" ? <Button type="submit" name="status" value="scheduled" variant="outline" size="sm">Back on as planned</Button> : null}
          <Button href="/admin/updates/new" variant="link" size="sm">Write an update</Button>
        </form>
      </Panel>
    </PortalFrame>
  );
}
