import { requireAdmin } from "@/lib/auth";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { createUpdateAction } from "@/app/admin/actions";
import { audienceSize, listAllMarkets, listVendors } from "@/lib/portal/data";

export const metadata = { title: "Write an update" };

export default async function NewUpdatePage() {
  const user = await requireAdmin();
  const [markets, vendors] = await Promise.all([listAllMarkets(), listVendors()]);
  const everyone = await audienceSize({ kind: "all" });
  const perMarket = await Promise.all(markets.map((m) => audienceSize({ kind: "market", marketId: m.id })));
  const audiences = [
    { value: "all", label: `All approved and active vendors (${everyone})` },
    ...markets.map((m, i) => ({ value: `market:${m.id}`, label: `${m.name} vendors (${perMarket[i]})` })),
    { value: "vendors", label: "Only the vendors I choose below" },
  ];

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/updates">
      <PageHeader title="Write an update" back={{ href: "/admin/updates", label: "Updates" }} lead="Posts to the portal straight away. Email it too for anything vendors need to act on." />
      <Panel className="max-w-[860px]">
        <AdminForm
          action={createUpdateAction}
          submitLabel="Post update"
          pendingLabel="Posting…"
          fields={[
            { kind: "text", name: "title", label: "Title", required: true, placeholder: "e.g. Rain plan for Saturday", autoComplete: "off" },
            { kind: "select", name: "audience", label: "Who gets it", options: audiences, defaultValue: "all" },
            { kind: "checkboxes", name: "vendorIds", label: "Chosen vendors", showWhen: { field: "audience", value: "vendors" }, options: vendors.filter((v) => v.status !== "declined").map((v) => ({ value: v.id, label: v.name })), columns: true },
            { kind: "markdown", name: "body", label: "Message", required: true },
            { kind: "checkbox", name: "email", label: "Also email it", hint: "Goes to everyone in the audience who hasn't turned off update emails.", defaultChecked: true },
            { kind: "checkbox", name: "pinned", label: "Pin to the top of vendors' home page" },
          ]}
        />
      </Panel>
    </PortalFrame>
  );
}
