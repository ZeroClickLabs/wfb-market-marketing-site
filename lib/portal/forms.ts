// Form helpers shared by the admin and event partner Server Actions: reading FormData, validating it
// with zod into the shape AdminForm shows (errors per field, typed values kept), and shared schemas.

import { z } from "zod";
import type { ActionState } from "@/app/portal/actions";
import type { PortalAsset } from "./types";

export const time = z.string().regex(/^\d{2}:\d{2}$/, "Enter a time.");
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date.");

export function values(formData: FormData) {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$") || key === "intent") continue;
    const all = formData.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return out;
}

/** Validate a form against a schema; on failure, the form's errors (and what was typed) to send back. */
export function parse<T extends z.ZodType>(schema: T, formData: FormData): { ok: true; data: z.infer<T> } | { ok: false; state: ActionState } {
  const v = values(formData);
  const parsed = schema.safeParse(v);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
  return { ok: false, state: { ok: false, errors, values: v, message: "Check the highlighted fields." } };
}

export const list = (v: unknown) => (v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v]);
export const str = (formData: FormData, key: string) => String(formData.get(key) ?? "");

/** A date's logistics: what both the Market and event partners can edit. */
export const Logistics = z
  .object({
    opensAt: time,
    closesAt: time,
    loadInAt: time,
    teardownBy: time,
    location: z.string().trim().min(1, "Enter the location.").max(120),
    address: z.string().trim().max(200),
    contactName: z.string().trim().max(80),
    contactPhone: z.string().trim().max(40),
    vendorNotes: z.string().trim().max(4000),
  })
  .refine((d) => d.closesAt > d.opensAt, { path: ["closesAt"], message: "Closing time must be after opening time." });

/** Logistics form values as stored: empty optional fields left out, and a maps link from the address. */
export function logisticsFields(d: z.infer<typeof Logistics>) {
  return {
    opensAt: d.opensAt,
    closesAt: d.closesAt,
    loadInAt: d.loadInAt,
    teardownBy: d.teardownBy,
    location: d.location,
    address: d.address,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address || d.location)}`,
    contactName: d.contactName || undefined,
    contactPhone: d.contactPhone || undefined,
    vendorNotes: d.vendorNotes || undefined,
  };
}

export const Task = z.object({
  marketId: z.string().min(1),
  title: z.string().trim().min(1, "Describe the task.").max(200),
  owner: z.enum(["market", "partner"]),
  dueDate: z.union([z.literal(""), isoDate]),
  notes: z.string().trim().max(1000),
});

export const EventNoteInput = z.object({ marketId: z.string().min(1), body: z.string().trim().min(1, "Write the note first.").max(4000) });

export const ASSET_KINDS = ["logo", "social", "poster", "photo", "other"] as const;
export const AssetInput = z.object({ title: z.string().trim().min(1, "Give the file a title.").max(140), description: z.string().trim().max(400), kind: z.enum(ASSET_KINDS), marketId: z.string() });

const MAX_UPLOAD = 900 * 1024; // Server Actions accept 1 MB bodies by default.

/** Checks an uploaded file; returns an error message, or the file. */
export function checkUpload(file: FormDataEntryValue | null): { error: string } | { file: File } {
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file." };
  if (file.size > MAX_UPLOAD) return { error: "Files can be up to 900 KB in the preview." };
  return { file };
}

/** The stored form of an upload. The preview keeps it in memory; with Supabase it goes to the private bucket. */
export async function fileToAsset(f: File): Promise<Pick<PortalAsset, "url" | "fileName" | "sizeLabel">> {
  const url = `data:${f.type || "application/octet-stream"};base64,${Buffer.from(await f.arrayBuffer()).toString("base64")}`;
  const kb = Math.max(1, Math.round(f.size / 1024));
  return { url, fileName: f.name, sizeLabel: `${(f.name.split(".").pop() ?? "file").toUpperCase()} · ${kb} KB` };
}
