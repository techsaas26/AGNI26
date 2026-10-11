import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/` so Cloudflare Pages can host it without a server.
  output: "export",
  // No image optimization server on a static host; serve files from /public as-is.
  images: { unoptimized: true },
};

export default nextConfig;
