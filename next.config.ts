import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero planes are served at quality 90 (the default allow-list is [75]).
    qualities: [75, 90],
  },
};

export default nextConfig;
