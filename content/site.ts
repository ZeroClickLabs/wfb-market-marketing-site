import type { IconName } from "@/components/wfb/Icon";

// Site-wide facts and navigation.
// PLACEHOLDER: the email address and social links are samples from the brand kit.
// Get the real ones from the Market before launch.
export const site = {
  name: "Whitefish Bay Farmers Market",
  status: "Open Saturdays 8 am–1 pm · Rain or shine",
  email: "hello@example.org",
  social: { instagram: "#", facebook: "#" },
  nav: [
    { label: "Visit", href: "/visit" },
    { label: "Vendors", href: "/vendors" },
    { label: "Events", href: "/events" },
    { label: "Food access", href: "/food-access" },
    { label: "Get involved", href: "/get-involved" },
  ],
  headerCta: { label: "Get directions", href: "/visit#map", icon: "map-pin" as IconName },
  footerExplore: [
    { label: "Vendors", href: "/vendors" },
    { label: "Events & markets", href: "/events" },
    { label: "Food access & SNAP", href: "/food-access" },
    { label: "Volunteer", href: "/get-involved/volunteer" },
    { label: "Sponsor the Market", href: "/get-involved/sponsor" },
  ],
};
