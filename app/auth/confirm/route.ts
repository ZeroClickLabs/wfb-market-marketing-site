import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";

// Where login and invite emails land. The email templates (docs/vendor-portal-setup.md) link here
// with a token_hash, which works even if the email is opened in a different browser.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  const supabase = await createClient();
  const ok = tokenHash && type
    ? !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error
    : code
      ? !(await supabase.auth.exchangeCodeForSession(code)).error
      : false;

  return NextResponse.redirect(new URL(ok ? next : `/login?error=link&next=${encodeURIComponent(next)}`, url.origin));
}
