import { notFound } from "next/navigation";
import { requireVendor } from "@/lib/auth";
import { Badge } from "@/components/wfb";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { Markdown } from "@/components/portal/Markdown";
import { getUpdate, markUpdateRead } from "@/lib/portal/data";
import { formatDate } from "@/content/format";

export const metadata = { title: "Update" };

export default async function UpdatePage({ params }: PageProps<"/portal/updates/[id]">) {
  const user = await requireVendor();
  const { id } = await params;
  const update = await getUpdate(id);
  if (!update) notFound();
  // Opening an update is the read receipt the Market sees.
  if (!update.read) await markUpdateRead(id);

  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/updates">
      <PageHeader title={update.title} back={{ href: "/portal/updates", label: "Updates" }}>
        {update.pinned ? <Badge tone="solid">Pinned</Badge> : null}
        <span className="font-sans text-[14px] font-bold text-ink-muted">
          {formatDate(update.publishedAt.slice(0, 10), { year: true })} · {update.authorOrg ? `From ${update.authorOrg}` : update.audienceLabel}
        </span>
      </PageHeader>
      <Panel className="max-w-[820px]">
        <Markdown>{update.body}</Markdown>
      </Panel>
    </PortalFrame>
  );
}
