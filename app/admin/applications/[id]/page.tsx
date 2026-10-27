import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { ApplicationBadge, PageHeader, Panel, fmtDateTime } from "@/components/portal/ui";
import { decideApplicationAction } from "@/app/admin/actions";
import { getApplication } from "@/lib/portal/data";

export const metadata = { title: "Application" };

export default async function ApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  const user = await requireAdmin();
  const { id } = await params;
  const a = await getApplication(id);
  if (!a) notFound();
  const rows: [string, React.ReactNode][] = [
    ["Contact", a.name],
    ["Email", <a key="e" className="tap-target brand-link" href={`mailto:${a.email}`}>{a.email}</a>],
    ["Phone", a.phone ?? "Not given"],
    ["Where they grow or make", a.town],
    ["Mainly sells", a.category],
    ["Interested in", a.markets.join(", ")],
    ["Insurance", "Confirmed they have, or will get, product liability insurance"],
  ];
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/applications">
      <PageHeader eyebrow={`Received ${fmtDateTime(a.submittedAt)}`} title={a.business} back={{ href: "/admin/applications", label: "Applications" }}>
        <ApplicationBadge status={a.status} />
      </PageHeader>
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <Panel title="Application">
          <dl className="m-0 grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-x-5 gap-y-3 font-sans text-[16px] leading-[24px] max-tablet:grid-cols-1 max-tablet:gap-y-1">
            {rows.map(([k, val]) => (
              <div key={k} className="contents">
                <dt className="font-extrabold max-tablet:mt-2">{k}</dt>
                <dd className="m-0">{val}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-5 mb-1 font-sans text-[16px] font-extrabold">About their products</h3>
          <p className="m-0 max-w-(--prose-max) font-sans text-[16px] leading-[26px] whitespace-pre-line">{a.products}</p>
        </Panel>
        <Panel title="Decision" className="bg-corn-tint max-desktop:order-first">
          {a.status === "new" ? (
            <form action={decideApplicationAction} className="grid grid-cols-1 gap-3">
              <input type="hidden" name="applicationId" value={a.id} />
              <p className="m-0 font-sans text-[15px] leading-[22px]">Approving moves them to Approved in Vendors, where you can invite them to the portal and to markets.</p>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" name="decision" value="approve" variant="primary" icon="check-circle">Approve</Button>
                <Button type="submit" name="decision" value="decline" variant="outline">Decline</Button>
              </div>
              <p className="m-0 font-sans text-[14px] text-ink-muted">Declining doesn&rsquo;t email them; reply from your own inbox.</p>
            </form>
          ) : (
            <p className="m-0 font-sans text-[16px]">This application was {a.status}.</p>
          )}
          <SmartLink href={`/admin/vendors/${a.vendorId}`} className="tap-target brand-link mt-3 inline-block font-sans text-[15px] font-bold">Open their vendor record</SmartLink>
        </Panel>
      </div>
    </PortalFrame>
  );
}
