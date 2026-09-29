import type { Metadata } from "next";
import { Button, Logo, Notice, SectionHeading } from "@/components/wfb";
import { Band, CardGrid, Edge, EventTickets, FactList, InfoCard, PageIntro, SiteShell, ButtonRow } from "@/components/site";
import { events, upcoming } from "@/content/events";
import { markets } from "@/content/markets";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Night Market",
  description: "Music, food trucks and the lake at dusk. The Night Market is planned for summer evenings from 2027.",
};

const night = markets.find((m) => m.id === "night")!;

export default function NightMarketPage() {
  const dates = upcoming(events.filter((e) => e.market === "night"));
  return (
    <SiteShell section="events" theme="dark">
      <PageIntro
        eyebrow="Planned for 2027"
        title="Night Market"
        lead={night.blurb}
        art={<Logo variant="night" width={360} label="Night Market, Whitefish Bay Farmers Market" />}
      >
        <FactList
          facts={[
            { icon: "calendar", label: "When", value: night.when },
            { icon: "clock", label: "Hours", value: night.hours },
            { icon: "map-pin", label: "Where", value: night.where },
          ]}
        />
      </PageIntro>
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="Save the date" title="Night Market dates" />
        {dates.length ? <EventTickets events={dates} /> : (
          <Notice tone="info" title="Planned for summer 2027.">We&rsquo;ll announce Night Market dates once the Summer Market is up and running. Join the Market Letter to hear first.</Notice>
        )}
      </Band>
      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="What we're planning" title="Stay for the sunset" lead="Here's the idea. Details will come once dates are set." />
        <CardGrid>
          <InfoCard icon="music" title="Live music">Local bands on a stage by the street.</InfoCard>
          <InfoCard icon="basket" title="Farm stands">Sweet corn, peaches and flowers from the same growers as Saturday morning.</InfoCard>
          <InfoCard icon="tent" title="Food trucks">Dinner from local food trucks, with seating along the street.</InfoCard>
          <InfoCard icon="card" title="SNAP/EBT welcome">Market Match at the info tent, just like Saturday mornings.</InfoCard>
        </CardGrid>
        <ButtonRow>
          <Button variant="outline" iconAfter="arrow-right" href="/events">All markets & events</Button>
        </ButtonRow>
      </Band>
    </SiteShell>
  );
}
