import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Supabase client with the SECRET key: it bypasses row-level security. Server code only, and only
 * for jobs that genuinely need it: inviting users, saving public "Apply to sell" submissions,
 * scheduled reminders, and the fixed set of vendor columns event partners see on their rosters. Never import this from a Client Component.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") throw new Error("createAdminClient() must only run on the server.");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) throw new Error("SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL must be set.");
  return createClient<Database>(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
