import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Logo, Notice, SectionHeading } from "@/components/wfb";
import { Band, Edge, EventTickets, FactList, LeafList, PageIntro, SiteShell } from "@/components/site";
import { events, getEvent, upcoming } from "@/content/events";
import { formatDate, formatTimeRange, mapsUrl, todayISO } from "@/content/format";
import { markets } from "@/content/markets";

export const revalidate = 86400;

// Events with their own landing page (like Christmas at The Argo) redirect there instead; see next.config.ts.
export function generateStaticParams() {
  return events.filter((e) => !e.href).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const e = getEvent((await params).slug);
  return e ? { title: `${e.title}, ${formatDate(e.date)}`, description: `${formatDate(e.date)} · ${formatTimeRange(e.start, e.end)} · ${e.location}. ${e.description}` } : {};
}

const LOGO = { summer: "emblem", night: "night", popup: "popup", winter: "winter" } as const;

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const event = getEvent((await params).slug);
  if (!event) notFound();

  const market = markets.find((m) => m.id === event.market)!;
  const past = event.date < todayISO();
  const more = upcoming().filter((e) => e.slug !== event.slug && e.market === event.market).slice(0, 2);
  const logo = LOGO[event.market];

  const notice = past ? (
    <Notice tone="info" title={`This market was on ${formatDate(event.date, { year: true })}.`} action={<Button variant="outline" size="sm" href="/events">See what&rsquo;s coming up</Button>}>
      Thanks to everyone who came. Here&rsquo;s what&rsquo;s next on the calendar.
    </Notice>
  ) : event.status ? (
    <Notice tone={event.status.tone} title={event.status.title}>{event.status.text}</Notice>
  ) : undefined;

  return (
    <SiteShell section="events" theme={event.market === "night" ? "dark" : "light"} notice={notice}>
      <PageIntro
        eyebrow={market.name}
        title={event.title}
        lead={event.description}
        art={<Logo variant={logo} width={logo === "emblem" ? 240 : 360} label={logo === "emblem" ? undefined : `${market.name}, Whitefish Bay Farmers Market`} />}
        actions={past ? undefined : (
          <>
            <Button variant="accent" icon="map-pin" href={mapsUrl(event.address)}>Get directions</Button>
            <Button variant="outline" icon="calendar" href={`/events/${event.slug}/calendar.ics`}>Add to calendar</Button>
          </>
        )}
      >
        <FactList
          facts={[
            { icon: "calendar", label: "Date", value: formatDate(event.date) },
            { icon: "clock", label: "Time", value: formatTimeRange(event.start, event.end) },
            { icon: "map-pin", label: "Where", value: event.location },
            ...(event.rainOrShine ? [{ icon: "sun" as const, label: "Weather", value: "Rain or shine" }] : []),
          ]}
        />
      </PageIntro>

      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <div className="wfb-split">
          <div>
            <h2 className="wfb-subhead">What&rsquo;s on</h2>
            <LeafList items={event.whatsOn} />
          </div>
          <div>
            <h2 className="wfb-subhead">Paying</h2>
            <p className="wfb-body">Most stalls take cards. Buy tokens with a card or SNAP/EBT at the info tent, and we&rsquo;ll match EBT up to $20 for fruit and vegetables.</p>
            <Button variant="link" iconAfter="arrow-right" href="/food-access">How Market Match works</Button>
          </div>
        </div>
      </Band>

      {more.length ? (
        <>
          <Edge from="canvas" to="kraft" />
          <Band ground="kraft">
            <SectionHeading eyebrow="Save the date" title={`More ${market.name === "Pop-Up Markets" ? "pop-ups" : market.name + "s"}`} />
            <EventTickets events={more} />
            <div className="wfb-row wfb-band-cta">
              <Button variant="outline" iconAfter="arrow-right" href="/events">All markets & events</Button>
            </div>
          </Band>
        </>
      ) : null}
    </SiteShell>
  );
}
