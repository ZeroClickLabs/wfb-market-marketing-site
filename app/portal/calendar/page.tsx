import { requireVendor } from "@/lib/auth";
import { Badge, Icon } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { DateStub, EmptyState, PageHeader, Panel, StatusBadge, dateLabel, hoursLabel } from "@/components/portal/ui";
import { RespondForm } from "@/components/portal/RespondForm";
import { listDates } from "@/lib/portal/data";
import type { PortalDate, PortalMarket } from "@/lib/portal/types";
import { todayISO } from "@/content/format";

export const metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const user = await requireVendor();
  const today = todayISO();
  const dates = (await listDates()).filter((d) => d.date >= today);

  // One group per market, in the order of each market's first date.
  const groups = new Map<string, { market: PortalMarket; dates: PortalDate[] }>();
  for (const d of dates) {
    const g = groups.get(d.market.id) ?? { market: d.market, dates: [] };
    g.dates.push(d);
    groups.set(d.market.id, g);
  }

  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/calendar">
      <PageHeader eyebrow="Your season" title="Calendar" lead="Every market date you're invited to. Let us know which ones you'll make, so we can plan the layout." />
      {groups.size === 0 ? <EmptyState title="No upcoming dates">We&rsquo;ll email you when you&rsquo;re invited to a market.</EmptyState> : null}
      <div className="grid grid-cols-1 gap-6">
        {[...groups.values()].map(({ market, dates }) => {
          const open = dates.filter((d) => d.status === "invited" && d.dateStatus !== "cancelled");
          const confirmed = dates.filter((d) => d.status === "confirmed").length;
          return (
            <Panel key={market.id} title={market.name}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-kraft px-4 py-3">
                <p className="m-0 font-sans text-[15px] leading-[22px] font-bold">
                  {confirmed} of {dates.length} confirmed{open.length ? ` · ${open.length} waiting for your reply` : ""}
                </p>
                {open.length > 1 ? <RespondForm ids={open.map((d) => d.id)} current="invited" confirmOnly confirmLabel={`Confirm all ${open.length}`} /> : null}
              </div>
              <ol className="m-0 grid list-none gap-0 p-0">
                {dates.map((d) => (
                  <li key={d.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 border-0 border-t-2 border-dashed border-border-control py-4 first:border-t-0 first:pt-0 max-tablet:grid-cols-[auto_minmax(0,1fr)]">
                    <DateStub date={d.date} kind={d.market.kind} />
                    <div className="min-w-0">
                      <SmartLink href={`/portal/calendar/${d.id}`} className="tap-target font-sans text-[17px] leading-[24px] font-extrabold text-ink no-underline hover:underline">
                        {dateLabel(d)}
                      </SmartLink>
                      <p className="m-0 font-sans text-[15px] leading-[22px] text-ink-muted">
                        {hoursLabel(d)}
                        {d.stall ? ` · Stall ${d.stall}` : ""}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <StatusBadge date={d} />
                        {d.vendorNote ? (
                          <Badge tone="neutral" icon="mail">Note sent</Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 max-tablet:col-span-2 max-tablet:justify-start">
                      {d.dateStatus !== "cancelled" ? <RespondForm ids={[d.id]} current={d.status} /> : null}
                      <SmartLink href={`/portal/calendar/${d.id}`} aria-label={`Details for ${dateLabel(d)}`} className="grid size-11 place-items-center rounded-full border-2 border-ink text-ink hover:bg-kraft">
                        <Icon name="arrow-right" size={18} />
                      </SmartLink>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          );
        })}
      </div>
    </PortalFrame>
  );
}
