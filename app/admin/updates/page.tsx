import { requireAdmin } from "@/lib/auth";
import { Badge, Button } from "@/components/wfb";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { EmptyState, Flash, PageHeader, fmtDateTime } from "@/components/portal/ui";
import { excerpt } from "@/components/portal/Markdown";
import { deleteUpdateAction, pinUpdateAction } from "@/app/admin/actions";
import { listAdminUpdates } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";

export const metadata = { title: "Updates" };

export default async function AdminUpdatesPage({ searchParams }: PageProps<"/admin/updates">) {
  const user = await requireAdmin();
  const [updates, sp] = await Promise.all([listAdminUpdates(), searchParams]);
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/updates">
      <PageHeader eyebrow="To vendors" title="Updates" lead="News and changes, in the portal and by email. See who's read each one.">
        <Button href="/admin/updates/new" variant="accent" icon="mail">Write an update</Button>
      </PageHeader>
      <Flash done={sp.done} n={sp.n} demo={isPortalDemo()} />
      {updates.length ? (
        <ul className="m-0 grid max-w-[900px] list-none gap-4 p-0">
          {updates.map((u) => {
            const read = u.recipients.filter((r) => r.readAt);
            const unread = u.recipients.filter((r) => !r.readAt);
            return (
              <li key={u.id} className="rounded-lg border-3 border-ink bg-paper p-5 max-tablet:p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {u.pinned ? <Badge tone="solid">Pinned</Badge> : null}
                  {u.authorOrg ? <Badge tone="info">From {u.authorOrg}</Badge> : null}
                  {u.emailedAt ? <Badge tone="info" icon="mail">Emailed</Badge> : <Badge tone="neutral">Portal only</Badge>}
                  <span className="font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink-muted">{fmtDateTime(u.publishedAt)} · {u.audienceLabel}</span>
                </div>
                <h2 className="mt-2 mb-1 font-sans text-[20px] leading-[26px] font-extrabold">{u.title}</h2>
                <p className="m-0 font-sans text-[15px] leading-[22px] text-ink-muted">{excerpt(u.body, 180)}</p>
                <details className="mt-3">
                  <summary className="cursor-pointer py-[11px] font-sans text-[15px] leading-[22px] font-bold">
                    Read by {read.length} of {u.recipients.length}
                  </summary>
                  <div className="mt-2 grid grid-cols-2 gap-4 font-sans text-[14px] leading-[21px] max-tablet:grid-cols-1">
                    <div>
                      <p className="m-0 font-extrabold">Not read yet</p>
                      <ul className="m-0 pl-5">{unread.length ? unread.map((r) => <li key={r.vendorId}>{r.vendorName}</li>) : <li>Everyone has read it</li>}</ul>
                    </div>
                    <div>
                      <p className="m-0 font-extrabold">Read</p>
                      <ul className="m-0 pl-5">{read.length ? read.map((r) => <li key={r.vendorId}>{r.vendorName} <span className="text-ink-muted">({fmtDateTime(r.readAt!)})</span></li>) : <li>Nobody yet</li>}</ul>
                    </div>
                  </div>
                </details>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={pinUpdateAction}>
                    <input type="hidden" name="updateId" value={u.id} />
                    <input type="hidden" name="pinned" value={String(!u.pinned)} />
                    <Button type="submit" variant="outline" size="sm">{u.pinned ? "Unpin" : "Pin to top"}</Button>
                  </form>
                  <form action={deleteUpdateAction}>
                    <input type="hidden" name="updateId" value={u.id} />
                    <Button type="submit" variant="link" size="sm">Delete</Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No updates yet" />
      )}
    </PortalFrame>
  );
}
