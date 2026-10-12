/**
 * The cuts between scenes — eleven of them, no two alike, each borrowed from the film vocabulary
 * of the two scenes it joins (a sun flare out of the hero, an iris into the movie night, a tube
 * switching on for the CRT, a burn spreading from the lamp, a velvet curtain for the runway…).
 *
 * How a cut works: the scenes are full-screen fixed layers (see `html.staged` in globals.css).
 * `build()` fills a GSAP timeline that the engine scrubs from 0 to 1 with scroll; it only tweens
 * numbers — custom properties, opacity, transforms — and the stylesheet turns those into masks
 * and clips through the classes a scene wears while it is being cut (`aClass` / `bClass`).
 * Every tween states both ends (`fromTo`), so a cut is the same picture at the same progress no
 * matter which way, or how fast, the page got there.
 */
import { sfx } from "@/lib/audio";
import { gsap } from "@/lib/gsap";

export interface CutCtx {
  /** Scrubbed by scroll, 0 → 1 over the cut. */
  tl: gsap.core.Timeline;
  /** The scene that leaves and the scene that arrives. */
  a: HTMLElement;
  b: HTMLElement;
  /** This cut's own overlay box; hidden unless the cut is on screen. */
  ov: HTMLElement;
  /** A warm backdrop behind every scene, for cuts that turn a scene away (opacity 0 at rest). */
  back: HTMLElement;
  vw(): number;
  vh(): number;
}

export interface Cut {
  name: string;
  /** Progress at which the arriving scene's copy starts to come in. */
  reveal: number;
  /** The leaving scene stays on top (it is taken away and the next one is found beneath it). */
  aOnTop?: boolean;
  /** Classes the two scenes wear while the cut is on screen. */
  aClass?: string;
  bClass?: string;
  build(c: CutCtx): void;
  /** Measure what the effect is anchored to; runs every time the cut comes on screen. */
  prep?(c: CutCtx): void;
  /** Per-frame work while the cut is on screen (noise, flicker). */
  tick?(c: CutCtx): void;
  /** Played as the cut starts, if the visitor has sound on. */
  sound?(): void;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

type V = gsap.TweenVars;

/** A tween that owns one stretch of the cut: both ends stated, nothing rendered before its time. */
const seg = (c: CutCtx, target: gsap.TweenTarget, t0: number, t1: number, from: V, to: V, ease = "none") =>
  c.tl.fromTo(target, from, { ...to, duration: t1 - t0, ease, immediateRender: false }, t0);

/** A value that switches at one instant (and switches back when the cut is run in reverse). */
const at = (c: CutCtx, target: gsap.TweenTarget, t: number, vars: V) => c.tl.set(target, vars, t);

const mk = (c: CutCtx, cls: string, html = "") => {
  const d = document.createElement("div");
  d.className = cls;
  if (html) d.innerHTML = html;
  c.ov.appendChild(d);
  return d;
};

/** A point inside an element, in viewport px (the scenes are fixed, so that is also layer px). */
const point = (el: Element | null | undefined, fx: number, fy: number, fallback: [number, number]): [number, number] => {
  const r = el?.getBoundingClientRect();
  return r && r.width ? [r.left + r.width * fx, r.top + r.height * fy] : fallback;
};

/* ── textures, drawn once ────────────────────────────────────────────────── */

let ring = "";
let snow = "";

/** A ring of fire: white-hot inner rim, then flame, ember red, char and smoke — with a ragged edge. */
function emberRing(N = 640) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const g = cv.getContext("2d")!;
  const img = g.createImageData(N, N);
  const d = img.data;
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const vn = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = (x - xi) * (x - xi) * (3 - 2 * (x - xi));
    const v = (y - yi) * (y - yi) * (3 - 2 * (y - yi));
    const top = hash(xi, yi) + (hash(xi + 1, yi) - hash(xi, yi)) * u;
    const bot = hash(xi, yi + 1) + (hash(xi + 1, yi + 1) - hash(xi, yi + 1)) * u;
    return top + (bot - top) * v;
  };
  const fbm = (x: number, y: number) => vn(x, y) * 0.55 + vn(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + vn(x * 4.3 + 1, y * 4.3 + 9) * 0.15;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N) * 2 - 1;
      const y = ((j + 0.5) / N) * 2 - 1;
      // the ring lives between 76% and 99% of the radius; noise makes both of its edges ragged
      const rho = Math.hypot(x, y) + (fbm(x * 5 + 11, y * 5 + 4) - 0.5) * 0.085 + (fbm(x * 15, y * 15) - 0.5) * 0.022;
      const t = (rho - 0.76) / 0.23;
      const o = (j * N + i) * 4;
      if (t <= 0 || t >= 1) continue;
      let r: number;
      let gr: number;
      let b: number;
      let al = 1;
      if (t < 0.08) {
        r = 255;
        gr = 250;
        b = 220;
        al = t / 0.08;
      } else if (t < 0.3) {
        const k = (t - 0.08) / 0.22;
        r = 255;
        gr = 240 - 115 * k;
        b = 190 - 165 * k;
      } else if (t < 0.5) {
        const k = (t - 0.3) / 0.2;
        r = 255 - 70 * k;
        gr = 125 - 95 * k;
        b = 25 - 17 * k;
      } else if (t < 0.75) {
        const k = (t - 0.5) / 0.25;
        r = 185 - 160 * k;
        gr = 30 - 20 * k;
        b = 8 - 3 * k;
      } else {
        r = 25;
        gr = 10;
        b = 5;
        al = 1 - (t - 0.75) / 0.25;
      }
      if (t > 0.5 && hash(i * 0.37, j * 0.91) > 0.992) {
        // embers still glowing in the char
        r = 255;
        gr = 150;
        b = 40;
      }
      d[o] = r;
      d[o + 1] = gr;
      d[o + 2] = b;
      d[o + 3] = al * 255;
    }
  }
  g.putImageData(img, 0, 0);
  return cv.toDataURL();
}

/** TV snow. */
function staticTile(N = 96) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const g = cv.getContext("2d")!;
  const img = g.createImageData(N, N);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return cv.toDataURL();
}

/** Draw the textures the cuts use and hand them to the stylesheet. Call it off the critical path. */
export function warmCuts(root: HTMLElement) {
  if (!ring) ring = emberRing();
  if (!snow) snow = staticTile();
  root.style.setProperty("--ring", `url(${ring})`);
  root.style.setProperty("--static", `url(${snow})`);
}

/* ── 1 · hero → about: the sun swells until it burns the frame out ───────── */

const sunFlare: Cut = {
  name: "sun flare",
  sound: () => sfx.flare(),
  reveal: 0.62,
  build(c) {
    const flare = mk(c, "tfx-flare");
    const white = mk(c, "tfx-white");
    at(c, c.b, 0, { opacity: 0 });
    // first a star on the horizon, then it swallows the frame
    seg(c, flare, 0, 0.14, { opacity: 0 }, { opacity: 1 }, "power1.out");
    seg(c, flare, 0, 0.52, { scale: 0.05 }, { scale: 1.1 }, "power2.in");
    seg(c, c.a, 0, 0.52, { scale: 1 }, { scale: 1.12 }, "power1.in"); // the camera leans into the light
    seg(c, white, 0.3, 0.52, { opacity: 0 }, { opacity: 1 }, "power2.in");
    at(c, c.b, 0.52, { opacity: 1 });
    seg(c, flare, 0.52, 0.8, { opacity: 1 }, { opacity: 0 }, "power1.out");
    // …and the memory resolves out of the glow
    seg(c, white, 0.56, 1, { opacity: 1 }, { opacity: 0 }, "power2.out");
    seg(c, c.b, 0.52, 1, { scale: 1.12 }, { scale: 1 }, "power3.out");
  },
  prep(c) {
    const sun = point(c.a.querySelector(".sun"), 0.907, 0.387, [c.vw() * 0.88, c.vh() * 0.38]);
    const x = Math.min(sun[0], c.vw() * 0.93); // the hero has pushed in; keep the sun inside the frame
    const y = sun[1];
    c.ov.style.setProperty("--sx", `${x.toFixed(0)}px`);
    c.ov.style.setProperty("--sy", `${y.toFixed(0)}px`);
    gsap.set(c.a, { transformOrigin: `${x.toFixed(0)}px ${y.toFixed(0)}px` });
  },
};

/* ── 2 · about → concert: house lights down, a spotlight opens from the rig ── */

const spotlight: Cut = {
  name: "spotlight",
  sound: () => sfx.clack(),
  reveal: 0.58,
  bClass: "fx-cone",
  build(c) {
    const haze = mk(c, "tfx-haze");
    at(c, c.b, 0, { "--w": 0, opacity: 0 });
    seg(c, c.a, 0, 0.3, { filter: "brightness(1)" }, { filter: "brightness(0.2)" }, "power2.out");
    seg(c, c.b, 0.12, 0.2, { opacity: 0 }, { opacity: 1 });
    seg(c, c.b, 0.12, 0.95, { "--w": 0 }, { "--w": 100 }, "power2.inOut");
    seg(c, haze, 0.12, 0.5, { opacity: 0 }, { opacity: 1 }, "power1.out");
    seg(c, haze, 0.5, 1, { opacity: 1 }, { opacity: 0 }, "power1.in");
  },
};

/* ── 3 · concert → movie: a silent-film iris closes on the cassette and opens on the screen ── */

/** Fully open, in vmax: a little past the far corner from anywhere on screen. */
const IRIS = 92;

const iris: Cut = {
  name: "iris",
  sound: () => sfx.tick(),
  reveal: 0.72,
  aClass: "fx-iris",
  bClass: "fx-iris",
  build(c) {
    at(c, c.a, 0, { "--r": IRIS });
    at(c, c.b, 0, { "--r": 0 });
    seg(c, c.a, 0, 0.46, { "--r": IRIS }, { "--r": 0 }, "power2.inOut");
    seg(c, c.b, 0.56, 1, { "--r": 0 }, { "--r": IRIS }, "power2.inOut");
  },
  prep(c) {
    const from = point(c.a.querySelector("#cassette"), 0.5, 0.55, [c.vw() * 0.62, c.vh() * 0.46]);
    const to = point(c.b.querySelector(".mv-screen"), 0.5, 0.5, [c.vw() * 0.5, c.vh() * 0.32]);
    c.a.style.setProperty("--ix", `${from[0].toFixed(0)}px`);
    c.a.style.setProperty("--iy", `${from[1].toFixed(0)}px`);
    c.b.style.setProperty("--ix", `${to[0].toFixed(0)}px`);
    c.b.style.setProperty("--iy", `${to[1].toFixed(0)}px`);
  },
};

/* ── 4 · movie → talent: the picture collapses to a line and a dot; the next set warms up ── */

const tube: Cut = {
  name: "tube",
  sound: () => sfx.bleep(220),
  reveal: 0.66,
  build(c) {
    const line = mk(c, "tfx-crt-line");
    const noise = mk(c, "tfx-static");
    const scan = mk(c, "tfx-scan");
    at(c, c.b, 0, { opacity: 0 });
    // off: squeezed flat, then pulled into a point that lingers
    seg(c, c.a, 0, 0.2, { scaleY: 1, scaleX: 1, filter: "brightness(1)" }, { scaleY: 0.004, scaleX: 1, filter: "brightness(5)" }, "power3.in");
    seg(c, c.a, 0.2, 0.3, { scaleX: 1 }, { scaleX: 0.002 }, "power2.in");
    at(c, c.a, 0.3, { opacity: 0 });
    seg(c, line, 0.1, 0.2, { opacity: 0, scaleX: 1 }, { opacity: 1, scaleX: 1 }, "power2.in");
    seg(c, line, 0.2, 0.3, { scaleX: 1 }, { scaleX: 0.004 }, "power2.in");
    seg(c, line, 0.3, 0.44, { opacity: 1 }, { opacity: 0 }, "power1.out");
    // on: the raster opens from a line, too bright at first, snow clearing
    at(c, c.b, 0.5, { opacity: 1 });
    seg(c, c.b, 0.5, 0.63, { scaleY: 0.004, filter: "brightness(5)" }, { scaleY: 1, filter: "brightness(1.7)" }, "power3.out");
    seg(c, c.b, 0.63, 1, { filter: "brightness(1.7)" }, { filter: "brightness(1)" }, "power1.out");
    seg(c, noise, 0.5, 0.58, { opacity: 0 }, { opacity: 0.6 });
    seg(c, noise, 0.58, 1, { opacity: 0.6 }, { opacity: 0 }, "power2.out");
    seg(c, scan, 0.5, 0.6, { opacity: 0 }, { opacity: 0.55 });
    seg(c, scan, 0.6, 1, { opacity: 0.55 }, { opacity: 0 });
  },
  tick(c) {
    const n = c.ov.querySelector<HTMLElement>(".tfx-static");
    if (n) n.style.backgroundPosition = `${(Math.random() * 192) | 0}px ${(Math.random() * 192) | 0}px`;
  },
};

/* ── 5 · talent → chenda: a hole burns outward from the lamp ─────────────── */

const burn: Cut = {
  name: "burn",
  sound: () => sfx.ignite(),
  reveal: 0.6,
  bClass: "fx-hole",
  build(c) {
    const heat = mk(c, "tfx-heat");
    const fire = mk(c, "tfx-ring");
    at(c, [c.b, fire], 0, { "--s": 0 });
    seg(c, [c.b, fire], 0.04, 0.97, { "--s": 0 }, { "--s": 1 }, "power1.in");
    seg(c, c.a, 0, 0.9, { filter: "brightness(1) sepia(0)" }, { filter: "brightness(0.5) sepia(0.55)" }, "power1.in"); // the old frame scorches
    seg(c, heat, 0, 0.25, { opacity: 0 }, { opacity: 1 }, "power1.out");
    seg(c, heat, 0.6, 1, { opacity: 1 }, { opacity: 0 });
    seg(c, fire, 0.9, 1, { opacity: 1 }, { opacity: 0 });
  },
  prep(c) {
    if (!ring) warmCuts(c.ov.parentElement ?? c.ov);
    const W = c.vw();
    const H = c.vh();
    const [x, y] = point(c.b.querySelector("#lamp"), 0.5, 0.22, [W * 0.5, H * 0.44]);
    // the ragged inner edge of the ring (≥ 70% of its radius) has to clear the farthest corner
    const far = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) / 0.7;
    for (const el of [c.b, c.ov]) {
      el.style.setProperty("--hx", `${x.toFixed(0)}px`);
      el.style.setProperty("--hy", `${y.toFixed(0)}px`);
      el.style.setProperty("--hmax", far.toFixed(0));
    }
  },
};

/* ── 6 · chenda → fashion: the house curtain closes, then parts on the runway ── */

const curtain: Cut = {
  name: "curtain",
  sound: () => sfx.light(),
  reveal: 0.7,
  build(c) {
    const l = mk(c, "tfx-cur");
    const r = mk(c, "tfx-cur r");
    at(c, c.b, 0, { opacity: 0 });
    seg(c, l, 0, 0.44, { xPercent: -103, skewX: 0 }, { xPercent: 0, skewX: 0 }, "power2.inOut");
    seg(c, r, 0, 0.44, { xPercent: 103, skewX: 0 }, { xPercent: 0, skewX: 0 }, "power2.inOut");
    // the cloth settles
    seg(c, l, 0.44, 0.5, { skewX: 0 }, { skewX: -1.2 }, "sine.inOut");
    seg(c, r, 0.44, 0.5, { skewX: 0 }, { skewX: 1.2 }, "sine.inOut");
    at(c, c.a, 0.48, { opacity: 0 });
    at(c, c.b, 0.48, { opacity: 1 });
    seg(c, l, 0.56, 1, { xPercent: 0, skewX: -1.2 }, { xPercent: -103, skewX: 0 }, "power2.inOut");
    seg(c, r, 0.56, 1, { xPercent: 0, skewX: 1.2 }, { xPercent: 103, skewX: 0 }, "power2.inOut");
  },
};

/* ── 7 · fashion → register: a flash; the scene is now a print, flicked off the table ── */

const snapshot: Cut = {
  name: "snapshot",
  sound: () => sfx.snap(),
  reveal: 0.62,
  aOnTop: true,
  aClass: "fx-print",
  build(c) {
    const flash = mk(c, "tfx-flash");
    at(c, c.b, 0, { filter: "brightness(0.35)", scale: 1.06 });
    at(c, c.a, 0, { "--pf": 0 });
    seg(c, flash, 0, 0.05, { opacity: 0 }, { opacity: 1 }, "power4.out");
    seg(c, flash, 0.05, 0.22, { opacity: 1 }, { opacity: 0 }, "power2.out");
    seg(c, c.a, 0.04, 0.07, { "--pf": 0 }, { "--pf": 1 }); // the white border arrives under the flash
    seg(c, c.a, 0.05, 0.36, { scale: 1, rotation: 0, xPercent: 0, yPercent: 0 }, { scale: 0.56, rotation: -5, xPercent: 0, yPercent: -3 }, "power3.out");
    seg(c, c.a, 0.05, 0.36, { filter: "sepia(0) saturate(1)" }, { filter: "sepia(0.35) saturate(0.85)" });
    seg(c, c.a, 0.46, 1, { scale: 0.56, rotation: -5, xPercent: 0, yPercent: -3 }, { scale: 0.46, rotation: -42, xPercent: -96, yPercent: 88 }, "power2.in");
    seg(c, c.b, 0.36, 0.92, { filter: "brightness(0.35)", scale: 1.06 }, { filter: "brightness(1)", scale: 1 }, "power2.out");
  },
};

/* ── 8 · register → merch: torn open along the ticket's perforation ──────── */

/** Per-overlay state of the rip: how far it is open and where the perforation sits. */
const rips = new WeakMap<HTMLElement, { st: { p: number; x0: number }; draw: () => void }>();

const rip: Cut = {
  name: "rip",
  sound: () => sfx.ratchet(),
  reveal: 0.56,
  build(c) {
    c.ov.insertAdjacentHTML("beforeend", `<svg class="tfx-rip"><polyline/><polyline/></svg>`);
    const lines = c.ov.querySelectorAll("polyline");
    const st = { p: 0, x0: 0 };
    const draw = () => {
      const W = c.vw();
      const H = c.vh();
      const x0 = st.x0 || W * 0.7;
      const N = 26;
      const zz = Math.max(7, W * 0.011);
      const lean = Math.tan(0.085);
      const wl = st.p * (x0 + zz * 3 + H * lean);
      const wr = st.p * (W - x0 + zz * 3 + H * lean);
      const L: [number, number][] = [];
      const R: [number, number][] = [];
      for (let k = 0; k <= N; k++) {
        const y = (k / N) * H * 1.1 - H * 0.05;
        const xc = x0 + (y - H / 2) * lean + (k % 2 ? zz : -zz); // the perforation's teeth
        L.push([xc - wl, y]);
        R.push([xc + wr, y]);
      }
      const px = (p: [number, number]) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`;
      const poly = `polygon(${[...R, ...[...L].reverse()].map(px).join(",")})`;
      c.b.style.clipPath = poly;
      c.b.style.setProperty("-webkit-clip-path", poly);
      const edge = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
      const show = st.p > 0.004 && st.p < 0.995 ? "1" : "0";
      lines[0].setAttribute("points", edge(L));
      lines[1].setAttribute("points", edge(R));
      lines[0].style.opacity = lines[1].style.opacity = show;
    };
    rips.set(c.ov, { st, draw });
    c.tl.fromTo(st, { p: 0 }, { p: 1, duration: 0.95, ease: "power2.inOut", immediateRender: false, onUpdate: draw }, 0.03);
    seg(c, c.a, 0, 1, { scale: 1 }, { scale: 1.05 }, "power1.in");
  },
  prep(c) {
    const rig = rips.get(c.ov);
    if (!rig) return;
    rig.st.x0 = point(c.a.querySelector(".tk-stub"), 0, 0.5, [c.vw() * 0.7, 0])[0];
    rig.draw(); // closed (or fully open) until the scrub says otherwise
  },
};

/* ── 9 · merch → gallery: the film leader counts the reel in ─────────────── */

const leader: Cut = {
  name: "leader",
  sound: () => sfx.reel(),
  reveal: 0.84,
  build(c) {
    const ld = mk(
      c,
      "tfx-leader",
      `<span class="hx"></span><span class="sw"></span><span class="lr"></span><span class="lr in"></span><b>3</b><b>2</b><i></i><small>AGNI’26 · reel 05 · picture start</small>`,
    );
    const flash = mk(c, "tfx-flash");
    const [three, two] = [...ld.querySelectorAll("b")];
    const sweep = ld.querySelector(".sw");
    at(c, c.b, 0, { opacity: 0 });
    seg(c, c.a, 0, 0.14, { filter: "sepia(0) brightness(1)" }, { filter: "sepia(0.8) brightness(0.55)" }, "power1.in");
    seg(c, ld, 0, 0.12, { opacity: 0 }, { opacity: 1 }, "power1.in");
    at(c, c.a, 0.14, { opacity: 0 });
    at(c, c.b, 0.14, { opacity: 1 });
    at(c, three, 0.12, { opacity: 1 });
    seg(c, sweep, 0.12, 0.42, { "--a": 0 }, { "--a": 360 });
    at(c, three, 0.42, { opacity: 0 });
    at(c, two, 0.42, { opacity: 1 });
    seg(c, sweep, 0.42, 0.72, { "--a": 0 }, { "--a": 360 });
    at(c, two, 0.72, { opacity: 0 });
    // the sync pop, then picture
    seg(c, flash, 0.72, 0.745, { opacity: 0 }, { opacity: 1 });
    at(c, ld, 0.745, { opacity: 0 });
    seg(c, flash, 0.745, 0.92, { opacity: 1 }, { opacity: 0 }, "power2.out");
    seg(c, c.b, 0.745, 1, { filter: "brightness(1.7) sepia(0.6)" }, { filter: "brightness(1) sepia(0)" }, "power2.out");
  },
  tick(c) {
    // scratches and a nervous lamp, on the leader only
    const ld = c.ov.querySelector<HTMLElement>(".tfx-leader");
    const scratch = ld?.querySelector<HTMLElement>("i");
    if (!ld || !scratch || Math.random() > 0.45) return;
    ld.style.filter = `brightness(${(0.86 + Math.random() * 0.28).toFixed(2)})`;
    scratch.style.opacity = Math.random() < 0.5 ? "0.55" : "0";
    scratch.style.left = `${(Math.random() * 100).toFixed(1)}%`;
  },
};

/* ── 10 · gallery → credits: the frame closes to black, then the roll ────── */

const scope: Cut = {
  name: "scope",
  sound: () => sfx.thump(60),
  reveal: 0.7,
  build(c) {
    const top = mk(c, "tfx-bar");
    const bot = mk(c, "tfx-bar b");
    const glow = mk(c, "tfx-glow");
    at(c, c.b, 0, { opacity: 0 });
    seg(c, [top, bot], 0, 0.46, { scaleY: 0 }, { scaleY: 1 }, "power3.inOut");
    seg(c, c.a, 0, 0.46, { scale: 1 }, { scale: 1.07 }, "power1.in");
    // the last sliver of light before black
    seg(c, glow, 0.32, 0.45, { opacity: 0, scaleX: 1 }, { opacity: 1, scaleX: 1 });
    seg(c, glow, 0.45, 0.6, { opacity: 1, scaleX: 1 }, { opacity: 0, scaleX: 0.2 }, "power2.in");
    at(c, c.a, 0.5, { opacity: 0 });
    at(c, c.b, 0.5, { opacity: 1 });
    seg(c, [top, bot], 0.6, 1, { scaleY: 1 }, { scaleY: 0 }, "power3.inOut");
  },
};

/* ── 11 · credits → contact: the screen turns over like a postcard ───────── */

const flip: Cut = {
  name: "flip",
  sound: () => sfx.hover(),
  reveal: 0.74,
  aClass: "fx-card",
  bClass: "fx-card",
  build(c) {
    at(c, c.b, 0, { opacity: 0 });
    at(c, c.a, 0, { "--edge": 0 });
    // the frame steps back and shows its edge: it is a card…
    seg(c, c.back, 0, 0.14, { opacity: 0 }, { opacity: 1 }, "power1.out");
    seg(c, c.a, 0, 0.14, { "--edge": 0 }, { "--edge": 1 });
    seg(c, c.a, 0, 0.2, { scale: 1 }, { scale: 0.8 }, "power2.out");
    // …that turns over…
    seg(c, c.a, 0.14, 0.5, { rotationY: 0 }, { rotationY: -90 }, "power2.in");
    at(c, c.a, 0.5, { opacity: 0 });
    at(c, c.b, 0.5, { opacity: 1, "--edge": 1, scale: 0.8 });
    seg(c, c.b, 0.5, 0.86, { rotationY: 90 }, { rotationY: 0 }, "power2.out");
    // …and comes back up to fill the screen
    seg(c, c.b, 0.8, 1, { scale: 0.8 }, { scale: 1 }, "power2.inOut");
    seg(c, c.b, 0.86, 1, { "--edge": 1 }, { "--edge": 0 });
    seg(c, c.back, 0.86, 1, { opacity: 1 }, { opacity: 0 }, "power1.in");
  },
  prep(c) {
    // turn about the middle of the screen (the contact layer can be taller than it)
    gsap.set([c.a, c.b], { transformPerspective: 1500, transformOrigin: `50% ${(c.vh() / 2).toFixed(0)}px` });
  },
};

/* ── reduced motion: a plain dissolve ────────────────────────────────────── */

const dissolve: Cut = {
  name: "dissolve",
  reveal: 0.5,
  build(c) {
    at(c, c.b, 0, { opacity: 0 });
    seg(c, c.b, 0.3, 0.7, { opacity: 0 }, { opacity: 1 }, "power1.inOut");
  },
};

const CUTS: Record<string, Cut> = {
  "hero>about": sunFlare,
  "about>concert": spotlight,
  "concert>movie": iris,
  "movie>talent": tube,
  "talent>chenda": burn,
  "chenda>fashion": curtain,
  "fashion>register": snapshot,
  "register>merch": rip,
  "merch>gallery": leader,
  "gallery>team": scope,
  "team>contact": flip,
};

/** The cut that joins two scenes (by `data-scene` name). */
export const cutFor = (a: string, b: string, reduce: boolean): Cut => (reduce ? dissolve : (CUTS[`${a}>${b}`] ?? dissolve));
