import type { Metadata } from "next";
import { League_Gothic, Public_Sans, Yellowtail } from "next/font/google";
import "./globals.css";

// Self-hosted Google Fonts (display: swap). tokens.css names the families; globals.css
// points the --font-* tokens at these so the fallbacks from tokens.json still apply.
const display = League_Gothic({ subsets: ["latin"], variable: "--font-league-gothic", display: "swap" });
const script = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", display: "swap" });
const sans = Public_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], style: ["normal", "italic"], variable: "--font-public-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Whitefish Bay Farmers Market · Saturdays by the lake",
    template: "%s · Whitefish Bay Farmers Market",
  },
  description:
    "Forty-plus local growers, bakers and makers, live music and a lake breeze. Every Saturday, June through September · 8 am–1 pm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
