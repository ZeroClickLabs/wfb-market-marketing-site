import type { Metadata } from "next";
import { League_Gothic, Playfair_Display, Public_Sans, Yellowtail } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

// Self-hosted Google Fonts (display: swap). tokens.css names the families; globals.css
// points the --font-* tokens at these so the fallbacks from tokens.json still apply.
const display = League_Gothic({ subsets: ["latin"], variable: "--font-league-gothic", display: "swap" });
const script = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", display: "swap" });
// Christmas at The Argo's display face, matching the serif in the event logo. Not preloaded: only the holiday pages use it.
const argoDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-argo-display", display: "swap", preload: false });
const sans = Public_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], style: ["normal", "italic"], variable: "--font-public-sans", display: "swap" });

// Every page re-renders daily, so date-driven content (announcements, events, the holiday feature) updates on its own.
export const revalidate = 86400;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Whitefish Bay Farmers Market · Saturdays by the lake",
    template: "%s · Whitefish Bay Farmers Market",
  },
  description:
    "A farmers market by the lake in Whitefish Bay, opening summer 2027. Coming soon: Christmas at The Argo, Sunday, December 13.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${display.variable} ${script.variable} ${sans.variable} ${argoDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
