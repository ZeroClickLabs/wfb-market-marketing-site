"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { todayISO } from "@/content/format";
import * as data from "@/lib/portal/data";
import { canEmail } from "@/lib/email/config";
import type { ActionState } from "@/app/portal/actions";
import { noEmailNote } from "@/components/portal/ui";
import { AssetInput, EventNoteInput, Logistics, Task, checkUpload, fileToAsset, isoDate, list, logisticsFields, parse, str, values } from "@/lib/portal/forms";
import type { Audience, VendorStatus } from "@/lib/portal/types";

// Admin changes. Every action checks the admin role itself; pages checking it isn't enough.

const STATUSES = ["lead", "applied", "approved", "active", "inactive", "declined"] as const;
const NOTE_KINDS = ["note", "email", "call", "meeting"] as const;
const MARKET_KINDS = ["summer", "night", "popup", "winter"] as const;

// ---- Vendors ----------------------------------------------------------------------------------

const NewVendor = z.object({
  name: z.string().trim().min(1, "Enter the business name.").max(120),
  town: z.string().trim().max(80),
  categories: z.preprocess(list, z.array(z.string()).min(1, "Choose at least one category.")),
  status: z.enum(STATUSES),
  contactName: z.string().trim().max(120),
  contactEmail: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  contactPhone: z.string().trim().max(40),
  note: z.string().trim().max(2000),
});

export async function createVendorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const p = parse(NewVendor, formData);
  if (!p.ok) return p.state;
  const id = await data.createVendor({ ...p.data, contactPhone: p.data.contactPhone || undefined, author: user.fullName ?? user.email });
  revalidatePath("/admin", "layout");
  redirect(`/admin/vendors/${id}?done=created`);
}

export async function setVendorStatusAction(formData: FormData) {
  await requireAdmin();
  const status = z.enum(STATUSES).parse(formData.get("status"));
  await data.setVendorStatus(str(formData, "vendorId"), status as VendorStatus);
  revalidatePath("/admin", "layout");
}

const Note = z.object({ vendorId: z.string().min(1), kind: z.enum(NOTE_KINDS), body: z.string().trim().min(1, "Write the note first.").max(4000) });

export async function addNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const p = parse(Note, formData);
  if (!p.ok) return p.state;
  await data.addVendorNote(p.data.vendorId, p.data.kind, p.data.body, user.fullName ?? user.email);
  revalidatePath(`/admin/vendors/${p.data.vendorId}`);
  return { ok: true, message: "Note added." };
}

const Contact = z.object({ vendorId: z.string().min(1), name: z.string().trim().min(1, "Enter their name.").max(120), email: z.email("Enter a valid email address."), phone: z.string().trim().max(40) });

export async function addContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(Contact, formData);
  if (!p.ok) return p.state;
  const added = await data.addContact(p.data.vendorId, { ...p.data, phone: p.data.phone || undefined });
  if (!added) return { ok: false, values: values(formData), errors: { email: "That email is already a contact for this vendor." } };
  revalidatePath(`/admin/vendors/${p.data.vendorId}`);
  return { ok: true, message: `${p.data.name} added. Send them an invite when you're ready.` };
}

export async function inviteContactAction(formData: FormData) {
  await requireAdmin();
  const vendorId = str(formData, "vendorId");
  await data.inviteContact(vendorId, str(formData, "contactId"));
  revalidatePath("/admin", "layout");
  redirect(`/admin/vendors/${vendorId}?done=invited`);
}

export async function publishProfileAction(formData: FormData) {
  await requireAdmin();
  const vendorId = str(formData, "vendorId");
  await data.publishProfile(vendorId);
  revalidatePath("/admin", "layout");
  revalidatePath("/vendors");
  redirect(`/admin/vendors/${vendorId}?done=published`);
}

// ---- Applications -----------------------------------------------------------------------------

export async function decideApplicationAction(formData: FormData) {
  const user = await requireAdmin();
  const approve = formData.get("decision") === "approve";
  const app = await data.decideApplication(str(formData, "applicationId"), approve, user.fullName ?? user.email);
  revalidatePath("/admin", "layout");
  redirect(approve ? `/admin/vendors/${app.vendorId}?done=approved` : `/admin/applications?done=declined`);
}

// ---- Markets, dates and rosters -------------------------------------------------------------------

const NewMarket = z.object({ name: z.string().trim().min(1, "Name the market.").max(80), kind: z.enum(MARKET_KINDS) });

export async function createMarketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(NewMarket, formData);
  if (!p.ok) return p.state;
  const id = await data.createMarket(p.data);
  revalidatePath("/admin", "layout");
  redirect(`/admin/markets/${id}?done=market`);
}

const NewDates = z
  .object({ marketId: z.string().min(1), date: isoDate, until: z.union([z.literal(""), isoDate]) })
  .refine((d) => !d.until || d.until >= d.date, { path: ["until"], message: "Repeat until must be on or after the first date." });

export async function addDatesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(NewDates, formData);
  const l = parse(Logistics, formData);
  if (!p.ok || !l.ok) {
    const states = [p, l].flatMap((x) => (x.ok ? [] : [x.state]));
    return { ok: false, values: values(formData), message: "Check the highlighted fields.", errors: Object.assign({}, ...states.map((x) => x.errors)) };
  }
  const { marketId, date, until } = p.data;
  const n = await data.addDates(marketId, date, until || undefined, logisticsFields(l.data));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  return n ? { ok: true, message: `Added ${n} ${n === 1 ? "date" : "dates"}. Vendors already in this market are invited to them.` } : { ok: false, values: values(formData), message: "Those dates are already on the schedule." };
}

export async function inviteToMarketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const marketId = str(formData, "marketId");
  const ids = formData.getAll("vendorIds").map(String);
  if (!ids.length) return { ok: false, errors: { vendorIds: "Choose at least one vendor." } };
  const n = await data.inviteToMarket(marketId, ids, todayISO());
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  return { ok: true, message: `Invited ${n} ${n === 1 ? "vendor" : "vendors"} to every upcoming date.${noEmailNote()}` };
}

export async function setStallAction(formData: FormData) {
  await requireAdmin();
  await data.setStall(str(formData, "dateId"), str(formData, "vendorId"), str(formData, "stall").trim().slice(0, 12));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

export async function setDateStatusAction(formData: FormData) {
  await requireAdmin();
  const status = z.enum(["scheduled", "cancelled", "moved"]).parse(formData.get("status"));
  const dateId = str(formData, "dateId");
  await data.setDateStatus(dateId, status);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect(`${str(formData, "back")}?done=${status === "cancelled" ? "cancelled" : "status"}`);
}

export async function remindAction(formData: FormData) {
  await requireAdmin();
  const n = await data.remindNonResponders(str(formData, "dateId"));
  redirect(`${str(formData, "back")}?done=reminded&n=${n}`);
}

// ---- Updates --------------------------------------------------------------------------------------

const NewUpdate = z
  .object({
    title: z.string().trim().min(1, "Give the update a title.").max(140),
    body: z.string().trim().min(1, "Write the update.").max(20000),
    audience: z.string().min(1, "Choose who gets this."),
    vendorIds: z.preprocess(list, z.array(z.string())),
    pinned: z.preprocess((v) => v === "on", z.boolean()),
    email: z.preprocess((v) => v === "on", z.boolean()),
  })
  .refine((d) => d.audience !== "vendors" || d.vendorIds.length > 0, { path: ["vendorIds"], message: "Choose at least one vendor." });

export async function createUpdateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(NewUpdate, formData);
  if (!p.ok) return p.state;
  const { audience: a, vendorIds, ...rest } = p.data;
  const audience: Audience = a === "all" ? { kind: "all" } : a === "vendors" ? { kind: "vendors", vendorIds } : { kind: "market", marketId: a.replace(/^market:/, "") };
  const email = rest.email && canEmail();
  const n = await data.createUpdate({ ...rest, email, audience });
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect(`/admin/updates?done=${email ? "emailed" : "posted"}&n=${n}`);
}

export async function pinUpdateAction(formData: FormData) {
  await requireAdmin();
  await data.setUpdatePinned(str(formData, "updateId"), formData.get("pinned") === "true");
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

export async function deleteUpdateAction(formData: FormData) {
  await requireAdmin();
  await data.deleteUpdate(str(formData, "updateId"));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/updates?done=deleted");
}

// ---- Guides and assets ----------------------------------------------------------------------------

const Guide = z.object({ id: z.string(), title: z.string().trim().min(1, "Give the guide a title.").max(140), marketId: z.string(), body: z.string().trim().min(1, "Write the guide.").max(20000) });

export async function saveGuideAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(Guide, formData);
  if (!p.ok) return p.state;
  await data.saveGuide({ ...p.data, marketId: p.data.marketId || null });
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/guides?done=saved");
}

export async function deleteGuideAction(formData: FormData) {
  await requireAdmin();
  await data.deleteGuide(str(formData, "guideId"));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/guides?done=deleted");
}

export async function addAssetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(AssetInput, formData);
  const upload = checkUpload(formData.get("file"));
  if (!p.ok || "error" in upload) {
    const state = p.ok ? { ok: false, values: values(formData), message: "Check the highlighted fields." } : p.state;
    return { ...state, errors: { ...state.errors, ...("error" in upload ? { file: upload.error } : {}) } };
  }
  const markets = await data.listAllMarkets();
  await data.addAsset({ ...p.data, market: markets.find((m) => m.id === p.data.marketId) ?? null, ...(await fileToAsset(upload.file)) });
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/assets?done=uploaded");
}

export async function deleteAssetAction(formData: FormData) {
  await requireAdmin();
  await data.deleteAsset(str(formData, "assetId"));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  redirect("/admin/assets?done=deleted");
}

// ---- Event partners and shared planning -----------------------------------------------------------

const Partner = z.object({
  marketId: z.string().min(1),
  name: z.string().trim().min(1, "Enter their name.").max(120),
  email: z.email("Enter a valid email address."),
  organisation: z.string().trim().min(1, "Enter their organisation, e.g. The Argo.").max(120),
});

export async function addPartnerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(Partner, formData);
  if (!p.ok) return p.state;
  const { marketId, ...partner } = p.data;
  const added = await data.addMarketPartner(marketId, partner);
  if (!added) return { ok: false, values: values(formData), errors: { email: "That email is already a partner for this market." } };
  revalidatePath(`/admin/markets/${marketId}`);
  return { ok: true, message: `${partner.name} added. Send them an invite when you're ready.` };
}

export async function invitePartnerAction(formData: FormData) {
  await requireAdmin();
  const marketId = str(formData, "marketId");
  await data.invitePartner(marketId, str(formData, "partnerId"));
  revalidatePath(`/admin/markets/${marketId}`);
  redirect(`/admin/markets/${marketId}?done=invited`);
}

export async function removePartnerAction(formData: FormData) {
  await requireAdmin();
  const marketId = str(formData, "marketId");
  await data.removeMarketPartner(marketId, str(formData, "partnerId"));
  revalidatePath(`/admin/markets/${marketId}`);
  redirect(`/admin/markets/${marketId}?done=deleted`);
}

function revalidatePlanning(marketId: string) {
  revalidatePath(`/admin/markets/${marketId}`);
  revalidatePath("/admin");
  revalidatePath(`/partner/${marketId}`, "layout");
}

export async function addTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = parse(Task, formData);
  if (!p.ok) return p.state;
  const { marketId, dueDate, notes, ...t } = p.data;
  await data.addTask(marketId, { ...t, dueDate: dueDate || undefined, notes: notes || undefined });
  revalidatePlanning(marketId);
  return { ok: true, message: "Task added." };
}

export async function toggleTaskAction(formData: FormData) {
  const user = await requireAdmin();
  const marketId = str(formData, "marketId");
  await data.setTaskDone(marketId, str(formData, "taskId"), formData.get("done") === "true", user.fullName ?? user.email);
  revalidatePlanning(marketId);
}

export async function deleteTaskAction(formData: FormData) {
  await requireAdmin();
  const marketId = str(formData, "marketId");
  await data.deleteTask(marketId, str(formData, "taskId"));
  revalidatePlanning(marketId);
}


export async function addEventNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const p = parse(EventNoteInput, formData);
  if (!p.ok) return p.state;
  await data.addEventNote(p.data.marketId, { body: p.data.body, authorName: user.fullName ?? user.email });
  revalidatePlanning(p.data.marketId);
  return { ok: true, message: "Note posted." };
}

export async function saveDateLogisticsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const marketId = str(formData, "marketId");
  const p = parse(Logistics, formData);
  if (!p.ok) return p.state;
  await data.updateDateLogistics(marketId, str(formData, "dateId"), logisticsFields(p.data));
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  revalidatePath(`/partner/${marketId}`, "layout");
  return { ok: true, message: "Saved. Vendors see the new details on this date's page." };
}
