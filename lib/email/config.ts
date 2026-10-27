import { isPortalDemo } from "@/lib/portal/demo";

// Portal email (invites, updates, reminders) goes out through Resend when RESEND_API_KEY and
// PORTAL_EMAIL_FROM are set. The sample-data preview never sends.
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.PORTAL_EMAIL_FROM) && !isPortalDemo();
}

/** Whether an action may say it emailed: always in the preview (it's pretend), otherwise only when email is on. */
export function canEmail() {
  return emailEnabled() || isPortalDemo();
}

/** The site's address, for links in emails. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://wfbmarkets.org").replace(/\/$/, "");
}
