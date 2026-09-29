import type { MetadataRoute } from "next";
import { argoPath } from "@/content/argo";
import { events } from "@/content/events";
import { site } from "@/content/site";
import { vendors } from "@/content/vendors";

const PAGES = ["", argoPath, "/visit", "/vendors", "/events", "/events/night-market", "/food-access", "/get-involved", "/get-involved/volunteer", "/get-involved/sell", "/get-involved/sponsor", "/contact", "/privacy", "/accessibility"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${site.url}${p}` })),
    ...vendors.map((v) => ({ url: `${site.url}/vendors/${v.slug}` })),
    ...events.filter((e) => !e.href).map((e) => ({ url: `${site.url}/events/${e.slug}` })),
  ];
}
