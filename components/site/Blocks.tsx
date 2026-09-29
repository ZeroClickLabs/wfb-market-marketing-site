import type { ReactNode } from "react";
import { Badge, Button, Icon, Illustration, Logo, type IconName, type IllustrationName, type MarketId, type ScheduleRow } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import type { Fact, Market, QA } from "@/content/types";

/* Shared class strings for text styles that appear in several components. */
const TITLE_DISPLAY = "m-0 font-display text-[32px] leading-[34px] font-normal uppercase tracking-[.02em]";
const BODY_16 = "font-sans text-[16px] leading-[25px] font-normal";

/** A section subheading in display caps, for the smaller headings inside a band. */
export function Subhead({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx("mt-0 mb-4 font-display text-[36px] leading-[38px] font-normal uppercase tracking-[.02em]", className)}>{children}</h2>;
}

/** A paragraph of body copy at reading width. */
export function BodyText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("mt-0 mb-4 max-w-(--prose-max) font-sans text-[17px] leading-[28px] font-normal in-[.wfb-on-deep]:text-on-deep [&_a]:brand-link", className)}>
      {children}
    </p>
  );
}

/** Key facts as icon + label + value: when, hours, where, payments. Icons always sit next to a word. */
export function FactList({ facts, tone = "market", className }: { facts: Fact[]; tone?: "market" | "argo"; className?: string }) {
  const argo = tone === "argo";
  return (
    <dl className={cx("m-0 grid grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-4", argo && "mx-auto max-w-[960px]", className)}>
      {facts.map((f) => (
        <div
          key={f.label}
          className={cx("rounded-lg border-3 px-5 py-4", argo ? "border-argo-gold bg-argo-paper text-argo-ink" : "border-ink bg-paper text-ink")}
        >
          <dt className={cx("flex items-center gap-2 font-sans text-[12px] leading-[16px] font-extrabold uppercase tracking-[.14em]", argo ? "text-argo-ink-muted [&_.wfb-icon]:text-argo-red" : "text-ink-muted [&_.wfb-icon]:text-bay")}>
            <Icon name={f.icon} size={18} />
            {f.label}
          </dt>
          <dd className="mx-0 mt-1.5 mb-0 font-sans text-[19px] leading-[26px] font-extrabold [&_a]:brand-link">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Questions and answers as native disclosures, so they work without JavaScript. */
export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="mx-auto grid max-w-[800px] gap-3">
      {items.map((item) => (
        <details key={item.q} className="group rounded-lg border-3 border-ink bg-paper text-ink">
          <summary
            className={cx(
              "flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 rounded-[calc(var(--radius-lg)-3px)] px-5 py-3.5",
              "font-sans text-[18px] leading-[26px] font-extrabold [&::-webkit-details-marker]:hidden",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid",
            )}
          >
            <span>{item.q}</span>
            {/* A plus that turns into a minus when the answer is open. */}
            <span aria-hidden="true" className="relative size-[28px] flex-none rounded-full border-2 border-ink bg-corn">
              <span className="absolute top-1/2 left-1/2 h-[2.5px] w-3 -translate-1/2 bg-on-corn" />
              <span className="absolute top-1/2 left-1/2 h-[2.5px] w-3 -translate-1/2 rotate-90 bg-on-corn transition-transform duration-160 ease-out group-open:rotate-0 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="max-w-(--prose-max) px-5 pb-5 font-sans text-[16px] leading-[26px] [&_a]:brand-link [&_p]:mt-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: Array<{ title: string; text: ReactNode }> }) {
  return (
    <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-6 p-0">
      {steps.map((s, i) => (
        <li key={s.title} className="flex flex-col items-center gap-2.5 text-center">
          <span
            aria-hidden="true"
            className="mb-1.5 grid size-20 place-items-center rounded-full border-3 border-ink bg-corn font-display text-[48px] leading-none text-on-corn shadow-[0_0_0_5px_var(--paper),0_0_0_7px_var(--ink)]"
          >
            {i + 1}
          </span>
          <h3 className={TITLE_DISPLAY}>{s.title}</h3>
          <p className={cx("m-0 max-w-[300px]", BODY_16, "in-[.wfb-on-deep]:text-glass")}>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export interface InfoCardProps {
  title: string;
  icon?: IconName;
  illustration?: IllustrationName;
  meta?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

// wfb-card is the kit's card (ink outline, paper, radius); these cards aren't links, so no hover lift.
const STILL_CARD = "wfb wfb-card h-full hover:transform-none hover:shadow-none";

/** A paper card for a fact, a job or a contact route. */
export function InfoCard({ title, icon, illustration, meta, children, action }: InfoCardProps) {
  return (
    <article className={STILL_CARD}>
      {illustration ? (
        <div className="relative grid aspect-video place-items-center overflow-hidden border-b-3 border-ink bg-corn-tint">
          <span aria-hidden="true" className="sunburst absolute -inset-1/2" />
          <Illustration name={illustration} className="relative w-[34%]" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {icon ? (
          <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-corn text-on-corn shadow-print-sm">
            <Icon name={icon} size={22} />
          </span>
        ) : null}
        <h3 className={TITLE_DISPLAY}>{title}</h3>
        {meta ? <div className="wfb-meta">{meta}</div> : null}
        {children ? <div className={cx("m-0", BODY_16, "[&_a]:brand-link [&_p]:mt-0 [&_p]:mb-2 [&_p:last-child]:mb-0")}>{children}</div> : null}
        {action ? <div className="mt-auto pt-1.5">{action}</div> : null}
      </div>
    </article>
  );
}

export function CardGrid({ children, min = 250 }: { children: ReactNode; min?: number }) {
  return <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

const MARKET_LOGO: Record<MarketId, "emblem" | "night" | "popup" | "winter"> = { summer: "emblem", night: "night", popup: "popup", winter: "winter" };
const MARKET_GROUND: Record<MarketId, string> = { summer: "bg-bay-tint", night: "bg-deep", popup: "bg-corn", winter: "bg-beet" };

/** One of the four markets: its ticket mark on its identity colour, then the facts. */
export function MarketCard({ market }: { market: Market }) {
  const logo = MARKET_LOGO[market.id];
  return (
    <article className={STILL_CARD}>
      <div className={cx("grid min-h-[200px] place-items-center border-b-3 border-ink p-5", MARKET_GROUND[market.id])}>
        <Logo variant={logo} width={logo === "emblem" ? 132 : 220} label={logo === "emblem" ? "Whitefish Bay Farmers Market" : `${market.name}, Whitefish Bay Farmers Market`} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className={TITLE_DISPLAY}>{market.name}</h3>
        {market.status === "planned" ? <div><Badge tone="info" icon="calendar">Planned</Badge></div> : null}
        <div className="wfb-meta">
          <span><Icon name="calendar" size={16} />{market.when}</span>
          <span><Icon name="clock" size={16} />{market.hours}</span>
          <span><Icon name="map-pin" size={16} />{market.where}</span>
        </div>
        <p className={cx("m-0", BODY_16)}>{market.blurb}</p>
        <div className="mt-auto pt-1.5">
          <Button variant="link" iconAfter="arrow-right" href={market.href}>{market.id === "night" ? "About the Night Market" : "See the dates"}</Button>
        </div>
      </div>
    </article>
  );
}

/** A real table that scrolls inside its container on phones (MarketSchedule.md).
 *  The frame (ink outline, rounded corners) belongs to this container, which stays put, so all four
 *  sides are always visible; only the table inside scrolls. */
export function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        "overflow-x-auto rounded-lg border-3 border-ink bg-paper",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid",
        "[&_.wfb-sched]:min-w-[620px] [&_.wfb-sched]:rounded-none [&_.wfb-sched]:border-0",
      )}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: ReactNode[][] }) {
  // wfb-sched is the kit's schedule board; row headers here are plain bold text, not the dark header style.
  const rowHeader = "border-0 border-dashed border-hairline bg-transparent px-[18px] py-4 font-sans text-[16px] leading-[22px] font-extrabold normal-case tracking-normal text-ink";
  return (
    <ScrollTable label={caption}>
      <table className="wfb wfb-sched">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (j === 0 ? <th key={j} scope="row" className={cx(rowHeader, i > 0 && "border-t-[1.5px]")}>{cell}</th> : <td key={j}>{cell}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollTable>
  );
}

export type { ScheduleRow };

export interface SponsorTier {
  name: string;
  sponsors: Array<{ name: string; logo?: string; href?: string }>;
}

/** "Thanks to our neighbours": equal 48px logo slots, tiers named in text (guidelines/40). */
export function SponsorList({ tiers, emptyAction }: { tiers: SponsorTier[]; emptyAction?: ReactNode }) {
  if (!tiers.some((t) => t.sponsors.length)) {
    return (
      <div className="text-center">
        <BodyText className="mx-auto">We&rsquo;re a brand-new non-profit, and our first sponsors will be thanked right here.</BodyText>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      {tiers.filter((t) => t.sponsors.length).map((tier) => (
        <div key={tier.name}>
          <h3 className="wfb-eyebrow mt-0 mb-3 text-center text-ink-muted">{tier.name}</h3>
          <ul className="m-0 flex list-none flex-wrap justify-center gap-6 p-0">
            {tier.sponsors.map((s, i) => {
              // eslint-disable-next-line @next/next/no-img-element -- partner logos are shown exactly as supplied
              const mark = s.logo ? <img src={s.logo} alt={s.name} height={48} className="block h-12 w-auto" /> : <span className="font-sans text-[14px] leading-[20px] font-bold text-ink-muted">{s.name}</span>;
              return (
                <li key={i} className="grid h-20 min-w-[180px] place-items-center rounded-md border-2 border-dashed border-border-control bg-paper px-5 py-4">
                  {s.href ? <a href={s.href}>{mark}</a> : mark}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Reading text for long pages, held to the prose width. Style plain h2, p, ul and a inside it. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        "mx-auto max-w-(--prose-max) font-sans text-[17px] leading-[28px] text-ink",
        "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[36px] [&_h2]:leading-[38px] [&_h2]:font-normal [&_h2]:uppercase [&_h2]:tracking-[.02em] [&_h2:first-child]:mt-0",
        "[&_p]:mt-0 [&_p]:mb-4 [&_ul]:mt-0 [&_ul]:mb-4 [&_li]:mb-1.5 [&_a]:brand-link",
      )}
    >
      {children}
    </div>
  );
}

/** A small "last updated" line at the end of a Prose page. */
export function UpdatedNote({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-ink-muted">{children}</p>;
}

/** A plain list with a leaf beside each item. */
export function LeafList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0 font-sans text-[17px] leading-[26px]">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 [&_.wfb-icon]:mt-1 [&_.wfb-icon]:text-kale-text in-[.wfb-on-deep]:[&_.wfb-icon]:text-corn">
          <Icon name="leaf" size={18} />
          {it}
        </li>
      ))}
    </ul>
  );
}

/** A grid of the kit's CircleTiles. "compact" fits six smaller tiles across, for light grounds. */
export function TileGrid({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <div
      className={cx(
        "grid justify-items-center gap-y-10",
        compact
          ? "grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-4 [&_.wfb-circle-disc]:size-[156px] [&_.wfb-circle-note]:max-w-[170px]"
          : "grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-5",
      )}
    >
      {children}
    </div>
  );
}

/** Two columns that stack on narrow screens. */
export function Split({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-start gap-7 *:min-w-0">{children}</div>;
}
