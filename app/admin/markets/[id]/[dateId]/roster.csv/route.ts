import { requireAdmin } from "@/lib/auth";
import { getRoster } from "@/lib/portal/data";
import { fmtDateTime } from "@/components/portal/ui";

const STATUS = { confirmed: "Confirmed", invited: "No reply", declined: "Can't make it" } as const;

// Quote every cell, and defuse spreadsheet formulas (cells starting with = + - @).
const cell = (v: string | undefined) => `"${(v ?? "").replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;

export async function GET(_req: Request, ctx: RouteContext<"/admin/markets/[id]/[dateId]/roster.csv">) {
  await requireAdmin();
  const { id, dateId } = await ctx.params;
  const roster = await getRoster(dateId);
  if (!roster || roster.date.market.id !== id) return new Response("Not found", { status: 404 });
  const lines = [
    ["Vendor", "Reply", "Stall", "Note", "Replied at"].map(cell).join(","),
    ...roster.rows.map((r) => [r.vendorName, STATUS[r.status], r.stall, r.note, r.respondedAt && fmtDateTime(r.respondedAt)].map(cell).join(",")),
  ];
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="roster-${roster.date.date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
