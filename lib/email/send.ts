import { Resend } from "resend";
import { emailEnabled } from "./config";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends emails through Resend, in batches of up to 100 (Resend's batch limit). Returns how many went
 * out; throws if Resend refuses a batch. Does nothing when email isn't enabled.
 */
export async function sendEmails(emails: Email[]): Promise<number> {
  if (!emailEnabled() || emails.length === 0) return 0;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.PORTAL_EMAIL_FROM!;
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100).map((e) => ({ from, to: [e.to], subject: e.subject, html: e.html, text: e.text }));
    const { error } = chunk.length === 1 ? await resend.emails.send(chunk[0]) : await resend.batch.send(chunk);
    if (error) throw new Error(`Email couldn't be sent: ${error.message}`);
    sent += chunk.length;
  }
  return sent;
}
