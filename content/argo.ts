import type { IconName } from "@/components/wfb";
import { site } from "./site";

// Christmas at The Argo: everything on the landing page and the home feature comes from here.
// Update this file as plans firm up; the page adapts without a redesign.
//
// status: "confirmed" shows as-is, "planned" shows with a "Planned" label, "hidden" is held off the site.
// PLACEHOLDER: the venue address, and each "planned" item until the organisers confirm it.

export type ArgoStatus = "confirmed" | "planned" | "hidden";

export interface ArgoProgramItem {
  id: string;
  title: string;
  text: string;
  icon: IconName;
  time?: string;
  status: ArgoStatus;
}

export interface ArgoMaker {
  name: string;
  /** What they sell, in one line. */
  what: string;
  from?: string;
  image?: string;
  imageAlt?: string;
  logo?: string;
  href?: string;
  /** YYYY-MM-DD they were announced; shows "Newly announced" for two weeks. */
  announced?: string;
}

export interface ArgoMerchant {
  name: string;
  what: string;
  href?: string;
}

export interface ArgoSponsor {
  name: string;
  logo?: string;
  href?: string;
}

const program: ArgoProgramItem[] = [
  { id: "shop", title: "Shop local", icon: "basket", status: "confirmed",
    text: "A small, hand-picked group of local makers, shops and small businesses, with gifts, seasonal goods, treats and more." },
  { id: "santa", title: "Meet Santa", icon: "clock", status: "planned", time: "About 2–4 pm",
    text: "Santa and Mrs. Claus are planning to visit The Argo for family visits and photos." },
  { id: "cookies", title: "Decorate Christmas cookies", icon: "leaf", status: "planned",
    text: "A staffed cookie-decorating table for children, free for families." },
  { id: "treats", title: "Holiday treats & drinks", icon: "sun", status: "planned",
    text: "We're lining up cocoa, coffee and seasonal food with local partners." },
  { id: "village", title: "Explore Whitefish Bay", icon: "map-pin", status: "confirmed",
    text: "Make an afternoon of it: visit the shops, restaurants and businesses throughout the village." },
];

export const argo = {
  slug: "christmas-at-the-argo",
  title: "Christmas at The Argo",
  date: "2026-12-13",
  start: "13:00",
  end: "18:00",
  /** While false, the page says details are still being finalized. */
  detailsFinal: false,
  venue: {
    name: "The Argo",
    /** PLACEHOLDER: the street address, once confirmed. */
    address: "",
    town: "Whitefish Bay, Wisconsin",
    mapsQuery: "The Argo, Whitefish Bay, WI",
  },
  admission: "Free admission",
  subhead: "A festive afternoon of local shopping, holiday activities, Santa, and Christmas magic in the heart of Whitefish Bay.",
  story: [
    "Join us at The Argo for an afternoon celebrating Christmas, community, and the small businesses that make our area special.",
    "Shop a curated collection of local makers and merchants, enjoy festive activities with the family, visit Santa, and make a day of it in Whitefish Bay.",
  ],
  storyMarks: ["Local", "Curated", "Family-friendly", "Free to attend"],
  program,
  /** Set to true once every maker is announced: the "More makers to come" card goes and the intro says it's the full line-up. */
  makersComplete: false,
  /** Add makers here as they're announced. The reveal grid appears as soon as there's one. */
  makers: [] as ArgoMaker[],
  /** Village shops and restaurants taking part. */
  merchants: [] as ArgoMerchant[],
  /** Sponsor and BID logos. The section stays hidden while this is empty. */
  sponsors: [] as ArgoSponsor[],
  updates: {
    instagram: site.social.instagram,
    line: "We'll be announcing participating vendors, activities, Santa details, and more as December approaches.",
  },
  promo: {
    /** The home page feature shows from this date through the event day. */
    from: "2026-09-01",
    line: "",
  },
};

export const argoPath = `/${argo.slug}`;

export function visibleProgram() {
  return argo.program.filter((p) => p.status !== "hidden");
}
