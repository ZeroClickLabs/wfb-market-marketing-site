import { requireVendor } from "@/lib/auth";
import { Badge } from "@/components/wfb";
import { CardGrid } from "@/components/site/Blocks";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { EmptyState, PageHeader } from "@/components/portal/ui";
import { listAssets } from "@/lib/portal/data";
import type { PortalAsset } from "@/lib/portal/types";

export const metadata = { title: "Assets" };

const KIND: Record<PortalAsset["kind"], string> = { logo: "Logo", social: "Social tile", poster: "Poster", photo: "Photo", other: "File" };

export default async function AssetsPage() {
  const user = await requireVendor();
  const assets = await listAssets();
  const groups = [
    { title: "For every market", items: assets.filter((a) => !a.market) },
    ...[...new Map(assets.filter((a) => a.market).map((a) => [a.market!.id, a.market!])).values()].map((m) => ({
      title: m.name,
      items: assets.filter((a) => a.market?.id === m.id),
    })),
  ].filter((g) => g.items.length);

  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/assets">
      <PageHeader eyebrow="Spread the word" title="Assets" lead="Logos and ready-made posts for your own website and social media. Tag the Market when you post and we'll share it." />
      {groups.length === 0 ? <EmptyState title="Nothing here yet" /> : null}
      <div className="grid grid-cols-1 gap-7">
        {groups.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h2 className="mt-0 mb-3 font-display text-[30px] leading-[32px] font-normal uppercase tracking-[.02em]">{g.title}</h2>
            <CardGrid min={240}>
              {g.items.map((a) => (
                <article key={a.id} className="flex flex-col overflow-hidden rounded-lg border-3 border-ink bg-paper">
                  <div className="grid aspect-[4/3] place-items-center border-b-3 border-ink bg-kraft p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element -- previews of the file as downloaded */}
                    <img src={a.url} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="neutral">{KIND[a.kind]}</Badge>
                    </div>
                    <h3 className="m-0 font-sans text-[18px] leading-[24px] font-extrabold">{a.title}</h3>
                    <p className="m-0 flex-1 font-sans text-[15px] leading-[22px] text-ink-muted">{a.description}</p>
                    <p className="m-0 font-sans text-[13px] font-bold text-ink-muted">{a.sizeLabel}</p>
                    <div>
                      {/* A plain link so the browser saves the file under its own name. */}
                      <a href={a.url} download={a.fileName} className="wfb-btn wfb-btn-primary wfb-btn-sm">
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </CardGrid>
          </section>
        ))}
      </div>
    </PortalFrame>
  );
}
