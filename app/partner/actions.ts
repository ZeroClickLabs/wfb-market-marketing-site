"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePartner } from "@/lib/auth";
import * as data from "@/lib/portal/data";
import { canEmail } from "@/lib/email/config";
import { AssetInput, EventNoteInput, Logistics, Task, checkUpload, fileToAsset, logisticsFields, parse, str, values } from "@/lib/portal/forms";
import type { ActionState } from "@/app/portal/actions";

// Event partner changes. Each action checks the signed-in user co-manages the market named in the
// form before doing anything; the data functions also refuse rows from any other market.

async function partnerOf(marketId: string) {
  const { user, marketIds } = await requirePartner();
  if (!marketIds.includes(marketId)) throw new Error("You don't co-manage this market.");
  const record = await data.getPartnerFor(marketId, user.email);
  return { user, org: record?.organisation, name: record?.name || user.fullName || user.email };
}

function revalidateMarket(marketId: string) {
  revalidatePath(`/partner/${marketId}`, "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

export async function setPartnerStallAction(formData: FormData) {
  const marketId = str(formData, "marketId");
  await partnerOf(marketId);
  await data.setMarketStall(marketId, str(formData, "dateId"), str(formData, "vendorId"), str(formData, "stall").trim().slice(0, 12));
  revalidateMarket(marketId);
}

export async function saveLogisticsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const marketId = str(formData, "marketId");
  const dateId = str(formData, "dateId");
  await partnerOf(marketId);
  const p = parse(Logistics, formData);
  if (!p.ok) return p.state;
  await data.updateDateLogistics(marketId, dateId, logisticsFields(p.data));
  revalidateMarket(marketId);
  return { ok: true, message: "Saved. Vendors see the new details on this date's page." };
}

const PartnerUpdate = z.object({
  marketId: z.string().min(1),
  title: z.string().trim().min(1, "Give the update a title.").max(140),
  body: z.string().trim().min(1, "Write the update.").max(20000),
  email: z.preprocess((v) => v === "on", z.boolean()),
});

export async function postPartnerUpdateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const marketId = str(formData, "marketId");
  const { org } = await partnerOf(marketId);
  const p = parse(PartnerUpdate, formData);
  if (!p.ok) return p.state;
  const email = p.data.email && canEmail();
  const n = await data.createUpdate({ title: p.data.title, body: p.data.body, email, pinned: false, audience: { kind: "market", marketId }, authorOrg: org });
  revalidateMarket(marketId);
  redirect(`/partner/${marketId}/updates?done=${email ? "emailed" : "posted"}&n=${n}`);
}

export async function addPartnerAssetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const marketId = str(formData, "marketId");
  await partnerOf(marketId);
  const p = parse(AssetInput, formData);
  const upload = checkUpload(formData.get("file"));
  if (!p.ok || "error" in upload) {
    const state = p.ok ? { ok: false, values: values(formData), message: "Check the highlighted fields." } : p.state;
    return { ...state, errors: { ...state.errors, ...("error" in upload ? { file: upload.error } : {}) } };
  }
  const market = await data.getMarketById(marketId);
  await data.addAsset({ ...p.data, market, ...(await fileToAsset(upload.file)) });
  revalidateMarket(marketId);
  redirect(`/partner/${marketId}/files?done=uploaded`);
}

export async function deletePartnerAssetAction(formData: FormData) {
  const marketId = str(formData, "marketId");
  await partnerOf(marketId);
  await data.deleteMarketAsset(marketId, str(formData, "assetId"));
  revalidateMarket(marketId);
  redirect(`/partner/${marketId}/files?done=deleted`);
}

export async function addPartnerTaskAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const p = parse(Task, formData);
  if (!p.ok) return p.state;
  const { marketId, dueDate, notes, ...t } = p.data;
  await partnerOf(marketId);
  await data.addTask(marketId, { ...t, dueDate: dueDate || undefined, notes: notes || undefined });
  revalidateMarket(marketId);
  return { ok: true, message: "Task added." };
}

export async function togglePartnerTaskAction(formData: FormData) {
  const marketId = str(formData, "marketId");
  const { name } = await partnerOf(marketId);
  await data.setTaskDone(marketId, str(formData, "taskId"), formData.get("done") === "true", name);
  revalidateMarket(marketId);
}

export async function deletePartnerTaskAction(formData: FormData) {
  const marketId = str(formData, "marketId");
  await partnerOf(marketId);
  await data.deleteTask(marketId, str(formData, "taskId"));
  revalidateMarket(marketId);
}

export async function addPartnerNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const p = parse(EventNoteInput, formData);
  if (!p.ok) return p.state;
  const { name, org } = await partnerOf(p.data.marketId);
  await data.addEventNote(p.data.marketId, { body: p.data.body, authorName: name, authorOrg: org });
  revalidateMarket(p.data.marketId);
  return { ok: true, message: "Note posted." };
}
