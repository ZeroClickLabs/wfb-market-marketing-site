import type { Metadata } from "next";
import { MarketSchedule, Notice, SectionHeading } from "@/components/wfb";
import { Button } from "@/components/wfb";
import { Band, CardGrid, Edge, EventTickets, MarketCard, PageIntro, ScrollTable, SiteShell } from "@/components/site";
import { ArgoPromo } from "@/components/argo/ArgoPromo";
import { argo } from "@/content/argo";
import { upcoming } from "@/content/events";
import { inWindow } from "@/content/format";
import { markets, scheduleRows } from "@/content/markets";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Markets & events",
  description: "Coming soon: Christmas at The Argo on Sunday, December 13, 2026. The Summer Market opens in 2027.",
};

export default function EventsPage() {
  const promo = inWindow(argo.promo.from, argo.date);
  const others = upcoming().filter((e) => !(promo && e.slug === argo.slug));
  return (
    <SiteShell section="events">
      <PageIntro eyebrow="Mark your calendar" title="Markets & events" lead="Christmas at The Argo is coming this December. The Summer Market and the rest of the year's markets open in 2027." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas" id="coming-up">
        <SectionHeading eyebrow="Coming up" title="Next dates" />
        <ArgoPromo />
        {others.length ? <EventTickets events={others} /> : null}
        {!promo && !others.length ? (
          <Notice tone="info" title="Our 2027 dates are coming." action={<Button variant="outline" size="sm" href="#newsletter">Join the list</Button>}>
            We&rsquo;ll post the Summer Market dates in the spring. Join the Market Letter to hear first.
          </Notice>
        ) : null}
      </Band>
      <Edge from="canvas" to="deep" />
      <Band ground="deep">
        <SectionHeading eyebrow="One lake, four markets" title="Planned for 2027" />
        <CardGrid min={250}>
          {markets.map((m) => <MarketCard key={m.id} market={m} />)}
        </CardGrid>
      </Band>
      <Edge from="deep" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="At a glance" title="The season board" lead="Working plans for the year ahead. We'll confirm dates, hours and places before each market." />
        <ScrollTable label="Planned markets">
          <MarketSchedule rows={scheduleRows} caption="Markets planned for 2027" />
        </ScrollTable>
      </Band>
    </SiteShell>
  );
}
