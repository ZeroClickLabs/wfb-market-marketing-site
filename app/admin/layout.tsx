import type { Metadata } from "next";

// The admin area is private: never indexed, never cached.
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
