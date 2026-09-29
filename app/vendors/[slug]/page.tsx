import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Button, CATEGORY_LABELS, Icon, Illustration, SectionHeading, Tag, VendorCard } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { Band, CardGrid, Edge, InfoCard, LeafList, SiteShell } from "@/components/site";
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
      <section className="wfb-section wfb-section-kraft wfb-grain wfb-intro wfb-intro-with-art">
        <div className="wfb-container">
          <div className="wfb-intro-copy">
            <header className="wfb-heading wfb-heading-left">
              <p className="wfb-heading-eyebrow">{vendor.stall ? `Stall ${vendor.stall}` : "At the market"}</p>
              <h1 className="wfb-heading-title">{vendor.name}</h1>
              <p className="wfb-lead">{vendor.about}</p>
            </header>
            <div className="wfb-vendor-tags">
              {vendor.categories.map((c) => <Tag key={c} category={c} />)}
              {vendor.snap ? <Badge tone="success" icon="card">Takes SNAP/EBT</Badge> : null}
            </div>
            <div className="wfb-meta" style={{ marginTop: 16 }}>
              <span><Icon name="map-pin" size={16} />From {vendor.from}</span>
              {vendor.stall ? <span><Icon name="tent" size={16} />Stall {vendor.stall} at the Summer Market</span> : null}
            </div>
          </div>
          <div className="wfb-intro-art">
            <div className="wfb-vendor-hero">
              <div className={cx("wfb-vendor-art", `wfb-vendor-art-${vendor.categories[0]}`)}>
                <Illustration name={vendor.illustration} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <div className="wfb-split">
          <div>
            <h2 className="wfb-subhead">What they bring</h2>
            <LeafList items={vendor.products} />
            <p className="wfb-body" style={{ marginTop: 24 }}>What&rsquo;s on the table changes with the season. Ask at the stall what&rsquo;s best this week.</p>
          </div>
          <div>
            <h2 className="wfb-subhead">Find them at</h2>
            <CardGrid min={220}>
              {attends.map((m) => (
                <InfoCard key={m.id} icon="calendar" title={m.name} meta={<><span><Icon name="clock" size={16} />{m.hours}</span><span><Icon name="map-pin" size={16} />{m.where}</span></>}>
                  {m.when}
                </InfoCard>
              ))}
            </CardGrid>
          </div>
        </div>
      </Band>

      <Edge from="canvas" to="kraft" />
      <Band ground="kraft">
        <SectionHeading eyebrow="Next stall over" title={more === related && vendor.categories[0] !== "other" ? `More ${CATEGORY_LABELS[vendor.categories[0]].toLowerCase()}` : "More vendors"} />
        <div className="wfb-grid">
          {more.map((v) => <VendorCard key={v.slug} {...vendorCardProps(v)} />)}
        </div>
        <div className="wfb-row wfb-band-cta">
          <Button variant="outline" iconAfter="arrow-right" href="/vendors">All vendors</Button>
        </div>
      </Band>
    </SiteShell>
  );
}
