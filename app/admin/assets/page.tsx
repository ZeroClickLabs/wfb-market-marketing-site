import { requireAdmin } from "@/lib/auth";
import { Badge, Button } from "@/components/wfb";
import { CardGrid } from "@/components/site/Blocks";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { Flash, PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { addAssetAction, deleteAssetAction } from "@/app/admin/actions";
import { listAllMarkets, listAssets } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";

export const metadata = { title: "Assets" };

export default async function AdminAssetsPage({ searchParams }: PageProps<"/admin/assets">) {
  const user = await requireAdmin();
  const [assets, markets, sp] = await Promise.all([listAssets(), listAllMarkets(), searchParams]);
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/assets">
      <PageHeader eyebrow="For vendors to share" title="Assets" lead="Logos, social tiles and posters vendors can download from their portal." />
      <Flash done={sp.done} />
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <CardGrid min={220}>
          {assets.map((a) => (
            <article key={a.id} className="flex flex-col overflow-hidden rounded-lg border-3 border-ink bg-paper">
              <div className="grid aspect-[4/3] place-items-center border-b-3 border-ink bg-kraft p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- previews of the file as uploaded */}
                <img src={a.url} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div className="flex flex-wrap gap-1.5"><Badge tone="neutral">{a.market?.name ?? "Every market"}</Badge></div>
                <h2 className="m-0 font-sans text-[17px] leading-[22px] font-extrabold">{a.title}</h2>
                <p className="m-0 flex-1 font-sans text-[14px] text-ink-muted">{a.sizeLabel}</p>
                <form action={deleteAssetAction}>
                  <input type="hidden" name="assetId" value={a.id} />
                  <Button type="submit" variant="link" size="sm">Remove</Button>
                </form>
              </div>
            </article>
          ))}
        </CardGrid>
        <Panel title="Add a file" className="max-desktop:order-first">
          <AdminForm
            action={addAssetAction}
            submitLabel="Upload"
            pendingLabel="Uploading…"
            fields={[
              { kind: "file", name: "file", label: "File", required: true, accept: "image/png,image/jpeg,image/svg+xml,application/pdf", hint: isPortalDemo() ? "PNG, JPG, SVG or PDF, up to 900 KB in the preview." : "PNG, JPG, SVG or PDF." },
              { kind: "text", name: "title", label: "Title", required: true, autoComplete: "off" },
              { kind: "textarea", name: "description", label: "How to use it (optional)", hint: "e.g. “For Instagram stories. Tag us!”" },
              { kind: "select", name: "kind", label: "Type", options: [{ value: "logo", label: "Logo" }, { value: "social", label: "Social tile" }, { value: "poster", label: "Poster" }, { value: "photo", label: "Photo" }, { value: "other", label: "Other" }], defaultValue: "social" },
              { kind: "select", name: "marketId", label: "Market", options: [{ value: "", label: "Every market" }, ...markets.map((m) => ({ value: m.id, label: m.name }))] },
            ]}
          />
        </Panel>
      </div>
    </PortalFrame>
  );
}
