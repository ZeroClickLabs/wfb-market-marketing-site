import { Button, CircleTile, Hero, SectionEdge, SectionHeading } from "@/components/wfb";
import { EventTickets, SiteShell } from "@/components/site";
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
        script={`Opening ${site.opening.toLowerCase()}`}
        sub="Local growers, bakers and makers, live music and a lake breeze, every Saturday by the lake. Christmas at The Argo is coming this December."
        actions={[
          <Button key="a" variant="accent" size="lg" iconAfter="arrow-right" href={argoPath}>Christmas at The Argo</Button>,
          <Button key="b" variant="outline" size="lg" href="/visit">Our plans for 2027</Button>,
        ]}
      />
      <SectionEdge kind="awning" tone="heirloom" ground="kraft" />

      <section className="wfb-section wfb-section-kraft wfb-grain wfb-section-after-awning">
        <div className="wfb-container">
          <ArgoPromo />
          <SectionHeading eyebrow="Coming summer 2027" title="What you'll find" lead="Saturday mornings by the lake with growers, bakers and makers from close to home. Here's what we're planning to bring together." />
          <div className="wfb-explore-grid wfb-find-grid">
            {whatYoullFind.map((t) => <CircleTile key={t.label} label={t.label} illustration={t.illustration} tone={t.tone} note={t.note} />)}
          </div>
          <div className="wfb-row wfb-section-cta">
            <Button variant="outline" iconAfter="arrow-right" href="/get-involved/sell">Apply to sell in 2027</Button>
          </div>
        </div>
      </section>

      <SectionEdge kind="wave" tone="deep" ground="kraft" />
      <section className="wfb-section wfb-section-deep wfb-on-deep wfb-section-after-wave">
        <div className="wfb-container">
          <SectionHeading eyebrow="Explore" title="More than a market" />
          <div className="wfb-explore-grid">
            {explore.map((t) => <CircleTile key={t.label} {...t} />)}
          </div>
        </div>
      </section>
      <SectionEdge kind="wave" tone="deep" ground="canvas" flip />

      <section className="wfb-section wfb-grain wfb-section-after-wave">
        <div className="wfb-container">
          <SectionHeading eyebrow="Mark your calendar" title="Markets & events" lead="The Summer Market opens in June 2027. We'll announce the dates here first." />
          {coming.length ? <EventTickets events={coming} /> : null}
          <div className="wfb-row wfb-section-cta">
            <Button variant="outline" iconAfter="arrow-right" href="/events">All markets & events</Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
