// Google Analytics 4 helpers. Safe to call anywhere on the client: they do nothing when analytics
// isn't loaded (local development, no measurement ID, or a visitor with Global Privacy Control on).

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagParams) => void;
  }
}

/** The GA4 measurement ID, if one is set and well-formed ("G-" then letters and digits). */
export function gaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && /^G-[A-Z0-9]+$/.test(id) ? id : undefined;
}

/** Sends a GA4 event, e.g. track("sign_up", { method: "newsletter" }). */
export function track(name: string, params?: GtagParams) {
  if (typeof window !== "undefined") window.gtag?.("event", name, params);
}
