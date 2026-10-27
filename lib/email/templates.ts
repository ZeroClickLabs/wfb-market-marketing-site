import { formatDate, formatTime, formatTimeRange } from "@/content/format";
import { siteUrl } from "./config";
import type { Email } from "./send";

// Portal emails: short, facts first, one button. Email clients don't support CSS variables, so the
// brand colours from brand/tokens/tokens.css are written out here (light theme).
const C = { canvas: "#f4ecdc", paper: "#fbf7ef", ink: "#1a2226", muted: "#4a5459", bay: "#1c5169", corn: "#f0b43c" };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout({ heading, paragraphs, button, footer }: { heading: string; paragraphs: string[]; button: { label: string; href: string }; footer?: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;font:16px/1.55 Arial,Helvetica,sans-serif;color:${C.ink}">${p}</p>`).join("");
  return `<!doctype html><html><body style="margin:0;background:${C.canvas}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.paper};border:3px solid ${C.ink};border-radius:12px">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 6px;font:800 12px/1.2 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.bay}">Whitefish Bay Farmers Market</p>
<h1 style="margin:0 0 16px;font:800 24px/1.25 Arial,Helvetica,sans-serif;color:${C.ink}">${heading}</h1>
${body}
<p style="margin:22px 0 26px"><a href="${esc(button.href)}" style="display:inline-block;background:${C.bay};color:#fff;border:2px solid ${C.ink};border-radius:999px;padding:13px 24px;font:800 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none">${esc(button.label)}</a></p>
</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:2px dashed ${C.corn}"><p style="margin:0;font:13px/1.5 Arial,Helvetica,sans-serif;color:${C.muted}">${footer ?? "You're getting this because you work with the Whitefish Bay Farmers Market."}</p></td></tr>
</table></td></tr></table></body></html>`;
}

const loginLink = (email: string, next: string) => `${siteUrl()}/login?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;

/** A vendor contact's invitation to the portal. */
export function vendorInvite(to: string, name: string, business: string): Email {
  const href = loginLink(to, "/portal");
  const hi = name ? `Hi ${esc(name)},` : "Hello,";
  return {
    to,
    subject: "You're invited to the Whitefish Bay Farmers Market vendor portal",
    html: layout({
      heading: "You're invited to the vendor portal",
      paragraphs: [
        hi,
        `We've set up <strong>${esc(business)}</strong> in our vendor portal. It's where you'll confirm the dates you can make, find load-in and setup details, read updates from the Market, and keep your profile for our website up to date.`,
        "Log in with this email address. We'll send you a link and a code; there's no password.",
      ],
      button: { label: "Open the vendor portal", href },
    }),
    text: `${name ? `Hi ${name},` : "Hello,"}\n\nWe've set up ${business} in the Whitefish Bay Farmers Market vendor portal: confirm dates, find setup details, read updates and keep your profile up to date.\n\nLog in with this email address (no password): ${href}\n`,
  };
}

/** An event partner's invitation. */
export function partnerInvite(to: string, name: string, organisation: string, marketName: string): Email {
  const href = loginLink(to, "/partner");
  return {
    to,
    subject: `${marketName}: your planning access`,
    html: layout({
      heading: `Plan ${esc(marketName)} with us`,
      paragraphs: [
        `Hi ${esc(name)},`,
        `You now have access to <strong>${esc(marketName)}</strong> in the Whitefish Bay Farmers Market portal, for ${esc(organisation)}. You'll see the vendor line-up and their contacts, set stall numbers, keep the logistics up to date, write to vendors, and share a task list and notes with us.`,
        "Log in with this email address. We'll send you a link and a code; there's no password.",
      ],
      button: { label: "Open the event", href },
    }),
    text: `Hi ${name},\n\nYou now have access to ${marketName} in the Whitefish Bay Farmers Market portal, for ${organisation}: vendor line-up and contacts, stall numbers, logistics, updates to vendors, and shared tasks and notes.\n\nLog in with this email address (no password): ${href}\n`,
  };
}

/** A new update, as a short notice that links to the full text in the portal. */
export function updateNotice(to: string, u: { id: string; title: string; excerpt: string; from?: string }): Email {
  const href = `${siteUrl()}/portal/updates/${u.id}`;
  const from = u.from ? `From ${u.from}` : "From the Market";
  return {
    to,
    subject: u.title,
    html: layout({
      heading: esc(u.title),
      paragraphs: [`<span style="color:${C.muted};font-size:14px">${esc(from)}</span>`, esc(u.excerpt)],
      button: { label: "Read the update", href },
      footer: `You can turn off update emails in your <a href="${siteUrl()}/portal/profile" style="color:${C.bay}">vendor profile</a>. Invites and attendance reminders still come by email.`,
    }),
    text: `${u.title}\n${from}\n\n${u.excerpt}\n\nRead it in the portal: ${href}\n\nTurn off update emails in your profile: ${siteUrl()}/portal/profile\n`,
  };
}

/** A reminder to reply for a market date. */
export function attendanceReminder(to: string, d: { id: string; date: string; marketName: string; opensAt: string; closesAt: string; loadInAt: string; location: string }): Email {
  const href = `${siteUrl()}/portal/calendar/${d.id}`;
  const when = `${formatDate(d.date)} · ${formatTimeRange(d.opensAt, d.closesAt)}`;
  return {
    to,
    subject: `Can you make it? ${d.marketName}, ${formatDate(d.date)}`,
    html: layout({
      heading: "Can you make it?",
      paragraphs: [
        `<strong>${esc(d.marketName)}</strong><br>${esc(when)}<br>Load-in from ${esc(formatTime(d.loadInAt))} · ${esc(d.location)}`,
        "We haven't heard from you about this date yet. Let us know either way so we can plan the layout.",
      ],
      button: { label: "Reply in the portal", href },
    }),
    text: `Can you make it?\n\n${d.marketName}\n${when}\nLoad-in from ${formatTime(d.loadInAt)} · ${d.location}\n\nWe haven't heard from you about this date yet. Reply here: ${href}\n`,
  };
}
