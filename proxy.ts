import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { isPortalDemo } from "@/lib/portal/demo";

// Runs before the vendor portal, partner and admin pages (see the matcher below; the public site is untouched).
// It refreshes the Supabase session cookie, and sends anyone who isn't signed in to /login.
// This is the first gate only: every page and action checks the user's role again on the server,
// and row-level security enforces it a third time in the database.

const PROTECTED = ["/portal", "/admin", "/partner"];

export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED.some((p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`));

  // Development preview with sample data (never in production): no session to check.
  if (isPortalDemo()) return NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    // Portal not set up yet: keep protected pages unreachable rather than half-working.
    return isProtected ? NextResponse.redirect(new URL("/login", request.url)) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        // Hand refreshed tokens to Server Components (request) and to the browser (response),
        // with the cache headers that stop a CDN caching anyone's session.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims() verifies the JWT; never trust getSession() here.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  if (isProtected && !signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    // Carry any cookie changes (e.g. a cleared session) and cache headers over to the redirect.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set("Cache-Control", response.headers.get("Cache-Control") ?? "private, no-store");
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/partner/:path*", "/login", "/auth/:path*"],
};
