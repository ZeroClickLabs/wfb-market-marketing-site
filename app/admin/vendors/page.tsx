import { requireAdmin } from "@/lib/auth";
import { Button, Select, TextField } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { AdminTable, EmptyState, PageHeader, VENDOR_STATUS_OPTIONS, VendorStatusBadge, categoryLabels } from "@/components/portal/ui";
import { listAllMarkets, listVendors } from "@/lib/portal/data";
import type { AdminVendor, VendorStatus } from "@/lib/portal/types";

export const metadata = { title: "Vendors" };

function portalState(v: AdminVendor) {
  if (v.contacts.some((c) => c.hasLogin)) return "Logged in";
  if (v.contacts.some((c) => c.invitedAt)) return "Invited";
  return v.contacts.length ? "Not invited" : "No contact";
}

export default async function VendorsPage({ searchParams }: PageProps<"/admin/vendors">) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = one("q"), status = one("status") as VendorStatus | "", marketId = one("market"), review = one("review") === "1";
  const [all, markets] = await Promise.all([listVendors({ q, status, marketId }), listAllMarkets()]);
  const vendors = review ? all.filter((v) => v.profilePendingReview) : all;
  const marketName = new Map(markets.map((m) => [m.id, m.name]));

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/vendors">
      <PageHeader eyebrow="Everyone we work with" title="Vendors" lead="Leads, applicants and active vendors in one list. Add anyone you're talking to, then invite them to the portal.">
        <Button href="/admin/vendors/new" variant="accent" icon="basket">Add vendor</Button>
      </PageHeader>

      <form method="get" className="mb-5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-4 rounded-lg border-2 border-ink bg-paper p-4 max-desktop:grid-cols-2 max-tablet:grid-cols-1" role="search" aria-label="Filter vendors">
        <TextField name="q" label="Search" placeholder="Business, town, contact or email" defaultValue={q} />
        <Select name="status" label="Status" placeholder="Any status" options={VENDOR_STATUS_OPTIONS} defaultValue={status} />
        <Select name="market" label="Market" placeholder="Any market" options={markets.map((m) => ({ value: m.id, label: m.name }))} defaultValue={marketId} />
        <div className="flex gap-2">
          <Button type="submit" variant="primary">Filter</Button>
          {q || status || marketId || review ? <Button href="/admin/vendors" variant="link">Clear</Button> : null}
        </div>
      </form>

      <p className="mt-0 mb-3 font-sans text-[15px] font-bold text-ink-muted" role="status">
        {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}{review ? " with a profile to review" : ""}
      </p>
      {vendors.length ? (
        <AdminTable label="Vendors" head={["Business", "Status", "Markets", "Main contact", "Portal"]}>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td>
                <SmartLink href={`/admin/vendors/${v.id}`} className="tap-target font-extrabold text-ink underline decoration-2 underline-offset-2 hover:text-bay">{v.name}</SmartLink>
                <span className="block text-[14px] text-ink-muted">{[v.town, categoryLabels(v.categories)].filter(Boolean).join(" · ")}</span>
              </td>
              <td><VendorStatusBadge status={v.status} />{v.profilePendingReview ? <span className="mt-1 block text-[13px] font-bold text-heirloom-text">Profile to review</span> : null}</td>
              <td>{v.marketIds.map((id) => marketName.get(id)).filter(Boolean).join(", ") || <span className="text-ink-muted">None yet</span>}</td>
              <td>
                {v.contacts[0] ? (
                  <>
                    {v.contacts[0].name}
                    <span className="block text-[14px] break-all text-ink-muted">{v.contacts[0].email}</span>
                  </>
                ) : <span className="text-ink-muted">None</span>}
              </td>
              <td className="whitespace-nowrap">{portalState(v)}</td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState title="No vendors match">Try a different search or clear the filters.</EmptyState>
      )}
    </PortalFrame>
  );
}
