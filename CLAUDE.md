@AGENTS.md

# AGNI'26 website

Cultural fest site for CEG (Student Association and Arts Society). Theme: **NOSTALGIA** — a one-page, cinematic
walk through a memory: a loader that is a burning match, a parallax maple-tree hero, then one illustrated, interactive
scene per event (cassette, bioscope, CRT console, lamp & drums, fashion runway), a ticket, a tee, a film reel, credits.
Migrated 1:1 from a hand-written static HTML/CSS/JS build onto the stack below; flow and design are unchanged.

## Stack
Next.js 16 (App Router, `src/` dir) · React 19 · TypeScript (strict) · Tailwind CSS v4 · framer-motion · lucide-react · npm.
Plus `lenis` for smooth scrolling (the one thing the stack has no equivalent for). Import alias `@/*` → `src/*`.

## Commands
- `npm run dev` — dev server on :3000 (`?skip` on the URL fast-forwards the loader)
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only (run `npx next typegen` first on a fresh clone)

## Layout
- `src/app/` — `layout.tsx` (fonts, metadata, global chrome: Loader · FilmLayer · Navbar · Rail), `page.tsx` (the home page),
  `globals.css` (tokens + the whole stylesheet), `fonts.ts` + `fonts/` (self-hosted woff2 through `next/font/local`).
- `src/components/layout/` — Loader, Navbar, Rail, FilmLayer (grain / vignette / flash / cursor), Footer.
- `src/components/home/` — one component per section: Hero, About, HighlightScene (the five "Why AGNI" scenes), Register,
  Merch, Gallery, Team, Contact; `SceneEngine.tsx` starts the engine; `art/` holds the SVG stages (one per scene).
- `src/data/` — **content lives here**, typed: `site.ts` (copy, dates, links, nav, rail), `highlights.ts` (the five scenes),
  `gallery.ts` (film-reel frames), `team.ts` (credits; photos in `public/images/team/`).
- `src/lib/` — `engine.ts` (scroll + parallax + scene visibility + particle fields), `loader.ts` (the match), `fx.ts` (canvas
  effects, cursor, tilt), `audio.ts` (synthesised sound, no files), `art.ts` (seeded art data), `scene-store.ts` (engine ⇄ React
  bridge), `scenes/` (one controller per interactive scene), `utils.ts` (`cn`, `formatUrl`, `groupBy`, `clamp`, `lerp`).
- `public/images/` — `hero/` (the three parallax planes + poster + sheen mask), `gallery/`, `branding/`, `team/`, and the
  empty `events/ sponsors/ agenda/`. Kebab-case filenames, no spaces.

## How the page works
- Sections are **server components** (static markup). Only Loader, Navbar, Rail and `SceneEngine` are client components.
- The engine reads the DOM: `[data-scene]` marks a pinned section (`data-fx` / `data-fw` frame its art on narrow screens),
  `[data-depth]` marks a parallax plane inside it (`data-bleed`, `data-zoom`, `data-origin`). Art is drawn in a 1600×900
  "stage" that is scaled with `--k`.
- Scene behaviour is in `src/lib/scenes/*.ts`; each controller looks up its elements by id (`#cassette`, `#crankwheel`,
  `#lamp`, `#tee`, …) and exposes `tick / enter / leave / destroy`. Keep those ids when editing the art.
- Anything that twinkles (bulbs, stars, lighters) is a `<canvas data-lights="…">`; its points come from `lib/art.ts`.
- Reveal-on-scroll: elements with class `rv` fade in when their scene gets `.is-in` (set by the engine).

## Conventions
- Server components by default; add `"use client"` only for state/effects/DOM access.
- Use `next/image` for photographs and plain `<a href="#id">` for in-page anchors (the engine scrolls them; `next/link`
  would fight it). In Next 16 use `preload`, not `priority`, on `<Image>`. Hero planes use `quality={90}` (see `next.config.ts`).
- Styling: tokens are in `globals.css` `@theme` (`ink, cream, amber, gold, ember, …`, `font-display`, `font-sans`, …). The
  cinematic stylesheet sits in the `components` layer of that one file — no per-page CSS files. New simple UI should use
  Tailwind utilities.
- SVG text and canvas text must use the theme font variables (`var(--font-display)` …) because next/font hashes family names.
- Never read `window` / `document` at module scope in `src/lib/*` — those modules are imported during SSR.
- Content changes go in `src/data/`, not in components.

## Hero art
`public/images/hero/`: `hero-bg.jpeg` (campus at sunset), `hero-tree.png` (maple, transparent), `hero-logo.png` (AGNI'26
logo, transparent). The tree keeps its aspect rooted bottom-left (`.tree-fit`); the logo sits in `.logo-box` (a % box over
the 1600×900 stage). `hero-logo-mask.png` is the logo's silhouette (used for the light sweep) and `hero-poster.jpg` is the
flattened hero (social image, bioscope film, gallery/polaroid crops). When the hero art changes, regenerate both from the
three plane images, and re-measure the sun position used by `.sun` / `.godrays` in `globals.css`.

## Not built here
The reference skeleton also had `/events`, `/schedule`, `/sponsors`, `/merch` pages and `Sponsor / FestEvent / ScheduleDay`
types; this project is the home page only, so they are not included. "Learn more / Register / Merch" buttons link to the
live site (`site.eventsUrl`, `site.merchUrl`).
