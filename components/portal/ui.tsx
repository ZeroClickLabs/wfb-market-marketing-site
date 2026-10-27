import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Badge, CATEGORY_LABELS, Icon, Notice, type Category } from "@/components/wfb";
import { SmartLink, cx } from "@/components/wfb/utils";
import { formatDate, formatTimeRange } from "@/content/format";
import { isPortalDemo } from "@/lib/portal/demo";
import { emailEnabled } from "@/lib/email/config";
import type { AdminApplication, DateCounts, PortalDate, VendorStatus } from "@/lib/portal/types";

// Building blocks for portal screens: the brand kit's look, sized for a working tool.

export function PageHeader({ eyebrow, title, lead, back, children }: { eyebrow?: string; title: string; lead?: ReactNode; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <header className="mb-6">
      {back ? (
        <SmartLink href={back.href} className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 font-sans text-[14px] font-bold text-bay no-underline hover:underline">
          <Icon name="arrow-right" size={16} className="rotate-180" />
          {back.label}
        </SmartLink>
      ) : null}
      {eyebrow ? <p className="mt-0 mb-2 -rotate-2 font-script text-[28px] leading-[32px] text-heirloom">{eyebrow}</p> : null}
      <h1 className="m-0 font-display text-[48px] leading-[48px] font-normal uppercase tracking-[.015em] max-tablet:text-[38px] max-tablet:leading-[40px]">{title}</h1>
      {lead ? <p className="mt-2 mb-0 max-w-(--prose-max) font-sans text-[17px] leading-[27px] text-ink-muted">{lead}</p> : null}
      {children ? <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

export function Panel({ title, action, children, className, id }: { title?: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cx("rounded-lg border-3 border-ink bg-paper p-5 max-tablet:p-4", className)} aria-label={title}>
      {title || action ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title ? <h2 className="m-0 font-display text-[28px] leading-[30px] font-normal uppercase tracking-[.02em]">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Attendance status, always in words. `admin` words it for the Market rather than the vendor. */
export function StatusBadge({ date, admin }: { date: Pick<PortalDate, "status" | "dateStatus">; admin?: boolean }) {
  if (date.dateStatus === "cancelled") return <Badge tone="danger" icon="x-circle">Market cancelled</Badge>;
  if (date.status === "confirmed") return <Badge tone="success" icon="check-circle">Confirmed</Badge>;
  if (date.status === "declined") return <Badge tone="neutral" icon="x-circle">Can&rsquo;t make it</Badge>;
  return <Badge tone="warning" icon="alert">{admin ? "No reply" : "Needs your reply"}</Badge>;
}

const STUB: Record<string, string> = { summer: "bg-bay text-on-bay", night: "bg-deep text-on-deep", popup: "bg-corn text-on-corn", winter: "bg-beet text-on-beet" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A small date block in the market's colour, like a ticket stub. */
export function DateStub({ date, kind, className }: { date: string; kind: string; className?: string }) {
  const [, m, d] = date.split("-").map(Number);
  return (
    <span aria-hidden="true" className={cx("grid w-14 flex-none place-items-center rounded-md border-2 border-ink py-1 text-center", STUB[kind] ?? STUB.summer, className)}>
      <span className="font-sans text-[10px] leading-[12px] font-extrabold uppercase tracking-[.14em]">{MONTHS[m - 1]}</span>
      <span className="font-display text-[28px] leading-[28px]">{d}</span>
    </span>
  );
}

export const dateLabel = (d: Pick<PortalDate, "date">) => formatDate(d.date);
export const hoursLabel = (d: Pick<PortalDate, "opensAt" | "closesAt">) => formatTimeRange(d.opensAt, d.closesAt);

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border-control p-6 text-center">
      <p className="m-0 font-sans text-[17px] font-extrabold">{title}</p>
      {children ? <div className="mt-1 font-sans text-[15px] leading-[23px] text-ink-muted">{children}</div> : null}
    </div>
  );
}

// ---- Admin --------------------------------------------------------------------------------------

const VENDOR_STATUS: Record<VendorStatus, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" | "solid" }> = {
  lead: { label: "Lead", tone: "neutral" },
  applied: { label: "Applied", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  declined: { label: "Declined", tone: "danger" },
};
export const VENDOR_STATUS_OPTIONS = (Object.keys(VENDOR_STATUS) as VendorStatus[]).map((value) => ({ value, label: VENDOR_STATUS[value].label }));

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  return <Badge tone={VENDOR_STATUS[status].tone}>{VENDOR_STATUS[status].label}</Badge>;
}

/** "12 confirmed · 3 can't · 4 no reply", always in words. */
export function CountsLine({ counts, className }: { counts: DateCounts; className?: string }) {
  return (
    <span className={cx("font-sans text-[14px] leading-[20px] text-ink-muted", className)}>
      <strong className="text-kale-text">{counts.confirmed} confirmed</strong> · {counts.declined} can&rsquo;t · <strong className={counts.invited ? "text-heirloom-text" : undefined}>{counts.invited} no reply</strong>
    </span>
  );
}

/** A confirmation bar: confirmed / declined / waiting as proportions, with the numbers in words beside it. */
export function CountsBar({ counts }: { counts: DateCounts }) {
  const total = counts.confirmed + counts.declined + counts.invited || 1;
  return (
    <div className="grid grid-cols-1 gap-1.5">
      <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-pill border-2 border-ink bg-paper">
        <span className="bg-kale" style={{ width: `${(counts.confirmed / total) * 100}%` }} />
        <span className="bg-border-control" style={{ width: `${(counts.declined / total) * 100}%` }} />
      </div>
      <CountsLine counts={counts} />
    </div>
  );
}

const FLASH: Record<string, (n: string) => string> = {
  created: () => "Vendor added.",
  invited: () => (emailEnabled() || isPortalDemo() ? "Invite sent. They'll get an email with a login link." : "Invite recorded."),
  published: () => "Profile approved.",
  approved: () => "Application approved. Invite a contact below to give them portal access.",
  declined: () => "Application declined.",
  market: () => "Market created. Add its dates next.",
  status: () => "Date updated. Consider posting an update so vendors know.",
  cancelled: () => "Date cancelled. Post an update so vendors know.",
  reminded: (n) => (n === "0" ? "Everyone has replied; no reminders needed." : `Reminder ${emailEnabled() || isPortalDemo() ? "sent" : "recorded"} for ${n} ${n === "1" ? "vendor" : "vendors"} who haven't replied.`),
  emailed: (n) => `Update posted and emailed to ${n} ${n === "1" ? "vendor" : "vendors"}.`,
  posted: (n) => `Update posted for ${n} ${n === "1" ? "vendor" : "vendors"}.`,
  deleted: () => "Deleted.",
  saved: () => "Saved.",
  uploaded: () => "File added to the library.",
};

/** Said after anything that would email someone, while email isn't going out. */
export function noEmailNote() {
  if (isPortalDemo()) return " (In the preview, no email is sent.)";
  return emailEnabled() ? "" : " (No email was sent: portal email isn't set up yet.)";
}

/** A one-time confirmation after an action, from ?done= (codes only, so the URL can't inject text). */
export function Flash({ done, n }: { done?: string | string[]; n?: string | string[]; demo?: boolean }) {
  const code = typeof done === "string" ? done : undefined;
  const msg = code && FLASH[code]?.(typeof n === "string" ? n : "");
  if (!msg) return null;
  const emails = ["invited", "reminded", "emailed"].includes(code!);
  return (
    <Notice tone={code === "cancelled" ? "warning" : "success"} className="mb-5">
      {msg}
      {emails ? noEmailNote() : ""}
    </Notice>
  );
}

/**
 * An admin table in the kit's style. When its frame is at least 600px wide it's a real table (cells wrap;
 * it scrolls sideways inside the frame only as a last resort). Narrower, wherever it sits (a phone, or a
 * side column), each row becomes a stacked card with every cell labelled by its column.
 * Rows are plain <tr><td>…</td></tr>; the labels are added here from `head`.
 */
export function AdminTable({ label, head, children }: { label: string; head: ReactNode[]; children: ReactNode }) {
  const labelled = Children.map(children, (row) => {
    if (!isValidElement<{ children?: ReactNode }>(row)) return row;
    let i = 0;
    const cells = Children.map(row.props.children, (cell) => {
      if (!isValidElement<{ "data-label"?: string }>(cell)) return cell;
      const h = head[i++];
      return cloneElement(cell, { "data-label": typeof h === "string" ? h : "" });
    });
    return cloneElement(row, {}, cells);
  });
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="@container relative overflow-x-auto rounded-lg border-3 border-ink bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid"
    >
      <table
        className={cx(
          "w-full border-collapse font-sans text-[15px] leading-[22px] [&_td]:!whitespace-normal @max-[720px]:[&_td]:px-3 @max-[720px]:[&_th]:px-3",
          // Narrow: rows as cards, cells as "Label  value" pairs; the first cell is the card's title.
          "@max-[600px]:block @max-[600px]:[&_tbody]:block @max-[600px]:[&_tr]:block @max-[600px]:[&_tr]:px-4 @max-[600px]:[&_tr]:py-3",
          "@max-[600px]:[&_tr+tr]:border-0 @max-[600px]:[&_tr+tr]:border-t-[1.5px] @max-[600px]:[&_tr+tr]:border-dashed @max-[600px]:[&_tr+tr]:border-hairline",
          "@max-[600px]:[&_td]:grid @max-[600px]:[&_td]:grid-cols-[minmax(0,104px)_minmax(0,1fr)] @max-[360px]:[&_td]:grid-cols-[minmax(0,84px)_minmax(0,1fr)]",
          "@max-[600px]:[&_td]:items-center @max-[600px]:[&_td]:gap-x-3 @max-[600px]:[&_td]:gap-y-0.5 @max-[600px]:[&_td]:!border-0 @max-[600px]:[&_td]:!px-0 @max-[600px]:[&_td]:!py-1 @max-[600px]:[&_td]:!text-left",
          "@max-[600px]:[&_td]:before:content-[attr(data-label)] @max-[600px]:[&_td]:before:font-sans @max-[600px]:[&_td]:before:text-[11px] @max-[600px]:[&_td]:before:font-extrabold @max-[600px]:[&_td]:before:uppercase @max-[600px]:[&_td]:before:tracking-[.12em] @max-[600px]:[&_td]:before:text-ink-muted",
          "@max-[600px]:[&_td>*]:col-start-2 @max-[600px]:[&_td>*]:justify-self-start",
          "@max-[600px]:[&_td:first-child]:block @max-[600px]:[&_td:first-child]:pb-2 @max-[600px]:[&_td:first-child]:text-[17px] @max-[600px]:[&_td:first-child]:before:hidden",
          "@max-[600px]:[&_td[data-label='']]:block @max-[600px]:[&_td[data-label='']]:before:hidden @max-[600px]:[&_thead]:hidden",
        )}
      >
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="bg-kraft">
            {head.map((h, i) => (
              <th key={i} scope="col" className="border-0 border-b-2 border-ink px-4 py-3 text-left align-bottom font-sans text-[12px] leading-[16px] font-extrabold uppercase tracking-[.12em]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-0 [&_td]:border-t-[1.5px] [&_td]:border-dashed [&_td]:border-hairline [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_tr:first-child_td]:border-t-0">{labelled}</tbody>
      </table>
    </div>
  );
}

export function categoryLabels(categories: string[]) {
  return categories.map((c) => CATEGORY_LABELS[c as Category] ?? c).join(", ");
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

export function ApplicationBadge({ status }: { status: AdminApplication["status"] }) {
  if (status === "new") return <Badge tone="warning" icon="alert">New</Badge>;
  if (status === "approved") return <Badge tone="success" icon="check-circle">Approved</Badge>;
  return <Badge tone="neutral" icon="x-circle">Declined</Badge>;
}

