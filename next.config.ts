import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gc.lumejs.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
