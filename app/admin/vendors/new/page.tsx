import { requireAdmin } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/components/wfb";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { PageHeader, Panel, VENDOR_STATUS_OPTIONS } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { createVendorAction } from "@/app/admin/actions";

export const metadata = { title: "Add vendor" };

export default async function NewVendorPage() {
  const user = await requireAdmin();
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/vendors">
      <PageHeader title="Add vendor" back={{ href: "/admin/vendors", label: "Vendors" }} lead="For anyone you're already talking to by email or phone. They don't need to apply." />
      <Panel className="max-w-[820px]">
        <AdminForm
          action={createVendorAction}
          submitLabel="Add vendor"
          fields={[
            { kind: "text", name: "name", label: "Business name", required: true, autoComplete: "off" },
            { kind: "text", name: "town", label: "Town", hint: "Where they farm or make, e.g. Cedarburg, WI.", half: true },
            { kind: "select", name: "status", label: "Status", options: VENDOR_STATUS_OPTIONS, defaultValue: "lead", half: true, hint: "Lead while you're still talking; Approved once they're in." },
            { kind: "checkboxes", name: "categories", label: "Category", options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })), columns: true },
            { kind: "text", name: "contactName", label: "Contact name", half: true, autoComplete: "off" },
            { kind: "email", name: "contactEmail", label: "Contact email", hint: "The portal invite goes here. You can add more people later.", half: true, autoComplete: "off" },
            { kind: "tel", name: "contactPhone", label: "Contact phone (optional)", half: true, autoComplete: "off" },
            { kind: "textarea", name: "note", label: "First note (optional)", hint: "How you met, what you talked about. Only admins see notes." },
          ]}
        />
      </Panel>
    </PortalFrame>
  );
}
