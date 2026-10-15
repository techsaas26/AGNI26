/**
 * Canvas effects: falling leaves, embers, dust and sparks; twinkling lights;
 * and the pointer toys (custom cursor, tilt, magnetic buttons) — those run on GSAP.
 *
 * Sprites are built lazily so this module is safe to import during SSR.
 */
import { MAPLE, TAU, type LightItem } from "@/lib/art";
import { gsap } from "@/lib/gsap";
import { clamp } from "@/lib/utils";

/** Pointer velocity, shared by the engine and the particle fields (wind). */
export const ptr = { x: 0.5, y: 0.5, vx: 0, vy: 0 };

const LEAF_COLS = ["#ff7a1f", "#ff9a3c", "#e0541a", "#c4281f", "#ffb347", "#b3380f", "#ff6a1a"];

/* ── sprites ─────────────────────────────────────────────────────────────── */

function glowSprite(rgb: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.35, `rgba(${rgb},.45)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

function leafSprite(col: string, blur = 0, size = 96) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  x.translate(size / 2, size / 2);
  x.scale(size / 62, size / 62);
  const g = x.createLinearGradient(-22, -22, 22, 24);
  g.addColorStop(0, col);
  g.addColorStop(1, "rgba(40,6,2,.95)");
  if (blur) x.filter = `blur(${blur}px)`;
  x.fillStyle = g;
  x.fill(new Path2D(MAPLE));
  if (!blur) {
    x.strokeStyle = "rgba(255,230,170,.55)";
    x.lineWidth = 0.9;
    x.beginPath();
    x.moveTo(0, 24);
    x.lineTo(0, -16);
    x.moveTo(0, 4);
    x.lineTo(-12, -6);
    x.moveTo(0, 4);
    x.lineTo(12, -6);
    x.stroke();
  }
  return c;
}

export type GlowName = "gold" | "hot" | "white" | "red";
type LeafLayer = "far" | "mid" | "near";

let glows: Record<GlowName, HTMLCanvasElement> | null = null;
export function glow(): Record<GlowName, HTMLCanvasElement> {
  return (glows ??= {
    gold: glowSprite("255,190,90"),
    hot: glowSprite("255,120,30"),
    white: glowSprite("255,244,210"),
    red: glowSprite("220,60,20"),
  });
}

let leaves: Record<LeafLayer, HTMLCanvasElement[]> | null = null;
function leafSprites() {
  return (leaves ??= {
    far: LEAF_COLS.map((c) => leafSprite(c, 0, 48)),
    mid: LEAF_COLS.map((c) => leafSprite(c, 0, 80)),
    near: LEAF_COLS.map((c) => leafSprite(c, 3, 128)),
  });
}

/* ── particle fields ─────────────────────────────────────────────────────── */

export type FieldKind = "leaves" | "embers" | "dust" | "sparks";

export interface FieldOptions {
  /** Draw in the canvas's own pixel grid (1600×900) instead of CSS pixels. */
  fixed?: boolean;
  /** Per-layer counts, e.g. [["far", 36]]. */
  mix?: [LeafLayer, number][];
  layer?: LeafLayer;
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  sw: number;
  ph: number;
  f: number;
  rot: number;
  vr: number;
  fl: number;
  fs: number;
  size: number;
  spr: HTMLCanvasElement | null;
  a: number;
  layer: LeafLayer;
  tw: number;
  col: GlowName;
  life: number;
  max: number;
  dead: boolean;
}

const blank = (): Particle => ({
  x: 0, y: 0, vx: 0, vy: 0, z: 0, sw: 0, ph: 0, f: 0, rot: 0, vr: 0, fl: 0, fs: 0,
  size: 0, spr: null, a: 1, layer: "mid", tw: 0, col: "white", life: 0, max: 0, dead: false,
});

export class Field {
  c: HTMLCanvasElement;
  x: CanvasRenderingContext2D;
  kind: FieldKind;
  o: FieldOptions;
  items: Particle[] = [];
  t = 0;
  fixed: boolean;
  W = 0;
  H = 0;
  dpr = 1;

  constructor(canvas: HTMLCanvasElement, kind: FieldKind, o: FieldOptions = {}) {
    this.c = canvas;
    this.x = canvas.getContext("2d")!;
    this.kind = kind;
    this.o = o;
    this.fixed = !!o.fixed;
    this.resize();
    this.seed(o.count);
  }

  resize() {
    if (this.fixed) {
      this.W = this.c.width;
      this.H = this.c.height;
      this.dpr = 1;
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const r = this.c.getBoundingClientRect();
    this.W = this.c.width = Math.max(2, Math.round(r.width * dpr));
    this.H = this.c.height = Math.max(2, Math.round(r.height * dpr));
    this.dpr = dpr;
  }

  private mk(init: boolean, layerOverride?: LeafLayer): Particle {
    const W = this.W;
    const H = this.H;
    const R = Math.random;
    const p = blank();
    const k = this.kind;
    if (k === "leaves") {
      const layer = layerOverride || this.o.layer || "mid";
      const z = layer === "far" ? R() * 0.35 : layer === "near" ? 0.75 + R() * 0.25 : 0.35 + R() * 0.4;
      const size =
        (layer === "far" ? 10 + R() * 14 : layer === "near" ? 58 + R() * 70 : 22 + R() * 26) *
        (this.fixed ? 1 : Math.max(0.7, H / 900)) *
        (this.fixed ? 1 : this.dpr);
      p.x = R() * W;
      p.y = init ? R() * H : -size * 2;
      p.z = z;
      p.vy = (18 + R() * 28) * (0.5 + z) * (this.dpr || 1);
      p.sw = 20 + R() * 40;
      p.ph = R() * TAU;
      p.f = 0.4 + R() * 0.8;
      p.rot = R() * TAU;
      p.vr = (R() - 0.5) * 1.6;
      p.fl = R() * TAU;
      p.fs = 1 + R() * 2.5;
      p.size = size;
      p.spr = leafSprites()[layer][(R() * LEAF_COLS.length) | 0];
      p.a = layer === "near" ? 0.9 : layer === "far" ? 0.55 : 0.8;
      p.layer = layer;
    } else if (k === "embers") {
      p.x = R() * W;
      p.y = init ? R() * H : H + 10;
      p.vy = -(14 + R() * 38) * this.dpr;
      p.sw = 12 + R() * 30;
      p.ph = R() * TAU;
      p.f = 0.5 + R() * 1.3;
      p.size = (2 + R() * 5) * this.dpr;
      p.a = 0.3 + R() * 0.7;
      p.tw = R() * TAU;
      p.col = R() < 0.7 ? "gold" : R() < 0.5 ? "hot" : "white";
    } else if (k === "dust") {
      p.x = R() * W;
      p.y = R() * H;
      p.vy = -(3 + R() * 8) * this.dpr;
      p.sw = 6 + R() * 14;
      p.ph = R() * TAU;
      p.f = 0.2 + R() * 0.5;
      p.size = (1 + R() * 2.6) * this.dpr;
      p.a = 0.15 + R() * 0.35;
      p.tw = R() * TAU;
      p.col = "white";
    } else {
      p.x = R() * W;
      p.y = H + 20;
      p.dead = true;
    }
    return p;
  }

  private seed(n?: number) {
    if (this.o.mix) {
      this.items = [];
      for (const [l, c] of this.o.mix) for (let i = 0; i < c; i++) this.items.push(this.mk(true, l));
      return;
    }
    const d = { leaves: 30, embers: 46, dust: 48, sparks: 90 }[this.kind];
    const count = n || d;
    this.items = Array.from({ length: count }, () => this.mk(true));
  }

  /** Throw a handful of sparks from (x, y) — sparks fields only. */
  burst(x: number, y: number, n = 24, o: { cone?: number; speed?: number } = {}) {
    if (this.kind !== "sparks") return;
    const dpr = this.dpr || 1;
    let made = 0;
    for (const p of this.items) {
      if (made >= n) break;
      if (!p.dead) continue;
      made++;
      const a = o.cone ? -Math.PI / 2 + (Math.random() - 0.5) * o.cone : Math.random() * TAU;
      const s = (o.speed || 260) * (0.3 + Math.random()) * dpr;
      Object.assign(p, {
        dead: false,
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0,
        max: 0.7 + Math.random() * 1.1,
        size: (2 + Math.random() * 4) * dpr,
        col: Math.random() < 0.6 ? "gold" : Math.random() < 0.5 ? "hot" : "white",
      });
    }
  }

  update(dt: number) {
    const x = this.x;
    const W = this.W;
    const H = this.H;
    const G = glow();
    this.t += dt;
    x.clearRect(0, 0, W, H);
    const wind = ptr.vx * (this.dpr || 1) * (this.kind === "leaves" ? 160 : 30);
    for (const p of this.items) {
      if (this.kind === "leaves") {
        p.y += p.vy * dt;
        p.x += (Math.sin(this.t * p.f + p.ph) * p.sw + wind * (0.3 + p.z)) * dt;
        p.rot += p.vr * dt + ptr.vx * 0.02;
        p.fl += p.fs * dt;
        const m = p.size * 1.5;
        if (p.y > H + m) Object.assign(p, this.mk(false, p.layer));
        if (p.x < -m) p.x = W + m;
        else if (p.x > W + m) p.x = -m;
        x.save();
        x.translate(p.x, p.y);
        x.rotate(p.rot);
        x.scale(Math.cos(p.fl) * 0.8 + (Math.cos(p.fl) < 0 ? -0.2 : 0.2), 1);
        x.globalAlpha = p.a;
        if (p.spr) x.drawImage(p.spr, -p.size / 2, -p.size / 2, p.size, p.size);
        x.restore();
      } else if (this.kind === "sparks") {
        if (p.dead) continue;
        p.life += dt;
        if (p.life > p.max) {
          p.dead = true;
          continue;
        }
        p.vy += 380 * dt * (this.dpr || 1);
        p.vx *= 1 - 1.4 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const a = 1 - p.life / p.max;
        x.globalCompositeOperation = "lighter";
        x.globalAlpha = a;
        const s = p.size * (2 + a * 3);
        x.drawImage(G[p.col], p.x - s, p.y - s, s * 2, s * 2);
        x.globalCompositeOperation = "source-over";
      } else {
        // embers + dust
        p.y += p.vy * dt;
        p.x += Math.sin(this.t * p.f + p.ph) * p.sw * dt + wind * 0.05 * dt;
        p.tw += dt * 2;
        if (p.y < -20) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        const a = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        x.globalCompositeOperation = "lighter";
        x.globalAlpha = a;
        const s = p.size * (this.kind === "embers" ? 3.2 : 2.4);
        x.drawImage(G[p.col], p.x - s, p.y - s, s * 2, s * 2);
        x.globalCompositeOperation = "source-over";
      }
    }
    x.globalAlpha = 1;
  }
}

/* ── twinkling bulbs / stars / lighters, painted on one canvas per cluster ── */

const hexRGB = (h: string) => {
  let s = h.replace("#", "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)).join(",");
};
const bulbSprites: Record<string, HTMLCanvasElement> = {};
const bulbSprite = (c: string) => (bulbSprites[c] ??= glowSprite(hexRGB(c), 64));

export class Lights {
  c: HTMLCanvasElement;
  x: CanvasRenderingContext2D;
  items: LightItem[];
  t = 0;
  bw: number;
  bh: number;
  r = 1;

  constructor(canvas: HTMLCanvasElement, items: LightItem[]) {
    this.c = canvas;
    this.x = canvas.getContext("2d")!;
    this.items = items;
    this.bw = canvas.width;
    this.bh = canvas.height;
    this.resize();
  }

  /** Match the canvas resolution to how large the stage is drawn. */
  resize() {
    const st = this.c.closest(".stage");
    const k = st ? parseFloat(getComputedStyle(st).getPropertyValue("--k")) || 1 : 1;
    const r = clamp(k * Math.min(window.devicePixelRatio || 1, 1.5), 1, 2);
    if (Math.abs(r - this.r) < 0.05 && this.c.width !== this.bw) return;
    this.r = r;
    this.c.width = Math.round(this.bw * r);
    this.c.height = Math.round(this.bh * r);
    this.x.setTransform(r, 0, 0, r, 0, 0);
  }

  update(dt: number) {
    this.t += dt;
    const x = this.x;
    const T = this.t;
    const G = glow();
    const y0 = +(this.c.dataset.y0 || 0);
    x.clearRect(0, 0, this.bw, this.bh);
    for (const p of this.items) {
      const a = 0.5 + 0.5 * Math.sin((T * TAU) / p.du + p.ph);
      const X = p.x;
      const Y = p.y - y0;
      if (p.k === "star") {
        x.globalAlpha = 0.2 + 0.8 * a * a;
        x.fillStyle = p.c;
        x.beginPath();
        x.arc(X, Y, p.r, 0, TAU);
        x.fill();
      } else if (p.k === "bulb") {
        x.globalCompositeOperation = "lighter";
        x.globalAlpha = 0.3 + 0.7 * a;
        const g = p.r * 4.2;
        x.drawImage(bulbSprite(p.c), X - g, Y - g, g * 2, g * 2);
        x.globalAlpha = 0.55 + 0.45 * a;
        x.drawImage(G.white, X - p.r * 1.5, Y - p.r * 1.5, p.r * 3, p.r * 3);
        x.globalCompositeOperation = "source-over";
      } else {
        const fl = 0.85 + 0.22 * Math.sin(((T * TAU) / p.du) * 2.3 + p.ph) + 0.1 * Math.sin(T * 11 + p.ph * 3);
        const R = p.r * 1.35;
        x.globalCompositeOperation = "lighter";
        x.globalAlpha = 0.55 * fl;
        x.drawImage(G.gold, X - R, Y - R, R * 2, R * 2);
        x.globalCompositeOperation = "source-over";
        x.globalAlpha = 1;
        const h = 24 * p.s * fl;
        const w = 7 * p.s;
        const l = Math.sin(T * 7 + p.ph) * 2.4 * p.s;
        x.fillStyle = "#ff8a2a";
        x.beginPath();
        x.moveTo(X + l, Y - h);
        x.quadraticCurveTo(X + w + l * 0.4, Y - h * 0.35, X, Y);
        x.quadraticCurveTo(X - w + l * 0.4, Y - h * 0.35, X + l, Y - h);
        x.fill();
        x.fillStyle = "#ffe29a";
        x.beginPath();
        x.moveTo(X + l * 0.8, Y - h * 0.62);
        x.quadraticCurveTo(X + w * 0.55, Y - h * 0.25, X, Y - 1);
        x.quadraticCurveTo(X - w * 0.55, Y - h * 0.25, X + l * 0.8, Y - h * 0.62);
        x.fill();
      }
    }
    x.globalAlpha = 1;
  }
}

/* ── cursor ──────────────────────────────────────────────────────────────── */

/** Custom cursor: a dot that sticks to the pointer plus a ring that trails it (GSAP quickTo). */
export function initCursor(el: HTMLElement | null): () => void {
  if (!el || matchMedia("(hover:none)").matches) return () => {};
  const root = document.documentElement;
  root.classList.add("has-cursor");
  const label = el.querySelector("b") as HTMLElement;
  const dot = el.querySelector<HTMLElement>(".c-dot")!;
  const ring = el.querySelector<HTMLElement>(".c-ring")!;
  let seen = false;

  const dx = gsap.quickSetter(dot, "x", "px");
  const dy = gsap.quickSetter(dot, "y", "px");
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
  const press = gsap.quickTo(ring, "scale", { duration: 0.35, ease: "power3.out" });

  const move = (e: PointerEvent) => {
    dx(e.clientX);
    dy(e.clientY);
    if (!seen) {
      seen = true;
      el.classList.add("on");
      gsap.set(ring, { x: e.clientX, y: e.clientY });
    } else {
      rx(e.clientX);
      ry(e.clientY);
    }
    const t = (e.target as Element | null)?.closest?.("[data-cursor],a,button");
    if (t) {
      const l = t.getAttribute("data-cursor");
      if (l) {
        label.textContent = l;
        el.classList.add("hot");
      } else el.classList.remove("hot");
    } else el.classList.remove("hot");
  };
  const down = () => press(0.84);
  const up = () => press(1);
  const leave = () => el.classList.remove("on");
  const enter = () => seen && el.classList.add("on");

  addEventListener("pointermove", move, { passive: true });
  addEventListener("pointerdown", down);
  addEventListener("pointerup", up);
  document.addEventListener("mouseleave", leave);
  document.addEventListener("mouseenter", enter);

  return () => {
    removeEventListener("pointermove", move);
    removeEventListener("pointerdown", down);
    removeEventListener("pointerup", up);
    document.removeEventListener("mouseleave", leave);
    document.removeEventListener("mouseenter", enter);
    root.classList.remove("has-cursor");
  };
}

/**
 * Tilt an element toward the pointer with a springy follow. It owns the element's whole
 * transform: `base` is the resting rotation, `perspective` (px) makes the tilt read as 3D.
 * `shine` also feeds --mx/--my (percent) for the highlight that rides across the surface.
 */
export function tilt(
  el: HTMLElement | null,
  { max = 9, base = 0, perspective, target, shine }: { max?: number; base?: number; perspective?: number; target?: HTMLElement; shine?: HTMLElement } = {},
) {
  if (!el) return () => {};
  const t = target || el;
  gsap.set(t, { rotation: base, transformPerspective: perspective ?? 0 });
  const o = { duration: 0.8, ease: "power3.out" };
  const rx = gsap.quickTo(t, "rotationX", o);
  const ry = gsap.quickTo(t, "rotationY", o);
  if (shine) gsap.set(shine, { "--mx": "30%", "--my": "20%" }); // units for the quickTo below
  const mx = shine ? gsap.quickTo(shine, "--mx", o) : null;
  const my = shine ? gsap.quickTo(shine, "--my", o) : null;
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry((px - 0.5) * 2 * max);
    rx((0.5 - py) * 2 * max);
    mx?.(px * 100);
    my?.(py * 100);
  };
  const leave = () => {
    rx(0);
    ry(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/** A button that leans a little toward the pointer while it hovers. */
export function magnet(el: HTMLElement, strength = 0.28) {
  const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
  const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - (r.left + r.width / 2)) * strength);
    y((e.clientY - (r.top + r.height / 2)) * strength - 2);
  };
  const leave = () => {
    x(0);
    y(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
    gsap.set(el, { x: 0, y: 0 });
  };
}
