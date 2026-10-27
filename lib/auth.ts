import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEMO_ADMIN_USER, DEMO_PARTNER_USER, DEMO_VENDOR_USER, demoStore, isPortalDemo } from "@/lib/portal/demo";

export type Role = "admin" | "vendor" | "partner";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  fullName: string | null;
}

/**
 * The signed-in user and their role, or null. The role comes from public.profiles (set by the
 * database, never by the user), read through row-level security as that user.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Development preview: a sample vendor, so the portal can be reviewed before Supabase exists.
  if (isPortalDemo()) return DEMO_VENDOR_USER;
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: profile } = await supabase.from("profiles").select("role, full_name, email").eq("user_id", userId).maybeSingle();
  if (!profile) return null;
  return { id: userId, email: profile.email ?? String(data.claims.email ?? ""), role: profile.role as Role, fullName: profile.full_name };
}

/** For admin pages and actions: anyone else is sent away. */
export async function requireAdmin(): Promise<CurrentUser> {
  // Development preview: a sample admin, so both sides can be reviewed.
  if (isPortalDemo()) return DEMO_ADMIN_USER;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect(user.role === "partner" ? "/partner" : "/portal");
  return user;
}

/** For vendor portal pages and actions. Admins are sent to the admin area. */
export async function requireVendor(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/portal");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "partner") redirect("/partner");
  return user;
}

/** The area each role lands in. */
export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/portal";
}

/**
 * For event partner pages and actions: the user and the markets they co-manage. Admins pass too
 * (with every market), so the Market can see exactly what a partner sees. With a marketId, anyone
 * who doesn't co-manage it gets a 404, which doesn't reveal that the market exists.
 */
export async function requirePartner(marketId?: string): Promise<{ user: CurrentUser; marketIds: string[] }> {
  let user: CurrentUser;
  let marketIds: string[];
  if (isPortalDemo()) {
    // Development preview: the sample partner.
    user = DEMO_PARTNER_USER;
    marketIds = demoStore().partners.filter((p) => p.email === user.email).map((p) => p.marketId);
  } else {
    const current = await getCurrentUser();
    if (!current) redirect("/login?next=/partner");
    if (current.role === "vendor") redirect("/portal");
    user = current;
    const supabase = await createClient();
    if (user.role === "admin") {
      const { data } = await supabase.from("markets").select("id");
      marketIds = (data ?? []).map((m) => m.id as string);
    } else {
      const { data } = await supabase.from("market_partners").select("market_id").eq("user_id", user.id);
      marketIds = (data ?? []).map((m) => m.market_id as string);
    }
  }
  if (marketId !== undefined && !marketIds.includes(marketId)) notFound();
  return { user, marketIds };
}

/** Only allow redirects back into the portal, partner area or admin, never to another site. */
export function safeNext(next: string | null | undefined, fallback = "/portal") {
  return next && /^\/(portal|admin|partner)(\/|$|\?)/.test(next) ? next : fallback;
}
