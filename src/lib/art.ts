/**
 * Deterministic data behind the illustrated scenes.
 *
 * Everything here is pure and seeded, so the server render and the client engine
 * (which paints the twinkling lights on canvases) always agree.
 */

export const TAU = Math.PI * 2;

/** Round to 1 decimal — keeps generated SVG paths compact. */
export const f = (n: number) => Math.round(n * 10) / 10;

/** Mulberry32 — small seeded PRNG. */
export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A maple leaf outline, drawn around (0,0). */
export const MAPLE =
  "M0-22 L5-12 L16-15 L11-4 L22 0 L11 6 L14 18 L3 12 L0 24 L-3 12 L-14 18 L-11 6 L-22 0 L-11-4 L-16-15 L-5-12Z";

/* ── twinkling lights (painted on canvas by lib/fx `Lights`) ─────────────── */

export type LightItem =
  | { k: "bulb"; x: number; y: number; r: number; c: string; ph: number; du: number }
  | { k: "star"; x: number; y: number; r: number; c: string; ph: number; du: number }
  | { k: "flame"; x: number; y: number; r: number; s: number; ph: number; du: number };

export type LightsName =
  | "concert-bulbs"
  | "concert-crowd"
  | "movie-stars"
  | "chenda-bulbs"
  | "register-bulbs";

const BULB_COLS = ["#ffd27a", "#ffb347", "#ff8a3a", "#fff0c0"];

interface BulbOptions {
  x0?: number;
  x1?: number;
  cols?: string[];
  r0?: number;
}

/** A sagging wire with bulbs hung along it. */
export function bulbString(y0: number, sag: number, n: number, seed: number, o: BulbOptions = {}) {
  const { x0 = -20, x1 = 1620, cols = BULB_COLS, r0 = 7 } = o;
  const r = rng(seed);
  const wire = `M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + sag * 2} ${x1} ${y0}`;
  const sockets: string[] = [];
  const items: LightItem[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + 4 * sag * t * (1 - t) + 13;
    items.push({ k: "bulb", x: f(x), y: f(y), r: r0, c: cols[i % cols.length], ph: r() * TAU, du: 1.6 + r() * 2.4 });
    sockets.push(`M${f(x - 3)} ${f(y - 12)}h6v6h-6z`);
  }
  return { wire, sockets, items };
}

export const concertBulbs = () => {
  const a = bulbString(128, 70, 26, 3);
  const b = bulbString(170, 50, 20, 8, { x0: 100, x1: 1500 });
  return { strings: [a, b], items: [...a.items, ...b.items] };
};

export const chendaBulbs = () => bulbString(150, 60, 30, 6, { cols: ["#ffd27a", "#ff8a3a", "#fff0c0"] });

/**
 * The register marquee: bulbs evenly round a frame the size of the screen (not of the cropped 1600×900 art), under the nav
 * bar, with a ripple of light running round it. `w` × `h` is the scene in CSS pixels.
 */
export function registerFrame(w: number, h: number): LightItem[] {
  const mx = 62; // gap to the side edges: the page's side rail sits just outside the frame, on the right
  const x0 = mx;
  const x1 = w - mx;
  const y0 = Math.min(108, h * 0.14); // the nav bar sits above the frame
  const y1 = h - 38;
  const nx = Math.max(2, Math.round((x1 - x0) / 46));
  const ny = Math.max(2, Math.round((y1 - y0) / 46));
  // clockwise from the top-left corner; each corner is the first bulb of its side
  const at: [number, number][] = [];
  for (let i = 0; i < nx; i++) at.push([x0 + ((x1 - x0) * i) / nx, y0]);
  for (let i = 0; i < ny; i++) at.push([x1, y0 + ((y1 - y0) * i) / ny]);
  for (let i = 0; i < nx; i++) at.push([x1 - ((x1 - x0) * i) / nx, y1]);
  for (let i = 0; i < ny; i++) at.push([x0, y1 - ((y1 - y0) * i) / ny]);
  // a whole number of ripples round the frame, so the pattern has no seam where it closes
  const step = (TAU * Math.max(1, Math.round(at.length / 14))) / at.length;
  return at.map(([x, y], i) => ({ k: "bulb", x: f(x), y: f(y), r: 7.5, c: "#ffd27a", ph: -i * step, du: 2.6 }));
}

/** Lights that follow the size of their scene rather than the stage, by canvas name (see `Lights.fit`). */
export function fitLights(name: string): ((w: number, h: number) => LightItem[]) | undefined {
  return name === "register-bulbs" ? registerFrame : undefined;
}

/* ── the concert crowd ───────────────────────────────────────────────────── */

export interface Person {
  body: string;
  head: { cx: number; cy: number; r: number };
  rim: string;
  fill: string;
  arm?: { d: string; width: number };
}

export function concertCrowd() {
  const r = rng(11);
  const people: Person[] = [];
  const flames: LightItem[] = [];
  for (let row = 0; row < 3; row++) {
    const base = [820, 850, 884][row];
    const sc = [0.72, 0.95, 1.25][row];
    const col = ["#241018", "#150810", "#0a0306"][row];
    let x = -30 + r() * 40;
    while (x < 1660) {
      const w = (76 + r() * 30) * sc;
      const hr = (17 + r() * 5) * sc;
      const hy = base - r() * 14 * sc;
      const p: Person = {
        body: `M${f(x - w / 2)} 1000L${f(x - w / 2)} ${f(hy + hr * 4.4)}Q${f(x - w / 2)} ${f(hy + hr * 1.5)} ${f(x)} ${f(hy + hr * 1.2)}Q${f(x + w / 2)} ${f(hy + hr * 1.5)} ${f(x + w / 2)} ${f(hy + hr * 4.4)}L${f(x + w / 2)} 1000z`,
        head: { cx: f(x), cy: f(hy), r: f(hr) },
        rim: `M${f(x - hr)} ${f(hy - hr * 0.2)}A${f(hr)} ${f(hr)} 0 0 1 ${f(x + hr)} ${f(hy - hr * 0.2)}`,
        fill: col,
      };
      if (row > 0 && r() < 0.34) {
        const d = r() < 0.5 ? -1 : 1;
        const sx = x + d * w * 0.36;
        const sy = hy + hr * 2.4;
        const hx = x + d * (w * 0.62 + r() * 14);
        const hy2 = hy - hr * (1.6 + r() * 1.8);
        p.arm = {
          d: `M${f(sx)} ${f(sy)}Q${f(sx + d * 18 * sc)} ${f((sy + hy2) / 2)} ${f(hx)} ${f(hy2)}`,
          width: f(12 * sc),
        };
        flames.push({ k: "flame", x: f(hx), y: f(hy2 - 10 * sc), r: 24 * sc, s: sc, ph: r() * TAU, du: 0.9 + r() * 0.9 });
      }
      people.push(p);
      x += w * 0.74 + r() * 16;
    }
  }
  return { people, flames };
}

/* ── the open-air cinema ─────────────────────────────────────────────────── */

export interface Building {
  x: number;
  w: number;
  h: number;
  window: boolean;
  dome: boolean;
}

export function movieData() {
  const r = rng(23);
  const stars: LightItem[] = [];
  for (let i = 0; i < 170; i++) {
    const y = Math.pow(r(), 1.6) * 560;
    stars.push({ k: "star", x: f(r() * 1600), y: f(y), r: f(0.5 + r() * 1.5), c: "#fff4dc", ph: r() * TAU, du: 2 + r() * 3 });
  }
  const buildings: Building[] = [];
  let x = -20;
  while (x < 1640) {
    const w = 40 + r() * 90;
    const h = 30 + r() * 110;
    const b: Building = { x, w, h, window: r() < 0.55, dome: r() < 0.2 };
    buildings.push(b);
    x += w + r() * 14;
  }
  const audience: Person[] = [];
  for (let row = 0; row < 3; row++) {
    const base = [836, 866, 900][row];
    const sc = [0.7, 0.95, 1.28][row];
    const col = ["#1d1124", "#0f0814", "#06030a"][row];
    let xx = -20 + r() * 40;
    while (xx < 1660) {
      const w = (78 + r() * 28) * sc;
      const hr = (17 + r() * 5) * sc;
      const hy = base - r() * 14 * sc;
      audience.push({
        body: `M${f(xx - w / 2)} 1000L${f(xx - w / 2)} ${f(hy + hr * 4.4)}Q${f(xx - w / 2)} ${f(hy + hr * 1.5)} ${f(xx)} ${f(hy + hr * 1.2)}Q${f(xx + w / 2)} ${f(hy + hr * 1.5)} ${f(xx + w / 2)} ${f(hy + hr * 4.4)}L${f(xx + w / 2)} 1000z`,
        head: { cx: f(xx), cy: f(hy), r: f(hr) },
        rim: `M${f(xx - hr)} ${f(hy - hr * 0.1)}A${f(hr)} ${f(hr)} 0 0 1 ${f(xx + hr)} ${f(hy - hr * 0.1)}`,
        fill: col,
      });
      xx += w * 0.76 + r() * 18;
    }
  }
  return { stars, buildings, audience };
}

/** Light data by canvas name — read by both the art components and the engine. */
export function getLights(name: string): LightItem[] {
  switch (name as LightsName) {
    case "concert-bulbs":
      return concertBulbs().items;
    case "concert-crowd":
      return concertCrowd().flames;
    case "movie-stars":
      return movieData().stars;
    case "chenda-bulbs":
      return chendaBulbs().items;
    default:
      return [];
  }
}
