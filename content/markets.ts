import type { Market } from "./types";

// The four markets in the brand kit. None has run yet: all are planned for 2027 onwards.
// PLACEHOLDER: months, hours and places are working plans. Confirm with the Market, then set
// status to "confirmed".

export const markets: Market[] = [
  { id: "summer", name: "Summer Market", when: "Saturdays from June 2027", hours: "Hours to be announced", where: "Klode Park", note: "", status: "planned",
    blurb: "The flagship: local growers, bakers and makers every Saturday morning by the lake, with live music.", href: "/visit" },
  { id: "winter", name: "Christmas at The Argo", when: "Dec. 13", hours: "1 - 6PM", where: "The Argo", note: "", status: "planned",
    blurb: "Indoor markets through the cold months, starting with Christmas at The Argo on December 13.", href: "/christmas-at-the-argo" },
];

export const scheduleRows = markets.map((m) => ({ market: m.name, market_id: m.id, when: m.when, hours: m.hours, where: m.where, note: m.note }));
