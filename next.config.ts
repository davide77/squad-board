import type { NextConfig } from "next";

// Sent with every page. The app loads nothing from other sites, so it can refuse to be
// framed, refuse to guess file types and ask for no device features. Vercel adds HSTS.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

// The clips, posters and logos in public/ keep their names when they change, so they are not
// immutable. A browser keeps them a day and may show the old one for up to a month while it
// fetches the new, which saves a round trip on every repeat visit.
const MEDIA_CACHE = "public, max-age=86400, stale-while-revalidate=2592000";
const MEDIA_PATHS = ["/film/:path*", "/story/:path*", "/brand/:path*"];

const nextConfig: NextConfig = {
  // No need to tell every visitor what the site is built with.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      ...MEDIA_PATHS.map((source) => ({ source, headers: [{ key: "Cache-Control", value: MEDIA_CACHE }] })),
    ];
  },
};

export default nextConfig;
