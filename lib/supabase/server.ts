import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers. Create one per request.
 * It acts as the signed-in user, so row-level security applies to everything it reads or writes.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        // Server Components can't set cookies; the proxy (proxy.ts) keeps the session fresh instead.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
