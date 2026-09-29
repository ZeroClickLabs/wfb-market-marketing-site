import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // A short link for posters and social posts.
      { source: "/argo", destination: "/christmas-at-the-argo", permanent: false },
      // The event has its own landing page instead of the generic event page.
      { source: "/events/christmas-at-the-argo", destination: "/christmas-at-the-argo", permanent: true },
    ];
  },
};

export default nextConfig;
