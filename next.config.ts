import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // On Cloudflare (OpenNext) there is no image-optimization binding configured, so every
    // `/_next/image` request ran the Worker only to return the original file. Serving images
    // directly as static assets is free and never invokes the Worker (no CPU, no request quota).
    // The source images in /public were pre-compressed instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bahs.edu.bd",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
