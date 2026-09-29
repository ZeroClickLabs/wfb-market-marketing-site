import type { CircleTileProps, IllustrationName, Tone, VendorCardProps } from "@/components/wfb";
import type { Vendor } from "./types";

export function vendorCardProps(v: Vendor): VendorCardProps {
  return { name: v.name, categories: v.categories, illustration: v.illustration, description: v.description, stall: v.stall, from: v.from, acceptsSnap: v.snap, href: `/vendors/${v.slug}` };
}

/** What the Summer Market will carry. Categories only: no vendor is named until they're confirmed. */
export const whatYoullFind: Array<{ label: string; illustration: IllustrationName; tone: Tone; note: string }> = [
  { label: "Produce", illustration: "tomato", tone: "kale-tint", note: "Vegetables and fruit picked the day before." },
  { label: "Bakery", illustration: "bread", tone: "corn-tint", note: "Bread, pastries and treats from local ovens." },
  { label: "Orchard", illustration: "apple", tone: "heirloom-tint", note: "Apples, cider and preserves in season." },
  { label: "Flowers", illustration: "sunflower", tone: "beet-tint", note: "Market bunches and plants for the garden." },
  { label: "Sweet corn", illustration: "sweet-corn", tone: "corn-tint", note: "The taste of a Wisconsin August." },
  { label: "Roots & greens", illustration: "carrots", tone: "bay-tint", note: "Carrots, greens and whatever the season brings." },
];

export const explore: CircleTileProps[] = [
  { label: "Holiday market", illustration: "apple", tone: "heirloom-tint", note: "Christmas at The Argo, Sunday, December 13.", href: "/christmas-at-the-argo" },
  { label: "Food access", illustration: "carrots", tone: "kale-tint", note: "We plan to match SNAP/EBT dollars at the Summer Market.", href: "/food-access" },
  { label: "Volunteer", illustration: "sunflower", tone: "bay-tint", note: "Help run Christmas at The Argo, then the Summer Market.", href: "/get-involved/volunteer" },
  { label: "Sell with us", illustration: "bread", tone: "corn", note: "Applications for the 2027 Summer Market open in January.", href: "/get-involved/sell" },
];
