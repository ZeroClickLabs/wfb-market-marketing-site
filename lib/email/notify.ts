// The portal's outgoing emails, as the Server Actions and the reminder job send them.
// Each returns how many went out (0 when email is off) and throws if Resend refuses them.

import { excerpt } from "@/components/portal/Markdown";
import * as data from "@/lib/portal/data";
import { sendEmails } from "./send";
import { attendanceReminder, partnerInvite, updateNotice, vendorInvite } from "./templates";

const unique = <T extends { email: string }>(xs: T[]) => [...new Map(xs.map((x) => [x.email.toLowerCase(), x])).values()];

export async function sendVendorInvite(vendorId: string, contact: { email: string; name: string }) {
  const found = await data.getAdminVendor(vendorId);
  return sendEmails([vendorInvite(contact.email, contact.name, found?.vendor.name ?? "your business")]);
}

export async function sendPartnerInvite(partner: { email: string; name: string; organisation: string; marketId: string }) {
  const market = await data.getMarketById(partner.marketId);
  return sendEmails([partnerInvite(partner.email, partner.name, partner.organisation, market?.name ?? "your event")]);
}

/** Tells an update's recipients about it, except people who've turned off update emails. */
export async function sendUpdateNotices(u: { id: string; title: string; body: string; vendorIds: string[]; from?: string }) {
  const targets = unique(await data.emailTargets(u.vendorIds, "update"));
  return sendEmails(targets.map((t) => updateNotice(t.email, { id: u.id, title: u.title, excerpt: excerpt(u.body, 400), from: u.from })));
}

/** Reminds vendors who haven't replied for a date. */
export async function sendReminders(date: { id: string; date: string; market: { name: string }; opensAt: string; closesAt: string; loadInAt: string; location: string }, vendorIds: string[]) {
  const targets = unique(await data.emailTargets(vendorIds, "always"));
  return sendEmails(targets.map((t) => attendanceReminder(t.email, { id: date.id, date: date.date, marketName: date.market.name, opensAt: date.opensAt, closesAt: date.closesAt, loadInAt: date.loadInAt, location: date.location })));
}
