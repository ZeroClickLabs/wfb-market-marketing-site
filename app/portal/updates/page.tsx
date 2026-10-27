import { requireVendor } from "@/lib/auth";
import { Badge } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { EmptyState, PageHeader } from "@/components/portal/ui";
import { excerpt } from "@/components/portal/Markdown";
import { listUpdates } from "@/lib/portal/data";
import { formatDate } from "@/content/format";

export const metadata = { title: "Updates" };

export default async function UpdatesPage() {
  const user = await requireVendor();
  const updates = await listUpdates();
  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/updates">
      <PageHeader eyebrow="From the Market" title="Updates" lead="News, reminders and changes. We also email new updates unless you've turned that off in your profile." />
      {updates.length ? (
        <ul className="m-0 grid max-w-[820px] list-none gap-3 p-0">
          {updates.map((u) => (
            <li key={u.id}>
              <SmartLink href={`/portal/updates/${u.id}`} className="block rounded-lg border-3 border-ink bg-paper p-5 text-ink no-underline shadow-print-sm hover:bg-kraft max-tablet:p-4">
                <span className="flex flex-wrap items-center gap-2">
                  {u.pinned ? <Badge tone="solid">Pinned</Badge> : null}
                  {!u.read ? <Badge tone="info">New</Badge> : null}
                  <span className="font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink-muted">
                    {formatDate(u.publishedAt.slice(0, 10))} · {u.authorOrg ? `From ${u.authorOrg}` : u.audienceLabel}
                  </span>
                </span>
                <span className="mt-2 block font-sans text-[20px] leading-[26px] font-extrabold">{u.title}</span>
                <span className="mt-1 block font-sans text-[16px] leading-[24px] text-ink-muted">{excerpt(u.body)}</span>
              </SmartLink>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No updates yet" />
      )}
    </PortalFrame>
  );
}
