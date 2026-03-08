import type { NextConfig } from "next";

const cdnHostname = process.env.NEXT_PUBLIC_CDN_HOSTNAME;

const remotePatterns = [
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "picsum.photos" },
];

if (cdnHostname) {
  remotePatterns.unshift({ protocol: "https" as const, hostname: cdnHostname });
}

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: { root: process.cwd() },
  images: { remotePatterns },
};

export default nextConfig;
