import type { ReactNode } from "react";
import { Logo } from "@/components/wfb";
import { SmartLink, cx } from "@/components/wfb/utils";
import { PortalNav } from "./PortalNav";
import { homeFor, type CurrentUser } from "@/lib/auth";
import { isPortalDemo } from "@/lib/portal/demo";

// The vendor portal and admin share this frame: the Market's lockup, a short nav and sign-out.
// No public announcement bar, newsletter or footer.

export interface PortalNavItem {
  label: string;
  href: string;
}

export function PortalFrame({ children, nav, user, current }: { children: ReactNode; nav?: PortalNavItem[]; user?: CurrentUser; current?: string }) {
  return (
    <div
      className={cx(
        "wfb min-h-screen bg-canvas font-sans text-ink",
        // Touch targets of at least 44px on phones and touch screens; the kit's small and link buttons are shorter.
        "max-tablet:[&_.wfb-btn-sm]:h-[44px] max-tablet:[&_.wfb-btn-link]:min-h-[44px] pointer-coarse:[&_.wfb-btn-sm]:h-[44px] pointer-coarse:[&_.wfb-btn-link]:min-h-[44px]",
      )}
    >
      {isPortalDemo() ? (
        <p className="m-0 border-b-2 border-ink bg-corn px-4 py-2 text-center font-sans text-[14px] leading-[20px] font-bold text-on-corn">
          Preview with sample data. Changes are kept only until the dev server restarts. See the{" "}
          {SIDES.filter((x) => x.role !== user?.role).map((x, i, all) => (
            <span key={x.role}>
              <SmartLink href={x.href} className="text-on-corn underline">{x.label}</SmartLink>
              {i < all.length - 2 ? ", " : i === all.length - 2 ? " or " : "."}
            </span>
          ))}
        </p>
      ) : null}
      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 max-phone:gap-x-3 max-tablet:px-4">
          <SmartLink href={user ? homeFor(user.role) : "/portal"} aria-label="Whitefish Bay Farmers Market vendor portal, home" className="mr-auto flex items-center gap-3 no-underline">
            <Logo variant="lockup" width={160} label="" />
            <span className="rounded-pill border-2 border-ink bg-corn px-2.5 max-tablet:hidden py-1 font-sans text-[11px] leading-none font-extrabold uppercase tracking-[.14em] text-on-corn">
              {user?.role === "admin" ? "Admin" : user?.role === "partner" ? "Partner" : "Vendors"}
            </span>
          </SmartLink>
          {nav?.length ? <PortalNav items={nav} current={current} ownRow={nav.length > 5} /> : null}
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="min-h-[44px] cursor-pointer rounded-pill border-2 border-ink bg-paper px-4 max-phone:px-3 font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink hover:bg-kraft">
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-content px-6 py-7 max-tablet:px-4 max-tablet:py-6">{children}</main>
    </div>
  );
}

// The preview's three sides, for switching between them.
const SIDES = [
  { role: "vendor", label: "vendor side", href: "/portal" },
  { role: "partner", label: "event partner side", href: "/partner" },
  { role: "admin", label: "admin side", href: "/admin" },
] as const;

export const VENDOR_NAV: PortalNavItem[] = [
  { label: "Home", href: "/portal" },
  { label: "Calendar", href: "/portal/calendar" },
  { label: "Updates", href: "/portal/updates" },
  { label: "Assets", href: "/portal/assets" },
  { label: "Profile", href: "/portal/profile" },
];

export const ADMIN_NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Vendors", href: "/admin/vendors" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Markets", href: "/admin/markets" },
  { label: "Updates", href: "/admin/updates" },
  { label: "Guides", href: "/admin/guides" },
  { label: "Assets", href: "/admin/assets" },
];

/** An event partner's nav, scoped to the event they're working on. */
export function partnerNav(marketId: string): PortalNavItem[] {
  const base = `/partner/${marketId}`;
  return [
    { label: "Overview", href: base },
    { label: "Dates", href: `${base}/dates` },
    { label: "Updates", href: `${base}/updates` },
    { label: "Files", href: `${base}/files` },
    { label: "Plan", href: `${base}/plan` },
  ];
}
