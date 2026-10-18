// Originals live in assets/<set>-src/ (any size, never deployed); this writes the WebPs the site serves.
// The static export copies public/ as it is (no image optimiser), so nothing large may go in there.
//   team     → public/images/team/<name>.webp     600² — desktop crew cards (≤250 CSS px, so 2× screens stay sharp)
//              public/images/m/team/<name>.webp   320² — the phone site
//   gallery  → public/images/gallery/<name>.webp  1200 wide, aspect kept — the memory reel; desktop frames (5:4, ≤520 CSS px)
//              and the phone polaroids (4:5, ≤340 CSS px) both crop it with CSS, framed by `position` in data/gallery.ts;
//              campus-bench (the About backdrop, full screen) keeps up to 1600
//   hero     → public/images/hero/<name>.webp     full size — the parallax planes (tree, logo, sky); hero-poster at 1200 is
//              the on-page copy (bioscope film); hero-poster.jpg stays in public/ for link previews
//   preloader→ public/images/preloader/<name>.webp full size — the finished logo the loader settles on
//   movie    → public/images/movie/<name>.webp     1600 wide — what plays on the open-air screen (≈760 of the 1600-px stage)
//   branding → public/images/branding/<name>.webp  400 wide — the AGNI'26 logo in the navbars (≤88 CSS px tall, so 2× screens
//              stay sharp) and the tab icon
//   events   → public/images/events/<name>.webp    1600 wide — the events section's category cards
//              public/images/m/<name>.webp         800 wide — the same cards on the phone site
// Run `npm run images` after adding or replacing a photo; outputs newer than their source are skipped.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SETS = [
  {
    src: "assets/team-src",
    square: true, // crop square, centred, 25% from the top (same framing as `.crew-photo img`'s object-position)
    out: [
      { dir: "public/images/team", width: 600, quality: 78 },
      { dir: "public/images/m/team", width: 320, quality: 75 },
    ],
  },
  {
    src: "assets/gallery-src",
    square: false,
    widths: { "campus-bench": 1600 },
    out: [{ dir: "public/images/gallery", width: 1200, quality: 80 }],
  },
  {
    src: "assets/hero-src",
    widths: { "hero-poster": 1200 },
    out: [{ dir: "public/images/hero", quality: 75 }],
  },
  {
    src: "assets/preloader-src",
    out: [{ dir: "public/images/preloader", quality: 80 }],
  },
  {
    src: "assets/movie-src",
    out: [{ dir: "public/images/movie", width: 1600, quality: 80 }],
  },
  {
    src: "assets/branding-src",
    out: [{ dir: "public/images/branding", width: 400, quality: 85 }],
  },
  {
    src: "assets/events-src",
    out: [
      { dir: "public/images/events", width: 1600, quality: 80 },
      { dir: "public/images/m", width: 800, quality: 75 },
    ],
  },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
const mtime = (file) => stat(file).then((s) => s.mtimeMs, () => 0);

for (const set of SETS) {
  const files = (await readdir(set.src).catch(() => [])).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  for (const { dir } of set.out) await mkdir(dir, { recursive: true });

  let before = 0;
  let after = 0;
  for (const file of files) {
    const src = path.join(set.src, file);
    const name = path.parse(file).name.toLowerCase();
    const srcTime = await mtime(src);
    const srcSize = (await stat(src)).size;

    let img = sharp(src).rotate();
    if (set.square) {
      const m = await img.metadata();
      const [width, height] = m.orientation >= 5 ? [m.height, m.width] : [m.width, m.height];
      const side = Math.min(width, height);
      img = img.extract({
        left: Math.round((width - side) / 2),
        top: Math.round((height - side) * 0.25),
        width: side,
        height: side,
      });
    }

    for (const [i, { dir, width: setWidth, quality }] of set.out.entries()) {
      const out = path.join(dir, `${name}.webp`);
      if ((await mtime(out)) > srcTime) continue;
      const width = set.widths?.[name] ?? setWidth; // none: keep the source's size
      const pipe = img.clone();
      if (width) pipe.resize({ width, withoutEnlargement: true });
      // alphaQuality only applies to the cut-outs (tree, logo); it is what keeps their edges small
      const info = await pipe.webp({ quality, alphaQuality: 70, effort: 6 }).toFile(out);
      if (i === 0) {
        before += srcSize;
        after += info.size;
      }
      console.log(`${out}  ${kb(srcSize)} → ${kb(info.size)}`);
    }
  }
  console.log(before ? `${set.src}: ${kb(before)} → ${kb(after)}\n` : `${set.src}: up to date\n`);
}
