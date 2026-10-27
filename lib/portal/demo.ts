// Sample data for previewing the vendor portal before Supabase is connected.
// Development only: isPortalDemo() is always false in production builds.
// Changes made in the preview live in the dev server's memory until it restarts.

import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AdminApplication, AdminUpdate, AdminVendor, EventNote, EventTask, MarketDate, MarketPartner, Participation, PortalAsset, PortalGuide, PortalMarket } from "./types";

/** The vendor the preview's vendor side is signed in as. */
export const DEMO_VENDOR_ID = "v-demo";
export const DEMO_VENDOR_USER = { id: "demo-user", email: "sam@example.com", role: "vendor" as const, fullName: "Sam Rivera" };
export const DEMO_ADMIN_USER = { id: "demo-admin", email: "casey@example.org", role: "admin" as const, fullName: "Casey Lee" };
export const DEMO_PARTNER_USER = { id: "demo-partner", email: "dana@example.com", role: "partner" as const, fullName: "Dana Whitaker" };

export function isPortalDemo() {
  return process.env.NODE_ENV !== "production" && (process.env.PORTAL_DEMO === "1" || !isSupabaseConfigured());
}

const SUMMER: PortalMarket = { id: "mkt-summer", name: "Summer Market", kind: "summer" };
const ARGO: PortalMarket = { id: "mkt-argo", name: "Christmas at The Argo", kind: "winter" };

const KLODE = { location: "Klode Park", address: "Klode Park, Whitefish Bay, WI", contactName: "Market info tent", contactPhone: "(414) 555-0142" };

function summerDates(): MarketDate[] {
  const out: MarketDate[] = [];
  // Saturdays, June 5 – September 25, 2027.
  for (let d = new Date(Date.UTC(2027, 5, 5)); d <= new Date(Date.UTC(2027, 8, 25)); d.setUTCDate(d.getUTCDate() + 7)) {
    const iso = d.toISOString().slice(0, 10);
    out.push({
      id: `sm-${iso}`,
      market: SUMMER,
      date: iso,
      opensAt: "08:00",
      closesAt: "13:00",
      loadInAt: "06:30",
      teardownBy: "14:00",
      ...KLODE,
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Klode+Park+Whitefish+Bay+WI",
      vendorNotes: out.length === 0 ? "Opening day: arrive by 6:30 am sharp, we'll have coffee at the info tent. Expect a crowd from 8." : undefined,
      dateStatus: "scheduled",
    });
  }
  return out;
}

const ARGO_DATE: MarketDate = {
  id: "argo-2026-12-13",
  market: ARGO,
  date: "2026-12-13",
  opensAt: "13:00",
  closesAt: "18:00",
  loadInAt: "10:30",
  teardownBy: "19:30",
  location: "The Argo",
  address: "Whitefish Bay, WI",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Argo+Whitefish+Bay+WI",
  contactName: "Ian, event lead",
  contactPhone: "(414) 555-0175",
  vendorNotes: "Tables, linens and power are provided indoors. Bring your own signage and a float for cash sales.",
  dateStatus: "scheduled",
};

/** Sample answers for one vendor across a list of dates: pick a status (and stall) per date by index. */
function answers(vendorId: string, dates: MarketDate[], pick: (i: number) => Partial<Participation> | null): Participation[] {
  return dates.flatMap((d, i) => {
    const p = pick(i);
    return p ? [{ vendorId, dateId: d.id, status: "invited" as const, ...p }] : [];
  });
}

const RESPONDED = "2026-10-21T16:40:00Z";

function recipients(ids: string[], read: string[]): AdminUpdate["recipients"] {
  return ids.map((vendorId) => ({ vendorId, vendorName: "", readAt: read.includes(vendorId) ? "2026-10-25T12:00:00Z" : undefined }));
}

function vendor(v: Partial<AdminVendor> & Pick<AdminVendor, "id" | "name" | "status" | "categories">): AdminVendor {
  return {
    town: "", description: "", products: [], website: "", instagram: "", phone: "",
    profilePublished: false, profilePendingReview: false, source: "manual", createdAt: "2026-10-01T15:00:00Z",
    contacts: [], notes: [], marketIds: [],
    ...v,
  };
}

const contact = (id: string, name: string, email: string, extra: Partial<AdminVendor["contacts"][number]> = {}) => ({ id, name, email, hasLogin: false, emailUpdates: true, ...extra });

/** Updates as stored; the audience's label is worked out when read. */
export type StoredUpdate = Omit<AdminUpdate, "audienceLabel">;

export interface DemoState {
  markets: PortalMarket[];
  dates: MarketDate[];
  vendors: AdminVendor[];
  participation: Participation[];
  applications: AdminApplication[];
  updates: StoredUpdate[];
  guides: PortalGuide[];
  assets: PortalAsset[];
  partners: MarketPartner[];
  tasks: EventTask[];
  notes: EventNote[];
}

function seed(): DemoState {
  const summer = summerDates();
  const vendors: AdminVendor[] = [
    vendor({
      id: DEMO_VENDOR_ID, name: "Lakeview Acres (sample)", status: "active", categories: ["produce"], town: "Cedarburg, WI",
      description: "Heirloom tomatoes, sweet peppers and whatever the August heat brings in.",
      products: ["Heirloom tomatoes", "Sweet and hot peppers", "Basil", "Seedlings in spring"],
      instagram: "@lakeviewacres", phone: "(262) 555-0188", marketIds: [SUMMER.id, ARGO.id], createdAt: "2026-10-12T14:00:00Z",
      contacts: [
        contact("c-sam", "Sam Rivera", "sam@example.com", { hasLogin: true, invitedAt: "2026-10-19T14:00:00Z" }),
        contact("c-jo", "Jo Rivera", "jo@example.com", { hasLogin: true, emailUpdates: false, invitedAt: "2026-10-19T14:00:00Z" }),
      ],
      notes: [{ id: "n-1", kind: "call", body: "Talked through the Summer season. Keen on a corner stall if one opens up.", at: "2026-10-14T17:00:00Z", author: "Casey Lee" }],
    }),
    vendor({
      id: "v-hearth", name: "Hearth & Crumb Bakery", status: "active", source: "application", applicationId: "app-hearth", categories: ["bakery"], town: "Shorewood, WI",
      description: "Naturally leavened bread and laminated pastry, baked the night before.", products: ["Country sourdough", "Croissants", "Seasonal galettes"],
      profilePublished: true, marketIds: [SUMMER.id, ARGO.id], createdAt: "2026-09-28T13:00:00Z",
      contacts: [contact("c-priya", "Priya Shah", "priya@example.com", { hasLogin: true, invitedAt: "2026-10-02T13:00:00Z" })],
    }),
    vendor({
      id: "v-north", name: "Northshore Honey Co.", status: "active", categories: ["other"], town: "Mequon, WI",
      description: "Raw honey from hives along the lakeshore.", products: ["Wildflower honey", "Creamed honey", "Beeswax candles"],
      profilePublished: true, profilePendingReview: true, marketIds: [SUMMER.id, ARGO.id], createdAt: "2026-09-30T13:00:00Z",
      contacts: [contact("c-dan", "Dan Okafor", "dan@example.com", { hasLogin: true, invitedAt: "2026-10-03T13:00:00Z" })],
    }),
    vendor({
      id: "v-fern", name: "Fernwood Flowers", status: "approved", categories: ["flowers"], town: "Grafton, WI", marketIds: [SUMMER.id], createdAt: "2026-10-15T13:00:00Z",
      contacts: [contact("c-maya", "Maya Lindqvist", "maya@example.com", { invitedAt: "2026-10-16T13:00:00Z" })],
      notes: [{ id: "n-2", kind: "email", body: "Sent the portal invite after our email back and forth. Hasn't logged in yet.", at: "2026-10-16T13:05:00Z", author: "Casey Lee" }],
    }),
    vendor({
      id: "v-loom", name: "Lake & Loom", status: "active", categories: ["crafts"], town: "Whitefish Bay, WI",
      description: "Hand-woven scarves and table linens.", products: ["Scarves", "Tea towels", "Table runners"], profilePublished: true,
      marketIds: [ARGO.id], createdAt: "2026-10-05T13:00:00Z",
      contacts: [contact("c-nora", "Nora Feld", "nora@example.com", { hasLogin: true, invitedAt: "2026-10-06T13:00:00Z" })],
    }),
    vendor({
      id: "v-kettle", name: "Kettle Moraine Creamery", status: "lead", categories: ["dairy"], town: "West Bend, WI", createdAt: "2026-10-22T13:00:00Z",
      contacts: [contact("c-ruth", "Ruth Becker", "ruth@example.com")],
      notes: [{ id: "n-3", kind: "call", body: "Interested in the Summer Market. Needs to check their cooler setup for an outdoor stall. Follow up in November.", at: "2026-10-22T13:00:00Z", author: "Casey Lee" }],
    }),
    vendor({
      id: "v-pasture", name: "Ozaukee Pasture Meats", status: "applied", source: "application", applicationId: "app-pasture", categories: ["meat"], town: "Fredonia, WI", createdAt: "2026-10-25T18:20:00Z",
      contacts: [contact("c-luis", "Luis Ortega", "luis@example.com", { phone: "(262) 555-0131" })],
    }),
    vendor({
      id: "v-sprout", name: "Little Sprout Microgreens", status: "applied", source: "application", applicationId: "app-sprout", categories: ["produce"], town: "Glendale, WI", createdAt: "2026-10-26T21:05:00Z",
      contacts: [contact("c-amy", "Amy Tran", "amy@example.com")],
    }),
  ];

  const participation: Participation[] = [
    { vendorId: DEMO_VENDOR_ID, dateId: ARGO_DATE.id, status: "invited" },
    { vendorId: "v-hearth", dateId: ARGO_DATE.id, status: "confirmed", stall: "A3", respondedAt: RESPONDED },
    { vendorId: "v-north", dateId: ARGO_DATE.id, status: "confirmed", stall: "A5", respondedAt: RESPONDED, note: "Can I be near an outlet for the candle warmer?" },
    { vendorId: "v-loom", dateId: ARGO_DATE.id, status: "invited" },
    ...answers(DEMO_VENDOR_ID, summer, (i) => (i < 4 ? { status: "confirmed", stall: "14", respondedAt: "2026-10-20T15:12:00Z" } : {})),
    ...answers("v-hearth", summer, (i) => (i === 6 || i === 7 ? { status: "declined", respondedAt: RESPONDED, note: i === 6 ? "Family wedding that weekend." : undefined } : { status: "confirmed", stall: "7", respondedAt: RESPONDED })),
    ...answers("v-north", summer, (i) => (i < 8 ? { status: "confirmed", stall: "22", respondedAt: RESPONDED } : {})),
    ...answers("v-fern", summer, () => ({})),
  ];

  const applications: AdminApplication[] = [
    {
      id: "app-sprout", submittedAt: "2026-10-26T21:05:00Z", business: "Little Sprout Microgreens", name: "Amy Tran", email: "amy@example.com", town: "Glendale, WI",
      category: "Produce", products: "Pea shoots, sunflower and radish microgreens grown indoors year-round. Sold in compostable clamshells.", markets: ["Summer Market", "Winter Market"], status: "new", vendorId: "v-sprout",
    },
    {
      id: "app-pasture", submittedAt: "2026-10-25T18:20:00Z", business: "Ozaukee Pasture Meats", name: "Luis Ortega", email: "luis@example.com", phone: "(262) 555-0131", town: "Fredonia, WI",
      category: "Meat & eggs", products: "Grass-fed beef and pastured pork, USDA inspected, sold frozen from chest freezers. Pastured eggs in season.", markets: ["Summer Market", "Night Market"], status: "new", vendorId: "v-pasture",
    },
    {
      id: "app-hearth", submittedAt: "2026-09-27T16:00:00Z", business: "Hearth & Crumb Bakery", name: "Priya Shah", email: "priya@example.com", town: "Shorewood, WI",
      category: "Bakery", products: "Sourdough loaves and laminated pastry from our licensed kitchen.", markets: ["Summer Market", "Winter Market"], status: "approved", vendorId: "v-hearth",
    },
  ];

  const names = new Map(vendors.map((v) => [v.id, v.name]));
  const state: DemoState = {
    markets: [ARGO, SUMMER],
    dates: [ARGO_DATE, ...summer],
    vendors,
    participation,
    applications,
    partners: [],
    tasks: [],
    notes: [],
    updates: [
      {
        id: "u-argo-loadin",
        title: "Christmas at The Argo: load-in details",
        body: "Thanks for joining us on **Sunday, December 13**! A few things to know:\n\n- **Load-in** opens at 10:30 am through the side entrance on the north side of the building.\n- Tables (6 ft), linens and a power strip are provided at every spot.\n- The doors open to shoppers at 1 pm sharp, so please be set up by 12:45.\n\nYour stall number will appear on the date page in the portal the week before.",
        publishedAt: "2026-10-24T14:00:00Z",
        pinned: true,
        audience: { kind: "market", marketId: ARGO.id },
        emailedAt: "2026-10-24T14:00:00Z",
        recipients: recipients(["v-demo", "v-hearth", "v-north", "v-loom"], ["v-hearth", "v-north"]),
      },
      {
        id: "u-welcome",
        title: "Welcome to the vendor portal",
        body: "This is where we'll share everything you need for our markets: dates, setup instructions, updates and marketing materials.\n\n**Please confirm the dates you can make** on the Calendar page. It helps us plan the layout and tell shoppers who's coming.",
        publishedAt: "2026-10-20T15:00:00Z",
        pinned: false,
        audience: { kind: "all" },
        emailedAt: "2026-10-20T15:00:00Z",
        recipients: recipients(["v-demo", "v-hearth", "v-north", "v-fern", "v-loom"], ["v-demo", "v-hearth", "v-north", "v-loom"]),
      },
      {
        id: "u-2027-season",
        title: "2027 Summer Market: save the dates",
        body: "The Summer Market opens **Saturday, June 5, 2027** at Klode Park and runs every Saturday through September 25.\n\nWe've added all 17 Saturdays to your calendar. Confirm the ones you can make now, and you can change your answer until the Wednesday before each market.",
        publishedAt: "2026-10-18T13:30:00Z",
        pinned: false,
        audience: { kind: "market", marketId: SUMMER.id },
        recipients: recipients(["v-demo", "v-hearth", "v-north", "v-fern"], ["v-hearth"]),
      },
    ],
    guides: [
      {
        id: "g-arrival",
        title: "Arriving and loading in",
        marketId: null,
        body: "- Arrive within your load-in window; the time is on each date's page.\n- Unload at the curb, then move your vehicle to vendor parking before setting up.\n- Check in at the info tent so we know you're here.",
      },
      {
        id: "g-setup-summer",
        title: "Setting up your stall",
        marketId: "mkt-summer",
        body: "- Every stall is **10 × 10 ft**. Tents must be weighted with at least **40 lb per leg**: no stakes in the park lawn.\n- Display your stall card (we provide it) where shoppers can see it.\n- Keep walkways clear: nothing past the front edge of your tent.",
      },
      {
        id: "g-teardown",
        title: "Teardown",
        marketId: null,
        body: "- Please don't pack up before closing time; shoppers notice.\n- Take all rubbish and produce waste with you.\n- Bring your vehicle in only once the market has fully closed and the walkways are clear.",
      },
      {
        id: "g-argo-indoor",
        title: "Indoors at The Argo",
        marketId: "mkt-argo",
        body: "- Tables, linens and power are provided; no tents.\n- Use the side entrance for load-in and keep the main doors clear.\n- No open flames: battery candles are fine for display.",
      },
    ],
    assets: [
      { id: "a-lockup", title: "Market logo (horizontal)", description: "For your website, flyers and posts. Use on light backgrounds.", kind: "logo", market: null, url: "/brand/logos/lockup.svg", fileName: "wfb-market-lockup.svg", sizeLabel: "SVG · 18 KB" },
      { id: "a-badge", title: "Market badge", description: "The round Bay Badge, for social posts and stickers.", kind: "logo", market: null, url: "/brand/logos/emblem.svg", fileName: "wfb-market-badge.svg", sizeLabel: "SVG · 32 KB" },
      { id: "a-icon", title: "Market icon", description: "Small square mark for avatars and tagging.", kind: "logo", market: null, url: "/brand/logos/icon.svg", fileName: "wfb-market-icon.svg", sizeLabel: "SVG · 5 KB" },
      { id: "a-argo-tile", title: "Christmas at The Argo social tile", description: "1200 × 630 image for Facebook, Instagram stories and link previews. Tag us and say you'll be there!", kind: "social", market: ARGO, url: "/christmas-at-the-argo/opengraph-image", fileName: "christmas-at-the-argo.png", sizeLabel: "PNG · 1200 × 630" },
    ],
  };
  state.partners = [
    { id: "p-dana", marketId: ARGO.id, name: "Dana Whitaker (sample)", email: DEMO_PARTNER_USER.email, organisation: "The Argo", invitedAt: "2026-10-15T14:00:00Z", hasLogin: true },
  ];
  state.tasks = [
    { id: "t-1", marketId: ARGO.id, title: "Confirm the floor plan and table count", owner: "partner", dueDate: "2026-11-06", createdAt: "2026-10-15T14:00:00Z" },
    { id: "t-2", marketId: ARGO.id, title: "Send the vendor list for building security", owner: "market", dueDate: "2026-12-04", createdAt: "2026-10-15T14:00:00Z" },
    { id: "t-3", marketId: ARGO.id, title: "Book the side entrance for load-in, 10:30 am", owner: "partner", dueDate: "2026-10-24", doneAt: "2026-10-22T16:00:00Z", createdAt: "2026-10-15T14:00:00Z" },
    { id: "t-4", marketId: ARGO.id, title: "Share the social tile with vendors", owner: "market", dueDate: "2026-10-25", doneAt: "2026-10-24T14:00:00Z", createdAt: "2026-10-15T14:00:00Z" },
    { id: "t-5", marketId: ARGO.id, title: "Check power: outlets per table, extension cords", owner: "partner", dueDate: "2026-11-20", notes: "Northshore Honey asked to be near an outlet.", createdAt: "2026-10-21T14:00:00Z" },
    { id: "t-6", marketId: ARGO.id, title: "Stall assignments to vendors", owner: "market", dueDate: "2026-12-06", createdAt: "2026-10-15T14:00:00Z" },
  ];
  state.notes = [
    { id: "en-1", marketId: ARGO.id, body: "Side entrance is booked from 10 am. Security will have the vendor list at the door.", authorName: "Dana Whitaker", authorOrg: "The Argo", at: "2026-10-22T16:05:00Z" },
    { id: "en-2", marketId: ARGO.id, body: "We're at 4 vendors so far, aiming for 6–7 makers. I'll post assignments the week before.", authorName: "Casey Lee", at: "2026-10-23T15:30:00Z" },
    { id: "en-3", marketId: ARGO.id, body: "Floor plan draft attached to Files. Tables along the windows get the best light.", authorName: "Dana Whitaker", authorOrg: "The Argo", at: "2026-10-26T13:10:00Z" },
  ];
  for (const u of state.updates) for (const r of u.recipients) r.vendorName = names.get(r.vendorId) ?? "";
  return state;
}

// One store per dev server, kept across hot reloads.
const g = globalThis as unknown as { __wfbPortalDemo3?: DemoState };
export function demoStore(): DemoState {
  g.__wfbPortalDemo3 ??= seed();
  return g.__wfbPortalDemo3;
}
