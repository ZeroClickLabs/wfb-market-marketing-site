import { requirePartner } from "@/lib/auth";
import { getPartnerRoster } from "@/lib/portal/data";
import { fmtDateTime } from "@/components/portal/ui";

const STATUS = { confirmed: "Confirmed", invited: "No reply", declined: "Can't make it" } as const;

// Quote every cell, and defuse spreadsheet formulas (cells starting with = + - @).
const cell = (v: string | undefined) => `"${(v ?? "").replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;

export async function GET(_req: Request, ctx: RouteContext<"/partner/[marketId]/dates/[dateId]/roster.csv">) {
  const { marketId, dateId } = await ctx.params;
  await requirePartner(marketId);
  const roster = await getPartnerRoster(marketId, dateId);
  if (!roster) return new Response("Not found", { status: 404 });
  const lines = [
    ["Vendor", "Reply", "Stall", "Note", "Contact", "Email", "Phone", "Replied at"].map(cell).join(","),
    ...roster.rows.map((r) => {
      const c = r.contacts[0];
      return [r.vendorName, STATUS[r.status], r.stall, r.note, c?.name, c?.email, c?.phone, r.respondedAt && fmtDateTime(r.respondedAt)].map(cell).join(",");
    }),
  ];
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vendors-${roster.date.date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
