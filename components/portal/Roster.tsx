import type { ReactNode } from "react";
import { Button } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { AdminTable, CountsBar, EmptyState, StatusBadge, categoryLabels, dateLabel, fmtDateTime } from "./ui";
import type { DateCounts, MarketDate, PartnerRosterRow, RosterRow } from "@/lib/portal/types";

const ORDER = { confirmed: 0, invited: 1, declined: 2 } as const;

/**
 * A market date's roster: replies in words, stall numbers (editable), vendor notes, and for event
 * partners the vendor's contacts. Used by the admin and by partners, each with their own actions.
 */
export function Roster({ date, rows, counts, stallAction, hidden, actions, vendorHref }: {
  date: MarketDate;
  rows: (RosterRow | PartnerRosterRow)[];
  counts: DateCounts;
  /** Saves one stall; receives dateId, vendorId, stall and the `hidden` fields. */
  stallAction: (formData: FormData) => Promise<void>;
  hidden?: Record<string, string>;
  /** Buttons beside the counts: remind, download. */
  actions?: ReactNode;
  /** Links vendor names (the admin's CRM); partners see plain names. */
  vendorHref?: (vendorId: string) => string;
}) {
  const sorted = [...rows].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.vendorName.localeCompare(b.vendorName));
  const withContacts = sorted.some((r) => "contacts" in r);
  const head = ["Vendor", "Reply", "Stall", "Note", ...(withContacts ? ["Contact"] : [])];

  return (
    <>
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-lg border-3 border-ink bg-paper p-5 max-tablet:grid-cols-1">
        <CountsBar counts={counts} />
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {sorted.length ? (
        <AdminTable label={`Roster for ${dateLabel(date)}`} head={head}>
          {sorted.map((r) => (
            <tr key={r.vendorId}>
              <td>
                {vendorHref ? (
                  <SmartLink href={vendorHref(r.vendorId)} className="tap-target font-extrabold text-ink underline decoration-2 underline-offset-2 hover:text-bay">{r.vendorName}</SmartLink>
                ) : (
                  <span className="font-extrabold">{r.vendorName}</span>
                )}
                <span className="block text-[14px] text-ink-muted">{categoryLabels(r.categories)}</span>
              </td>
              <td>
                <StatusBadge admin date={{ status: r.status, dateStatus: date.dateStatus }} />
                {r.respondedAt ? <span className="mt-1 block text-[13px] text-ink-muted">{fmtDateTime(r.respondedAt)}</span> : null}
              </td>
              <td>
                {r.status === "declined" ? (
                  <span className="text-ink-muted">–</span>
                ) : (
                  <form action={stallAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="dateId" value={date.id} />
                    <input type="hidden" name="vendorId" value={r.vendorId} />
                    {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
                    <label className="sr-only" htmlFor={`stall-${r.vendorId}`}>Stall for {r.vendorName}</label>
                    <input id={`stall-${r.vendorId}`} name="stall" defaultValue={r.stall ?? ""} maxLength={12} className="wfb-field-input min-h-[44px] w-20 px-2.5 py-1.5" />
                    <Button type="submit" variant="link" size="sm">Save</Button>
                  </form>
                )}
              </td>
              <td className="max-w-[260px] text-[14px]">{r.note ? `“${r.note}”` : <span className="text-ink-muted">–</span>}</td>
              {withContacts ? (
                <td className="text-[14px]">
                  {"contacts" in r && r.contacts.length ? (
                    <div>
                      {r.contacts.map((c) => (
                        <span key={c.email} className="block">
                          {c.name}
                          <a href={`mailto:${c.email}`} className="tap-target brand-link block break-all">{c.email}</a>
                          {c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="tap-target brand-link block">{c.phone}</a> : null}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-ink-muted">–</span>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState title="Nobody invited yet">The Market invites vendors to each date.</EmptyState>
      )}
    </>
  );
}
