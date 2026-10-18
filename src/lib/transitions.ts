/**
 * The cuts between scenes, in families chosen by how the two scenes relate: a memory dissolve
 * (connected memories), a film cut (a decisive frame advance, then stillness), a curtain (the
 * stage opens on the ceremony), a projector (the lamp flares and the next reel is in the gate) and
 * a physical handoff (paper pulled up over the last scene). The credits are reached through a dip
 * to dark. The old scene always sinks as it is covered.
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

/**
 * What "not yet there" means for a scene that is covered while it waits: not quite zero, as with the
 * engine's own `is-warm` before a cut. A scene at exactly 0 can be dropped by the compositor and then
 * has to be painted again the moment it appears; at 1% it stays painted and still cannot be seen.
 */
const HIDDEN = 0.01;

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

/** An empty box in this cut's overlay, for the cut to dress. */
const dress = (c: CutCtx, cls: string) => {
  const d = document.createElement("div");
  d.className = cls;
  c.ov.appendChild(d);
  return d;
};

/**
 * CURTAIN — a velvet curtain draws shut over the old scene and parts on the new one: the ceremony
 * opens. The scenes change while the cloth is shut; the new scene settles back from a slight push
 * as it is uncovered, its planes drifting into place. Two panels, transform and opacity only.
 */
const curtain: Cut = {
  name: "curtain",
  build(c) {
    const l = dress(c, "tfx-curtain tfx-curtain--l");
    const r = dress(c, "tfx-curtain tfx-curtain--r");
    seg(c, l, 0, 0.4, { xPercent: -102 }, { xPercent: 0 }, "power2.inOut");
    seg(c, r, 0, 0.4, { xPercent: 102 }, { xPercent: 0 }, "power2.inOut");
    seg(c, c.a, 0, 0.4, { scale: 1 }, { scale: 1.05 }, "power1.in");
    seg(c, c.dim, 0, 0.4, { opacity: 0 }, { opacity: 0.6 });
    c.tl.set(c.b, { opacity: HIDDEN }, 0);
    seg(c, c.b, 0.42, 0.44, { opacity: HIDDEN }, { opacity: 1 });
    seg(c, l, 0.46, 1, { xPercent: 0 }, { xPercent: -102 }, "power2.inOut");
    seg(c, r, 0.46, 1, { xPercent: 0 }, { xPercent: 102 }, "power2.inOut");
    seg(c, c.b, 0.4, 1, { scale: 1.08 }, { scale: 1 }, "power2.out");
    c.b.querySelectorAll<HTMLElement>("[data-depth]").forEach((p) => seg(c, p, 0.4, 1, { x: +(p.dataset.depth || 0.2) * 260 }, { x: 0 }, "power2.out"));
    settle(c);
  },
};

/**
 * PROJECTOR — widescreen bars close in, the lamp flares behind an anamorphic streak and the next
 * reel is there, flickering and slipping into the gate. Four thin overlays, transform and opacity only.
 */
const projector: Cut = {
  name: "projector",
  build(c) {
    const top = dress(c, "tfx-bar tfx-bar--t");
    const bottom = dress(c, "tfx-bar tfx-bar--b");
    const streak = dress(c, "tfx-streak");
    const bloom = dress(c, "tfx-bloom");
    // the bars close in and the lamp builds on the old scene …
    seg(c, top, 0, 0.3, { yPercent: -100 }, { yPercent: 0 }, "power3.out");
    seg(c, bottom, 0, 0.3, { yPercent: 100 }, { yPercent: 0 }, "power3.out");
    seg(c, c.a, 0, 0.5, { scale: 1 }, { scale: 1.08 }, "power2.in");
    seg(c, c.dim, 0, 0.5, { opacity: 0 }, { opacity: 0.5 });
    seg(c, bloom, 0.32, 0.5, { opacity: 0 }, { opacity: 1 }, "power2.in");
    seg(c, streak, 0.36, 0.5, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1 }, "power2.out");
    // … the reel changes under the flash …
    c.tl.set(c.b, { opacity: HIDDEN }, 0);
    seg(c, c.b, 0.46, 0.5, { opacity: HIDDEN }, { opacity: 1 });
    // … and as it dies the new picture flickers and slips into the gate, and the bars part
    seg(c, bloom, 0.5, 0.8, { opacity: 1 }, { opacity: 0 }, "power2.out");
    seg(c, streak, 0.5, 0.72, { scaleX: 1, opacity: 1 }, { scaleX: 1.15, opacity: 0 }, "power1.in");
    seg(c, c.b, 0.46, 1, { scale: 1.09 }, { scale: 1 }, "power3.out");
    seg(c, c.b, 0.5, 0.78, { yPercent: 2.5 }, { yPercent: 0 }, "back.out(2.4)");
    seg(c, c.b, 0.5, 0.54, { opacity: 1 }, { opacity: 0.84 });
    seg(c, c.b, 0.54, 0.58, { opacity: 0.84 }, { opacity: 1 });
    seg(c, c.b, 0.58, 0.62, { opacity: 1 }, { opacity: 0.92 });
    seg(c, c.b, 0.62, 0.66, { opacity: 0.92 }, { opacity: 1 });
    seg(c, top, 0.72, 1, { yPercent: 0 }, { yPercent: -100 }, "power2.inOut");
    seg(c, bottom, 0.72, 1, { yPercent: 0 }, { yPercent: 100 }, "power2.inOut");
    settle(c);
  },
};

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
  "about>chenda": curtain,
  "chenda>movie": projector,
  "movie>concert": filmcut("y"),
  "concert>talent": memory(),
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
