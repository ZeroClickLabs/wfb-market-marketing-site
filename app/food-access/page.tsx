import type { Metadata } from "next";
import { Badge, SectionHeading } from "@/components/wfb";
import { Band, CardGrid, Edge, Faq, InfoCard, PageIntro, SiteShell, Steps } from "@/components/site";
import { foodAccessFaqs } from "@/content/faqs";

export const metadata: Metadata = {
  title: "Food access",
  description: "When the Whitefish Bay Farmers Market opens in 2027, we plan to accept SNAP/EBT and match those dollars for fruit and vegetables.",
};

// PLACEHOLDER: these are plans for 2027. Confirm the match amount, benefits and partners with the Market.

export default function FoodAccessPage() {
  return (
    <SiteShell section="food-access">
      <PageIntro
        eyebrow="Everyone eats"
        title="Food access"
        lead="When the Summer Market opens in 2027, we plan to accept SNAP/EBT at every stall and to match those dollars for fruit and vegetables through Market Match."
      >
        <div className="wfb-row mt-[20px] justify-center"><Badge tone="info" icon="calendar">Planned for 2027</Badge></div>
      </PageIntro>
      <Edge from="kraft" to="sage" />
      <Band ground="sage">
        <SectionHeading eyebrow="Three steps" title="How Market Match will work" />
        <Steps
          steps={[
            { title: "Visit the info tent", text: "It'll be by the entrance. Just say you'd like to use EBT." },
            { title: "Swipe your card", text: "Choose how much to take off your card. You'll get tokens for that amount, plus a match for fruit and vegetables." },
            { title: "Shop the stalls", text: "Spend tokens at any stall, and keep any you don't use for next time." },
          ]}
        />
      </Band>
      <Edge from="sage" to="deep" />
      <Band ground="deep">
        <SectionHeading eyebrow="More ways to shop" title="Other benefits we're planning for" />
        <CardGrid>
          <InfoCard icon="card" title="WIC fruit & veg">We plan to accept the WIC Cash Value Benefit at the info tent.</InfoCard>
          <InfoCard icon="basket" title="Senior vouchers">We plan to welcome farmers&rsquo; market vouchers for older neighbours at every produce stall.</InfoCard>
          <InfoCard icon="leaf" title="Grow your own">SNAP covers seeds and vegetable plants, and we plan to have them at spring markets.</InfoCard>
        </CardGrid>
      </Band>
      <Edge from="deep" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="Good to know" title="Questions" />
        <Faq items={foodAccessFaqs} />
      </Band>
    </SiteShell>
  );
}
