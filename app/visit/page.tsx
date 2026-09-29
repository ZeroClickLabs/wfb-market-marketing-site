import type { Metadata } from "next";
import { Badge, Button, MarketSchedule, SectionHeading } from "@/components/wfb";
import { Band, Edge, EventTickets, FactList, Faq, PageIntro, ScrollTable, SiteShell } from "@/components/site";
import { argoPath } from "@/content/argo";
import { upcoming } from "@/content/events";
import { visitFaqs } from "@/content/faqs";
import { scheduleRows } from "@/content/markets";
import { summerFacts } from "@/content/visit";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Plan your visit",
  description: "The Whitefish Bay Farmers Market opens in summer 2027. Coming soon: Christmas at The Argo on Sunday, December 13, 2026.",
};

export default function VisitPage() {
  const coming = upcoming();
  return (
    <SiteShell section="visit">
      <PageIntro
        eyebrow="Opening summer 2027"
        title="Plan your visit"
        lead="The Summer Market opens in June 2027, every Saturday morning by the lake. Until then, come and meet us at Christmas at The Argo."
        actions={<Button variant="accent" size="lg" iconAfter="arrow-right" href={argoPath}>Christmas at The Argo</Button>}
      />

      {coming.length ? (
        <>
          <Edge from="kraft" to="canvas" />
          <Band ground="canvas">
            <SectionHeading eyebrow="Come and say hello" title="Coming soon" />
            <EventTickets events={coming} />
          </Band>
          <Edge from="canvas" to="kraft" />
        </>
      ) : null}

      <Band ground="kraft">
        <SectionHeading eyebrow="Opening 2027" title="The Summer Market" lead="Here's what we're planning. We'll confirm the details in spring 2027." />
        <div className="wfb-row" style={{ justifyContent: "center", marginBottom: 24 }}><Badge tone="info" icon="calendar">Planned</Badge></div>
        <FactList facts={summerFacts} />
      </Band>

      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="The year ahead" title="Planned for 2027" lead="Four markets, one lake. None has dates yet; we'll announce each one here first." />
        <ScrollTable label="Planned markets">
          <MarketSchedule rows={scheduleRows} caption="Markets planned for 2027" />
        </ScrollTable>
      </Band>

      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="Good to know" title="Questions" />
        <Faq items={visitFaqs} />
      </Band>
    </SiteShell>
  );
}
