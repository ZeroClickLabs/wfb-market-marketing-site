import type { MetadataRoute } from "next";
import { argoPath } from "@/content/argo";
import { events } from "@/content/events";
import { markets } from "@/content/markets";
import { site } from "@/content/site";
import { vendors } from "@/content/vendors";

const PAGES = ["", argoPath, "/visit", "/vendors", "/events", "/food-access", "/get-involved", "/get-involved/volunteer", "/get-involved/sell", "/get-involved/sponsor", "/contact", "/privacy", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${site.url}${p}` })),
    // Listed only while the Night Market is in content/markets.ts.
    ...(markets.some((m) => m.id === "night") ? [{ url: `${site.url}/events/night-market` }] : []),
    ...vendors.map((v) => ({ url: `${site.url}/vendors/${v.slug}` })),
    ...events.filter((e) => !e.href).map((e) => ({ url: `${site.url}/events/${e.slug}` })),
  ];
}
