import { requirePartner } from "@/lib/auth";
import { Badge, Button } from "@/components/wfb";
import { CardGrid } from "@/components/site/Blocks";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { EmptyState, Flash, PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { addPartnerAssetAction, deletePartnerAssetAction } from "@/app/partner/actions";
import { getMarketById, listMarketAssets } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";

export const metadata = { title: "Files" };

export default async function PartnerFiles({ params, searchParams }: PageProps<"/partner/[marketId]/files">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, assets, sp] = await Promise.all([getMarketById(marketId), listMarketAssets(marketId), searchParams]);
  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/files`}>
      <PageHeader eyebrow={market?.name} title="Files" lead="Floor plans, parking maps and anything else vendors need. They can download these from their portal." />
      <Flash done={sp.done} />
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        {assets.length ? (
          <CardGrid min={220}>
            {assets.map((a) => (
              <article key={a.id} className="flex flex-col overflow-hidden rounded-lg border-3 border-ink bg-paper">
                <div className="grid aspect-[4/3] place-items-center border-b-3 border-ink bg-kraft p-4">
                  {a.url.startsWith("data:application/pdf") ? (
                    <span className="font-display text-[40px] uppercase">PDF</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- previews of the file as uploaded
                    <img src={a.url} alt="" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <div><Badge tone="neutral">{a.kind === "poster" ? "Poster" : a.kind === "photo" ? "Photo" : a.kind === "social" ? "Social tile" : a.kind === "logo" ? "Logo" : "File"}</Badge></div>
                  <h2 className="m-0 font-sans text-[17px] leading-[22px] font-extrabold">{a.title}</h2>
                  {a.description ? <p className="m-0 font-sans text-[14px] text-ink-muted">{a.description}</p> : null}
                  <p className="m-0 flex-1 font-sans text-[13px] font-bold text-ink-muted">{a.sizeLabel}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={a.url} download={a.fileName} className="wfb-btn wfb-btn-outline wfb-btn-sm"><span>Download</span></a>
                    <form action={deletePartnerAssetAction}>
                      <input type="hidden" name="marketId" value={marketId} />
                      <input type="hidden" name="assetId" value={a.id} />
                      <Button type="submit" variant="link" size="sm">Remove</Button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </CardGrid>
        ) : (
          <EmptyState title="No files yet">Add a floor plan or load-in map so vendors know where to go.</EmptyState>
        )}
        <Panel title="Add a file" className="max-desktop:order-first">
          <AdminForm
            action={addPartnerAssetAction}
            submitLabel="Upload"
            pendingLabel="Uploading…"
            fields={[
              { kind: "hidden", name: "marketId", value: marketId },
              { kind: "file", name: "file", label: "File", required: true, accept: "image/png,image/jpeg,image/svg+xml,application/pdf", hint: isPortalDemo() ? "PNG, JPG, SVG or PDF, up to 900 KB in the preview." : "PNG, JPG, SVG or PDF." },
              { kind: "text", name: "title", label: "Title", required: true, placeholder: "e.g. Floor plan", autoComplete: "off" },
              { kind: "textarea", name: "description", label: "What it's for (optional)" },
              { kind: "select", name: "kind", label: "Type", options: [{ value: "other", label: "Map or plan" }, { value: "poster", label: "Poster" }, { value: "photo", label: "Photo" }, { value: "social", label: "Social tile" }], defaultValue: "other" },
            ]}
          />
        </Panel>
      </div>
    </PortalFrame>
  );
}
