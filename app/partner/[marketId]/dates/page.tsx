import { requirePartner } from "@/lib/auth";
import { Badge } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { AdminTable, CountsLine, EmptyState, PageHeader, dateLabel, hoursLabel } from "@/components/portal/ui";
import { getMarketById, listMarketDates } from "@/lib/portal/data";
import { todayISO } from "@/content/format";

export const metadata = { title: "Dates" };

export default async function PartnerDates({ params }: PageProps<"/partner/[marketId]/dates">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, dates] = await Promise.all([getMarketById(marketId), listMarketDates(marketId)]);
  const upcoming = dates.filter((d) => d.date >= todayISO());
  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/dates`}>
      <PageHeader eyebrow={market?.name} title="Dates" lead="Each date's vendors, stalls and logistics." />
      {upcoming.length ? (
        <AdminTable label={`${market?.name} dates`} head={["Date", "Hours", "Vendors", ""]}>
          {upcoming.map((d) => (
            <tr key={d.id}>
              <td>
                <SmartLink href={`/partner/${marketId}/dates/${d.id}`} className="tap-target font-extrabold text-ink underline decoration-2 underline-offset-2 hover:text-bay">{dateLabel(d)}</SmartLink>
                {d.dateStatus !== "scheduled" ? <Badge tone={d.dateStatus === "cancelled" ? "danger" : "warning"} className="ml-2">{d.dateStatus === "cancelled" ? "Cancelled" : "Moved"}</Badge> : null}
              </td>
              <td>{hoursLabel(d)}</td>
              <td><CountsLine counts={d.counts} /></td>
              <td className="text-right"><SmartLink href={`/partner/${marketId}/dates/${d.id}`} className="tap-target brand-link font-bold">Open</SmartLink></td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState title="No upcoming dates" />
      )}
    </PortalFrame>
  );
}
