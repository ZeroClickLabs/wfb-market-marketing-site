import { Button, CircleTile, Hero, SectionEdge, SectionHeading } from "@/components/wfb";
import { ButtonRow, EventTickets, SiteShell, TileGrid } from "@/components/site";
import { ArgoPromo } from "@/components/argo/ArgoPromo";
import { argoPath } from "@/content/argo";
import { upcoming } from "@/content/events";
import { explore, whatYoullFind } from "@/content/home";
import { site } from "@/content/site";

// Recheck once a day so past events and the holiday feature drop off on their own.
export const revalidate = 86400;

export default function Home() {
  const coming = upcoming().slice(0, 4);
  return (
    <SiteShell>
      <Hero
        script={`Coming ${site.opening.toLowerCase()}`}
        sub="Local growers, bakers and makers, live music and a lake breeze, every Saturday at Klode Park."
        actions={[
          <Button key="a" variant="outline" size="lg" iconAfter="arrow-right" href={argoPath}>Learn more</Button>,
          // <Button key="b" variant="accent" size="lg" href="/visit">Christmas at The Argo</Button>,
        ]}
      />
      <SectionEdge kind="awning" tone="heirloom" ground="kraft" />

      <section className="wfb-section wfb-section-kraft wfb-grain pt-10 max-desktop:pt-7">
        <div className="wfb-container">
          <ArgoPromo />
          <SectionHeading eyebrow="Coming summer 2027" title="What you'll find" lead="Saturday mornings by the lake with growers, bakers and makers from close to home. Here's what we're planning to bring together." />
          <TileGrid compact>
            {whatYoullFind.map((t) => <CircleTile key={t.label} label={t.label} illustration={t.illustration} tone={t.tone} note={t.note} />)}
          </TileGrid>
          <ButtonRow>
            <Button variant="outline" iconAfter="arrow-right" href="/get-involved/sell">Apply to sell in 2027</Button>
          </ButtonRow>
        </div>
      </section>

      <SectionEdge kind="wave" tone="deep" ground="kraft" />
      <section className="wfb-section wfb-section-deep wfb-on-deep pt-7">
        <div className="wfb-container">
          <SectionHeading eyebrow="Explore" title="More than a market" />
          <TileGrid>
            {explore.map((t) => <CircleTile key={t.label} {...t} />)}
          </TileGrid>
        </div>
      </section>
      <SectionEdge kind="wave" tone="deep" ground="canvas" flip />

      <section className="wfb-section wfb-grain pt-7">
        <div className="wfb-container">
          <SectionHeading eyebrow="Mark your calendar" title="Markets & events" lead="The Summer Market opens in June 2027. We'll announce the dates here first." />
          {coming.length ? <EventTickets events={coming} /> : null}
          <ButtonRow>
            <Button variant="outline" iconAfter="arrow-right" href="/events">All markets & events</Button>
          </ButtonRow>
        </div>
      </section>
    </SiteShell>
  );
}
