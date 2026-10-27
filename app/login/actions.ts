"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth";

export interface LoginState {
  step: "email" | "code";
  email?: string;
  next?: string;
  message?: string;
  error?: string;
}

const Email = z.email().max(254);

/**
 * Step 1: email a login link and code. The portal is invite-only: a login is created only for
 * allowlisted admins, event partners and contacts already added to a vendor. Everyone gets the same reply, so the
 * form doesn't reveal who has access.
 */
export async function requestLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(formData.get("next") ?? ""));
  const parsed = Email.safeParse(raw);
  if (!parsed.success) return { step: "email", email: raw, next, error: "Enter an email address like name@example.com." };
  if (!isSupabaseConfigured()) return { step: "email", email: raw, next, error: "The vendor portal isn't set up yet." };

  const admin = createAdminClient();
  const [{ data: allowed }, { data: contact }, { data: partner }] = await Promise.all([
    admin.from("admin_allowlist").select("email").eq("email", raw).maybeSingle(),
    admin.from("vendor_contacts").select("id").ilike("email", raw).limit(1).maybeSingle(),
    admin.from("market_partners").select("id").ilike("email", raw).limit(1).maybeSingle(),
  ]);
  const mayCreate = Boolean(allowed || contact || partner);

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: raw,
    options: { shouldCreateUser: mayCreate, emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  // "Signups not allowed" means no access: reply exactly as if it worked.
  if (error && error.status !== 422 && error.code !== "otp_disabled" && error.code !== "signup_disabled") {
    console.error(`login email failed: ${error.code ?? error.status}`);
    if (error.status === 429) return { step: "email", email: raw, next, error: "Too many attempts. Wait a minute and try again." };
  }
  return { step: "code", email: raw, next, message: "If this email has access to the vendor portal, a login link and a 6-digit code are on their way." };
}

/** Step 2 (optional): type the 6-digit code instead of clicking the link, e.g. on another device. */
export async function verifyCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!/^\d{6,10}$/.test(token)) return { step: "code", email, next, error: "Enter the code from the email: just the digits." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, next, error: "That code didn't work or has expired. Check it, or send a new one." };
  redirect(next);
}
