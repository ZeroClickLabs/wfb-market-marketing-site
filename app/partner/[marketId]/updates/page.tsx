import { requirePartner } from "@/lib/auth";
import { Badge, Button } from "@/components/wfb";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { EmptyState, Flash, PageHeader, fmtDateTime } from "@/components/portal/ui";
import { excerpt } from "@/components/portal/Markdown";
import { getMarketById, listMarketUpdates } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";

export const metadata = { title: "Updates" };

export default async function PartnerUpdates({ params, searchParams }: PageProps<"/partner/[marketId]/updates">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, updates, sp] = await Promise.all([getMarketById(marketId), listMarketUpdates(marketId), searchParams]);
  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/updates`}>
      <PageHeader eyebrow={market?.name} title="Updates" lead="What vendors at this event have been told, by you and by the Market.">
        <Button href={`/partner/${marketId}/updates/new`} variant="accent" icon="mail">Write to vendors</Button>
      </PageHeader>
      <Flash done={sp.done} n={sp.n} demo={isPortalDemo()} />
      {updates.length ? (
        <ul className="m-0 grid max-w-[900px] list-none gap-4 p-0">
          {updates.map((u) => (
            <li key={u.id} className="rounded-lg border-3 border-ink bg-paper p-5 max-tablet:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={u.authorOrg ? "info" : "neutral"}>{u.authorOrg ? `From ${u.authorOrg}` : "From the Market"}</Badge>
                {u.emailedAt ? <Badge tone="neutral" icon="mail">Emailed</Badge> : null}
                <span className="font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink-muted">{fmtDateTime(u.publishedAt)}</span>
              </div>
              <h2 className="mt-2 mb-1 font-sans text-[20px] leading-[26px] font-extrabold">{u.title}</h2>
              <p className="m-0 font-sans text-[15px] leading-[22px] text-ink-muted">{excerpt(u.body, 200)}</p>
              <p className="m-0 mt-2 font-sans text-[14px] font-bold">Read by {u.recipients.filter((r) => r.readAt).length} of {u.recipients.length} vendors</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No updates yet" />
      )}
    </PortalFrame>
  );
}
