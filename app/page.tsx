import {
  AnnouncementBar, Badge, Button, CircleTile, EventCard, Hero, NewsletterBand,
  SectionEdge, SectionHeading, SiteFooter, SiteHeader, VendorCard,
} from "@/components/wfb";
import { announcement, events, explore, featuredVendors, vendorCount } from "@/content/home";

export default function Home() {
  return (
    <div className="wfb">
      <AnnouncementBar label={announcement.label} href={announcement.href} linkText={announcement.linkText}>
        {announcement.text}
      </AnnouncementBar>
      <SiteHeader />
      <main>
        <Hero />
        <SectionEdge kind="awning" tone="heirloom" ground="kraft" />

        <section className="wfb-section wfb-section-kraft wfb-grain wfb-section-after-awning">
          <div className="wfb-container">
            <SectionHeading eyebrow="This week" title="At the market" lead="A few of the growers, bakers and makers setting up by the lake this Saturday." />
            <div className="wfb-grid">
              {featuredVendors.map((v) => <VendorCard key={v.name} {...v} />)}
            </div>
            <div className="wfb-row wfb-section-cta">
              <Button variant="outline" iconAfter="arrow-right" href="/vendors">All {vendorCount} vendors</Button>
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
            <SectionHeading eyebrow="Mark your calendar" title="Markets & events" />
            <div className="wfb-events-grid">
              {events.map(({ rainOrShine, ...e }) => (
                <EventCard key={e.date} {...e} status={rainOrShine ? <Badge tone="success" icon="sun">Rain or shine</Badge> : undefined} />
              ))}
            </div>
          </div>
        </section>

        <NewsletterBand />
      </main>
      <SiteFooter />
    </div>
  );
}
