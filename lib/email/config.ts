import { isPortalDemo } from "@/lib/portal/demo";

// Whether portal email (invites, updates, reminders) actually goes out. Off until the Resend sender is
// built and RESEND_API_KEY / PORTAL_EMAIL_FROM are set; until then the portal records invites and
// reminders and says plainly that no email was sent.
export function emailEnabled() {
  return false;
}

/** Whether an action may say it emailed: always in the preview (it's pretend), otherwise only when email is on. */
export function canEmail() {
  return emailEnabled() || isPortalDemo();
}
