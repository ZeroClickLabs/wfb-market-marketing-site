import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Button, CATEGORY_LABELS, Icon, Illustration, SectionHeading, Tag, VendorCard } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { Band, CardGrid, Edge, InfoCard, LeafList, SiteShell, PageIntro, Split, Subhead, BodyText, ButtonRow } from "@/components/site";
import { vendorCardProps } from "@/content/home";
import { markets } from "@/content/markets";
import { getVendor, vendors } from "@/content/vendors";

export function generateStaticParams() {
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const v = getVendor((await params).slug);
  return v ? { title: v.name, description: v.description } : {};
}

export default async function VendorPage({ params }: PageProps<"/vendors/[slug]">) {
  const vendor = getVendor((await params).slug);
  if (!vendor) notFound();

  const related = vendors.filter((v) => v.slug !== vendor.slug && v.categories.some((c) => vendor.categories.includes(c))).slice(0, 4);
  const more = related.length >= 2 ? related : vendors.filter((v) => v.slug !== vendor.slug).slice(0, 4);
  const attends = markets.filter((m) => vendor.markets.includes(m.id));

  return (
    <SiteShell section="vendors">
      <PageIntro
        eyebrow={vendor.stall ? `Stall ${vendor.stall}` : "At the market"}
        title={vendor.name}
        lead={vendor.about}
        art={
          <div className="w-[min(440px,100%)] overflow-hidden rounded-lg border-3 border-ink shadow-print [&_.wfb-illo]:w-[46%] [&_.wfb-vendor-art]:border-b-0">
            <div className={cx("wfb-vendor-art", `wfb-vendor-art-${vendor.categories[0]}`)}>
              <Illustration name={vendor.illustration} />
            </div>
          </div>
        }
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {vendor.categories.map((c) => <Tag key={c} category={c} />)}
          {vendor.snap ? <Badge tone="success" icon="card">Takes SNAP/EBT</Badge> : null}
        </div>
        <div className="wfb-meta mt-4">
          <span><Icon name="map-pin" size={16} />From {vendor.from}</span>
          {vendor.stall ? <span><Icon name="tent" size={16} />Stall {vendor.stall} at the Summer Market</span> : null}
        </div>
      </PageIntro>

      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <Split>
          <div>
            <Subhead>What they bring</Subhead>
            <LeafList items={vendor.products} />
            <div className="mt-5"><BodyText>What&rsquo;s on the table changes with the season. Ask at the stall what&rsquo;s best this week.</BodyText></div>
          </div>
          <div>
            <Subhead>Find them at</Subhead>
            <CardGrid min={220}>
              {attends.map((m) => (
                <InfoCard key={m.id} icon="calendar" title={m.name} meta={<><span><Icon name="clock" size={16} />{m.hours}</span><span><Icon name="map-pin" size={16} />{m.where}</span></>}>
                  {m.when}
                </InfoCard>
              ))}
            </CardGrid>
          </div>
        </Split>
      </Band>

      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="Next stall over" title={more === related && vendor.categories[0] !== "other" ? `More ${CATEGORY_LABELS[vendor.categories[0]].toLowerCase()}` : "More vendors"} />
        <div className="wfb-grid">
          {more.map((v) => <VendorCard key={v.slug} {...vendorCardProps(v)} />)}
        </div>
        <ButtonRow>
          <Button variant="outline" iconAfter="arrow-right" href="/vendors">All vendors</Button>
        </ButtonRow>
      </Band>
    </SiteShell>
  );
}
