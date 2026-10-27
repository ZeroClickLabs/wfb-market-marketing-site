import type { Metadata } from "next";

// The vendor portal is private: never indexed, never cached.
export const metadata: Metadata = { title: "Vendor portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return children;
}
