import type { Metadata } from "next";
import { SectionHeading } from "@/components/wfb";
import { Band, CardGrid, DataTable, Edge, InfoCard, PageIntro, SiteShell, Steps, StubForm } from "@/components/site";
import { applySteps, sellFees, sellFields, sellRules } from "@/content/get-involved";

export const metadata: Metadata = {
  title: "Sell with us",
  description: "Applications for the 2027 season open in January. We welcome growers and makers from within 100 miles of Whitefish Bay.",
};

export default function SellPage() {
  return (
    <SiteShell section="get-involved">
      <PageIntro eyebrow="Grow it, bake it, make it" title="Sell with us" lead="Applications for the 2027 season open in January. We welcome growers, bakers and makers from within 100 miles of the lake." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="The ground rules" title="Who sells here" />
        <CardGrid>
          {sellRules.map((r) => <InfoCard key={r.title} icon={r.icon} title={r.title}>{r.text}</InfoCard>)}
        </CardGrid>
      </Band>
      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="What it costs" title="Stall fees" />
        <DataTable caption="Stall fees by market" columns={sellFees.columns} rows={sellFees.rows} />
      </Band>
      <Edge from="kraft" to="deep" />
      <Band ground="deep">
        <SectionHeading eyebrow="From form to stall" title="How to apply" />
        <Steps steps={applySteps} />
      </Band>
      <Edge from="deep" to="kraft" />
      <Band ground="kraft" id="apply">
        <SectionHeading eyebrow="Tell us about you" title="Apply to sell" />
        <StubForm title="Vendor application" fields={sellFields} submitLabel="Send application" emailSubject="Vendor application" />
      </Band>
    </SiteShell>
  );
}
