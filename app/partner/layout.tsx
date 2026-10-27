import type { Metadata } from "next";

// The event partner area is private: never indexed, never cached.
export const metadata: Metadata = { title: "Event partner", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PartnerLayout({ children }: LayoutProps<"/partner">) {
  return children;
}
