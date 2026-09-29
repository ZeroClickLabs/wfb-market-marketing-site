import type { Metadata } from "next";
import { Suspense } from "react";
import { Button, CircleTile, SectionHeading, VendorCard } from "@/components/wfb";
import { Band, Edge, PageIntro, SiteShell, VendorDirectory, type DirectoryVendor, TileGrid } from "@/components/site";
import { MakersSection, StripeEdge } from "@/components/argo/parts";
import { ARGO_ROOT } from "@/components/argo/styles";
import { argoPath } from "@/content/argo";
import { vendorCardProps, whatYoullFind } from "@/content/home";
import { vendors } from "@/content/vendors";

export const metadata: Metadata = {
  title: "Meet the makers",
  description: "The local makers coming to Christmas at The Argo, and what you'll find at the Whitefish Bay Farmers Market when it opens in summer 2027.",
};

const directory: DirectoryVendor[] = vendors.map((v) => ({
  card: vendorCardProps(v),
  categories: v.categories,
  acceptsSnap: !!v.snap,
  searchText: [v.name, v.description, ...v.products].join(" "),
}));

export default function VendorsPage() {
  return (
    <SiteShell section="vendors">
      <PageIntro
        eyebrow="Grown and made close to home"
        title="Meet the makers"
        lead="Our Summer Market vendors will be announced in spring 2027. Coming soon: the local makers at Christmas at The Argo."
        actions={<Button variant="accent" iconAfter="arrow-right" href={argoPath}>Christmas at The Argo</Button>}
      />

      {/* The Argo's makers, in the event's own look. */}
      <StripeEdge />
      <div className={ARGO_ROOT}><MakersSection /></div>
      <StripeEdge />

      {directory.length ? (
        <Band ground="canvas">
          <SectionHeading eyebrow="Every Saturday" title="Summer Market vendors" />
          <Suspense fallback={<div className="wfb-grid">{directory.map((v) => <VendorCard key={v.card.name} {...v.card} />)}</div>}>
            <VendorDirectory vendors={directory} />
          </Suspense>
        </Band>
      ) : (
        <Band ground="canvas">
          <SectionHeading eyebrow="Coming summer 2027" title="What you'll find" lead="We'll introduce every grower, baker and maker here as they sign on." />
          <TileGrid compact>
            {whatYoullFind.map((t) => <CircleTile key={t.label} label={t.label} illustration={t.illustration} tone={t.tone} note={t.note} />)}
          </TileGrid>
        </Band>
      )}

      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="Grow it, bake it, make it" title="Sell with us" lead="Applications for the 2027 Summer Market open in January. We're looking for growers and makers from within 100 miles of the lake." />
        <div className="wfb-row justify-center">
          <Button variant="outline" iconAfter="arrow-right" href="/get-involved/sell">How to apply</Button>
        </div>
      </Band>
    </SiteShell>
  );
}
