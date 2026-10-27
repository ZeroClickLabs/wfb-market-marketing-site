import { notFound } from "next/navigation";
import { requirePartner } from "@/lib/auth";
import { Button, Notice } from "@/components/wfb";
import { FactList } from "@/components/site/Blocks";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { PageHeader, Panel, dateLabel, hoursLabel } from "@/components/portal/ui";
import { Roster } from "@/components/portal/Roster";
import { AdminForm } from "@/components/portal/AdminForm";
import { Markdown } from "@/components/portal/Markdown";
import { logisticsFormFields } from "@/components/portal/logistics";
import { saveLogisticsAction, setPartnerStallAction } from "@/app/partner/actions";
import { getPartnerRoster, listMarketGuides } from "@/lib/portal/data";
import { formatTime } from "@/content/format";
import type { Fact } from "@/content/types";

export const metadata = { title: "Market date" };

export default async function PartnerDate({ params }: PageProps<"/partner/[marketId]/dates/[dateId]">) {
  const { marketId, dateId } = await params;
  const { user } = await requirePartner(marketId);
  const [roster, guides] = await Promise.all([getPartnerRoster(marketId, dateId), listMarketGuides(marketId)]);
  if (!roster) notFound();
  const { date, counts } = roster;
  const base = `/partner/${marketId}/dates/${dateId}`;
  const facts: Fact[] = [
    { icon: "clock", label: "Open to shoppers", value: hoursLabel(date) },
    { icon: "basket", label: "Vendor load-in", value: `From ${formatTime(date.loadInAt)}` },
    { icon: "tent", label: "Teardown", value: `Packed up by ${formatTime(date.teardownBy)}` },
    { icon: "map-pin", label: "Location", value: <>{date.location}{date.address ? <span className="block text-[15px] font-normal text-ink-muted">{date.address}</span> : null}</> },
    ...(date.contactName ? [{ icon: "info" as const, label: "Day-of contact", value: <>{date.contactName}{date.contactPhone ? <span className="block text-[15px] font-normal">{date.contactPhone}</span> : null}</> }] : []),
  ];

  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/dates`}>
      <PageHeader eyebrow={date.market.name} title={dateLabel(date)} back={{ href: `/partner/${marketId}/dates`, label: "Dates" }} />
      {date.dateStatus === "cancelled" ? <Notice tone="danger" title="This date is cancelled" className="mb-5">The Market has let vendors know.</Notice> : null}

      <FactList facts={facts} className="mb-6" />

      <section aria-labelledby="vendors" className="mb-6">
        <h2 id="vendors" className="mt-0 mb-3 font-display text-[28px] leading-[30px] font-normal uppercase tracking-[.02em]">Vendors and stalls</h2>
        <Roster
          date={date}
          rows={roster.rows}
          counts={counts}
          stallAction={setPartnerStallAction}
          hidden={{ marketId }}
          actions={<Button href={`${base}/roster.csv`} variant="outline" size="sm">Download CSV</Button>}
        />
      </section>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <Panel title="Logistics" id="logistics">
          <p className="mt-0 font-sans text-[15px] leading-[22px] text-ink-muted">Vendors see these on this date&rsquo;s page in their portal. Post an update too if anything changes close to the day.</p>
          <AdminForm
            action={saveLogisticsAction}
            submitLabel="Save logistics"
            fields={[{ kind: "hidden", name: "marketId", value: marketId }, { kind: "hidden", name: "dateId", value: dateId }, ...logisticsFormFields(date)]}
          />
        </Panel>
        {guides.length ? (
          <Panel title="Guides vendors see">
            <div className="grid grid-cols-1 gap-2">
              {guides.map((g) => (
                <details key={g.id} className="group rounded-md border-2 border-ink bg-canvas">
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-sans text-[16px] font-extrabold [&::-webkit-details-marker]:hidden">
                    {g.title}
                    <span aria-hidden="true" className="font-display text-[26px] leading-none transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                  </summary>
                  <div className="border-0 border-t-2 border-dashed border-border-control px-4 py-3">
                    <Markdown>{g.body}</Markdown>
                  </div>
                </details>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </PortalFrame>
  );
}
