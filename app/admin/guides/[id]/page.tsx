import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { deleteGuideAction, saveGuideAction } from "@/app/admin/actions";
import { getGuide, listAllMarkets } from "@/lib/portal/data";

export const metadata = { title: "Guide" };

export default async function GuidePage({ params }: PageProps<"/admin/guides/[id]">) {
  const user = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const [guide, markets] = await Promise.all([isNew ? null : getGuide(id), listAllMarkets()]);
  if (!isNew && !guide) notFound();
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/guides">
      <PageHeader title={isNew ? "New guide" : guide!.title} back={{ href: "/admin/guides", label: "Guides" }} />
      <Panel className="max-w-[860px]">
        <AdminForm
          action={saveGuideAction}
          submitLabel={isNew ? "Create guide" : "Save guide"}
          fields={[
            { kind: "hidden", name: "id", value: guide?.id ?? "" },
            { kind: "text", name: "title", label: "Title", required: true, defaultValue: guide?.title, autoComplete: "off" },
            { kind: "select", name: "marketId", label: "Shown for", options: [{ value: "", label: "Every market" }, ...markets.map((m) => ({ value: m.id, label: m.name }))], defaultValue: guide?.marketId ?? "" },
            { kind: "markdown", name: "body", label: "Guide", required: true, defaultValue: guide?.body },
          ]}
        />
      </Panel>
      {guide ? (
        <form action={deleteGuideAction} className="mt-4">
          <input type="hidden" name="guideId" value={guide.id} />
          <Button type="submit" variant="link" size="sm">Delete this guide</Button>
        </form>
      ) : null}
    </PortalFrame>
  );
}
