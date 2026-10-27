import { requireAdmin } from "@/lib/auth";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { createMarketAction } from "@/app/admin/actions";

export const metadata = { title: "New market" };

export default async function NewMarketPage() {
  const user = await requireAdmin();
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/markets">
      <PageHeader title="New market" back={{ href: "/admin/markets", label: "Markets" }} lead="Name it, then add its dates: one event, or every week for a season." />
      <Panel className="max-w-[640px]">
        <AdminForm
          action={createMarketAction}
          submitLabel="Create market"
          fields={[
            { kind: "text", name: "name", label: "Market name", required: true, placeholder: "e.g. 2027 Night Market", autoComplete: "off" },
            { kind: "select", name: "kind", label: "Look", hint: "Sets the market's colour in the portal.", options: [{ value: "summer", label: "Summer (bay blue)" }, { value: "night", label: "Night (deep blue)" }, { value: "popup", label: "Pop-up (corn yellow)" }, { value: "winter", label: "Winter (beet red)" }] },
          ]}
        />
      </Panel>
    </PortalFrame>
  );
}
