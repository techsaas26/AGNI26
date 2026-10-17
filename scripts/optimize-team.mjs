// Team portraits: originals in assets/team-src/ (any size, never deployed) → square WebPs in public/.
//   public/images/team/<name>.webp    600px — desktop crew cards (≤250 CSS px, so 2× screens stay sharp)
//   public/images/m/team/<name>.webp  320px — the phone site
// Run `npm run images:team` after adding or replacing a photo; outputs newer than their source are skipped.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/team-src";
const OUT = [
  { dir: "public/images/team", size: 600, quality: 78 },
  { dir: "public/images/m/team", size: 320, quality: 75 },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
const mtime = (file) => stat(file).then((s) => s.mtimeMs, () => 0);

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
for (const { dir } of OUT) await mkdir(dir, { recursive: true });

let before = 0;
let after = 0;
for (const file of files) {
  const src = path.join(SRC, file);
  const name = path.parse(file).name.toLowerCase();
  const srcTime = await mtime(src);

  // Square crop, horizontally centred, 25% from the top (same framing as `.crew-photo img`'s object-position).
  const img = sharp(src).rotate();
  const { width, height } = await img.metadata().then((m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  const side = Math.min(width, height);
  const crop = {
    left: Math.round((width - side) / 2),
    top: Math.round((height - side) * 0.25),
    width: side,
    height: side,
  };

  for (const { dir, size, quality } of OUT) {
    const out = path.join(dir, `${name}.webp`);
    if ((await mtime(out)) > srcTime) continue;
    const info = await img
      .clone()
      .extract(crop)
      .resize(size, size, { withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(out);
    const srcSize = (await stat(src)).size;
    if (dir === OUT[0].dir) {
      before += srcSize;
      after += info.size;
    }
    console.log(`${out}  ${kb(srcSize)} → ${kb(info.size)}`);
  }
}
console.log(before ? `\nDesktop set: ${kb(before)} → ${kb(after)}` : "All team photos are up to date.");
