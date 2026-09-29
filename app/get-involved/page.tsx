import type { Metadata } from "next";
import { Button, CircleTile, SectionHeading } from "@/components/wfb";
import { Band, Edge, PageIntro, SiteShell, SponsorList, TileGrid } from "@/components/site";
import { sponsorTiers } from "@/content/get-involved";

export const metadata: Metadata = {
  title: "Get involved",
  description: "Volunteer on a Saturday, sell at the market or sponsor it. The Whitefish Bay Farmers Market is run by neighbours.",
};

export default function GetInvolvedPage() {
  return (
    <SiteShell section="get-involved">
      <PageIntro eyebrow="Run by neighbours" title="Get involved" lead="The Market is a brand-new, volunteer-run non-profit. Christmas at The Argo is coming this December, and the Summer Market opens in 2027. Here's how to be part of it from the start." />
      <Edge from="kraft" to="deep" />
      <Band ground="deep">
        <SectionHeading eyebrow="Pick a way in" title="Lend a hand" />
        <TileGrid>
          <CircleTile label="Volunteer" illustration="sunflower" tone="bay-tint" note="Help run Christmas at The Argo, then the Summer Market." href="/get-involved/volunteer" />
          <CircleTile label="Sell with us" illustration="bread" tone="heirloom-tint" note="Applications for 2027 open in January." href="/get-involved/sell" />
          <CircleTile label="Sponsor" illustration="apple" tone="corn" note="Help launch Christmas at The Argo and our first season." href="/get-involved/sponsor" />
        </TileGrid>
      </Band>
      <Edge from="deep" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="Thanks to our neighbours" title="Our sponsors" />
        <SponsorList tiers={sponsorTiers} emptyAction={<Button variant="outline" iconAfter="arrow-right" href="/get-involved/sponsor">Become a sponsor</Button>} />
      </Band>
    </SiteShell>
  );
}
