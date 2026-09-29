import type { Metadata } from "next";
import { Button, Notice } from "@/components/wfb";
import { SiteShell } from "@/components/site";
import { cx } from "@/components/wfb/utils";
import { ArgoHero } from "@/components/argo/ArgoHero";
import { ARGO_ROOT } from "@/components/argo/styles";
import { MakersSection, ProgramSection, SponsorsSection, StorySection, StripeEdge, UpdatesSection, VillageSection, VisitSection } from "@/components/argo/parts";
import { argo, argoPath } from "@/content/argo";
import { formatDate, formatTimeRange, isPast, toMarketISO } from "@/content/format";
import { site } from "@/content/site";

// Recheck daily so the page switches to its thank-you state after the event.
export const revalidate = 86400;

const when = `${formatDate(argo.date)} · ${formatTimeRange(argo.start, argo.end)}`;

export const metadata: Metadata = {
  title: { absolute: `${argo.title} · ${formatDate(argo.date)}` },
  description: `${when} at ${argo.venue.name}, Whitefish Bay. ${argo.admission}. Local makers, Santa, cookie decorating and holiday magic.`,
  alternates: { canonical: argoPath },
  openGraph: {
    title: `${argo.title} · ${formatDate(argo.date)}`,
    description: argo.subhead,
    url: argoPath,
    siteName: site.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: `${argo.title} · ${formatDate(argo.date)}`, description: argo.subhead },
};

/** schema.org Event, so search engines and social tools pick up the date, place and price. */
function EventJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: argo.title,
    description: argo.subhead,
    startDate: toMarketISO(argo.date, argo.start),
    endDate: toMarketISO(argo.date, argo.end),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    location: {
      "@type": "Place",
      name: argo.venue.name,
      address: { "@type": "PostalAddress", streetAddress: argo.venue.address || undefined, addressLocality: "Whitefish Bay", addressRegion: "WI", addressCountry: "US" },
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${site.url}${argoPath}` },
    organizer: { "@type": "Organization", name: site.legalName, url: site.url },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function ArgoPage() {
  const past = isPast(argo.date);
  const notice = past ? (
    <Notice tone="info" title={`Christmas at The Argo was on ${formatDate(argo.date, { year: true })}. Thank you!`} action={<Button variant="outline" size="sm" href="/events">See what&rsquo;s next</Button>}>
      Thank you to every maker, volunteer and neighbour who came. Next up: the Summer Market in 2027.
    </Notice>
  ) : undefined;

  return (
    <SiteShell
      section="events"
      newsletter={false}
      notice={notice}
      // The Market footer's wave sits on whichever holiday ground ends the page.
      className={cx("[&_.wfb-footer>.wfb-edge-wrap]:bg-none!", argo.sponsors.length || past ? "[&_.wfb-footer>.wfb-edge-wrap]:bg-argo-cream!" : "[&_.wfb-footer>.wfb-edge-wrap]:bg-argo-green!")}
    >
      <EventJsonLd />
      <div className={ARGO_ROOT}>
        <ArgoHero past={past} />
        <StorySection />
        <StripeEdge />
        <ProgramSection />
        <StripeEdge />
        <MakersSection />
        <StripeEdge />
        <VillageSection />
        <StripeEdge />
        <VisitSection />
        {past ? null : (
          <>
            <StripeEdge />
            <UpdatesSection />
          </>
        )}
        <SponsorsSection />
      </div>
    </SiteShell>
  );
}
