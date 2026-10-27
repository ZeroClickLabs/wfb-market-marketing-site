import { requirePartner } from "@/lib/auth";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { PageHeader } from "@/components/portal/ui";
import { EventPlanning } from "@/components/portal/EventPlanning";
import { addPartnerNoteAction, addPartnerTaskAction, deletePartnerTaskAction, togglePartnerTaskAction } from "@/app/partner/actions";
import { getMarketById, getPartnerFor, listEventNotes, listTasks } from "@/lib/portal/data";

export const metadata = { title: "Plan" };

export default async function PartnerPlan({ params }: PageProps<"/partner/[marketId]/plan">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, tasks, notes, partner] = await Promise.all([getMarketById(marketId), listTasks(marketId), listEventNotes(marketId), getPartnerFor(marketId, user.email)]);
  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/plan`}>
      <PageHeader eyebrow={market?.name} title="Plan" lead="The to-do list and notes you share with the Market. Vendors don't see these." />
      <EventPlanning
        marketId={marketId}
        side="partner"
        partnerOrg={partner?.organisation ?? "Your team"}
        tasks={tasks}
        notes={notes}
        toggleTask={togglePartnerTaskAction}
        deleteTask={deletePartnerTaskAction}
        addTask={addPartnerTaskAction}
        addNote={addPartnerNoteAction}
      />
    </PortalFrame>
  );
}
