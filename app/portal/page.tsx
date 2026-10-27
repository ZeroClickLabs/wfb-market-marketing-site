import { requireVendor } from "@/lib/auth";
import { Badge, Button, Icon } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { PortalFrame, VENDOR_NAV } from "@/components/portal/PortalShell";
import { DateStub, EmptyState, PageHeader, Panel, StatusBadge, dateLabel, hoursLabel } from "@/components/portal/ui";
import { RespondForm } from "@/components/portal/RespondForm";
import { excerpt } from "@/components/portal/Markdown";
import { getVendor, listDates, listUpdates } from "@/lib/portal/data";
import { todayISO } from "@/content/format";

export default async function PortalHome() {
  const user = await requireVendor();
  const [vendor, dates, updates] = await Promise.all([getVendor(), listDates(), listUpdates()]);
  const today = todayISO();
  const upcoming = dates.filter((d) => d.date >= today && d.dateStatus !== "cancelled");
  const next = upcoming.find((d) => d.status !== "declined");
  const toReply = upcoming.filter((d) => d.status === "invited");
  const unread = updates.filter((u) => !u.read);
  const highlights = updates.filter((u) => u.pinned || !u.read).slice(0, 3);

  const todos = [
    toReply.length ? { href: "/portal/calendar", text: `Reply to ${toReply.length} market ${toReply.length === 1 ? "date" : "dates"}` } : null,
    unread.length ? { href: "/portal/updates", text: `Read ${unread.length} new ${unread.length === 1 ? "update" : "updates"}` } : null,
    !vendor.description || !vendor.products.length ? { href: "/portal/profile", text: "Finish your profile for the website" } : null,
  ].filter((t): t is { href: string; text: string } => Boolean(t));

  return (
    <PortalFrame user={user} nav={VENDOR_NAV} current="/portal">
      <PageHeader eyebrow={`Hi, ${user.fullName?.split(" ")[0] ?? "there"}`} title={vendor.name} lead="Your next market, what needs a reply, and news from the Market." />

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-5 max-desktop:grid-cols-1">
        <div className="grid grid-cols-1 gap-5">
          <Panel title="Your next market">
            {next ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4">
                  <DateStub date={next.date} kind={next.market.kind} />
                  <div className="min-w-0">
                    <p className="m-0 font-sans text-[13px] leading-[18px] font-extrabold uppercase tracking-[.12em] text-ink-muted">{next.market.name}</p>
                    <p className="m-0 font-sans text-[20px] leading-[28px] font-extrabold">{dateLabel(next)}</p>
                    <p className="m-0 font-sans text-[16px] leading-[24px] text-ink-muted">
                      {hoursLabel(next)} · {next.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge date={next} />
                      {next.stall ? <Badge tone="info" icon="tent">Stall {next.stall}</Badge> : null}
                    </div>
                  </div>
                </div>
                {next.status === "invited" ? <RespondForm ids={[next.id]} current={next.status} /> : null}
                <div>
                  <Button href={`/portal/calendar/${next.id}`} variant="outline" size="sm" iconAfter="arrow-right">
                    Load-in and details
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState title="No upcoming dates yet">We&rsquo;ll let you know as soon as we invite you to a market.</EmptyState>
            )}
          </Panel>

          <Panel title="Updates" action={<SmartLink href="/portal/updates" className="tap-target brand-link font-sans text-[15px] font-bold">See all</SmartLink>}>
            {highlights.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {highlights.map((u) => (
                  <li key={u.id}>
                    <SmartLink href={`/portal/updates/${u.id}`} className="block rounded-md border-2 border-ink bg-canvas px-4 py-3 text-ink no-underline hover:bg-kraft">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-[17px] leading-[24px] font-extrabold">{u.title}</span>
                        {u.pinned ? <Badge tone="solid">Pinned</Badge> : null}
                        {!u.read ? <Badge tone="info">New</Badge> : null}
                      </span>
                      <span className="mt-1 block font-sans text-[15px] leading-[22px] text-ink-muted">{excerpt(u.body, 120)}</span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="You're all caught up" />
            )}
          </Panel>
        </div>

        <Panel title="To do" className="bg-corn-tint">
          {todos.length ? (
            <ul className="m-0 grid list-none gap-2 p-0">
              {todos.map((t) => (
                <li key={t.href}>
                  <SmartLink href={t.href} className="flex min-h-[44px] items-center gap-3 rounded-md border-2 border-ink bg-paper px-4 py-2 font-sans text-[16px] leading-[22px] font-bold text-ink no-underline hover:bg-kraft">
                    <Icon name="alert" size={20} className="flex-none text-heirloom" />
                    <span className="flex-1">{t.text}</span>
                    <Icon name="arrow-right" size={18} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 flex items-center gap-2 font-sans text-[16px] font-bold">
              <Icon name="check-circle" size={20} className="text-kale" /> Nothing to do. See you at the market!
            </p>
          )}
        </Panel>
      </div>
    </PortalFrame>
  );
}
