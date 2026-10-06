// Shared between the subscribe Server Action (app/actions/newsletter.ts) and the forms that call it.

/** Where a sign-up came from. Sent to beehiiv as utm_campaign so subscribers can be segmented. */
export type SignupSource = "market-letter" | "christmas-at-the-argo";
export const SIGNUP_SOURCES: SignupSource[] = ["market-letter", "christmas-at-the-argo"];

export interface SubscribeState {
  status: "idle" | "subscribed" | "confirm" | "error" | "unavailable";
  message: string;
  /** The address as entered, so the field keeps it after an error. */
  email?: string;
}

export const initialSubscribeState: SubscribeState = { status: "idle", message: "" };
