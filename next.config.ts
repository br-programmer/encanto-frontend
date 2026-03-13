import type { NextConfig } from "next";

const cdnHostname = process.env.NEXT_PUBLIC_CDN_HOSTNAME;

const remotePatterns = [
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "picsum.photos" },
  { protocol: "https" as const, hostname: "**.cdninstagram.com" },
  { protocol: "https" as const, hostname: "**.fbcdn.net" },
];

if (cdnHostname) {
  remotePatterns.unshift({ protocol: "https" as const, hostname: cdnHostname });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encanto-storage-dev.nyc3.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Instagram CDN
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
