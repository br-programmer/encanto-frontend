import type { NextConfig } from "next";

const cdnHostname = process.env.NEXT_PUBLIC_CDN_HOSTNAME;

const remotePatterns = [
  ...(cdnHostname
    ? [{ protocol: "https" as const, hostname: cdnHostname }]
    : []),
  { protocol: "https" as const, hostname: "**.cdninstagram.com" },
  { protocol: "https" as const, hostname: "**.fbcdn.net" },
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "picsum.photos" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
