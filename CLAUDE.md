@AGENTS.md

# AGNI'26 website

Cultural fest site for CEG (Student Association and Arts Society). Theme: **NOSTALGIA** (retro, cassette/VHS, sepia).
Successor to `techsaas26/AGNI25` (React + Vite + plain CSS); same pages, rebuilt on the stack below.

## Stack
Next.js 16 (App Router, `src/` dir) · React 19 · TypeScript (strict) · Tailwind CSS v4 · lucide-react · framer-motion · npm.
Import alias `@/*` → `src/*`.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only

## Layout
- `src/app/` — routes: `/` (page.tsx), `/events`, `/schedule`, `/sponsors`, `/merch`, `not-found.tsx`. `layout.tsx` wraps every page with Navbar + Footer, loads fonts, sets metadata.
- `src/components/{layout,home,events,schedule,sponsors,ui}/` — components grouped by the page that uses them; `ui/` is shared (Modal, PageHeader, ImagePlaceholder).
- `src/data/` — **all content lives here**, typed: `site.ts` (name, nav links, socials), `team.ts`, `events.ts`, `sponsors.ts`, `schedule.ts`. Edit data, not components, to change content.
- `src/types/index.ts` — `TeamMember`, `FestEvent`, `EventCategory`, `Sponsor`, `ScheduleDay`, `NavLink`.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatUrl()`, `groupBy()`.
- `public/images/{team,sponsors,events,agenda,branding}/` — static images. Use kebab-case filenames without spaces.

## Conventions
- Server components by default; add `"use client"` only for state/effects (Navbar, Modal, EventsExplorer, ScheduleGallery).
- Use `next/image` for images and `next/link` for internal links. In Next 16 use `preload`, not `priority`, on `<Image>`.
- Style with Tailwind utilities only; no per-page CSS files. Theme tokens are in `src/app/globals.css` `@theme`:
  colors `paper, ink, sepia, cassette, mustard, vhs, night`; fonts `font-sans` (Poppins), `font-display` (VT323 pixel).
- Event/category `image` is optional — `ImagePlaceholder` renders when missing.
- Event registration: set `registrationUrl` on a `FestEvent` (no backend yet).
