import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // The vendor portal, partner area, admin and login are private.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/admin", "/partner", "/login", "/auth"] }, sitemap: `${site.url}/sitemap.xml` };
}
