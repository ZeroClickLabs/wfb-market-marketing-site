import { notFound } from "next/navigation";
import { requireVendor } from "@/lib/auth";
import { Badge, Notice } from "@/components/wfb";
import { FactList } from "@/components/site/Blocks";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { PageHeader, Panel, StatusBadge, dateLabel, hoursLabel } from "@/components/portal/ui";
import { RespondForm } from "@/components/portal/RespondForm";
import { Markdown } from "@/components/portal/Markdown";
import { getDate, listGuides } from "@/lib/portal/data";
import { formatTime, isPast } from "@/content/format";
import type { Fact } from "@/content/types";

export const metadata = { title: "Market date" };

export default async function DatePage({ params }: PageProps<"/portal/calendar/[id]">) {
  const user = await requireVendor();
  const { id } = await params;
  const date = await getDate(id);
  if (!date) notFound();
  const guides = await listGuides(date.market.id);
  const past = isPast(date.date);

  const facts: Fact[] = [
    { icon: "clock", label: "Market hours", value: hoursLabel(date) },
    { icon: "basket", label: "Load-in", value: `From ${formatTime(date.loadInAt)}` },
    { icon: "tent", label: "Teardown", value: `Packed up by ${formatTime(date.teardownBy)}` },
    {
      icon: "map-pin",
      label: "Location",
      value: (
        <>
          {date.location}
          {date.address ? <span className="block text-[15px] font-normal text-ink-muted">{date.address}</span> : null}
          {date.mapUrl ? <a className="brand-link text-[15px]" href={date.mapUrl}>Open in Maps</a> : null}
        </>
      ),
    },
    ...(date.contactName ? [{ icon: "info" as const, label: "Day-of contact", value: <>{date.contactName}{date.contactPhone ? <a className="brand-link block text-[15px]" href={`tel:${date.contactPhone.replace(/[^\d+]/g, "")}`}>{date.contactPhone}</a> : null}</> }] : []),
  ];

  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/calendar">
      <PageHeader eyebrow={date.market.name} title={dateLabel(date)} back={{ href: "/portal/calendar", label: "Calendar" }}>
        <StatusBadge date={date} />
        {date.stall ? <Badge tone="info" icon="tent">Stall {date.stall}</Badge> : <Badge tone="neutral" icon="tent">Stall assigned closer to the date</Badge>}
      </PageHeader>

      {date.dateStatus === "cancelled" ? <Notice tone="danger" title="This market is cancelled" className="mb-5">We&rsquo;ve posted an update with the details.</Notice> : null}
      {date.dateStatus === "moved" ? <Notice tone="warning" title="This market has moved" className="mb-5">Check the time and location below.</Notice> : null}

      <FactList facts={facts} className="mb-6" />

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          {date.vendorNotes ? (
            <Panel title="From the Market">
              <Markdown>{date.vendorNotes}</Markdown>
            </Panel>
          ) : null}
          {guides.length ? (
            <Panel title="Setup and teardown">
              <div className="grid grid-cols-1 gap-2">
                {guides.map((g, i) => (
                  <details key={g.id} open={i === 0} className="group rounded-md border-2 border-ink bg-canvas">
                    <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-sans text-[17px] font-extrabold [&::-webkit-details-marker]:hidden">
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

        {!past && date.dateStatus !== "cancelled" ? (
          <Panel title="Your reply" className="bg-corn-tint max-desktop:order-first">
            <RespondForm ids={[date.id]} current={date.status} variant="full" note={date.vendorNote} />
          </Panel>
        ) : null}
      </div>
    </PortalFrame>
  );
}
