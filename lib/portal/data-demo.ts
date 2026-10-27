// The portal's data functions over the in-memory sample data (lib/portal/demo.ts), for the development
// preview. lib/portal/data-live.ts implements the same functions against Supabase; lib/portal/data.ts
// picks one. Keep the two in step: data.ts checks they have the same shape.

import { DEMO_VENDOR_ID, demoStore, type DemoState, type StoredUpdate } from "./demo";
import type {
  AdminApplication, AdminContact, AdminNote, AdminUpdate, AdminVendor, Audience, DateCounts, EventNote, EventTask, MarketDate, MarketPartner,
  NoteKind, ParticipationStatus, PartnerRosterRow, PortalAsset, PortalDate, PortalGuide, PortalMarket, PortalMember, PortalUpdate,
  PortalVendor, ProfileInput, RosterRow, VendorStatus,
} from "./types";

function store(): DemoState {
  return demoStore();
}

const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clone = <T,>(x: T): T => structuredClone(x);

// ---- Vendor side (as the signed-in vendor) -------------------------------------------------------

function myVendor() {
  const v = store().vendors.find((x) => x.id === DEMO_VENDOR_ID);
  if (!v) throw new Error("Vendor not found.");
  return v;
}

export async function getVendor(): Promise<PortalVendor> {
  const v = myVendor();
  return {
    id: v.id, name: v.name, town: v.town, categories: [...v.categories], description: v.description, products: [...v.products],
    website: v.website, instagram: v.instagram, phone: v.phone, profilePublished: v.profilePublished, profilePendingReview: v.profilePendingReview,
  };
}

export async function listMembers(): Promise<PortalMember[]> {
  return myVendor().contacts.filter((c) => c.hasLogin).map((c) => ({ name: c.name, email: c.email, isYou: c.email === "sam@example.com", emailUpdates: c.emailUpdates }));
}

function forVendor(vendorId: string): PortalDate[] {
  const s = store();
  return s.participation
    .filter((p) => p.vendorId === vendorId)
    .flatMap((p) => {
      const d = s.dates.find((x) => x.id === p.dateId);
      return d ? [{ ...clone(d), status: p.status, stall: p.stall, vendorNote: p.note, respondedAt: p.respondedAt }] : [];
    })
    .sort(byDate);
}

export async function listDates(): Promise<PortalDate[]> {
  return forVendor(DEMO_VENDOR_ID);
}

export async function getDate(id: string): Promise<PortalDate | null> {
  return forVendor(DEMO_VENDOR_ID).find((d) => d.id === id) ?? null;
}

export async function respond(ids: string[], status: Exclude<ParticipationStatus, "invited">, note?: string) {
  const s = store();
  const now = new Date().toISOString();
  for (const p of s.participation) {
    if (p.vendorId !== DEMO_VENDOR_ID || !ids.includes(p.dateId)) continue;
    if (s.dates.find((d) => d.id === p.dateId)?.dateStatus === "cancelled") continue;
    p.status = status;
    p.respondedAt = now;
    if (note !== undefined) p.note = note || undefined;
  }
}

function audienceLabel(a: Audience) {
  if (a.kind === "all") return "All vendors";
  if (a.kind === "market") return `${store().markets.find((m) => m.id === a.marketId)?.name ?? "Market"} vendors`;
  const n = a.vendorIds?.length ?? 0;
  return n === 1 ? "1 chosen vendor" : `${n} chosen vendors`;
}

const newestFirst = (a: StoredUpdate, b: StoredUpdate) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt);

export async function listUpdates(): Promise<PortalUpdate[]> {
  return store()
    .updates.filter((u) => u.recipients.some((r) => r.vendorId === DEMO_VENDOR_ID))
    .sort(newestFirst)
    .map((u) => ({
      id: u.id, title: u.title, body: u.body, publishedAt: u.publishedAt, pinned: u.pinned,
      read: Boolean(u.recipients.find((r) => r.vendorId === DEMO_VENDOR_ID)?.readAt),
      audienceLabel: audienceLabel(u.audience),
      authorOrg: u.authorOrg,
    }));
}

export async function getUpdate(id: string): Promise<PortalUpdate | null> {
  return (await listUpdates()).find((u) => u.id === id) ?? null;
}

export async function markUpdateRead(id: string) {
  const r = store().updates.find((u) => u.id === id)?.recipients.find((x) => x.vendorId === DEMO_VENDOR_ID);
  if (r && !r.readAt) r.readAt = new Date().toISOString();
}

export async function listGuides(marketId?: string): Promise<PortalGuide[]> {
  return clone(store().guides.filter((g) => !marketId || g.marketId === null || g.marketId === marketId));
}

export async function listAssets(): Promise<PortalAsset[]> {
  return clone(store().assets);
}

export async function updateProfile(input: ProfileInput) {
  Object.assign(myVendor(), input, { profilePendingReview: true });
}

export async function setEmailUpdates(on: boolean) {
  const me = myVendor().contacts.find((c) => c.email === "sam@example.com");
  if (me) me.emailUpdates = on;
}

// ---- Admin ----------------------------------------------------------------------------------------

function counts(dateId: string): DateCounts {
  const c: DateCounts = { invited: 0, confirmed: 0, declined: 0 };
  for (const p of store().participation) if (p.dateId === dateId) c[p.status]++;
  return c;
}

export interface VendorFilter {
  q?: string;
  status?: VendorStatus | "";
  marketId?: string;
}

export async function listVendors(filter: VendorFilter = {}): Promise<AdminVendor[]> {
  const q = filter.q?.trim().toLowerCase();
  return clone(
    store()
      .vendors.filter((v) => !filter.status || v.status === filter.status)
      .filter((v) => !filter.marketId || v.marketIds.includes(filter.marketId))
      .filter((v) => !q || [v.name, v.town, ...v.contacts.flatMap((c) => [c.name, c.email])].some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
}

export async function getAdminVendor(id: string) {
  const s = store();
  const v = s.vendors.find((x) => x.id === id);
  if (!v) return null;
  const dates = s.participation
    .filter((p) => p.vendorId === id)
    .map((p) => ({ ...p, date: clone(s.dates.find((d) => d.id === p.dateId)!) }))
    .filter((p) => p.date)
    .sort((a, b) => byDate(a.date, b.date));
  const application = s.applications.find((a) => a.id === v.applicationId);
  return { vendor: clone(v), dates, application: application ? clone(application) : undefined };
}

export async function createVendor(input: { name: string; town: string; categories: string[]; status: VendorStatus; contactName: string; contactEmail: string; contactPhone?: string; note?: string; author: string }) {
  const id = newId("v");
  const now = new Date().toISOString();
  store().vendors.push({
    id, name: input.name, town: input.town, categories: input.categories, description: "", products: [], website: "", instagram: "", phone: "",
    profilePublished: false, profilePendingReview: false, status: input.status, source: "manual", createdAt: now, marketIds: [],
    contacts: input.contactEmail ? [{ id: newId("c"), name: input.contactName, email: input.contactEmail.toLowerCase(), phone: input.contactPhone, hasLogin: false, emailUpdates: true }] : [],
    notes: input.note ? [{ id: newId("n"), kind: "note", body: input.note, at: now, author: input.author }] : [],
  });
  return id;
}

function adminVendor(id: string) {
  const v = store().vendors.find((x) => x.id === id);
  if (!v) throw new Error("Vendor not found.");
  return v;
}

export async function setVendorStatus(id: string, status: VendorStatus) {
  adminVendor(id).status = status;
}

export async function addVendorNote(id: string, kind: NoteKind, body: string, author: string) {
  adminVendor(id).notes.unshift({ id: newId("n"), kind, body, at: new Date().toISOString(), author } satisfies AdminNote);
}

export async function addContact(id: string, c: Pick<AdminContact, "name" | "email" | "phone">) {
  const v = adminVendor(id);
  const email = c.email.toLowerCase();
  if (v.contacts.some((x) => x.email === email)) return false;
  v.contacts.push({ id: newId("c"), name: c.name, email, phone: c.phone, hasLogin: false, emailUpdates: true });
  return true;
}

/** Records the invite. With Supabase connected this also emails the contact a login link. */
export async function inviteContact(vendorId: string, contactId: string) {
  const v = adminVendor(vendorId);
  const c = v.contacts.find((x) => x.id === contactId);
  if (!c) throw new Error("Contact not found.");
  c.invitedAt = new Date().toISOString();
  if (v.status === "lead" || v.status === "applied") v.status = "approved";
  return c;
}

export async function publishProfile(id: string) {
  Object.assign(adminVendor(id), { profilePublished: true, profilePendingReview: false });
}

export async function listApplications(): Promise<AdminApplication[]> {
  return clone([...store().applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
}

export async function getApplication(id: string) {
  const a = store().applications.find((x) => x.id === id);
  return a ? clone(a) : null;
}

export async function decideApplication(id: string, approve: boolean, author: string) {
  const s = store();
  const a = s.applications.find((x) => x.id === id);
  if (!a) throw new Error("Application not found.");
  a.status = approve ? "approved" : "declined";
  const v = s.vendors.find((x) => x.id === a.vendorId);
  if (v) {
    v.status = approve ? "approved" : "declined";
    v.notes.unshift({ id: newId("n"), kind: "note", body: approve ? "Application approved." : "Application declined.", at: new Date().toISOString(), author });
  }
  return a;
}

export interface MarketSummary {
  market: PortalMarket;
  dates: number;
  vendors: number;
  next?: MarketDate & { counts: DateCounts };
  first?: string;
  last?: string;
}

export async function listMarkets(today: string): Promise<MarketSummary[]> {
  const s = store();
  return s.markets.map((m) => {
    const dates = s.dates.filter((d) => d.market.id === m.id).sort(byDate);
    const next = dates.find((d) => d.date >= today && d.dateStatus !== "cancelled");
    return {
      market: clone(m),
      dates: dates.length,
      vendors: s.vendors.filter((v) => v.marketIds.includes(m.id)).length,
      next: next ? { ...clone(next), counts: counts(next.id) } : undefined,
      first: dates[0]?.date,
      last: dates.at(-1)?.date,
    };
  });
}

export async function getMarket(id: string) {
  const s = store();
  const market = s.markets.find((m) => m.id === id);
  if (!market) return null;
  return {
    market: clone(market),
    dates: s.dates.filter((d) => d.market.id === id).sort(byDate).map((d) => ({ ...clone(d), counts: counts(d.id) })),
    vendors: clone(s.vendors.filter((v) => v.marketIds.includes(id))),
  };
}

export async function createMarket(input: Omit<PortalMarket, "id">) {
  const id = newId("mkt");
  store().markets.push({ id, ...input });
  return id;
}

export type DateTemplate = Omit<MarketDate, "id" | "market" | "date" | "dateStatus">;

/** Adds one date, or every week from `date` through `until`. Vendors already in the market are invited. */
export async function addDates(marketId: string, date: string, until: string | undefined, t: DateTemplate) {
  const s = store();
  const market = s.markets.find((m) => m.id === marketId);
  if (!market) throw new Error("Market not found.");
  const added: string[] = [];
  const end = until && until > date ? until : date;
  for (let d = new Date(`${date}T12:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 7)) {
    const iso = d.toISOString().slice(0, 10);
    if (s.dates.some((x) => x.market.id === marketId && x.date === iso)) continue;
    const id = newId("d");
    s.dates.push({ id, market, date: iso, dateStatus: "scheduled", ...t });
    added.push(id);
  }
  for (const v of s.vendors.filter((x) => x.marketIds.includes(marketId) && x.status !== "inactive" && x.status !== "declined")) {
    for (const dateId of added) s.participation.push({ vendorId: v.id, dateId, status: "invited" });
  }
  return added.length;
}

/** Adds vendors to a market and invites them to every date still to come. */
export async function inviteToMarket(marketId: string, vendorIds: string[], today: string) {
  const s = store();
  const upcoming = s.dates.filter((d) => d.market.id === marketId && d.date >= today);
  let n = 0;
  for (const id of vendorIds) {
    const v = s.vendors.find((x) => x.id === id);
    if (!v || v.marketIds.includes(marketId)) continue;
    v.marketIds.push(marketId);
    n++;
    for (const d of upcoming) if (!s.participation.some((p) => p.vendorId === id && p.dateId === d.id)) s.participation.push({ vendorId: id, dateId: d.id, status: "invited" });
  }
  return n;
}

export async function getRoster(dateId: string) {
  const s = store();
  const date = s.dates.find((d) => d.id === dateId);
  if (!date) return null;
  const rows: RosterRow[] = s.participation
    .filter((p) => p.dateId === dateId)
    .map((p) => {
      const v = s.vendors.find((x) => x.id === p.vendorId);
      return { ...clone(p), vendorName: v?.name ?? "Unknown vendor", categories: v?.categories ?? [] };
    })
    .sort((a, b) => a.vendorName.localeCompare(b.vendorName));
  return { date: clone(date), rows, counts: counts(dateId) };
}

export async function setStall(dateId: string, vendorId: string, stall: string) {
  const p = store().participation.find((x) => x.dateId === dateId && x.vendorId === vendorId);
  if (p) p.stall = stall || undefined;
}

export async function setDateStatus(dateId: string, status: MarketDate["dateStatus"]) {
  const d = store().dates.find((x) => x.id === dateId);
  if (d) d.dateStatus = status;
}

/** Who'd get a reminder: invited vendors who haven't answered. With Supabase connected, this emails them. */
export async function remindNonResponders(dateId: string) {
  return store().participation.filter((p) => p.dateId === dateId && p.status === "invited").map((p) => p.vendorId);
}

function resolveAudience(a: Audience) {
  const s = store();
  const active = s.vendors.filter((v) => v.status === "approved" || v.status === "active");
  if (a.kind === "all") return active;
  if (a.kind === "market") return active.filter((v) => v.marketIds.includes(a.marketId ?? ""));
  return s.vendors.filter((v) => a.vendorIds?.includes(v.id));
}

export async function audienceSize(a: Audience) {
  return resolveAudience(a).length;
}

export async function listAdminUpdates(): Promise<AdminUpdate[]> {
  return clone([...store().updates].sort(newestFirst)).map((u) => ({ ...u, audienceLabel: audienceLabel(u.audience) }));
}

/** Posts an update. `authorOrg` is set when an event partner posts it (shown as "From The Argo"). */
export async function createUpdate(input: { title: string; body: string; audience: Audience; pinned: boolean; email: boolean; authorOrg?: string }) {
  const now = new Date().toISOString();
  const recipients = resolveAudience(input.audience).map((v) => ({ vendorId: v.id, vendorName: v.name }));
  const id = newId("u");
  store().updates.push({
    id, title: input.title, body: input.body, audience: input.audience, pinned: input.pinned,
    publishedAt: now, emailedAt: input.email ? now : undefined, recipients, authorOrg: input.authorOrg,
  });
  return { count: recipients.length, id, vendorIds: recipients.map((r) => r.vendorId) };
}

export async function setUpdatePinned(id: string, pinned: boolean) {
  const u = store().updates.find((x) => x.id === id);
  if (u) u.pinned = pinned;
}

export async function deleteUpdate(id: string) {
  const s = store();
  s.updates = s.updates.filter((u) => u.id !== id);
}

export async function getGuide(id: string) {
  const g = store().guides.find((x) => x.id === id);
  return g ? clone(g) : null;
}

export async function saveGuide(input: PortalGuide) {
  const s = store();
  const existing = s.guides.find((g) => g.id === input.id);
  if (existing) Object.assign(existing, input);
  else s.guides.push({ ...input, id: newId("g") });
}

export async function deleteGuide(id: string) {
  const s = store();
  s.guides = s.guides.filter((g) => g.id !== id);
}

export async function addAsset(input: Omit<PortalAsset, "id">) {
  store().assets.push({ ...input, id: newId("a") });
}

export async function deleteAsset(id: string) {
  const s = store();
  s.assets = s.assets.filter((a) => a.id !== id);
}

export async function listAllMarkets(): Promise<PortalMarket[]> {
  return clone(store().markets);
}

export async function dashboard(today: string) {
  const s = store();
  const upcoming = s.dates.filter((d) => d.date >= today && d.dateStatus !== "cancelled").sort(byDate);
  const next = upcoming[0];
  return {
    newApplications: s.applications.filter((a) => a.status === "new").length,
    leads: s.vendors.filter((v) => v.status === "lead").length,
    pendingProfiles: clone(s.vendors.filter((v) => v.profilePendingReview)),
    invitedNoLogin: clone(s.vendors.filter((v) => v.contacts.some((c) => c.invitedAt && !c.hasLogin))),
    next: next ? { ...clone(next), counts: counts(next.id) } : undefined,
    needsReply: upcoming.slice(0, 6).map((d) => ({ ...clone(d), counts: counts(d.id) })),
    updates: (await listAdminUpdates()).slice(0, 3),
  };
}

// ---- Event partners, and the planning they share with the Market --------------------------------
// Partner pages check requirePartner(marketId) first; every function here also takes the market id
// and refuses rows from any other market, so a forged id from another market changes nothing.

export async function getMarketById(id: string): Promise<PortalMarket | null> {
  const m = store().markets.find((x) => x.id === id);
  return m ? clone(m) : null;
}

export async function listMarketsByIds(ids: string[]): Promise<PortalMarket[]> {
  return clone(store().markets.filter((m) => ids.includes(m.id)));
}

/** A date, only if it belongs to the market. */
export async function getMarketDate(marketId: string, dateId: string) {
  const d = store().dates.find((x) => x.id === dateId && x.market.id === marketId);
  return d ? { ...clone(d), counts: counts(d.id) } : null;
}

export async function listMarketDates(marketId: string) {
  return store()
    .dates.filter((d) => d.market.id === marketId)
    .sort(byDate)
    .map((d) => ({ ...clone(d), counts: counts(d.id) }));
}

/**
 * A date's roster as a partner sees it: names, categories, replies, stalls and notes, plus contact
 * names, emails and phones. With Supabase this is the one place partner pages read vendors and
 * vendor_contacts (server-side, a fixed set of columns), since RLS gives partners no access to them.
 */
export async function getPartnerRoster(marketId: string, dateId: string): Promise<{ date: MarketDate; rows: PartnerRosterRow[]; counts: DateCounts } | null> {
  const roster = await getRoster(dateId);
  if (!roster || roster.date.market.id !== marketId) return null;
  const vendors = store().vendors;
  return {
    ...roster,
    rows: roster.rows.map((r) => ({
      ...r,
      contacts: (vendors.find((v) => v.id === r.vendorId)?.contacts ?? []).map((c) => ({ name: c.name, email: c.email, phone: c.phone })),
    })),
  };
}

export type Logistics = Pick<MarketDate, "opensAt" | "closesAt" | "loadInAt" | "teardownBy" | "location" | "address" | "mapUrl" | "contactName" | "contactPhone" | "vendorNotes">;

/** Edits a date's logistics (never its market, day or status). */
export async function updateDateLogistics(marketId: string, dateId: string, l: Logistics) {
  const d = store().dates.find((x) => x.id === dateId && x.market.id === marketId);
  if (!d) throw new Error("Date not found.");
  Object.assign(d, l);
}

/** Sets a stall, only on the given market's dates. */
export async function setMarketStall(marketId: string, dateId: string, vendorId: string, stall: string) {
  if (!store().dates.some((d) => d.id === dateId && d.market.id === marketId)) throw new Error("Date not found.");
  await setStall(dateId, vendorId, stall);
}

export async function listMarketUpdates(marketId: string): Promise<AdminUpdate[]> {
  return (await listAdminUpdates()).filter((u) => u.audience.kind === "market" && u.audience.marketId === marketId);
}

export async function listMarketAssets(marketId: string): Promise<PortalAsset[]> {
  return clone(store().assets.filter((a) => a.market?.id === marketId));
}

/** Removes a file, only if it belongs to the market. */
export async function deleteMarketAsset(marketId: string, assetId: string) {
  const s = store();
  if (!s.assets.some((a) => a.id === assetId && a.market?.id === marketId)) throw new Error("File not found.");
  s.assets = s.assets.filter((a) => a.id !== assetId);
}

export async function listMarketGuides(marketId: string): Promise<PortalGuide[]> {
  return clone(store().guides.filter((g) => g.marketId === null || g.marketId === marketId));
}

// Tasks

const taskOrder = (a: EventTask, b: EventTask) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || a.createdAt.localeCompare(b.createdAt);

export async function listTasks(marketId: string): Promise<EventTask[]> {
  return clone(store().tasks.filter((t) => t.marketId === marketId).sort(taskOrder));
}

/** Open tasks across markets due on or before a date (for the admin dashboard). */
export async function listTasksDue(until: string): Promise<(EventTask & { marketName: string })[]> {
  const s = store();
  return clone(s.tasks.filter((t) => !t.doneAt && t.dueDate && t.dueDate <= until).sort(taskOrder)).map((t) => ({
    ...t,
    marketName: s.markets.find((m) => m.id === t.marketId)?.name ?? "",
  }));
}

export async function addTask(marketId: string, t: Pick<EventTask, "title" | "owner" | "dueDate" | "notes">) {
  store().tasks.push({ id: newId("t"), marketId, ...t, createdAt: new Date().toISOString() });
}

export async function setTaskDone(marketId: string, taskId: string, done: boolean, by: string) {
  const t = store().tasks.find((x) => x.id === taskId && x.marketId === marketId);
  if (!t) throw new Error("Task not found.");
  t.doneAt = done ? new Date().toISOString() : undefined;
  t.doneBy = done ? by : undefined;
}

export async function deleteTask(marketId: string, taskId: string) {
  const s = store();
  s.tasks = s.tasks.filter((t) => !(t.id === taskId && t.marketId === marketId));
}

// Notes

export async function listEventNotes(marketId: string): Promise<EventNote[]> {
  return clone(store().notes.filter((n) => n.marketId === marketId).sort((a, b) => b.at.localeCompare(a.at)));
}

export async function addEventNote(marketId: string, n: Pick<EventNote, "body" | "authorName" | "authorOrg">) {
  store().notes.push({ id: newId("en"), marketId, ...n, at: new Date().toISOString() });
}

// Partners

export async function listMarketPartners(marketId: string): Promise<MarketPartner[]> {
  return clone(store().partners.filter((p) => p.marketId === marketId));
}

/** The partner record for the signed-in partner on a market (their organisation, for labels). */
export async function getPartnerFor(marketId: string, email: string): Promise<MarketPartner | null> {
  const p = store().partners.find((x) => x.marketId === marketId && x.email === email.toLowerCase());
  return p ? clone(p) : null;
}

export async function addMarketPartner(marketId: string, p: Pick<MarketPartner, "name" | "email" | "organisation">) {
  const s = store();
  const email = p.email.toLowerCase();
  if (s.partners.some((x) => x.marketId === marketId && x.email === email)) return false;
  s.partners.push({ id: newId("p"), marketId, name: p.name, email, organisation: p.organisation, hasLogin: false });
  return true;
}

/** Records the invite. With Supabase connected this also emails a login link. */
export async function invitePartner(marketId: string, partnerId: string) {
  const p = store().partners.find((x) => x.id === partnerId && x.marketId === marketId);
  if (!p) throw new Error("Partner not found.");
  p.invitedAt = new Date().toISOString();
  return clone(p);
}

export async function removeMarketPartner(marketId: string, partnerId: string) {
  const s = store();
  s.partners = s.partners.filter((p) => !(p.id === partnerId && p.marketId === marketId));
}

/**
 * Who to email about these vendors: their contacts' addresses. For updates, people who've turned off
 * update emails are left out; invites and reminders always go.
 */
export async function emailTargets(vendorIds: string[], purpose: "update" | "always"): Promise<{ vendorId: string; email: string; name: string }[]> {
  return store()
    .vendors.filter((v) => vendorIds.includes(v.id))
    .flatMap((v) => v.contacts.filter((c) => purpose === "always" || c.emailUpdates).map((c) => ({ vendorId: v.id, email: c.email, name: c.name })));
}
