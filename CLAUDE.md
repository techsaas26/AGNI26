@AGENTS.md

# AGNI'26 website

Cultural fest site for CEG (Student Association and Arts Society). Theme: **NOSTALGIA** — a one-page, cinematic
walk through a memory: a loader where the AGNI'26 lettering runs in and the props spring into place, a parallax maple-tree hero, then one illustrated, interactive
scene per event (cassette, bioscope, CRT console, lamp & drums, fashion runway), a ticket, a tee, a film reel, credits —
each scene holding the screen for a beat, then the next one is pulled up over it.
Migrated 1:1 from a hand-written static HTML/CSS/JS build onto the stack below; flow and design are unchanged.

## Stack
Next.js 16 (App Router, `src/` dir) · React 19 · TypeScript (strict) · Tailwind CSS v4 · **GSAP** (core + ScrollTrigger) · lucide-react · npm.
Plus `lenis` for the smooth scroll position (clocked by GSAP's ticker). Import alias `@/*` → `src/*`.

## Commands
- `npm run dev` — dev server on :3000 (`?skip` on the URL fast-forwards the loader)
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only (run `npx next typegen` first on a fresh clone)
- `npx wrangler pages dev` — after a build: serve `out/` plus `functions/` the way Cloudflare Pages does (:8788)

## Hosting (Cloudflare Pages)
Static export (`out/`) on Cloudflare Pages; `wrangler.jsonc` is a Pages config (`pages_build_output_dir`). Dashboard builds:
`npm run build`, output `out`, Node 22. `functions/index.js` is the only Pages Function: it runs on `/` alone and sends
phones (`Sec-CH-UA-Mobile: ?1` or a "Mobi"/iPhone user agent) to `/m` before the desktop page downloads; `?desktop` opts
out. The script in `app/(home)/layout.tsx` still does the same in the browser for whatever it misses (tablets) — keep the
two in step. A Workers-style config (`"assets": {…}`) makes Pages skip `functions/`.

## Layout
- `src/app/` — `layout.tsx` (fonts, metadata, global chrome: Loader · FilmLayer · Navbar · Rail), `page.tsx` (the home page),
  `globals.css` (tokens + the whole stylesheet), `fonts.ts` + `fonts/` (self-hosted woff2 through `next/font/local`).
- `src/components/layout/` — Loader, Navbar, Rail, FilmLayer (grain / vignette / flash / cursor), Footer.
- `src/components/home/` — one component per section: Hero, About, HighlightScene (the five "Why AGNI" scenes), Register,
  Merch, Gallery, Team, Contact; `SceneEngine.tsx` starts the engine; `art/` holds the SVG stages (one per scene).
- `src/data/` — **content lives here**, typed: `site.ts` (copy, dates, links, nav, rail), `highlights.ts` (the five scenes),
  `gallery.ts` (film-reel frames), `sponsors.ts` (sponsor strip), `team.ts` (credits; photos in `public/images/team/`).
- Images: originals (kebab-case names) live in `assets/<set>-src/` and `npm run images` (`scripts/optimize-images.mjs`)
  writes the WebPs the site serves. Team → square 600px in `public/images/team/` + 320px in `public/images/m/team/`;
  gallery → 1200px wide in `public/images/gallery/` (campus-bench up to 1600), listed in `data/gallery.ts` (one list feeds
  the desktop reel and the `/m` polaroids; `position` frames both crops); hero → full-size planes in `public/images/hero/`
  (hero-poster.webp at 1200); preloader → `full.webp`; branding → the AGNI'26 navbar logo at 400px; events → category cards
  (1600px + 800px phone copy); sponsors → logos at 400px in `public/images/sponsors/`, listed in `data/sponsors.ts`
  (the ticket-stub marquee `SponsorsMarquee` above the footer on `/` and `/m`; `dark: true` for a white logo). Never put originals in `public/`: the static export serves files as they are.
- Audio: originals in `assets/audio-src/`; `public/audio/` holds 112 kbps re-encodes
  (`ffmpeg -i assets/audio-src/<name>.mp3 -map_metadata -1 -c:a libmp3lame -b:a 112k public/audio/<name>.mp3`).
- `src/lib/` — `gsap.ts` (GSAP + ScrollTrigger registered once, the `EASE` set), `engine.ts` (the GSAP rig: Lenis ↔ ticker,
  the stage — beats and cuts along the scroll — plus push-in parallax, scrubbed copy reveals, hero intro, pointer parallax),
  `transitions.ts` (the one scene-to-scene cut), `ambient.ts` (every looping flame, beam and twinkle), `loader.ts` (the
  logo loader timeline), `burn.ts` (the WebGL fire the loader exits through), `fx.ts` (canvas particle fields, cursor, tilt, magnet),
  `audio.ts` (synthesised sfx + the looped track in `public/audio/`), `art.ts` (seeded art data), `scene-store.ts` (engine ⇄
  React bridge), `scenes/` (one controller per interactive scene), `utils.ts` (`cn`, `formatUrl`, `groupBy`, `clamp`, `lerp`).
- `public/images/` — `hero/` (the three parallax planes + poster + sheen mask), `preloader/` (the logo cut
  into lettering and props, described by `src/data/preloader.ts`), `gallery/`, `branding/`, `team/`, `sponsors/`, and the
  empty `events/ agenda/`. Kebab-case filenames, no spaces.

## How the page works
- Sections are **server components** (static markup). Only Loader, Navbar, Rail and `SceneEngine` are client components.
- The engine reads the DOM: `[data-scene]` marks a scene (`data-fx` / `data-fw` frame its art on narrow screens),
  `[data-depth]` marks a parallax plane inside it (`data-bleed`, `data-zoom`, `data-origin`). Art is drawn in a 1600×900
  "stage" that is scaled with `--k`.
- **The stage**: without JS the sections are a plain sticky stack. As soon as the engine starts it adds `html.staged`, which
  turns every `[data-scene]` into a full-screen `position: fixed` layer; from then on scroll decides where everything is. `main`
  is given a height equal to the whole timeline and only the scene that owns the screen (plus the one arriving, during a cut) is
  visible — the rest carry `.is-off`.
- Scene behaviour is in `src/lib/scenes/*.ts`; each controller looks up its elements by id (`#cassette`, `#crankwheel`,
  `#lamp`, `#tee`, …) and exposes `tick / enter / leave / destroy`. Keep those ids when editing the art.
- Anything that twinkles (bulbs, stars, lighters) is a `<canvas data-lights="…">`; its points come from `lib/art.ts`.
- Reveal-on-scroll: elements with class `rv` start at `opacity:0` in CSS and a **scrubbed** GSAP timeline brings them in as the scene
  rises (from `COPY_FROM` of the cut to `COPY_LAND` viewports after it has landed; `reveal()` in `engine.ts` decides how each kind of
  element moves; headlines are SplitText word masks). It runs backwards if the visitor scrolls back. Nothing is time-triggered.

## Pacing and cuts
- **`PACE` in `engine.ts`** is the edit decision list: `[beat, cut]` per scene, in viewport heights of scroll. `beat` is how long
  the scene holds the screen (its copy, props and scroll effects play here); `cut` is how long the handover out of it lasts (1 = the
  incoming scene moves at exactly the speed of the scroll). `measure()` lays them end to end: `appear → arrive → leave → gone` per
  scene (`SceneEnv` hands these to the controllers). Want a scene to stay longer? Raise its first number. A scene taller than the
  screen (contact; merch on phones) gets its overflow added to its beat and is scrolled through at the end of it.
- **Cuts** live in `lib/transitions.ts`, built from a few shared moves and mapped per pair in `CUTS`: `slide` (next scene carried in from below, above, or either side at scroll speed, planes drifting at their own depth, ember seam on vertical ones), `through` (camera pushes through the old scene into the new: hero→about, chenda→events) and `drift` (pull-back dissolve: concert→movie, merch→gallery). The old scene always sinks into a black sheet (`.sc-dim`, added by the engine). Only transforms and opacity move. Each is a GSAP timeline scrubbed 0→1 by a ScrollTrigger; the old scene's copy drifts up and fades as it starts (`leaving()`). Reduced motion: a dissolve.
- **`Engine.state()`** runs every frame after the scrubbed timelines have rendered and decides, from the scroll position alone,
  which layers are visible, which cut is on and which scene is "active" (nav highlight, controller `enter`/`leave`). When a cut ends,
  `rest()` strips everything it left on the scene. Keep cut scrubs at `scrub: true` — `state()` relies on that ordering.
- **No snapping**: the page never moves by itself; the scroll rests wherever the visitor leaves it (a half-finished cut is just two
  scenes sharing the screen). Lenis `lerp: 0.1`.
- **Jumps** (`goto`, used by the nav, rail and in-page anchors): a neighbouring scene is reached by scrolling through the cut
  at its normal pace — going forward, the rest of the current beat is run through quickly first (≤0.9 s: the reel winds to
  its end in a blink, then the cut); going back, the current beat is skipped in one jump and the move lands at the end of the
  previous scene's beat (top of the page for the hero), so the reel is never rewound; anything further dips to black and
  cuts straight there.

## Animation (GSAP)
- **One clock**: `gsap.ticker` advances Lenis (`lenis.raf`), which feeds `ScrollTrigger.update`; everything else hangs off that.
  `gsap.ticker.lagSmoothing(0)` keeps tween time equal to wall time.
- **Everything is inside one `gsap.context`** (`Engine` constructor, `startLoader`), so teardown / React StrictMode is a single
  `revert()`. Create tweens and ScrollTriggers only from code that runs inside that context (or `ctx.add`).
- **Scroll-linked** things are ScrollTriggers whose `start` / `end` are *functions* returning absolute scroll positions from the
  engine's timeline (`measure()` — the scenes are fixed layers, so there is nothing in the DOM to measure against).
  `measure()` re-runs on ScrollTrigger's `refreshInit`. Use `invalidateOnRefresh: true` on tweens with function values.
- **Transforms**: GSAP owns an element's whole transform once it touches it. Pointer parallax uses `xPercent/yPercent`, the
  scroll push-in uses `scale` + `y` (planes only ever grow, so an edge never shows while a scene sits on screen), and cuts use
  `scale` / `yPercent` on the scene layer itself. Don't put a CSS `transform` (or `transition: transform`) on anything GSAP animates;
  3D tilts (`tilt()` in `fx.ts`) use `rotationX/Y` + `transformPerspective`.
- **Loops** (flames, beams, twinkles, grain…) live in `ambient.ts` and are paused while their scene is off screen.
- Motion language: `EASE` in `gsap.ts` (`expo.out` for arrivals, `power3.out` for UI, `sine.inOut` for loops, `back.out` /
  `elastic` for props that land). Reduced motion: no Lenis, no loops, cuts become dissolves, copy is simply shown.
- Dev only: `window.__gsap` exposes `{ gsap, ScrollTrigger }` and `window.__engine` the engine (`__engine.scenes`, `.goto(id)`).

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
- SEO: every layout builds its metadata with `pageMetadata()` from `lib/seo.ts` (canonical, OG, Twitter) and the home and `/m`
  layouts embed `structuredDataJson()` (Event + Organization JSON-LD). `/m` is canonical to `/`; `/` points at `/m` with
  `rel=alternate media`. `app/robots.ts` + `app/sitemap.ts` are the crawl files; `app/icon.png` / `apple-icon.png` come from
  `npm run images`; `public/_redirects` sends old-edition URLs to this year's pages. Title, description, keywords, dates
  live in `data/site.ts`. Keep the year in the title.

## Loader
`components/layout/Loader.tsx` renders the sprites; `lib/loader.ts` is one GSAP timeline (letters run in from the right with
a hopping gait, land with a squash and ring out; props pop from behind the lettering; dust puffs off every landing) and waits
for the page's images and fonts. When both are done the exact logo fades in over the pieces and the loader exits by burning
away: `lib/burn.ts` is a WebGL fragment shader that repaints the loader (ink + ember glow + logo) and eats it from the bottom
up while the page beneath starts moving. No WebGL → a plain fade. `?skip` and `prefers-reduced-motion` jump the timeline to
its end as soon as the page is ready.

## Hero art
`public/images/hero/`: `hero-bg.webp` (campus at sunset), `hero-tree.webp` (maple, transparent), `hero-logo.webp` (AGNI'26
logo, transparent) — made by `npm run images` from the originals in `assets/hero-src/` (`hero-bg.jpeg`, `hero-tree.png`,
`hero-logo.png`, `hero-poster.jpg`). The tree keeps its aspect rooted bottom-left (`.tree-fit`); the logo sits in `.logo-box` (a % box over
the 1600×900 stage). `hero-logo-mask.png` is the logo's silhouette (used for the light sweep) and `hero-poster.jpg` is the
flattened hero: the `.jpg` in `public/` is the social/link-preview image, `hero-poster.webp` is the on-page copy (bioscope film). When the hero art changes, regenerate both from the
three plane images, and re-measure the sun position used by `.sun` / `.godrays` in `globals.css`.

## Not built here
The reference skeleton also had `/events`, `/schedule`, `/sponsors`, `/merch` pages and `Sponsor / FestEvent / ScheduleDay`
types; this project is the home page only, so they are not included. "Learn more / Register / Merch" buttons link to the
live site (`site.eventsUrl`, `site.merchUrl`).
