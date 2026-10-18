import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site: `next build` writes plain HTML/JS/CSS to ./out, served by Cloudflare (wrangler.jsonc).
  output: "export",
  // No image optimisation server on a static host: next/image serves the files in public/ as they are.
  images: { unoptimized: true },
};

export default nextConfig;
