"use server";

import { revalidatePath } from "next/cache";
import * as data from "@/lib/portal/data";
import { isPortalDemo } from "@/lib/portal/demo";
import { sendApplicationEmails } from "@/lib/email/notify";
import { Application, MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES, UPLOAD_ID, fieldErrors, photoFolder, stepOf, type Answers } from "@/lib/apply/schema";

// The public vendor application at /apply. Anyone can call these, so they check everything they're
// given. Photos go from the browser straight to Storage with one-time links from preparePhotoUpload,
// so they never pass through these actions (which accept 1 MB at most).

/** Bots fill the hidden field, and nobody gets through five steps this quickly. */
const MIN_SECONDS = 8;

const isPhoto = (f: { name: string; type: string }) => PHOTO_TYPES.includes(f.type) || (!f.type && /\.(heic|heif)$/i.test(f.name));

export type PhotoTicket = { uploadId: string; uploads: { path: string; token: string }[] } | { error: string };

export async function preparePhotoUpload(input: { uploadId: string | null; files: { name: string; size: number; type: string }[]; company: string }): Promise<PhotoTicket> {
  if (input.company) return { error: "That photo didn't upload. Try again." };
  if (isPortalDemo()) return { error: "Photo uploads need Supabase, so they're off in the preview. Add an Instagram handle or website instead." };
  const files = input.files.slice(0, MAX_PHOTOS);
  if (!files.length) return { error: "Choose a photo." };
  if (files.some((f) => !isPhoto(f))) return { error: "Photos need to be JPG, PNG, WebP or HEIC." };
  if (files.some((f) => f.size > MAX_PHOTO_BYTES)) return { error: "Each photo can be up to 10 MB." };
  const uploadId = input.uploadId && UPLOAD_ID.test(input.uploadId) ? input.uploadId : crypto.randomUUID();
  try {
    const uploads = await Promise.all(files.map((f) => data.startApplicationPhotoUpload(uploadId, String(f.name).slice(-120))));
    return { uploadId, uploads };
  } catch (e) {
    console.error("Application photo upload link failed:", e instanceof Error ? e.message : e);
    return { error: "We couldn't start the upload. Try again, or add your Instagram or website instead." };
  }
}

export type SubmitResult = { ok: true } | { ok: false; message: string; errors: Record<string, string>; step: number };

export async function submitApplication(input: { answers: Answers; uploadId: string | null; startedAt: number; company: string }): Promise<SubmitResult> {
  // Pretend it worked, so bots learn nothing.
  if (input.company || Date.now() - Number(input.startedAt) < MIN_SECONDS * 1000) return { ok: true };

  const parsed = Application.safeParse(input.answers);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { ok: false, message: "Some answers need another look.", errors, step: Math.min(...Object.keys(errors).map(stepOf)) };
  }
  const a = parsed.data;
  const uploadId = input.uploadId && UPLOAD_ID.test(input.uploadId) ? input.uploadId : null;
  a.photos = uploadId ? a.photos.filter((p) => p.startsWith(photoFolder(uploadId)) && !p.slice(photoFolder(uploadId).length).includes("/")) : [];

  let id: string;
  try {
    id = await data.submitApplication(a, uploadId);
  } catch (e) {
    console.error("Saving an application failed:", e instanceof Error ? e.message : e);
    return { ok: false, message: "Something went wrong on our side and your application wasn't sent. Please try again in a minute.", errors: {}, step: 4 };
  }
  revalidatePath("/admin", "layout");

  // The application is saved either way; a failed email is only logged (without addresses).
  try {
    await sendApplicationEmails({ id, business: a.business, name: a.name, email: a.email, town: a.town, category: a.category, markets: a.markets });
  } catch (e) {
    console.error("Application emails failed:", e instanceof Error ? e.message : e);
  }
  return { ok: true };
}
