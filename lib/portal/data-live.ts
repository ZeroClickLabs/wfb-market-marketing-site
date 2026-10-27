// The portal's data functions against Supabase. Each runs as the signed-in user (row-level security
// applies) except where noted: the secret-key client is used only for the vendor names and contacts
// on an event partner's roster, and to resolve an update's recipients, after the caller's access has
// been checked through RLS. Same functions and shapes as lib/portal/data-demo.ts.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import type { DateTemplate, Logistics, MarketSummary, VendorFilter } from "./data-demo";
import type {
  AdminApplication, AdminContact, AdminNote, AdminUpdate, AdminVendor, Audience, DateCounts, EventNote, EventTask, MarketDate, MarketPartner,
  NoteKind, Participation, ParticipationStatus, PartnerRosterRow, PortalAsset, PortalDate, PortalGuide, PortalMarket, PortalMember, PortalUpdate,
  PortalVendor, ProfileInput, RosterRow, VendorStatus,
} from "./types";

type Tables = Database["public"]["Tables"];
type Row<T extends keyof Tables> = Tables[T]["Row"];
type Db = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "assets";
const SIGNED_URL_SECONDS = 60 * 60;

// ---- Helpers ----------------------------------------------------------------------------------------

type Result<T> = { data: T; error: { message: string } | null };

/** The data, or throws: on a database error, or when nothing came back. */
function must<T>(res: Result<T>): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null || res.data === undefined) throw new Error("Not found.");
  return res.data;
}

/** An optional single row: null when there's none; throws on a database error. */
function maybe<T>(res: Result<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** A write that returns no rows: throws on a database error. */
function ok(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

async function session() {
  const db = await createClient();
  const { data } = await db.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) throw new Error("Not signed in.");
  return { db, uid };
}

async function myName(db: Db, uid: string) {
  const p = maybe(await db.from("profiles").select("full_name, email").eq("user_id", uid).maybeSingle());
  return p?.full_name || p?.email || "Market team";
}

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : "");
const opt = (v: string | null) => v ?? undefined;
const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);

function toMarket(m: Pick<Row<"markets">, "id" | "name" | "kind">): PortalMarket {
  return { id: m.id, name: m.name, kind: m.kind };
}

function toDate(d: Row<"market_dates">, market: PortalMarket): MarketDate {
  return {
    id: d.id,
    market,
    date: d.date,
    opensAt: hhmm(d.opens_at),
    closesAt: hhmm(d.closes_at),
    loadInAt: hhmm(d.load_in_at),
    teardownBy: hhmm(d.teardown_by),
    location: d.location ?? "",
    address: d.address ?? "",
    mapUrl: opt(d.map_url),
    contactName: opt(d.contact_name),
    contactPhone: opt(d.contact_phone),
    vendorNotes: opt(d.vendor_notes),
    dateStatus: d.status,
  };
}

function toLogisticsRow(l: Logistics) {
  return {
    opens_at: l.opensAt,
    closes_at: l.closesAt,
    load_in_at: l.loadInAt,
    teardown_by: l.teardownBy,
    location: l.location,
    address: l.address,
    map_url: l.mapUrl ?? null,
    contact_name: l.contactName ?? null,
    contact_phone: l.contactPhone ?? null,
    vendor_notes: l.vendorNotes ?? null,
  };
}

/** Reply counts per date, from whatever participation rows the client can see. */
async function countsFor(db: Db, dateIds: string[]) {
  const map = new Map<string, DateCounts>(dateIds.map((id) => [id, { invited: 0, confirmed: 0, declined: 0 }]));
  if (!dateIds.length) return map;
  const rows = must(await db.from("participation").select("market_date_id, status").in("market_date_id", dateIds));
  for (const r of rows) map.get(r.market_date_id)![r.status]++;
  return map;
}

const DATE_WITH_MARKET = "*, markets!inner(id, name, kind)";
type DateWithMarket = Row<"market_dates"> & { markets: Pick<Row<"markets">, "id" | "name" | "kind"> };

// ---- Vendor side (as the signed-in vendor) -------------------------------------------------------

async function myVendorId(db: Db, uid: string) {
  const m = maybe(await db.from("vendor_members").select("vendor_id").eq("user_id", uid).order("created_at").limit(1).maybeSingle());
  if (!m) throw new Error("Your login isn't linked to a vendor yet. Ask the Market to check your invite.");
  return m.vendor_id;
}

function toPortalVendor(v: Row<"vendors">): PortalVendor {
  return {
    id: v.id,
    name: v.name,
    town: v.town ?? "",
    categories: v.categories,
    description: v.description ?? "",
    products: v.products,
    website: v.website ?? "",
    instagram: v.instagram ?? "",
    phone: v.phone ?? "",
    profilePublished: v.profile_published,
    profilePendingReview: v.profile_pending_review,
  };
}

export async function getVendor(): Promise<PortalVendor> {
  const { db, uid } = await session();
  const id = await myVendorId(db, uid);
  return toPortalVendor(must(await db.from("vendors").select("*").eq("id", id).single()));
}

export async function listMembers(): Promise<PortalMember[]> {
  const { db, uid } = await session();
  const id = await myVendorId(db, uid);
  const [contacts, members] = await Promise.all([
    db.from("vendor_contacts").select("name, email, user_id").eq("vendor_id", id).not("user_id", "is", null),
    db.from("vendor_members").select("user_id, email_updates").eq("vendor_id", id),
  ]);
  const prefs = new Map(must(members).map((m) => [m.user_id, m.email_updates]));
  return must(contacts).map((c) => ({ name: c.name ?? c.email, email: c.email, isYou: c.user_id === uid, emailUpdates: prefs.get(c.user_id!) ?? true }));
}

async function myDates(db: Db, vendorId: string): Promise<PortalDate[]> {
  const rows = must(await db.from("participation").select(`*, market_dates!inner(${DATE_WITH_MARKET})`).eq("vendor_id", vendorId)) as unknown as (Row<"participation"> & { market_dates: DateWithMarket })[];
  return rows
    .map((p) => ({
      ...toDate(p.market_dates, toMarket(p.market_dates.markets)),
      status: p.status,
      stall: opt(p.stall),
      vendorNote: opt(p.vendor_note),
      respondedAt: opt(p.responded_at),
    }))
    .sort(byDate);
}

export async function listDates(): Promise<PortalDate[]> {
  const { db, uid } = await session();
  return myDates(db, await myVendorId(db, uid));
}

export async function getDate(id: string): Promise<PortalDate | null> {
  return (await listDates()).find((d) => d.id === id) ?? null;
}

export async function respond(ids: string[], status: Exclude<ParticipationStatus, "invited">, note?: string) {
  const { db, uid } = await session();
  const vendorId = await myVendorId(db, uid);
  const open = must(await db.from("market_dates").select("id").in("id", ids).neq("status", "cancelled")).map((d) => d.id);
  if (!open.length) return;
  ok(await db.from("participation").update({ status, ...(note !== undefined ? { vendor_note: note || null } : {}) }).eq("vendor_id", vendorId).in("market_date_id", open));
}

const UPDATE_SELECT = "*, markets:audience_market_id(name), update_recipients(vendor_id, read_at)";
type UpdateRow = Row<"updates"> & { markets: { name: string } | null; update_recipients: { vendor_id: string; read_at: string | null }[] };

function audienceLabelOf(u: UpdateRow) {
  if (u.audience_kind === "all") return "All vendors";
  if (u.audience_kind === "market") return `${u.markets?.name ?? "Market"} vendors`;
  const n = u.update_recipients.length;
  return n === 1 ? "1 chosen vendor" : `${n} chosen vendors`;
}

export async function listUpdates(): Promise<PortalUpdate[]> {
  const { db, uid } = await session();
  const vendorId = await myVendorId(db, uid);
  const rows = must(await db.from("updates").select(UPDATE_SELECT).not("published_at", "is", null).order("pinned", { ascending: false }).order("published_at", { ascending: false })) as unknown as UpdateRow[];
  return rows.map((u) => ({
    id: u.id,
    title: u.title,
    body: u.body,
    publishedAt: u.published_at!,
    pinned: u.pinned,
    read: Boolean(u.update_recipients.find((r) => r.vendor_id === vendorId)?.read_at),
    audienceLabel: audienceLabelOf(u),
    authorOrg: opt(u.author_org),
  }));
}

export async function getUpdate(id: string): Promise<PortalUpdate | null> {
  return (await listUpdates()).find((u) => u.id === id) ?? null;
}

export async function markUpdateRead(id: string) {
  const { db, uid } = await session();
  const vendorId = await myVendorId(db, uid);
  ok(await db.from("update_recipients").update({ read_at: new Date().toISOString() }).eq("update_id", id).eq("vendor_id", vendorId).is("read_at", null));
}

function toGuide(g: Row<"guides">): PortalGuide {
  return { id: g.id, title: g.title, body: g.body, marketId: g.market_id };
}

export async function listGuides(marketId?: string): Promise<PortalGuide[]> {
  const db = await createClient();
  let q = db.from("guides").select("*").eq("published", true).order("sort").order("created_at");
  if (marketId) q = q.or(`market_id.is.null,market_id.eq.${marketId}`);
  return must(await q).map(toGuide);
}

type AssetRow = Row<"assets"> & { markets: Pick<Row<"markets">, "id" | "name" | "kind"> | null };

async function toAssets(db: Db, rows: AssetRow[]): Promise<PortalAsset[]> {
  if (!rows.length) return [];
  const signed = must(await db.storage.from(BUCKET).createSignedUrls(rows.map((a) => a.file_path), SIGNED_URL_SECONDS));
  const urls = new Map(signed.map((s) => [s.path, s.signedUrl]));
  return rows.map((a) => {
    const fileName = a.file_path.split("/").pop()!.replace(/^[0-9a-f-]{36}-/, "");
    const ext = (fileName.split(".").pop() ?? "file").toUpperCase();
    return {
      id: a.id,
      title: a.title,
      description: a.description ?? "",
      kind: a.kind,
      market: a.markets ? toMarket(a.markets) : null,
      url: urls.get(a.file_path) ?? "",
      fileName,
      sizeLabel: a.file_size ? `${ext} · ${Math.max(1, Math.round(a.file_size / 1024))} KB` : ext,
    };
  });
}

export async function listAssets(): Promise<PortalAsset[]> {
  const db = await createClient();
  const rows = must(await db.from("assets").select("*, markets(id, name, kind)").order("created_at")) as unknown as AssetRow[];
  return toAssets(db, rows);
}

export async function updateProfile(input: ProfileInput) {
  const { db, uid } = await session();
  const id = await myVendorId(db, uid);
  // The database marks the profile for review on every vendor edit (private.guard_vendor_update).
  ok(await db.from("vendors").update({
    name: input.name, town: input.town, description: input.description, products: input.products,
    website: input.website || null, instagram: input.instagram || null, phone: input.phone || null,
  }).eq("id", id));
}

export async function setEmailUpdates(on: boolean) {
  const { db, uid } = await session();
  ok(await db.from("vendor_members").update({ email_updates: on }).eq("user_id", uid));
}

// ---- Admin ----------------------------------------------------------------------------------------

const VENDOR_SELECT = "*, vendor_contacts(*), vendor_markets(market_id), vendor_members(user_id, email_updates), vendor_notes(*), vendor_applications(id)";
type VendorRow = Row<"vendors"> & {
  vendor_contacts: Row<"vendor_contacts">[];
  vendor_markets: { market_id: string }[];
  vendor_members: { user_id: string; email_updates: boolean }[];
  vendor_notes: Row<"vendor_notes">[];
  vendor_applications: { id: string }[];
};

function toAdminVendor(v: VendorRow): AdminVendor {
  const prefs = new Map(v.vendor_members.map((m) => [m.user_id, m.email_updates]));
  return {
    ...toPortalVendor(v),
    status: v.status,
    source: v.source,
    createdAt: v.created_at,
    contacts: [...v.vendor_contacts]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.created_at.localeCompare(b.created_at))
      .map((c): AdminContact => ({ id: c.id, name: c.name ?? "", email: c.email, phone: opt(c.phone), invitedAt: opt(c.invited_at), hasLogin: Boolean(c.user_id), emailUpdates: c.user_id ? prefs.get(c.user_id) ?? true : true })),
    notes: [...v.vendor_notes]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((n): AdminNote => ({ id: n.id, kind: n.kind, body: n.body, at: n.created_at, author: n.author_name ?? "Market team" })),
    marketIds: v.vendor_markets.map((m) => m.market_id),
    applicationId: v.vendor_applications[0]?.id,
  };
}

export async function listVendors(filter: VendorFilter = {}): Promise<AdminVendor[]> {
  const db = await createClient();
  let q = db.from("vendors").select(VENDOR_SELECT).order("name");
  if (filter.status) q = q.eq("status", filter.status);
  const vendors = (must(await q) as unknown as VendorRow[]).map(toAdminVendor);
  const text = filter.q?.trim().toLowerCase();
  return vendors
    .filter((v) => !filter.marketId || v.marketIds.includes(filter.marketId))
    .filter((v) => !text || [v.name, v.town, ...v.contacts.flatMap((c) => [c.name, c.email])].some((t) => t.toLowerCase().includes(text)));
}

function toApplication(a: Row<"vendor_applications">): AdminApplication {
  return {
    id: a.id,
    submittedAt: a.created_at,
    business: a.business_name,
    name: a.contact_name,
    email: a.email,
    phone: opt(a.phone),
    town: a.town ?? "",
    category: a.category ?? "",
    products: a.products ?? "",
    markets: a.markets,
    status: a.status,
    vendorId: a.vendor_id ?? "",
  };
}

export async function getAdminVendor(id: string) {
  const db = await createClient();
  const row = maybe(await db.from("vendors").select(VENDOR_SELECT).eq("id", id).maybeSingle()) as unknown as VendorRow | null;
  if (!row) return null;
  const vendor = toAdminVendor(row);
  const parts = must(await db.from("participation").select(`*, market_dates!inner(${DATE_WITH_MARKET})`).eq("vendor_id", id)) as unknown as (Row<"participation"> & { market_dates: DateWithMarket })[];
  const dates = parts
    .map((p) => ({
      vendorId: p.vendor_id, dateId: p.market_date_id, status: p.status, stall: opt(p.stall), note: opt(p.vendor_note), respondedAt: opt(p.responded_at),
      date: toDate(p.market_dates, toMarket(p.market_dates.markets)),
    }))
    .sort((a, b) => byDate(a.date, b.date));
  const app = vendor.applicationId ? maybe(await db.from("vendor_applications").select("*").eq("id", vendor.applicationId).maybeSingle()) : null;
  return { vendor, dates, application: app ? toApplication(app) : undefined };
}

export async function createVendor(input: { name: string; town: string; categories: string[]; status: VendorStatus; contactName: string; contactEmail: string; contactPhone?: string; note?: string; author: string }) {
  const { db, uid } = await session();
  const v = must(await db.from("vendors").insert({ name: input.name, town: input.town || null, categories: input.categories, status: input.status, source: "manual" }).select("id").single());
  if (input.contactEmail) {
    ok(await db.from("vendor_contacts").insert({ vendor_id: v.id, name: input.contactName || null, email: input.contactEmail.toLowerCase(), phone: input.contactPhone ?? null, is_primary: true }));
  }
  if (input.note) ok(await db.from("vendor_notes").insert({ vendor_id: v.id, kind: "note", body: input.note, author_id: uid, author_name: input.author }));
  return v.id;
}

export async function setVendorStatus(id: string, status: VendorStatus) {
  const db = await createClient();
  ok(await db.from("vendors").update({ status }).eq("id", id));
}

export async function addVendorNote(id: string, kind: NoteKind, body: string, author: string) {
  const { db, uid } = await session();
  ok(await db.from("vendor_notes").insert({ vendor_id: id, kind, body, author_id: uid, author_name: author }));
}

export async function addContact(id: string, c: Pick<AdminContact, "name" | "email" | "phone">) {
  const db = await createClient();
  const res = await db.from("vendor_contacts").insert({ vendor_id: id, name: c.name || null, email: c.email.toLowerCase(), phone: c.phone ?? null });
  if (res.error?.code === "23505") return false;
  ok(res);
  return true;
}

/** Records the invite (the action sends the email). Leads and applicants become approved. */
export async function inviteContact(vendorId: string, contactId: string) {
  const db = await createClient();
  const c = must(await db.from("vendor_contacts").update({ invited_at: new Date().toISOString() }).eq("id", contactId).eq("vendor_id", vendorId).select("*").single());
  ok(await db.from("vendors").update({ status: "approved" }).eq("id", vendorId).in("status", ["lead", "applied"]));
  return { id: c.id, name: c.name ?? "", email: c.email, phone: opt(c.phone), invitedAt: opt(c.invited_at), hasLogin: Boolean(c.user_id), emailUpdates: true } satisfies AdminContact;
}

/** Approves the vendor's working profile: it becomes the public snapshot. */
export async function publishProfile(id: string) {
  const db = await createClient();
  const v = must(await db.from("vendors").select("name, town, categories, description, products, website, instagram").eq("id", id).single());
  ok(await db.from("vendors").update({ published_profile: v, profile_published: true, profile_pending_review: false }).eq("id", id));
}

export async function listApplications(): Promise<AdminApplication[]> {
  const db = await createClient();
  return must(await db.from("vendor_applications").select("*").order("created_at", { ascending: false })).map(toApplication);
}

export async function getApplication(id: string) {
  const db = await createClient();
  const a = maybe(await db.from("vendor_applications").select("*").eq("id", id).maybeSingle());
  return a ? toApplication(a) : null;
}

export async function decideApplication(id: string, approve: boolean, author: string) {
  const { db, uid } = await session();
  const a = must(await db.from("vendor_applications").update({ status: approve ? "approved" : "declined", reviewed_by: uid, reviewed_at: new Date().toISOString() }).eq("id", id).select("*").single());
  if (a.vendor_id) {
    ok(await db.from("vendors").update({ status: approve ? "approved" : "declined" }).eq("id", a.vendor_id));
    ok(await db.from("vendor_notes").insert({ vendor_id: a.vendor_id, kind: "note", body: approve ? "Application approved." : "Application declined.", author_id: uid, author_name: author }));
  }
  return toApplication(a);
}

export async function listMarkets(today: string): Promise<MarketSummary[]> {
  const db = await createClient();
  const markets = must(await db.from("markets").select("id, name, kind, market_dates(*), vendor_markets(vendor_id)").order("created_at")) as unknown as (Pick<Row<"markets">, "id" | "name" | "kind"> & { market_dates: Row<"market_dates">[]; vendor_markets: { vendor_id: string }[] })[];
  const nextIds = markets.map((m) => [...m.market_dates].sort(byDate).find((d) => d.date >= today && d.status !== "cancelled")?.id).filter((x): x is string => Boolean(x));
  const counts = await countsFor(db, nextIds);
  return markets.map((m) => {
    const market = toMarket(m);
    const dates = [...m.market_dates].sort(byDate);
    const next = dates.find((d) => d.date >= today && d.status !== "cancelled");
    return {
      market,
      dates: dates.length,
      vendors: m.vendor_markets.length,
      next: next ? { ...toDate(next, market), counts: counts.get(next.id)! } : undefined,
      first: dates[0]?.date,
      last: dates.at(-1)?.date,
    };
  });
}

export async function getMarket(id: string) {
  const db = await createClient();
  const m = maybe(await db.from("markets").select("id, name, kind, market_dates(*)").eq("id", id).maybeSingle()) as unknown as (Pick<Row<"markets">, "id" | "name" | "kind"> & { market_dates: Row<"market_dates">[] }) | null;
  if (!m) return null;
  const market = toMarket(m);
  const dates = [...m.market_dates].sort(byDate);
  const counts = await countsFor(db, dates.map((d) => d.id));
  const vendorIds = must(await db.from("vendor_markets").select("vendor_id").eq("market_id", id)).map((x) => x.vendor_id);
  const vendors = vendorIds.length ? (must(await db.from("vendors").select(VENDOR_SELECT).in("id", vendorIds).order("name")) as unknown as VendorRow[]).map(toAdminVendor) : [];
  return { market, dates: dates.map((d) => ({ ...toDate(d, market), counts: counts.get(d.id)! })), vendors };
}

export async function createMarket(input: Omit<PortalMarket, "id">) {
  const db = await createClient();
  const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
  return must(await db.from("markets").insert({ name: input.name, kind: input.kind, slug }).select("id").single()).id;
}

/** Adds one date, or every week from `date` through `until`. Vendors already in the market are invited. */
export async function addDates(marketId: string, date: string, until: string | undefined, t: DateTemplate) {
  const db = await createClient();
  const end = until && until > date ? until : date;
  const days: string[] = [];
  for (let d = new Date(`${date}T12:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 7)) days.push(d.toISOString().slice(0, 10));
  const added = must(await db.from("market_dates").upsert(days.map((day) => ({ market_id: marketId, date: day, ...toLogisticsRow(t) })), { onConflict: "market_id,date", ignoreDuplicates: true }).select("id"));
  if (added.length) {
    const vendorIds = must(await db.from("vendor_markets").select("vendor_id, vendors!inner(status)").eq("market_id", marketId).not("vendors.status", "in", "(inactive,declined)")).map((x) => x.vendor_id);
    const rows = vendorIds.flatMap((vendor_id) => added.map((d) => ({ vendor_id, market_date_id: d.id })));
    if (rows.length) ok(await db.from("participation").upsert(rows, { onConflict: "vendor_id,market_date_id", ignoreDuplicates: true }));
  }
  return added.length;
}

/** Adds vendors to a market and invites them to every date still to come. */
export async function inviteToMarket(marketId: string, vendorIds: string[], today: string) {
  const db = await createClient();
  const already = new Set(must(await db.from("vendor_markets").select("vendor_id").eq("market_id", marketId)).map((x) => x.vendor_id));
  const fresh = vendorIds.filter((id) => !already.has(id));
  if (!fresh.length) return 0;
  ok(await db.from("vendor_markets").insert(fresh.map((vendor_id) => ({ vendor_id, market_id: marketId }))));
  const upcoming = must(await db.from("market_dates").select("id").eq("market_id", marketId).gte("date", today)).map((d) => d.id);
  const rows = fresh.flatMap((vendor_id) => upcoming.map((market_date_id) => ({ vendor_id, market_date_id })));
  if (rows.length) ok(await db.from("participation").upsert(rows, { onConflict: "vendor_id,market_date_id", ignoreDuplicates: true }));
  return fresh.length;
}

async function rosterWith(client: Db | ReturnType<typeof createAdminClient>, dateId: string) {
  const d = maybe(await client.from("market_dates").select(DATE_WITH_MARKET).eq("id", dateId).maybeSingle()) as unknown as DateWithMarket | null;
  if (!d) return null;
  const parts = must(await client.from("participation").select("*, vendors!inner(name, categories)").eq("market_date_id", dateId)) as unknown as (Row<"participation"> & { vendors: { name: string; categories: string[] } })[];
  const rows: RosterRow[] = parts
    .map((p) => ({ vendorId: p.vendor_id, dateId, status: p.status, stall: opt(p.stall), note: opt(p.vendor_note), respondedAt: opt(p.responded_at), vendorName: p.vendors.name, categories: p.vendors.categories }))
    .sort((a, b) => a.vendorName.localeCompare(b.vendorName));
  const counts: DateCounts = { invited: 0, confirmed: 0, declined: 0 };
  for (const r of rows) counts[r.status]++;
  return { date: toDate(d, toMarket(d.markets)), rows, counts };
}

export async function getRoster(dateId: string) {
  return rosterWith(await createClient(), dateId);
}

export async function setStall(dateId: string, vendorId: string, stall: string) {
  const db = await createClient();
  ok(await db.from("participation").update({ stall: stall || null }).eq("market_date_id", dateId).eq("vendor_id", vendorId));
}

export async function setDateStatus(dateId: string, status: MarketDate["dateStatus"]) {
  const db = await createClient();
  ok(await db.from("market_dates").update({ status }).eq("id", dateId));
}

/** Marks who's being reminded (invited, no reply yet) and returns them; the action sends the emails. */
export async function remindNonResponders(dateId: string) {
  const db = await createClient();
  const rows = must(await db.from("participation").update({ reminded_at: new Date().toISOString() }).eq("market_date_id", dateId).eq("status", "invited").select("vendor_id"));
  return rows.length;
}

/** The vendors an audience reaches: approved and active vendors (in the market), or the chosen ones. */
async function resolveAudience(a: Audience) {
  const admin = createAdminClient();
  if (a.kind === "vendors") return must(await admin.from("vendors").select("id, name").in("id", a.vendorIds ?? []));
  if (a.kind === "all") return must(await admin.from("vendors").select("id, name").in("status", ["approved", "active"]));
  const rows = must(await admin.from("vendor_markets").select("vendors!inner(id, name, status)").eq("market_id", a.marketId ?? "").in("vendors.status", ["approved", "active"])) as unknown as { vendors: { id: string; name: string } }[];
  return rows.map((r) => r.vendors);
}

export async function audienceSize(a: Audience) {
  return (await resolveAudience(a)).length;
}

async function updatesFor(db: Db, marketId?: string): Promise<AdminUpdate[]> {
  let q = db.from("updates").select(UPDATE_SELECT).not("published_at", "is", null).order("pinned", { ascending: false }).order("published_at", { ascending: false });
  if (marketId) q = q.eq("audience_kind", "market").eq("audience_market_id", marketId);
  const rows = must(await q) as unknown as UpdateRow[];
  // Vendor names for read receipts (partners can't read vendors, so names are looked up server-side).
  const ids = [...new Set(rows.flatMap((u) => u.update_recipients.map((r) => r.vendor_id)))];
  const names = new Map(ids.length ? must(await createAdminClient().from("vendors").select("id, name").in("id", ids)).map((v) => [v.id, v.name]) : []);
  return rows.map((u) => ({
    id: u.id,
    title: u.title,
    body: u.body,
    publishedAt: u.published_at!,
    pinned: u.pinned,
    audience: u.audience_kind === "market" ? { kind: "market", marketId: u.audience_market_id ?? undefined } : u.audience_kind === "vendors" ? { kind: "vendors", vendorIds: u.update_recipients.map((r) => r.vendor_id) } : { kind: "all" },
    audienceLabel: audienceLabelOf(u),
    emailedAt: opt(u.emailed_at),
    recipients: u.update_recipients.map((r) => ({ vendorId: r.vendor_id, vendorName: names.get(r.vendor_id) ?? "", readAt: opt(r.read_at) })),
    authorOrg: opt(u.author_org),
  }));
}

export async function listAdminUpdates(): Promise<AdminUpdate[]> {
  return updatesFor(await createClient());
}

/**
 * Posts an update as the signed-in admin or partner (RLS decides; the database stamps the author),
 * then records its recipients. `email` only marks it as emailed; the action sends the emails.
 */
export async function createUpdate(input: { title: string; body: string; audience: Audience; pinned: boolean; email: boolean; authorOrg?: string }) {
  const db = await createClient();
  const now = new Date().toISOString();
  const u = must(await db.from("updates").insert({
    title: input.title, body: input.body, pinned: input.pinned, published_at: now,
    audience_kind: input.audience.kind, audience_market_id: input.audience.kind === "market" ? input.audience.marketId ?? null : null,
    emailed_at: input.email ? now : null,
  }).select("id").single());
  // The insert above passed RLS, so the caller may address this audience; partners can't write
  // recipients themselves, so they're recorded with the secret key.
  const recipients = await resolveAudience(input.audience);
  if (recipients.length) ok(await createAdminClient().from("update_recipients").insert(recipients.map((v) => ({ update_id: u.id, vendor_id: v.id }))));
  return recipients.length;
}

export async function setUpdatePinned(id: string, pinned: boolean) {
  const db = await createClient();
  ok(await db.from("updates").update({ pinned }).eq("id", id));
}

export async function deleteUpdate(id: string) {
  const db = await createClient();
  ok(await db.from("updates").delete().eq("id", id));
}

export async function getGuide(id: string) {
  const db = await createClient();
  const g = maybe(await db.from("guides").select("*").eq("id", id).maybeSingle());
  return g ? toGuide(g) : null;
}

export async function saveGuide(input: PortalGuide) {
  const db = await createClient();
  const row = { title: input.title, body: input.body, market_id: input.marketId };
  if (input.id) ok(await db.from("guides").update(row).eq("id", input.id));
  else must(await db.from("guides").insert(row));
}

export async function deleteGuide(id: string) {
  const db = await createClient();
  ok(await db.from("guides").delete().eq("id", id));
}

/** Stores an upload (given as a data: URL) in the private bucket and records it. */
export async function addAsset(input: Omit<PortalAsset, "id">) {
  const db = await createClient();
  const match = /^data:([^;]+);base64,(.*)$/.exec(input.url);
  if (!match) throw new Error("Unsupported upload.");
  const [, contentType, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  const safeName = input.fileName.replace(/[^\w.-]+/g, "-").slice(-80);
  // Market files live under markets/<id>/ (partners can manage those); Market-wide ones under shared/.
  const path = `${input.market ? `markets/${input.market.id}` : "shared"}/${crypto.randomUUID()}-${safeName}`;
  ok(await db.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false }));
  const res = await db.from("assets").insert({ title: input.title, description: input.description || null, kind: input.kind, market_id: input.market?.id ?? null, file_path: path, file_size: bytes.length, content_type: contentType });
  if (res.error) {
    await db.storage.from(BUCKET).remove([path]);
    throw new Error(res.error.message);
  }
}

async function removeAsset(db: Db, id: string, marketId?: string) {
  let q = db.from("assets").delete().eq("id", id);
  if (marketId) q = q.eq("market_id", marketId);
  const gone = must(await q.select("file_path"));
  if (!gone.length) throw new Error("File not found.");
  await db.storage.from(BUCKET).remove(gone.map((a) => a.file_path));
}

export async function deleteAsset(id: string) {
  await removeAsset(await createClient(), id);
}

export async function listAllMarkets(): Promise<PortalMarket[]> {
  const db = await createClient();
  return must(await db.from("markets").select("id, name, kind").order("created_at")).map(toMarket);
}

export async function dashboard(today: string) {
  const db = await createClient();
  const [apps, vendors, upcoming, updates] = await Promise.all([
    db.from("vendor_applications").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("vendors").select(VENDOR_SELECT),
    db.from("market_dates").select(DATE_WITH_MARKET).gte("date", today).neq("status", "cancelled").order("date").limit(6),
    updatesFor(db),
  ]);
  if (apps.error) throw new Error(apps.error.message);
  const all = (must(vendors) as unknown as VendorRow[]).map(toAdminVendor);
  const dates = must(upcoming) as unknown as DateWithMarket[];
  const counts = await countsFor(db, dates.map((d) => d.id));
  const withCounts = dates.map((d) => ({ ...toDate(d, toMarket(d.markets)), counts: counts.get(d.id)! }));
  return {
    newApplications: apps.count ?? 0,
    leads: all.filter((v) => v.status === "lead").length,
    pendingProfiles: all.filter((v) => v.profilePendingReview),
    invitedNoLogin: all.filter((v) => v.contacts.some((c) => c.invitedAt && !c.hasLogin)),
    next: withCounts[0],
    needsReply: withCounts,
    updates: updates.slice(0, 3),
  };
}

// ---- Event partners, and the planning they share with the Market --------------------------------
// Pages check requirePartner(marketId) first; RLS limits partners to their markets again here.

export async function getMarketById(id: string): Promise<PortalMarket | null> {
  const db = await createClient();
  const m = maybe(await db.from("markets").select("id, name, kind").eq("id", id).maybeSingle());
  return m ? toMarket(m) : null;
}

export async function listMarketsByIds(ids: string[]): Promise<PortalMarket[]> {
  if (!ids.length) return [];
  const db = await createClient();
  return must(await db.from("markets").select("id, name, kind").in("id", ids).order("created_at")).map(toMarket);
}

/** A date, only if it belongs to the market. */
export async function getMarketDate(marketId: string, dateId: string) {
  const db = await createClient();
  const d = maybe(await db.from("market_dates").select(DATE_WITH_MARKET).eq("id", dateId).eq("market_id", marketId).maybeSingle()) as unknown as DateWithMarket | null;
  if (!d) return null;
  const counts = await countsFor(db, [d.id]);
  return { ...toDate(d, toMarket(d.markets)), counts: counts.get(d.id)! };
}

export async function listMarketDates(marketId: string) {
  const db = await createClient();
  const dates = must(await db.from("market_dates").select(DATE_WITH_MARKET).eq("market_id", marketId).order("date")) as unknown as DateWithMarket[];
  const counts = await countsFor(db, dates.map((d) => d.id));
  return dates.map((d) => ({ ...toDate(d, toMarket(d.markets)), counts: counts.get(d.id)! }));
}

/**
 * A date's roster as a partner sees it, with vendors' contacts. RLS gives partners no access to
 * vendors or vendor_contacts, so after confirming the caller can see this date (RLS), a fixed set
 * of columns is read with the secret key. This is the only place partner pages read those tables.
 */
export async function getPartnerRoster(marketId: string, dateId: string): Promise<{ date: MarketDate; rows: PartnerRosterRow[]; counts: DateCounts } | null> {
  const db = await createClient();
  const visible = maybe(await db.from("market_dates").select("id").eq("id", dateId).eq("market_id", marketId).maybeSingle());
  if (!visible) return null;
  const admin = createAdminClient();
  const roster = await rosterWith(admin, dateId);
  if (!roster) return null;
  const contacts = roster.rows.length ? must(await admin.from("vendor_contacts").select("vendor_id, name, email, phone, is_primary").in("vendor_id", roster.rows.map((r) => r.vendorId))) : [];
  return {
    ...roster,
    rows: roster.rows.map((r) => ({
      ...r,
      contacts: contacts
        .filter((c) => c.vendor_id === r.vendorId)
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((c) => ({ name: c.name ?? "", email: c.email, phone: opt(c.phone) })),
    })),
  };
}

/** Edits a date's logistics (never its market, day or status). */
export async function updateDateLogistics(marketId: string, dateId: string, l: Logistics) {
  const db = await createClient();
  const rows = must(await db.from("market_dates").update(toLogisticsRow(l)).eq("id", dateId).eq("market_id", marketId).select("id"));
  if (!rows.length) throw new Error("Date not found.");
}

/** Sets a stall, only on the given market's dates. */
export async function setMarketStall(marketId: string, dateId: string, vendorId: string, stall: string) {
  const db = await createClient();
  const d = maybe(await db.from("market_dates").select("id").eq("id", dateId).eq("market_id", marketId).maybeSingle());
  if (!d) throw new Error("Date not found.");
  ok(await db.from("participation").update({ stall: stall || null }).eq("market_date_id", dateId).eq("vendor_id", vendorId));
}

export async function listMarketUpdates(marketId: string): Promise<AdminUpdate[]> {
  return updatesFor(await createClient(), marketId);
}

export async function listMarketAssets(marketId: string): Promise<PortalAsset[]> {
  const db = await createClient();
  const rows = must(await db.from("assets").select("*, markets(id, name, kind)").eq("market_id", marketId).order("created_at")) as unknown as AssetRow[];
  return toAssets(db, rows);
}

/** Removes a file, only if it belongs to the market. */
export async function deleteMarketAsset(marketId: string, assetId: string) {
  await removeAsset(await createClient(), assetId, marketId);
}

export async function listMarketGuides(marketId: string): Promise<PortalGuide[]> {
  return listGuides(marketId);
}

// Tasks

function toTask(t: Row<"event_tasks">): EventTask {
  return { id: t.id, marketId: t.market_id, title: t.title, notes: opt(t.notes), owner: t.owner, dueDate: opt(t.due_date), doneAt: opt(t.done_at), doneBy: opt(t.done_by), createdAt: t.created_at };
}

const taskOrder = (a: EventTask, b: EventTask) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || a.createdAt.localeCompare(b.createdAt);

export async function listTasks(marketId: string): Promise<EventTask[]> {
  const db = await createClient();
  return must(await db.from("event_tasks").select("*").eq("market_id", marketId)).map(toTask).sort(taskOrder);
}

/** Open tasks across markets due on or before a date (for the admin dashboard). */
export async function listTasksDue(until: string): Promise<(EventTask & { marketName: string })[]> {
  const db = await createClient();
  const rows = must(await db.from("event_tasks").select("*, markets(name)").is("done_at", null).lte("due_date", until)) as unknown as (Row<"event_tasks"> & { markets: { name: string } | null })[];
  return rows.map((t) => ({ ...toTask(t), marketName: t.markets?.name ?? "" })).sort(taskOrder);
}

export async function addTask(marketId: string, t: Pick<EventTask, "title" | "owner" | "dueDate" | "notes">) {
  const { db, uid } = await session();
  ok(await db.from("event_tasks").insert({ market_id: marketId, title: t.title, owner: t.owner, due_date: t.dueDate ?? null, notes: t.notes ?? null, created_by: uid }));
}

export async function setTaskDone(marketId: string, taskId: string, done: boolean) {
  const db = await createClient();
  // The database records who ticked it off (private.guard_task_update).
  const rows = must(await db.from("event_tasks").update({ done_at: done ? new Date().toISOString() : null }).eq("id", taskId).eq("market_id", marketId).select("id"));
  if (!rows.length) throw new Error("Task not found.");
}

export async function deleteTask(marketId: string, taskId: string) {
  const db = await createClient();
  ok(await db.from("event_tasks").delete().eq("id", taskId).eq("market_id", marketId));
}

// Notes

export async function listEventNotes(marketId: string): Promise<EventNote[]> {
  const db = await createClient();
  return must(await db.from("event_notes").select("*").eq("market_id", marketId).order("created_at", { ascending: false })).map((n) => ({
    id: n.id, marketId: n.market_id, body: n.body, authorName: n.author_name, authorOrg: opt(n.author_org), at: n.created_at,
  }));
}

export async function addEventNote(marketId: string, n: Pick<EventNote, "body" | "authorName" | "authorOrg">) {
  const { db, uid } = await session();
  ok(await db.from("event_notes").insert({ market_id: marketId, body: n.body, author_id: uid, author_name: n.authorName || (await myName(db, uid)), author_org: n.authorOrg ?? null }));
}

// Partners

function toPartner(p: Row<"market_partners">): MarketPartner {
  return { id: p.id, marketId: p.market_id, name: p.name, email: p.email, organisation: p.organisation, invitedAt: opt(p.invited_at), hasLogin: Boolean(p.user_id) };
}

export async function listMarketPartners(marketId: string): Promise<MarketPartner[]> {
  const db = await createClient();
  return must(await db.from("market_partners").select("*").eq("market_id", marketId).order("created_at")).map(toPartner);
}

/** The partner record for a person on a market (their organisation, for labels). */
export async function getPartnerFor(marketId: string, email: string): Promise<MarketPartner | null> {
  const db = await createClient();
  const p = maybe(await db.from("market_partners").select("*").eq("market_id", marketId).ilike("email", email).maybeSingle());
  return p ? toPartner(p) : null;
}

export async function addMarketPartner(marketId: string, p: Pick<MarketPartner, "name" | "email" | "organisation">) {
  const db = await createClient();
  const res = await db.from("market_partners").insert({ market_id: marketId, name: p.name, email: p.email.toLowerCase(), organisation: p.organisation });
  if (res.error?.code === "23505") return false;
  ok(res);
  return true;
}

/** Records the invite (the action sends the email). */
export async function invitePartner(marketId: string, partnerId: string) {
  const db = await createClient();
  const rows = must(await db.from("market_partners").update({ invited_at: new Date().toISOString() }).eq("id", partnerId).eq("market_id", marketId).select("id"));
  if (!rows.length) throw new Error("Partner not found.");
}

export async function removeMarketPartner(marketId: string, partnerId: string) {
  const db = await createClient();
  ok(await db.from("market_partners").delete().eq("id", partnerId).eq("market_id", marketId));
}

// Re-exported so the shapes line up with the preview module.
export type { Participation };
