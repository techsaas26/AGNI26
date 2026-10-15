/**
 * The cuts between scenes, in four families chosen by how the two scenes relate: a memory dissolve
 * (connected memories), a film cut (a decisive frame advance, then stillness), a light reveal (the
 * new scene found through a bloom) and a physical handoff (paper pulled up over the last scene).
 * The credits are reached through a dip to dark. The old scene always sinks as it is covered.
 *
 * How a cut works: the scenes are full-screen fixed layers (see `html.staged` in globals.css).
 * `build()` fills a GSAP timeline that the engine scrubs from 0 to 1 with scroll. Everything here
 * moves only transforms and opacity, so the compositor does the work and nothing is repainted or
 * re-laid-out while two illustrated scenes share the screen. Every tween states both ends, so a
 * cut is the same picture at the same progress however the page got there.
 */
import { gsap } from "@/lib/gsap";

export interface CutCtx {
  /** Scrubbed by scroll, 0 → 1 over the cut. */
  tl: gsap.core.Timeline;
  /** The scene that leaves and the scene that arrives. */
  a: HTMLElement;
  b: HTMLElement;
  /** This cut's own overlay box; hidden unless the cut is on screen. */
  ov: HTMLElement;
  /** A black sheet inside the leaving scene, for it to sink into. */
  dim: HTMLElement;
  vw(): number;
  vh(): number;
}

export interface Cut {
  name: string;
  build(c: CutCtx): void;
}

type V = gsap.TweenVars;

/** A tween that owns one stretch of the cut: both ends stated, nothing rendered before its time. */
const seg = (c: CutCtx, target: gsap.TweenTarget, t0: number, t1: number, from: V, to: V, ease = "none") =>
  c.tl.fromTo(target, from, { ...to, duration: t1 - t0, ease, immediateRender: false }, t0);

type Axis = "y" | "x";

/** Depth: each parallax plane of both scenes drifts sideways by its own amount (near planes further). */
const depth3d = (c: CutCtx, dir: 1 | -1) => {
  c.b.querySelectorAll<HTMLElement>("[data-depth]").forEach((p) => {
    seg(c, p, 0, 1, { x: dir * +(p.dataset.depth || 0.2) * 320 }, { x: 0 });
  });
  c.a.querySelectorAll<HTMLElement>("[data-depth]").forEach((p) => {
    seg(c, p, 0, 1, { x: 0 }, { x: -dir * +(p.dataset.depth || 0.2) * 200 });
  });
};

/** The new scene is simply there at the end of the cut, however it got there. */
const settle = (c: CutCtx) => c.tl.set(c.b, { opacity: 1, scale: 1 }, 1);

/**
 * MEMORY DISSOLVE — a gentle crossfade between connected memories. The old scene breathes out
 * while the new one breathes in; nothing slides.
 */
const memory = (aScale = 1.05, bScale = 1.04, dim = 0.55): Cut => ({
  name: "memory",
  build(c) {
    seg(c, c.a, 0, 1, { scale: 1 }, { scale: aScale });
    seg(c, c.dim, 0, 1, { opacity: 0 }, { opacity: dim });
    c.tl.set(c.b, { opacity: 0 }, 0);
    seg(c, c.b, 0.15, 0.85, { opacity: 0, scale: bScale }, { opacity: 1, scale: 1 }, "power1.inOut");
    settle(c);
  },
});

/**
 * FILM CUT — a decisive frame advance: the new scene is on in the first half of the cut with a
 * small settle, then everything is still. Carried from below, or from the right.
 */
const filmcut = (axis: Axis): Cut => ({
  name: "filmcut",
  build(c) {
    const from = axis === "y" ? { yPercent: 100 } : { xPercent: 100 };
    const to = axis === "y" ? { yPercent: 0 } : { xPercent: 0 };
    seg(c, c.b, 0, 0.5, from, to, "power3.out");
    seg(c, c.b, 0.3, 0.6, { scale: 1.05 }, { scale: 1 }, "power2.out");
    seg(c, c.a, 0, 0.5, { yPercent: 0, xPercent: 0, scale: 1 }, axis === "y" ? { yPercent: -6, scale: 0.97 } : { xPercent: -10, scale: 0.97 }, "power2.out");
    seg(c, c.dim, 0, 0.5, { opacity: 0 }, { opacity: 0.85 }, "power2.out");
    if (axis === "x") depth3d(c, 1);
  },
});

/**
 * LIGHT REVEAL — a warm bloom opens at (x, y) and the new scene becomes visible through it.
 */
const light = (x: string, y: string): Cut => ({
  name: "light",
  build(c) {
    const f = document.createElement("div");
    f.className = "tfx-flare";
    f.style.left = x;
    f.style.top = y;
    c.ov.appendChild(f);
    seg(c, f, 0, 0.5, { scale: 0.05, opacity: 0 }, { scale: 1, opacity: 1 }, "power2.out");
    seg(c, f, 0.5, 1, { scale: 1, opacity: 1 }, { scale: 1.25, opacity: 0 }, "power2.in");
    seg(c, c.a, 0, 1, { scale: 1 }, { scale: 1.05 });
    seg(c, c.dim, 0, 1, { opacity: 0 }, { opacity: 0.4 });
    c.tl.set(c.b, { opacity: 0 }, 0);
    seg(c, c.b, 0.3, 0.8, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1 }, "power1.inOut");
    settle(c);
  },
});

/**
 * PHYSICAL HANDOFF — the next scene is a sheet of paper pulled up over the last, a little
 * crooked at first and settling flat (the programme, the postcard).
 */
const paper = (tilt: number): Cut => ({
  name: "paper",
  build(c) {
    seg(c, c.b, 0, 1, { yPercent: 100, rotation: tilt, transformOrigin: "50% 100%" }, { yPercent: 0, rotation: 0, transformOrigin: "50% 100%" }, "power1.out");
    seg(c, c.a, 0, 1, { yPercent: 0, scale: 1 }, { yPercent: -8, scale: 0.97 });
    seg(c, c.dim, 0, 1, { opacity: 0 }, { opacity: 0.7 });
  },
});

/** Into the credits: the reel runs out to dark and the credits come up out of it. */
const dip: Cut = {
  name: "dip",
  build(c) {
    seg(c, c.a, 0, 1, { scale: 1 }, { scale: 1.03 });
    seg(c, c.dim, 0, 0.5, { opacity: 0 }, { opacity: 0.96 }, "power1.in");
    c.tl.set(c.b, { opacity: 0 }, 0);
    seg(c, c.b, 0.5, 1, { opacity: 0 }, { opacity: 1 }, "power1.out");
    settle(c);
  },
};

const CUTS: Record<string, Cut> = {
  "hero>about": memory(1.06, 1.04, 0.5),
  "about>chenda": light("62%", "52%"),
  "chenda>concert": filmcut("y"),
  "concert>movie": light("68%", "42%"),
  "movie>talent": memory(),
  "talent>events": memory(1.03, 1.03, 0.8),
  "events>register": paper(3.5),
  "register>merch": filmcut("x"),
  "merch>gallery": memory(1.04, 1.05, 0.6),
  "gallery>team": dip,
  "team>contact": paper(-3),
};

/** Reduced motion: a plain dissolve. */
const dissolve: Cut = {
  name: "dissolve",
  build(c) {
    c.tl.set(c.b, { opacity: 0 }, 0);
    seg(c, c.b, 0.3, 0.7, { opacity: 0 }, { opacity: 1 }, "power1.inOut");
  },
};

/** The cut that joins two scenes. */
export const cutFor = (a: string, b: string, reduce: boolean): Cut => (reduce ? dissolve : (CUTS[`${a}>${b}`] ?? memory()));
