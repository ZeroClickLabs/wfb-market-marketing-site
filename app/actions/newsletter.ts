"use server";

// Subscribes an email address to the Market Letter on beehiiv.
// Runs on the server only, so the API key never reaches the browser.
//
// Needs two environment variables (see .env.example), set in Vercel for production:
//   BEEHIIV_API_KEY         an API key with the subscriptions:write scope
//   BEEHIIV_PUBLICATION_ID  the publication's ID, starting "pub_"
// Without them the forms say plainly that sign-up isn't open yet, and nothing is sent.
//
// API: https://developers.beehiiv.com/api-reference/subscriptions/create

import { site } from "@/content/site";
import { SIGNUP_SOURCES, type SubscribeState } from "@/lib/newsletter";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  const source = SIGNUP_SOURCES.find((s) => s === formData.get("source")) ?? "market-letter";

  // Honeypot: people never see or fill this field; bots usually do. Pretend it worked.
  if (String(formData.get("company") ?? "")) {
    return { status: "subscribed", message: "Thanks! You're on the list." };
  }

  if (!email) return { status: "error", message: "Enter your email address.", email };
  if (!EMAIL.test(email) || email.length > 254) {
    return { status: "error", message: "Enter an email address like name@example.com.", email };
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    return {
      status: "unavailable",
      message: `Online sign-up isn't switched on yet, so nothing was sent. Email ${site.email} and we'll add you to the list.`,
      email,
    };
  }

  let res: Response;
  try {
    res = await fetch(`https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        // Respect anyone who unsubscribed before: signing up again from the site doesn't override that.
        reactivate_existing: false,
        // Sends beehiiv's welcome email, if one is set up for the publication.
        send_welcome_email: true,
        utm_source: "website",
        utm_medium: "signup-form",
        utm_campaign: source,
        referring_site: site.url,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { status: "error", message: "We couldn't reach our mailing list just now. Please try again in a minute.", email };
  }

  if (res.status === 429) {
    return { status: "error", message: "Lots of people are signing up right now. Please try again in a minute.", email };
  }
  if (res.status === 400) {
    return { status: "error", message: "That email address didn't work. Check it and try again.", email };
  }
  if (!res.ok) {
    // Log the status only: never the address or the key.
    console.error(`beehiiv subscribe failed: HTTP ${res.status}`);
    return { status: "error", message: `Something went wrong on our side. Please try again, or email ${site.email}.`, email };
  }

  const body = (await res.json().catch(() => null)) as { data?: { status?: string } } | null;
  const subStatus = body?.data?.status;
  if (subStatus === "invalid") {
    return { status: "error", message: "That email address doesn't look deliverable. Check it and try again.", email };
  }
  if (subStatus === "pending") {
    // Double opt-in is on: beehiiv has sent a confirmation email.
    return { status: "confirm", message: "Almost there: check your inbox and confirm your subscription." };
  }
  return { status: "subscribed", message: "Thanks! You're on the list. Watch your inbox for the Market Letter." };
}
