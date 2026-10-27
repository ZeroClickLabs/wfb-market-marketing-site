import { createAdminClient } from "@/lib/supabase/admin";
import { emailEnabled } from "@/lib/email/config";
import { sendReminders } from "@/lib/email/notify";
import { todayISO } from "@/content/format";

// Daily (vercel.json): email vendors who haven't replied for a market date three days away.
// Vercel Cron sends "Authorization: Bearer $CRON_SECRET"; anything else is refused.

const DAYS_AHEAD = 3;
const NOT_AGAIN_WITHIN_HOURS = 48;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  if (!emailEnabled()) return Response.json({ skipped: "email isn't set up" });

  const today = todayISO();
  const target = new Date(Date.parse(`${today}T12:00:00Z`) + DAYS_AHEAD * 864e5).toISOString().slice(0, 10);
  const since = new Date(Date.now() - NOT_AGAIN_WITHIN_HOURS * 36e5).toISOString();
  const db = createAdminClient();

  const { data: dates, error } = await db.from("market_dates").select("*, markets!inner(name)").eq("date", target).eq("status", "scheduled");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const d of dates ?? []) {
    const { data: due, error: dueError } = await db
      .from("participation")
      .select("vendor_id")
      .eq("market_date_id", d.id)
      .eq("status", "invited")
      .or(`reminded_at.is.null,reminded_at.lt.${since}`);
    if (dueError) return Response.json({ error: dueError.message }, { status: 500 });
    const vendorIds = (due ?? []).map((p) => p.vendor_id);
    if (!vendorIds.length) continue;
    const sent = await sendReminders(
      { id: d.id, date: d.date, market: { name: (d.markets as { name: string }).name }, opensAt: (d.opens_at ?? "").slice(0, 5), closesAt: (d.closes_at ?? "").slice(0, 5), loadInAt: (d.load_in_at ?? "").slice(0, 5), location: d.location ?? "" },
      vendorIds,
    );
    await db.from("participation").update({ reminded_at: new Date().toISOString() }).eq("market_date_id", d.id).in("vendor_id", vendorIds);
    results.push({ date: d.date, vendors: vendorIds.length, emails: sent });
  }
  return Response.json({ date: target, results });
}
