import { notFound } from "next/navigation";
import { requirePartner } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { CountsBar, DateStub, EmptyState, PageHeader, Panel, dateLabel, hoursLabel } from "@/components/portal/ui";
import { NotesThread, TaskList } from "@/components/portal/EventPlanning";
import { addPartnerNoteAction, addPartnerTaskAction, deletePartnerTaskAction, togglePartnerTaskAction } from "@/app/partner/actions";
import { getMarketById, getPartnerFor, listEventNotes, listMarketDates, listMarketUpdates, listTasks } from "@/lib/portal/data";
import { formatTime, todayISO } from "@/content/format";

export const metadata = { title: "Event overview" };

export default async function PartnerOverview({ params }: PageProps<"/partner/[marketId]">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, dates, tasks, notes, updates, partner] = await Promise.all([
    getMarketById(marketId), listMarketDates(marketId), listTasks(marketId), listEventNotes(marketId), listMarketUpdates(marketId), getPartnerFor(marketId, user.email),
  ]);
  if (!market) notFound();
  const org = partner?.organisation ?? "Your team";
  const today = todayISO();
  const next = dates.find((d) => d.date >= today && d.dateStatus !== "cancelled");
  const planning = { marketId, side: "partner" as const, partnerOrg: org, tasks, notes, toggleTask: togglePartnerTaskAction, deleteTask: deletePartnerTaskAction, addTask: addPartnerTaskAction, addNote: addPartnerNoteAction, compact: true };

  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}`}>
      <PageHeader eyebrow={`With ${org}`} title={market.name} lead="What's coming up, what needs doing, and the latest from the Market." />

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          <Panel title={next ? "Next date" : "Dates"}>
            {next ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4">
                  <DateStub date={next.date} kind={next.market.kind} />
                  <div>
                    <p className="m-0 font-sans text-[20px] leading-[28px] font-extrabold">{dateLabel(next)}</p>
                    <p className="m-0 font-sans text-[15px] text-ink-muted">{hoursLabel(next)} · load-in from {formatTime(next.loadInAt)} · {next.location}</p>
                  </div>
                </div>
                <CountsBar counts={next.counts} />
                <div className="flex flex-wrap gap-2">
                  <Button href={`/partner/${marketId}/dates/${next.id}`} variant="primary" size="sm" iconAfter="arrow-right">Vendors and stalls</Button>
                  <Button href={`/partner/${marketId}/dates/${next.id}#logistics`} variant="outline" size="sm">Edit logistics</Button>
                </div>
              </div>
            ) : (
              <EmptyState title="No upcoming dates" />
            )}
          </Panel>
          <TaskList {...planning} />
        </div>
        <div className="grid grid-cols-1 gap-5">
          <NotesThread {...planning} />
          <Panel title="Updates to vendors" action={<SmartLink href={`/partner/${marketId}/updates`} className="tap-target brand-link font-sans text-[15px] font-bold">All updates</SmartLink>}>
            {updates.length ? (
              <ul className="m-0 grid list-none gap-2 p-0">
                {updates.slice(0, 3).map((u) => (
                  <li key={u.id} className="rounded-md border-2 border-ink bg-canvas px-4 py-3">
                    <p className="m-0 font-sans text-[16px] leading-[22px] font-extrabold">{u.title}</p>
                    <p className="m-0 mt-1 font-sans text-[14px] text-ink-muted">{u.authorOrg ? `From ${u.authorOrg}` : "From the Market"} · read by {u.recipients.filter((r) => r.readAt).length} of {u.recipients.length}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No updates yet" />
            )}
            <div className="mt-4">
              <Button href={`/partner/${marketId}/updates/new`} variant="accent" size="sm" icon="mail">Write to vendors</Button>
            </div>
          </Panel>
        </div>
      </div>
    </PortalFrame>
  );
}
