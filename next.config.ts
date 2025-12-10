import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      "tanstack.com",
      "nextjs.org",
      "www.example.com",
      "favicons.githubusercontent.com",
      "icons.duckduckgo.com",
    ],
  },
};

export default nextConfig;
