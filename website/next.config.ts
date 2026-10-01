import type { NextConfig } from "next";

const immutable = "public, max-age=31536000, immutable";
const longLived = "public, max-age=2592000, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // Fonts never change name; media/photos may be replaced in place.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: longLived }] },
      { source: "/company/:path*", headers: [{ key: "Cache-Control", value: longLived }] },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
