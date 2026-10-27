import { redirect } from "next/navigation";
import { requirePartner } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { CardGrid } from "@/components/site/Blocks";
import { PortalFrame } from "@/components/portal/PortalShell";
import { EmptyState, PageHeader } from "@/components/portal/ui";
import { listMarketsByIds } from "@/lib/portal/data";

export default async function PartnerHome() {
  const { user, marketIds } = await requirePartner();
  const markets = await listMarketsByIds(marketIds);
  if (markets.length === 1) redirect(`/partner/${markets[0].id}`);
  return (
    <PortalFrame user={user}>
      <PageHeader eyebrow={`Hi, ${user.fullName?.split(" ")[0] ?? "there"}`} title="Your events" lead="The events you're planning with the Whitefish Bay Farmers Market." />
      {markets.length ? (
        <CardGrid min={280}>
          {markets.map((m) => (
            <article key={m.id} className="flex flex-col gap-4 rounded-lg border-3 border-ink bg-paper p-5">
              <h2 className="m-0 font-display text-[30px] leading-[32px] font-normal uppercase tracking-[.02em]">{m.name}</h2>
              <div className="mt-auto">
                <Button href={`/partner/${m.id}`} variant="primary" size="sm" iconAfter="arrow-right">Open</Button>
              </div>
            </article>
          ))}
        </CardGrid>
      ) : (
        <EmptyState title="No events yet">The Market will add you to an event and let you know.</EmptyState>
      )}
    </PortalFrame>
  );
}
