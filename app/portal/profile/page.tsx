import { requireVendor } from "@/lib/auth";
import { Badge, Notice } from "@/components/wfb";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { PageHeader, Panel } from "@/components/portal/ui";
import { EmailPrefForm, ProfileForm } from "@/components/portal/ProfileForm";
import { getVendor, listMembers } from "@/lib/portal/data";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireVendor();
  const [vendor, members] = await Promise.all([getVendor(), listMembers()]);
  const me = members.find((m) => m.isYou);
  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal/profile">
      <PageHeader eyebrow="Your business" title="Profile" lead="What shoppers see about you on the Market's Vendors page.">
        {vendor.profilePendingReview ? (
          <Badge tone="warning" icon="clock">Changes waiting for review</Badge>
        ) : vendor.profilePublished ? (
          <Badge tone="success" icon="check-circle">On the website</Badge>
        ) : (
          <Badge tone="neutral">Not on the website yet</Badge>
        )}
      </PageHeader>

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <Panel title="Public profile">
          {vendor.profilePendingReview ? (
            <Notice tone="info" className="mb-5">We&rsquo;ll review your latest changes, usually within two days.
              {vendor.profilePublished ? " Until then the website shows your last approved profile." : " Your profile goes on the website once it's approved."}
            </Notice>
          ) : null}
          <ProfileForm vendor={vendor} />
        </Panel>

        <div className="grid grid-cols-1 gap-5">
          <Panel title="Team">
            <p className="mt-0 mb-3 font-sans text-[15px] leading-[22px] text-ink-muted">Everyone here can log in and reply for {vendor.name}. To add someone, email the Market.</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {members.map((m) => (
                <li key={m.email} className="rounded-md border-2 border-ink bg-canvas px-4 py-2.5">
                  <span className="block font-sans text-[16px] font-extrabold">
                    {m.name}
                    {m.isYou ? <span className="font-normal text-ink-muted"> (you)</span> : null}
                  </span>
                  <span className="block break-all font-sans text-[14px] text-ink-muted">{m.email}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Email">
            <EmailPrefForm on={me?.emailUpdates ?? true} />
          </Panel>
        </div>
      </div>
    </PortalFrame>
  );
}
