import type { NextConfig } from "next";

const longCache = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: false,
  },
  compress: true,
  async headers() {
    return [
      { source: "/scroll-frames/:path*", headers: longCache },
      { source: "/assets/:path*", headers: longCache },
      { source: "/ctine-video.mp4", headers: longCache },
      { source: "/ctine-logo.svg", headers: longCache },
    ];
  },
};

export default nextConfig;
