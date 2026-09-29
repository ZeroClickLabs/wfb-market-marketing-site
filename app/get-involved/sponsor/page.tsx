import type { Metadata } from "next";
import { Button, SectionHeading } from "@/components/wfb";
import { Band, CardGrid, DataTable, Edge, InfoCard, PageIntro, SiteShell, SponsorList, StubForm } from "@/components/site";
import { sponsorFields, sponsorLevels, sponsorReasons, sponsorTiers } from "@/content/get-involved";

export const metadata: Metadata = {
  title: "Sponsor the Market",
  description: "Sponsor Christmas at The Argo or the 2027 season. The Whitefish Bay Farmers Market Corp is a new non-profit organization.",
};

export default function SponsorPage() {
  return (
    <SiteShell section="get-involved">
      <PageIntro eyebrow="Keep it growing" title="Sponsor the Market" lead="Whitefish Bay Farmers Market Corp is a brand-new non-profit. Our first sponsors will help launch Christmas at The Argo this December and the Summer Market in 2027." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="Where it goes" title="Why sponsor" />
        <CardGrid>
          {sponsorReasons.map((r) => <InfoCard key={r.title} icon={r.icon} title={r.title}>{r.text}</InfoCard>)}
        </CardGrid>
      </Band>
      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="For the 2027 season" title="Sponsor levels" lead="Working levels for our first full season. Sponsoring Christmas at The Argo? Tell us below and we'll talk it through." />
        <DataTable caption="Sponsor levels" columns={sponsorLevels.columns} rows={sponsorLevels.rows} />
      </Band>
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="Thanks to our neighbours" title="Our sponsors" />
        <SponsorList tiers={sponsorTiers} emptyAction={<Button variant="outline" href="#enquire">Become a sponsor</Button>} />
      </Band>
      <Edge from="canvas" to="kraft" />
      <Band ground="kraft" id="enquire">
        <SectionHeading eyebrow="Let's talk" title="Become a sponsor" />
        <StubForm title="Sponsor enquiry" fields={sponsorFields} submitLabel="Send enquiry" emailSubject="Sponsoring the market" />
      </Band>
    </SiteShell>
  );
}
