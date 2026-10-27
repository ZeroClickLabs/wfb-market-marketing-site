"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor } from "@/lib/auth";
import { respond, setEmailUpdates, updateProfile } from "@/lib/portal/data";

export interface ActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** What was submitted, so a form shows it again after an error (React resets forms after an action). */
  values?: Record<string, string | string[]>;
}

/** Confirm or decline one or more market dates (ids comma-separated), with an optional note. */
export async function respondAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireVendor();
  const status = formData.get("status");
  if (status !== "confirmed" && status !== "declined") return { ok: false, message: "Choose confirm or can't make it." };
  const ids = String(formData.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return { ok: false, message: "No dates selected." };
  const note = formData.has("note") ? String(formData.get("note") ?? "").trim().slice(0, 500) : undefined;
  await respond(ids, status, note);
  revalidatePath("/portal", "layout");
  const n = ids.length;
  return {
    ok: true,
    message: status === "confirmed" ? `Thanks! You're confirmed for ${n === 1 ? "this date" : `${n} dates`}.` : `Got it. We've noted you can't make ${n === 1 ? "this date" : `${n} dates`}.`,
  };
}

const Profile = z.object({
  name: z.string().trim().min(1, "Enter your business name.").max(120),
  town: z.string().trim().max(80),
  description: z.string().trim().max(400, "Keep the description under 400 characters."),
  products: z.string().max(2000),
  website: z.union([z.literal(""), z.url("Enter a full web address, like https://example.com.")]),
  instagram: z.string().trim().max(60),
  phone: z.string().trim().max(40),
});

export async function profileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireVendor();
  const values = Object.fromEntries(Object.keys(Profile.shape).map((k) => [k, String(formData.get(k) ?? "")]));
  const parsed = Profile.safeParse({ ...values, website: values.website.trim() });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, errors, values, message: "Check the highlighted fields." };
  }
  const { products, ...rest } = parsed.data;
  await updateProfile({ ...rest, products: products.split("\n").map((p) => p.trim()).filter(Boolean).slice(0, 20) });
  revalidatePath("/portal", "layout");
  return { ok: true, message: "Saved. We'll review your changes before they appear on the website." };
}

export async function emailPrefAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireVendor();
  const on = formData.get("emailUpdates") === "on";
  await setEmailUpdates(on);
  revalidatePath("/portal/profile");
  return { ok: true, message: on ? "You'll get an email when we post an update." : "You won't get update emails. Invites and attendance reminders still come by email." };
}
