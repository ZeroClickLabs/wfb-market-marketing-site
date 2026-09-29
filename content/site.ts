import type { IconName } from "@/components/wfb/Icon";

export type SectionKey = "visit" | "vendors" | "events" | "food-access" | "get-involved";

// Site-wide facts and navigation.
// The Market hasn't opened yet: the first event is Christmas at The Argo (Dec 13, 2026) and
// the Summer Market opens in summer 2027. When it opens, update status, announcement,
// headerCta and footerVisit.
// PLACEHOLDER: the URL, email, mailing address and social links are samples.
// Get the real ones from the Market before launch.
export const site = {
  name: "Whitefish Bay Farmers Market",
  legalName: "Whitefish Bay Farmers Market Corp",
  url: "https://example.org",
  opening: "Summer 2027",
  /** Shows the green "open" dot in the utility bar. */
  inSeason: false,
  status: "Opening summer 2027 · Christmas at The Argo, Sunday, Dec 13",
  /** After this date the utility bar shows statusAfter instead. */
  statusUntil: "2026-12-13",
  statusAfter: "Opening summer 2027 · Saturdays by the lake",
  email: "hello@wfbmarkets.org",
  mailingAddress: ["Whitefish Bay Farmers Market Corp", "PO Box 000", "Whitefish Bay, WI 53217"],
  marketAddress: "Whitefish Bay, WI",
  social: { instagram: "#", facebook: "#" },
  announcement: {
    label: "Sunday, December 13",
    text: "Christmas at The Argo. Free admission.",
    href: "/christmas-at-the-argo",
    linkText: "Learn more",
    /** The bar hides itself after this date. */
    until: "2026-12-13",
  } as { label?: string; text: string; href?: string; linkText?: string; until?: string } | null,
  nav: [
    { key: "visit", label: "Visit", href: "/visit" },
    { key: "vendors", label: "Vendors", href: "/vendors" },
    { key: "events", label: "Events", href: "/events" },
    { key: "food-access", label: "Food access", href: "/food-access" },
    { key: "get-involved", label: "Get involved", href: "/get-involved" },
  ] as Array<{ key: SectionKey; label: string; href: string }>,
  /** "Get directions" in season, "Join the list" off-season (guidelines/20). */
  headerCta: { label: "Join the list", href: "#newsletter", icon: "mail" as IconName },
  utilityLinks: [
    { label: "Food access", href: "/food-access", icon: "card" as IconName },
    { label: "Upcoming events", href: "/events", icon: "calendar" as IconName },
  ],
  footerVisit: ["The Summer Market", "Coming summer 2027", "Whitefish Bay, Wisconsin"],
  footerExplore: [
    { label: "Christmas at The Argo", href: "/christmas-at-the-argo" },
    { label: "Events & markets", href: "/events" },
    { label: "Food access & SNAP", href: "/food-access" },
    { label: "Volunteer", href: "/get-involved/volunteer" },
    { label: "Sponsor the Market", href: "/get-involved/sponsor" },
  ],
  /** Online forms send nothing until a provider is connected. */
  formsEnabled: false,
};
