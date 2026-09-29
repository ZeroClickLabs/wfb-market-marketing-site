import type { ReactNode } from "react";
import { Badge, Button, Icon, Illustration, Logo, type IconName, type IllustrationName, type MarketId, type ScheduleRow } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import type { Fact, Market, QA } from "@/content/types";

/** Key facts as icon + label + value: when, hours, where, payments. Icons always sit next to a word. */
export function FactList({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl className={cx("wfb-facts", className)}>
      {facts.map((f) => (
        <div className="wfb-fact" key={f.label}>
          <dt><Icon name={f.icon} size={18} />{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Questions and answers as native disclosures, so they work without JavaScript. */
export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="wfb-faq">
      {items.map((item) => (
        <details className="wfb-faq-item" key={item.q}>
          <summary>
            <span>{item.q}</span>
            <span className="wfb-faq-mark" aria-hidden="true" />
          </summary>
          <div className="wfb-faq-a">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: Array<{ title: string; text: ReactNode }> }) {
  return (
    <ol className="wfb-steps">
      {steps.map((s, i) => (
        <li className="wfb-step" key={s.title}>
          <span className="wfb-step-num" aria-hidden="true">{i + 1}</span>
          <h3 className="wfb-step-title">{s.title}</h3>
          <p>{s.text}</p>
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

/** A paper card for a fact, a job or a contact route. */
export function InfoCard({ title, icon, illustration, meta, children, action }: InfoCardProps) {
  return (
    <article className="wfb wfb-card wfb-info">
      {illustration ? <div className="wfb-info-art"><Illustration name={illustration} /></div> : null}
      <div className="wfb-info-body">
        {icon ? <span className="wfb-info-icon"><Icon name={icon} size={22} /></span> : null}
        <h3 className="wfb-info-title">{title}</h3>
        {meta ? <div className="wfb-meta">{meta}</div> : null}
        {children ? <div className="wfb-info-text">{children}</div> : null}
        {action ? <div className="wfb-info-action">{action}</div> : null}
      </div>
    </article>
  );
}

export function CardGrid({ children, min = 250 }: { children: ReactNode; min?: number }) {
  return <div className="wfb-card-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

const MARKET_LOGO: Record<MarketId, "emblem" | "night" | "popup" | "winter"> = { summer: "emblem", night: "night", popup: "popup", winter: "winter" };

/** One of the four markets: its ticket mark on its identity colour, then the facts. */
export function MarketCard({ market }: { market: Market }) {
  const logo = MARKET_LOGO[market.id];
  return (
    <article className="wfb wfb-card wfb-market">
      <div className={cx("wfb-market-art", `wfb-market-${market.id}`)}>
        <Logo variant={logo} width={logo === "emblem" ? 132 : 220} label={logo === "emblem" ? "Whitefish Bay Farmers Market" : `${market.name}, Whitefish Bay Farmers Market`} />
      </div>
      <div className="wfb-info-body">
        <h3 className="wfb-info-title">{market.name}</h3>
        {market.status === "planned" ? <div><Badge tone="info" icon="calendar">Planned</Badge></div> : null}
        <div className="wfb-meta">
          <span><Icon name="calendar" size={16} />{market.when}</span>
          <span><Icon name="clock" size={16} />{market.hours}</span>
          <span><Icon name="map-pin" size={16} />{market.where}</span>
        </div>
        <p className="wfb-info-text">{market.blurb}</p>
        <div className="wfb-info-action">
          <Button variant="link" iconAfter="arrow-right" href={market.href}>{market.id === "night" ? "About the Night Market" : "See the dates"}</Button>
        </div>
      </div>
    </article>
  );
}

/** A real table that scrolls inside its container on phones (MarketSchedule.md). */
export function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return <div className="wfb-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>;
}

export function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: ReactNode[][] }) {
  return (
    <ScrollTable label={caption}>
      <table className="wfb wfb-sched wfb-datatable">
        <caption className="wfb-sr">{caption}</caption>
        <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}</tr>
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
      <div className="wfb-sponsors-empty">
        <p className="wfb-body">We&rsquo;re a brand-new non-profit, and our first sponsors will be thanked right here.</p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className="wfb-sponsors">
      {tiers.filter((t) => t.sponsors.length).map((tier) => (
        <div className="wfb-sponsor-tier" key={tier.name}>
          <h3 className="wfb-eyebrow wfb-sponsor-tier-name">{tier.name}</h3>
          <ul className="wfb-sponsor-slots">
            {tier.sponsors.map((s, i) => {
              // eslint-disable-next-line @next/next/no-img-element -- partner logos are shown exactly as supplied
              const mark = s.logo ? <img src={s.logo} alt={s.name} height={48} /> : <span className="wfb-sponsor-name">{s.name}</span>;
              return <li className="wfb-sponsor-slot" key={i}>{s.href ? <a href={s.href}>{mark}</a> : mark}</li>;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Reading text for long pages, held to --prose-max. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="wfb-prose">{children}</div>;
}

/** A plain list with a leaf beside each item. */
export function LeafList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="wfb-leaf-list">
      {items.map((it, i) => <li key={i}><Icon name="leaf" size={18} />{it}</li>)}
    </ul>
  );
}
