import { requireAdmin } from "@/lib/auth";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { AdminTable, ApplicationBadge, EmptyState, Flash, PageHeader, fmtDateTime } from "@/components/portal/ui";
import { listApplications } from "@/lib/portal/data";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const user = await requireAdmin();
  const [apps, sp] = await Promise.all([listApplications(), searchParams]);
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/applications">
      <PageHeader eyebrow="From the website" title="Applications" lead="Sent from the “Apply to sell” form. Each one is already in Vendors as an applicant." />
      <Flash done={sp.done} />
      {apps.length ? (
        <AdminTable label="Applications" head={["Business", "Category", "Markets", "Received", "Status"]}>
          {apps.map((a) => (
            <tr key={a.id}>
              <td>
                <SmartLink href={`/admin/applications/${a.id}`} className="tap-target font-extrabold text-ink underline decoration-2 underline-offset-2 hover:text-bay">{a.business}</SmartLink>
                <span className="block text-[14px] text-ink-muted">{a.name} · {a.town}</span>
              </td>
              <td>{a.category}</td>
              <td>{a.markets.join(", ")}</td>
              <td className="whitespace-nowrap">{fmtDateTime(a.submittedAt)}</td>
              <td><ApplicationBadge status={a.status} /></td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState title="No applications yet" />
      )}
    </PortalFrame>
  );
}
