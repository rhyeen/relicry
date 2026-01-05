import type { NextConfig } from "next";

const SECOND = 60;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const nextConfig: NextConfig = {
  // @NOTE: These are to tell Firebase App Hosting to set proper caching headers.
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  cacheComponents: true,
  cacheLife: {
    noChange: {
      stale: 1 * DAY,
      revalidate: 1 * HOUR,
      expire: 3 * DAY,
    },
    unlikelyChange: {
      stale: 6 * HOUR,
      revalidate: 15 * MINUTE,
      expire: 12 * HOUR,
    },
    expectedChangeLowConsequenceIfStale: {
      stale: 15 * MINUTE,
      revalidate: 5 * MINUTE,
      expire: 1 * HOUR,
    },
  },
};

export default nextConfig;
