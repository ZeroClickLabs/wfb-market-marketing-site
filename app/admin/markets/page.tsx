import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { CardGrid } from "@/components/site/Blocks";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { CountsBar, DateStub, PageHeader, dateLabel } from "@/components/portal/ui";
import { listMarkets } from "@/lib/portal/data";
import { formatDate, todayISO } from "@/content/format";

export const metadata = { title: "Markets" };

export default async function MarketsPage() {
  const user = await requireAdmin();
  const markets = await listMarkets(todayISO());
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/markets">
      <PageHeader eyebrow="Dates and rosters" title="Markets" lead="Each market's dates, who's coming and where they're set up.">
        <Button href="/admin/markets/new" variant="accent" icon="calendar">New market</Button>
      </PageHeader>
      <CardGrid min={320}>
        {markets.map(({ market, dates, vendors, next, first, last }) => (
          <article key={market.id} className="flex flex-col gap-4 rounded-lg border-3 border-ink bg-paper p-5">
            <div>
              <h2 className="m-0 font-display text-[30px] leading-[32px] font-normal uppercase tracking-[.02em]">
                <SmartLink href={`/admin/markets/${market.id}`} className="tap-target text-ink no-underline hover:underline">{market.name}</SmartLink>
              </h2>
              <p className="m-0 mt-1 font-sans text-[15px] text-ink-muted">
                {dates ? `${dates} ${dates === 1 ? "date" : "dates"}, ${first === last ? formatDate(first!, { year: true }) : `${formatDate(first!)} – ${formatDate(last!, { year: true })}`}` : "No dates yet"} · {vendors} {vendors === 1 ? "vendor" : "vendors"}
              </p>
            </div>
            {next ? (
              <div className="flex items-start gap-3 rounded-md bg-kraft p-3">
                <DateStub date={next.date} kind={next.market.kind} />
                <div className="grid flex-1 gap-1.5">
                  <p className="m-0 font-sans text-[15px] font-extrabold">Next: {dateLabel(next)}</p>
                  <CountsBar counts={next.counts} />
                </div>
              </div>
            ) : null}
            <div className="mt-auto">
              <Button href={`/admin/markets/${market.id}`} variant="outline" size="sm" iconAfter="arrow-right">Dates and vendors</Button>
            </div>
          </article>
        ))}
      </CardGrid>
    </PortalFrame>
  );
}
