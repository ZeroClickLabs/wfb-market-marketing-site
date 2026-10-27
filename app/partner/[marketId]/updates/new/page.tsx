import { requirePartner } from "@/lib/auth";
import { PortalFrame, partnerNav } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { postPartnerUpdateAction } from "@/app/partner/actions";
import { audienceSize, getMarketById, getPartnerFor } from "@/lib/portal/data";

export const metadata = { title: "Write to vendors" };

export default async function PartnerNewUpdate({ params }: PageProps<"/partner/[marketId]/updates/new">) {
  const { marketId } = await params;
  const { user } = await requirePartner(marketId);
  const [market, partner, n] = await Promise.all([getMarketById(marketId), getPartnerFor(marketId, user.email), audienceSize({ kind: "market", marketId })]);
  const org = partner?.organisation;
  return (
    <PortalFrame user={user} nav={partnerNav(marketId)} current={`/partner/${marketId}/updates`}>
      <PageHeader
        title="Write to vendors"
        back={{ href: `/partner/${marketId}/updates`, label: "Updates" }}
        lead={`Goes to the ${n} ${n === 1 ? "vendor" : "vendors"} at ${market?.name}${org ? `, marked “From ${org}”` : ""}. The Market sees it too.`}
      />
      <Panel className="max-w-[860px]">
        <AdminForm
          action={postPartnerUpdateAction}
          submitLabel="Post update"
          pendingLabel="Posting…"
          fields={[
            { kind: "hidden", name: "marketId", value: marketId },
            { kind: "text", name: "title", label: "Title", required: true, placeholder: "e.g. Parking on the day", autoComplete: "off" },
            { kind: "markdown", name: "body", label: "Message", required: true },
            { kind: "checkbox", name: "email", label: "Also email it", hint: "Goes to vendors who haven't turned off update emails.", defaultChecked: true },
          ]}
        />
      </Panel>
    </PortalFrame>
  );
}
