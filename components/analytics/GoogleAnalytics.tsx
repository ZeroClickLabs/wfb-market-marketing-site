"use client";

import Script from "next/script";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Google Analytics 4. Rendered by the root layout only in production builds with a measurement ID.
 *
 * - Google Signals and ad personalisation are off: visits are counted, nothing feeds Google's ads.
 * - Visitors whose browser sends Global Privacy Control get no analytics at all: the tag never loads.
 * - Page views, including in-app navigation, come from GA4's enhanced measurement (on by default).
 * - Clicks on calendar files (.ics) and Google Maps links are recorded as add_to_calendar and
 *   get_directions, wherever those links appear.
 */
export function GoogleAnalytics({ id }: { id: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, location.href);
      const label = link.textContent?.trim() || undefined;
      if (url.pathname.endsWith(".ics")) track("add_to_calendar", { link_url: url.pathname, link_text: label });
      else if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith("/maps")) track("get_directions", { link_text: label });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // One inline script: it sets up gtag and only then loads Google's tag, unless GPC is on.
  // `id` is validated as G-XXXXXXX by gaMeasurementId() before it reaches this component.
  return (
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        if (!navigator.globalPrivacyControl) {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(){ window.dataLayer.push(arguments); };
          gtag('js', new Date());
          gtag('config', '${id}', { allow_google_signals: false, allow_ad_personalization_signals: false });
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=${id}';
          document.head.appendChild(s);
        }
      `}
    </Script>
  );
}
