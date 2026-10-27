// Supabase settings for the vendor portal (see .env.example).
// The publishable key is safe in the browser; RLS decides what it can read.
// The secret key bypasses RLS and is read only in server-only modules (lib/supabase/admin.ts).

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until the Supabase env vars are set, so the public site still builds and runs without them. */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
