import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Badge, Button, Notice, Select } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { AdminTable, EmptyState, Flash, PageHeader, Panel, StatusBadge, VENDOR_STATUS_OPTIONS, VendorStatusBadge, categoryLabels, dateLabel, fmtDateTime } from "@/components/portal/ui";
import { AdminForm } from "@/components/portal/AdminForm";
import { addContactAction, addNoteAction, inviteContactAction, publishProfileAction, setVendorStatusAction } from "@/app/admin/actions";
import { getAdminVendor, listAllMarkets } from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";
import { todayISO } from "@/content/format";

const NOTE_LABEL = { note: "Note", email: "Email", call: "Call", meeting: "Meeting" } as const;

export const metadata = { title: "Vendor" };

export default async function VendorPage({ params, searchParams }: PageProps<"/admin/vendors/[id]">) {
  const user = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [found, markets] = await Promise.all([getAdminVendor(id), listAllMarkets()]);
  if (!found) notFound();
  const { vendor: v, dates, application } = found;
  const today = todayISO();
  const upcoming = dates.filter((d) => d.date.date >= today);
  const marketNames = v.marketIds.map((m) => markets.find((x) => x.id === m)?.name).filter(Boolean);

  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/vendors">
      <PageHeader eyebrow={v.town || undefined} title={v.name} back={{ href: "/admin/vendors", label: "Vendors" }}>
        <VendorStatusBadge status={v.status} />
        <Badge tone="neutral">{v.source === "application" ? "Applied online" : "Added by the Market"}</Badge>
        {categoryLabels(v.categories) ? <Badge tone="neutral">{categoryLabels(v.categories)}</Badge> : null}
      </PageHeader>
      <Flash done={sp.done} demo={isPortalDemo()} />

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          <Panel
            title="Public profile"
            action={v.profilePendingReview ? <Badge tone="warning" icon="clock">Changes to review</Badge> : v.profilePublished ? <Badge tone="success" icon="check-circle">On the website</Badge> : <Badge tone="neutral">Not published</Badge>}
          >
            {v.description || v.products.length ? (
              <div className="grid grid-cols-1 gap-3 font-sans text-[16px] leading-[24px]">
                {v.description ? <p className="m-0">{v.description}</p> : null}
                {v.products.length ? <p className="m-0"><strong>Sells:</strong> {v.products.join(", ")}</p> : null}
                <p className="m-0 text-[15px] text-ink-muted">
                  {[v.website, v.instagram, v.phone && `Phone (private): ${v.phone}`].filter(Boolean).join(" · ") || "No links yet."}
                </p>
                {v.profilePendingReview || !v.profilePublished ? (
                  <form action={publishProfileAction}>
                    <input type="hidden" name="vendorId" value={v.id} />
                    <Button type="submit" variant="primary" size="sm" icon="check-circle">{v.profilePublished ? "Approve changes" : "Approve and publish"}</Button>
                  </form>
                ) : null}
              </div>
            ) : (
              <EmptyState title="No profile yet">The vendor fills this in from their portal.</EmptyState>
            )}
          </Panel>

          <Panel title="Market dates" action={<span className="font-sans text-[14px] font-bold text-ink-muted">{marketNames.join(", ") || "Not in a market yet"}</span>}>
            {upcoming.length ? (
              <AdminTable label={`Upcoming dates for ${v.name}`} head={["Date", "Market", "Reply", "Stall"]}>
                {upcoming.map((p) => (
                  <tr key={p.dateId}>
                    <td className="font-bold whitespace-nowrap"><SmartLink href={`/admin/markets/${p.date.market.id}/${p.dateId}`} className="tap-target text-ink underline decoration-2 underline-offset-2 hover:text-bay">{dateLabel(p.date)}</SmartLink></td>
                    <td>{p.date.market.name}</td>
                    <td><StatusBadge admin date={{ status: p.status, dateStatus: p.date.dateStatus }} />{p.note ? <span className="mt-1 block text-[14px] text-ink-muted">&ldquo;{p.note}&rdquo;</span> : null}</td>
                    <td>{p.stall ?? "–"}</td>
                  </tr>
                ))}
              </AdminTable>
            ) : (
              <EmptyState title="No upcoming dates">Invite them from a market&rsquo;s page.</EmptyState>
            )}
          </Panel>

          <Panel title="Notes">
            <AdminForm
              action={addNoteAction}
              submitLabel="Add note"
              fields={[
                { kind: "hidden", name: "vendorId", value: v.id },
                { kind: "select", name: "kind", label: "Type", options: Object.entries(NOTE_LABEL).map(([value, label]) => ({ value, label })), defaultValue: "note", half: true },
                { kind: "textarea", name: "body", label: "Note", hint: "Calls, emails, anything to remember. Only admins see this." },
              ]}
            />
            {v.notes.length ? (
              <ol className="m-0 mt-5 grid list-none gap-3 p-0">
                {v.notes.map((n) => (
                  <li key={n.id} className="rounded-md border-2 border-ink bg-canvas px-4 py-3">
                    <p className="m-0 font-sans text-[13px] font-extrabold uppercase tracking-[.1em] text-ink-muted">{NOTE_LABEL[n.kind]} · {fmtDateTime(n.at)} · {n.author}</p>
                    <p className="m-0 mt-1 font-sans text-[16px] leading-[24px] whitespace-pre-line">{n.body}</p>
                  </li>
                ))}
              </ol>
            ) : null}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Panel title="Status">
            <form action={setVendorStatusAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="vendorId" value={v.id} />
              <Select name="status" label="Vendor status" options={VENDOR_STATUS_OPTIONS} defaultValue={v.status} className="min-w-[200px] flex-1" />
              <Button type="submit" variant="outline">Save</Button>
            </form>
          </Panel>

          <Panel title="People">
            {v.contacts.length ? (
              <ul className="m-0 mb-5 grid list-none gap-3 p-0">
                {v.contacts.map((c) => (
                  <li key={c.id} className="grid grid-cols-1 gap-2 rounded-md border-2 border-ink bg-canvas px-4 py-3">
                    <div>
                      <p className="m-0 font-sans text-[16px] font-extrabold">{c.name || c.email}</p>
                      <p className="m-0 font-sans text-[14px] break-all text-ink-muted">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {c.hasLogin ? <Badge tone="success" icon="check-circle">Has logged in</Badge> : c.invitedAt ? <Badge tone="info" icon="mail">Invited {fmtDateTime(c.invitedAt)}</Badge> : <Badge tone="neutral">Not invited</Badge>}
                      {!c.hasLogin ? (
                        <form action={inviteContactAction}>
                          <input type="hidden" name="vendorId" value={v.id} />
                          <input type="hidden" name="contactId" value={c.id} />
                          <Button type="submit" variant={c.invitedAt ? "link" : "primary"} size="sm" icon={c.invitedAt ? undefined : "mail"}>{c.invitedAt ? "Resend invite" : "Invite to portal"}</Button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Notice tone="info" className="mb-5">Add a contact to invite them to the portal.</Notice>
            )}
            <details className="rounded-md border-2 border-dashed border-border-control px-4 py-2 open:pb-4">
              <summary className="min-h-[44px] cursor-pointer py-2.5 font-sans text-[15px] font-extrabold">Add a person</summary>
              <div className="mt-2">
                <AdminForm
                  action={addContactAction}
                  submitLabel="Add person"
                  fields={[
                    { kind: "hidden", name: "vendorId", value: v.id },
                    { kind: "text", name: "name", label: "Name", autoComplete: "off" },
                    { kind: "email", name: "email", label: "Email", autoComplete: "off" },
                    { kind: "tel", name: "phone", label: "Phone (optional)", autoComplete: "off" },
                  ]}
                />
              </div>
            </details>
          </Panel>

          {application ? (
            <Panel title="Application">
              <p className="m-0 font-sans text-[15px] leading-[22px] text-ink-muted">Applied {fmtDateTime(application.submittedAt)} for {application.markets.join(", ")}.</p>
              <SmartLink href={`/admin/applications/${application.id}`} className="tap-target brand-link mt-2 inline-block font-sans text-[15px] font-bold">Read the application</SmartLink>
            </Panel>
          ) : null}
        </div>
      </div>
    </PortalFrame>
  );
}
