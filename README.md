# AGNI'26 — Nostalgia

Official website for AGNI'26, the cultural fest of CEG, Anna University.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + framer-motion**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000   (add ?skip to fast-forward the loader)
```

| Script          | What it does                  |
| --------------- | ----------------------------- |
| `npm run dev`   | Start the dev server          |
| `npm run build` | Production build + type-check |
| `npm start`     | Serve the production build    |
| `npm run lint`  | Lint with ESLint              |

## Project structure

```
src/
  app/            # layout, the home page, globals.css (tokens + stylesheet), fonts
  components/     # layout/ (Loader, Navbar, Rail, …) · home/ (one per section, art/ = SVG stages)
  data/           # Site content: copy & links, the five event scenes, gallery, team
  lib/            # engine (scroll/parallax), loader, canvas fx, audio, seeded art data, scene controllers
  types/          # Shared TypeScript types
public/images/    # hero/ gallery/ branding/ team/ events/ sponsors/ agenda/
```

## Updating content

Most changes need no component edits:

- **Copy, dates, links, nav** → `src/data/site.ts`
- **The five "Why AGNI" scenes** → `src/data/highlights.ts`
- **Gallery frames** → `src/data/gallery.ts` (photos in `public/images/gallery/`)
- **Team / credits** → `src/data/team.ts` (photo in `public/images/team/`)
- **Hero artwork** → `public/images/hero/` (see `CLAUDE.md` → "Hero art")

Theme colors and fonts are defined once in `src/app/globals.css` (`@theme`) and used as Tailwind classes such as
`bg-ink`, `text-gold` and `font-display`.
