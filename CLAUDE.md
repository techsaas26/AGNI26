@AGENTS.md

# AGNI'26 website

Cultural fest site for CEG (Student Association and Arts Society). Theme: **NOSTALGIA** (retro, cassette/VHS, sepia).
Successor to `techsaas26/AGNI25` (React + Vite + plain CSS); same pages, rebuilt on the stack below.

## Stack
Next.js 16 (App Router, `src/` dir) · React 19 · TypeScript (strict) · Tailwind CSS v4 · lucide-react · @google/model-viewer · npm.
Import alias `@/*` → `src/*`.

**`merch` branch:** stripped to a single merch page and built as a static export (`output: "export"` in `next.config.ts` → `out/`).
Deployed on Cloudflare Pages: build `npm run build`, output dir `out`, Node pinned by `.node-version`. Server-only features (route handlers, `next/image` optimization, dynamic server functions) won't work here.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build` — static export to `out/` (also type-checks); preview with `npx serve out`
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only

## Layout (merch branch)
- `src/app/page.tsx` — the only route: 3D T-shirt viewer + Buy Now. `not-found.tsx` → `404.html`. `layout.tsx` loads fonts and sets metadata (no navbar/footer).
- `src/components/merch/TshirtViewer.tsx` — client `<model-viewer>` wrapper (matte material, vertical angle locked so only front/back show).
- `src/data/merch.ts` — name, tagline, model path, `orderFormUrl` (Google Form). `src/data/site.ts` — name/theme/description for metadata.
- `public/models/tshirt.glb` — the 3D model; `public/images/branding/` — logo/favicon.

## Conventions
- Server components by default; add `"use client"` only for state/effects (TshirtViewer).
- Use `next/link` for internal links. If adding `next/image`, set `images: { unoptimized: true }` (static export); in Next 16 use `preload`, not `priority`.
- Style with Tailwind utilities only; no per-page CSS files. Theme tokens are in `src/app/globals.css` `@theme`:
  colors `paper, ink, sepia, cassette, mustard, vhs, night`; fonts `font-sans` (Poppins), `font-display` (VT323 pixel).
