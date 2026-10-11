import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/` so Cloudflare Pages can host it without a server.
  output: "export",
};

export default nextConfig;
