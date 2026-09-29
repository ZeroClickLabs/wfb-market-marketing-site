import { Badge, EventCard } from "@/components/wfb";
import { eventHref } from "@/content/events";
import { formatTimeRange } from "@/content/format";
import type { MarketEvent } from "@/content/types";

/** Event tickets in date order, two columns on desktop (guidelines/20). */
export function EventTickets({ events }: { events: MarketEvent[] }) {
  return (
    // min() keeps tickets from overflowing narrow phones; a lone ticket doesn't stretch across the page.
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-5 has-[>:only-child]:mx-auto has-[>:only-child]:max-w-[580px]">
      {events.map((e) => (
        <EventCard
          key={e.slug}
          date={e.date}
          market={e.market}
          eyebrow={e.eyebrow}
          title={e.title}
          time={formatTimeRange(e.start, e.end)}
          location={e.location}
          href={eventHref(e)}
          status={
            e.status ? <Badge tone={e.status.tone === "info" ? "info" : e.status.tone} icon={e.status.tone === "danger" ? "x-circle" : "alert"}>{e.status.title}</Badge>
            : e.rainOrShine ? <Badge tone="success" icon="sun">Rain or shine</Badge> : undefined
          }
        />
      ))}
    </div>
  );
}
