# AGNI'26 — Nostalgia

Official website for AGNI'26, the cultural fest of CEG, Anna University.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
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
  app/            # One folder per route: events/, schedule/, sponsors/, merch/
  components/     # UI, grouped by page (layout/, home/, events/, ...) + shared ui/
  data/           # Site content: team, events, sponsors, schedule, nav links
  types/          # Shared TypeScript types
  lib/            # Helpers (cn, formatUrl, groupBy)
public/images/    # team/, sponsors/, events/, agenda/, branding/
```

## Updating content

Most changes need no component edits:

- **Events** → `src/data/events.ts` (poster in `public/images/events/`)
- **Sponsors** → `src/data/sponsors.ts` (logo in `public/images/sponsors/`)
- **Schedule** → `src/data/schedule.ts` (agenda poster in `public/images/agenda/`)
- **Team** → `src/data/team.ts` (photo in `public/images/team/`)
- **Nav links / socials** → `src/data/site.ts`

Theme colors and fonts are defined once in `src/app/globals.css` (`@theme`) and used as Tailwind classes such as `bg-paper`, `text-mustard` and `font-display`.
