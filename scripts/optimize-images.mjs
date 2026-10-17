// Originals live in assets/<set>-src/ (any size, never deployed); this writes the WebPs the site serves.
// The static export copies public/ as it is (no image optimiser), so nothing large may go in there.
//   team     → public/images/team/<name>.webp     600² — desktop crew cards (≤250 CSS px, so 2× screens stay sharp)
//              public/images/m/team/<name>.webp   320² — the phone site
//   gallery  → public/images/gallery/<name>.webp  1200 wide, aspect kept — the memory reel; desktop frames (5:4, ≤520 CSS px)
//              and the phone polaroids (4:5, ≤340 CSS px) both crop it with CSS, framed by `position` in data/gallery.ts
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
    out: [{ dir: "public/images/gallery", width: 1200, quality: 80 }],
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

    for (const [i, { dir, width, quality }] of set.out.entries()) {
      const out = path.join(dir, `${name}.webp`);
      if ((await mtime(out)) > srcTime) continue;
      const info = await img
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toFile(out);
      if (i === 0) {
        before += srcSize;
        after += info.size;
      }
      console.log(`${out}  ${kb(srcSize)} → ${kb(info.size)}`);
    }
  }
  console.log(before ? `${set.src}: ${kb(before)} → ${kb(after)}\n` : `${set.src}: up to date\n`);
}
