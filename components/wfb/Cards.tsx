/* eslint-disable @next/next/no-img-element -- vendor photos come from content; swap to next/image once they're hosted */
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { Illustration, type IllustrationName } from "./Logo";
import { Badge, Tag, type Category } from "./Status";
import { cx, SmartLink, toneVar, type Tone } from "./utils";

export type MarketId = "summer" | "night" | "popup" | "winter";

function CardTitleLink({ href, children }: { href?: string; children: ReactNode }) {
  return href ? <SmartLink className="wfb-card-link" href={href}>{children}</SmartLink> : <>{children}</>;
}

export interface VendorCardProps {
  name: string;
  category?: Category;
  categories?: Category[];
  description?: string;
  stall?: string | number;
  from?: string;
  illustration?: IllustrationName;
  image?: string;
  imageAlt?: string;
  acceptsSnap?: boolean;
  href?: string;
  className?: string;
}

export function VendorCard(p: VendorCardProps) {
  const cats = p.categories ?? [p.category ?? "other"];
  return (
    <article className={cx("wfb", "wfb-card", "wfb-vendor", p.className)}>
      <div className={cx("wfb-vendor-art", `wfb-vendor-art-${cats[0]}`)}>
        {p.stall ? <span className="wfb-vendor-stall">Stall {p.stall}</span> : null}
        {p.image ? <img className="wfb-photo" src={p.image} alt={p.imageAlt ?? ""} /> : <Illustration name={p.illustration ?? "tomato"} />}
      </div>
      <div className="wfb-vendor-body">
        <div className="wfb-row" style={{ gap: "6px" }}>
          {cats.map((c) => <Tag key={c} category={c} />)}
        </div>
        <h3 className="wfb-vendor-name"><CardTitleLink href={p.href}>{p.name}</CardTitleLink></h3>
        {p.description ? <p className="wfb-vendor-desc">{p.description}</p> : null}
        <div className="wfb-vendor-foot">
          <div className="wfb-meta">
            {p.from ? <span><Icon name="map-pin" size={16} />{p.from}</span> : null}
          </div>
          {p.acceptsSnap ? <Badge tone="success" icon="card">SNAP/EBT</Badge> : null}
        </div>
      </div>
    </article>
  );
}

const MARKET_NAMES: Record<MarketId, string> = { summer: "Summer Market", night: "Night Market", popup: "Pop-Up Market", winter: "Winter Market" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface EventCardProps {
  /** ISO date, e.g. "2026-06-06". */
  date: string;
  title: string;
  market?: MarketId;
  eyebrow?: string;
  time?: string;
  location?: string;
  status?: ReactNode;
  href?: string;
  className?: string;
}

export function EventCard({ date, title, market = "summer", eyebrow, time, location, status, href, className }: EventCardProps) {
  // Read the calendar date directly so the server's time zone can't shift the day.
  const [y, m, d] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (
    <article className={cx("wfb", "wfb-card", "wfb-ticket", className)}>
      <time className={cx("wfb-ticket-stub", `wfb-ticket-${market}`)} dateTime={date}>
        <span className="wfb-ticket-mo">{MONTHS[m - 1]}</span>
        <span className="wfb-ticket-day">{d}</span>
        <span className="wfb-ticket-wd">{WEEKDAYS[weekday]}</span>
      </time>
      <div className="wfb-ticket-body">
        <span className="wfb-ticket-eyebrow">{eyebrow ?? MARKET_NAMES[market]}</span>
        <h3 className="wfb-ticket-title"><CardTitleLink href={href}>{title}</CardTitleLink></h3>
        <div className="wfb-meta">
          {time ? <span><Icon name="clock" size={16} />{time}</span> : null}
          {location ? <span><Icon name="map-pin" size={16} />{location}</span> : null}
        </div>
        {status ? <div>{status}</div> : null}
      </div>
    </article>
  );
}

export interface CircleTileProps {
  label: string;
  illustration?: IllustrationName;
  tone?: Tone;
  note?: string;
  href?: string;
  className?: string;
}

export function CircleTile({ label, illustration = "sunflower", tone, note, href, className }: CircleTileProps) {
  const inner = (
    <>
      <span className="wfb-circle-disc" style={{ background: toneVar(tone) }}><Illustration name={illustration} /></span>
      <span className="wfb-circle-label">{label}</span>
      {note ? <span className="wfb-circle-note">{note}</span> : null}
    </>
  );
  const cls = cx("wfb", "wfb-circle", className);
  return href ? <SmartLink href={href} className={cls}>{inner}</SmartLink> : <div className={cls}>{inner}</div>;
}

export interface ScheduleRow {
  market: string;
  market_id?: MarketId;
  when: string;
  hours: string;
  where: string;
  note?: string;
}

const SWATCH: Record<MarketId, string> = { summer: "var(--bay)", night: "var(--deep)", popup: "var(--corn)", winter: "var(--beet)" };

export function MarketSchedule({ rows, caption, className }: { rows: ScheduleRow[]; caption?: string; className?: string }) {
  return (
    <table className={cx("wfb", "wfb-sched", className)}>
      {caption ? <caption className="wfb-sr">{caption}</caption> : null}
      <thead>
        <tr><th scope="col">Market</th><th scope="col">When</th><th scope="col">Hours</th><th scope="col">Where</th></tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>
              <span className="wfb-sched-market">
                <span className="wfb-sched-swatch" style={{ background: SWATCH[r.market_id ?? "summer"] }} />
                {r.market}
              </span>
            </td>
            <td>{r.when}</td>
            <td><b>{r.hours}</b></td>
            <td>{r.where}{r.note ? <span className="wfb-sched-note">{r.note}</span> : null}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
