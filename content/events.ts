import { argo, argoPath } from "./argo";
import { todayISO } from "./format";
import type { MarketEvent } from "./types";

// Every real, dated event. The Market hasn't opened yet, so the first is Christmas at The Argo.
// Add Summer Market dates here once they're confirmed; until then the site shows them as planned.

const list: MarketEvent[] = [
  {
    slug: argo.slug,
    date: argo.date,
    market: "winter",
    eyebrow: "Holiday market",
    title: argo.title,
    start: argo.start,
    end: argo.end,
    location: argo.venue.name,
    address: argo.venue.address || argo.venue.mapsQuery,
    description: argo.subhead,
    whatsOn: argo.program.filter((p) => p.status === "confirmed").map((p) => p.title),
    href: argoPath,
  },
];

export const events = list.sort((a, b) => a.date.localeCompare(b.date));

export function upcoming(items: MarketEvent[] = events, today = todayISO()) {
  return items.filter((e) => e.date >= today);
}

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}

export function eventHref(e: MarketEvent) {
  return e.href ?? `/events/${e.slug}`;
}
