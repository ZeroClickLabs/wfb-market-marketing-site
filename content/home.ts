import type { CircleTileProps, EventCardProps, VendorCardProps } from "@/components/wfb";

// PLACEHOLDER: every vendor, town, date and location below is sample content from the
// brand kit's reference home page. Replace it with real content before launch.

export const announcement = {
  label: "This Saturday",
  text: "Sweet corn is in — and the Night Market is back July 25.",
  href: "/vendors",
  linkText: "See who's coming",
};

export const featuredVendors: VendorCardProps[] = [
  { name: "Lakeview Acres", category: "produce", illustration: "tomato", description: "Heirloom tomatoes, sweet peppers and whatever the August heat brings in.", stall: 14, from: "Cedarburg, WI", acceptsSnap: true, href: "/vendors/lakeview-acres" },
  { name: "North Shore Bread Co.", category: "bakery", illustration: "bread", description: "Naturally leavened sourdough, rye and cardamom buns baked the night before.", stall: 3, from: "Shorewood, WI", href: "/vendors/north-shore-bread-co" },
  { name: "Two Creeks Orchard", category: "produce", illustration: "apple", description: "Early Zestar and Honeycrisp apples, cider and apple butter.", stall: 22, from: "Two Rivers, WI", acceptsSnap: true, href: "/vendors/two-creeks-orchard" },
  { name: "Bluff Top Flowers", category: "flowers", illustration: "sunflower", description: "Market bunches cut Friday night: zinnias, dahlias and sunflowers.", stall: 9, from: "Mequon, WI", href: "/vendors/bluff-top-flowers" },
];

export const vendorCount = 42;

export const explore: CircleTileProps[] = [
  { label: "Food access", illustration: "carrots", tone: "kale-tint", note: "We match SNAP/EBT dollars up to $20 every week.", href: "/food-access" },
  { label: "Night Market", illustration: "sweet-corn", tone: "corn", note: "Music, food trucks and the lake at dusk.", href: "/events/night-market" },
  { label: "Volunteer", illustration: "sunflower", tone: "bay-tint", note: "Two hours on a Saturday keeps the market running.", href: "/get-involved/volunteer" },
  { label: "Sell with us", illustration: "bread", tone: "heirloom-tint", note: "Applications for 2027 open in January.", href: "/get-involved/sell" },
];

export const events: Array<EventCardProps & { rainOrShine?: boolean }> = [
  { date: "2026-06-06", market: "summer", title: "Opening day", time: "8 am–1 pm", location: "By the lake", rainOrShine: true, href: "/events/opening-day" },
  { date: "2026-07-25", market: "night", title: "Night Market & music", time: "5–9 pm", location: "Downtown", href: "/events/night-market" },
  { date: "2026-10-17", market: "popup", title: "Harvest Pop-Up", time: "10 am–2 pm", location: "The village green", href: "/events/harvest-pop-up" },
  { date: "2026-12-12", market: "winter", title: "Holiday Market", time: "9 am–1 pm", location: "Indoors", href: "/events/holiday-market" },
];
