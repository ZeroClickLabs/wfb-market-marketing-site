import { z } from "zod";
import { CATEGORY_LABELS } from "@/components/wfb/Status";

// The vendor application at /apply. The browser checks each step with these schemas before moving on,
// and the server checks the whole application again with `Application` before saving it.

export const APPLY_CATEGORIES = Object.values(CATEGORY_LABELS);
export const STALL_SIZES = ["10 × 10 ft", "10 × 20 ft", "I'd like to share a stall"] as const;
export const YEARS_SELLING = ["Just starting out", "Less than a year", "1 to 3 years", "More than 3 years"] as const;

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Where an application's photos go in the private bucket; the id is made by the server. */
export const photoFolder = (uploadId: string) => `applications/${uploadId}/`;
export const UPLOAD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const required = (message: string, max: number) => z.string().trim().min(1, message).max(max, "That's a bit long. Shorten it a little.");
const optional = (max: number) => z.string().trim().max(max, "That's a bit long. Shorten it a little.");
const yesNo = z.enum(["yes", "no"], { error: "Choose yes or no." });

/** "@farm", "instagram.com/farm" or a full profile link, kept as just the handle. */
export function instagramHandle(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");
}

/** "farm.com" or "https://farm.com", kept as a full link. */
export function websiteUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function isWebsite(v: string) {
  if (!v) return true;
  try {
    const u = new URL(v);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const you = z.object({
  name: required("Enter your name.", 120),
  email: z.string().trim().min(1, "Enter your email address.").max(254).pipe(z.email("Enter an email address like name@example.com.")),
  phone: optional(40),
});

const business = z.object({
  business: required("Enter your business name. Your own name is fine if you don't have one.", 140),
  town: required("Enter the town where you grow or make your products.", 120),
  category: z.enum(APPLY_CATEGORIES as [string, ...string[]], { error: "Choose what you mainly sell." }),
  products: required("Tell us a little about what you sell.", 3000),
});

const workShape = z.object({
  instagram: optional(120).transform(instagramHandle).refine((v) => !v || /^[A-Za-z0-9._]{1,30}$/.test(v), "Enter your Instagram handle, like @lakeviewacres."),
  website: optional(300).transform(websiteUrl).refine(isWebsite, "Enter a web address, like lakeviewacres.com."),
  photos: z.array(z.string()).max(MAX_PHOTOS),
});
const SHOW_US = "Add a photo, your Instagram or a website so we can see your work.";
const showsWork = (d: { instagram: string; website: string; photos: string[] }) => Boolean(d.instagram || d.website || d.photos.length);

const stall = z.object({
  needsPower: yesNo,
  needsVehicle: yesNo,
  stallSize: z.enum(STALL_SIZES, { error: "Choose a stall size." }),
  otherMarkets: optional(1000),
  yearsSelling: z.enum(YEARS_SELLING, { error: "Choose how long you've been selling." }),
});

/** The last step only shows the answers back; nothing new is asked. */
const review = z.object({});

/** One schema per step, in order. A step's errors are keyed by field name; "work" is the show-us rule. */
export const STEPS = [
  { key: "you", title: "About you", schema: you },
  { key: "business", title: "Your business", schema: business },
  { key: "work", title: "Show us your work", schema: workShape.refine(showsWork, { message: SHOW_US, path: ["work"] }) },
  { key: "stall", title: "Your stall", schema: stall },
  { key: "review", title: "Check and send", schema: review },
] as const;

export const Application = you.extend(business.shape).extend(workShape.shape).extend(stall.shape).extend(review.shape).refine(showsWork, { message: SHOW_US, path: ["work"] });
export type ApplicationInput = z.input<typeof Application>;
export type ApplicationData = z.output<typeof Application>;

/** The form's answers before they're checked. */
export interface Answers {
  name: string;
  email: string;
  phone: string;
  business: string;
  town: string;
  category: string;
  products: string;
  instagram: string;
  website: string;
  photos: string[];
  needsPower: string;
  needsVehicle: string;
  stallSize: string;
  otherMarkets: string;
  yearsSelling: string;
}

export const EMPTY_ANSWERS: Answers = {
  name: "", email: "", phone: "", business: "", town: "", category: "", products: "", instagram: "", website: "", photos: [],
  needsPower: "", needsVehicle: "", stallSize: "", otherMarkets: "", yearsSelling: "",
};

/** Field errors from a failed check: the first message for each field. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}

/** Which step a field belongs to, so the server can send someone back to the right place. */
export function stepOf(field: string) {
  const i = field === "work" ? STEPS.findIndex((s) => s.key === "work") : STEPS.findIndex((s) => field in s.schema.shape);
  return i === -1 ? STEPS.length - 1 : i;
}
