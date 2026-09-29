import type { Market } from "./types";

// The four markets in the brand kit. None has run yet: all are planned for 2027 onwards.
// PLACEHOLDER: months, hours and places are working plans. Confirm with the Market, then set
// status to "confirmed".

export const markets: Market[] = [
  { id: "summer", name: "Summer Market", when: "Saturdays from June 2027", hours: "Mornings · hours to be announced", where: "By the lake", note: "Opening date to be announced", status: "planned",
    blurb: "The flagship: local growers, bakers and makers every Saturday morning by the lake, with live music.", href: "/visit" },
  { id: "night", name: "Night Market", when: "Summer evenings, 2027", hours: "To be announced", where: "Downtown", status: "planned",
    blurb: "Music, food trucks and the lake at dusk, on a few summer evenings.", href: "/events/night-market" },
  { id: "popup", name: "Pop-Up Markets", when: "Spring and fall", hours: "To be announced", where: "Around the village", status: "planned",
    blurb: "One-off markets for the seasons in between.", href: "/events" },
  { id: "winter", name: "Winter Market", when: "Winter months", hours: "To be announced", where: "Indoors", note: "Starting with Christmas at The Argo", status: "planned",
    blurb: "Indoor markets through the cold months, starting with Christmas at The Argo on December 13.", href: "/christmas-at-the-argo" },
];

export const scheduleRows = markets.map((m) => ({ market: m.name, market_id: m.id, when: m.when, hours: m.hours, where: m.where, note: m.note }));
