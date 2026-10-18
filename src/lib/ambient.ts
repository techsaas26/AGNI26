/**
 * The things that never stop moving: flames, beams, twinkles, grain, the projector's jitter.
 * They were CSS keyframes; here they are GSAP tweens so the whole page shares one clock and
 * one set of eases. Each loop is handed to `reg` so the engine can pause it while its scene
 * is off screen.
 */
import { gsap, EASE } from "@/lib/gsap";

export type Register = (anim: gsap.core.Animation, el: Element | null) => void;

/** A CSS custom property as a number ("-1.5s" → -1.5, "2.6deg" → 2.6). */
const cssNum = (el: Element, name: string, d: number) => {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(v) ? v : d;
};

/** Start a repeating animation part-way through, like a negative CSS animation-delay. */
const phase = <T extends gsap.core.Animation>(a: T, seconds: number) => {
  if (seconds) a.totalTime(Math.abs(seconds));
  return a;
};

/** Grain jumps to a new offset ten times a second. */
const GRAIN: [number, number][] = [
  [0, 0],
  [-4, 3],
  [3, -5],
  [-6, -2],
  [5, 4],
  [-2, 6],
  [4, -3],
];

/** A candle flame: a quick, uneven lick of scale and lean, anchored at its base. */
export function flicker(el: Element, dur = 1.4, offset = 0) {
  const k = dur / 1.4;
  gsap.set(el, { transformOrigin: "50% 100%" });
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: EASE.breathe } });
  tl.to(el, { scaleX: 0.94, scaleY: 1.08, skewX: -2, duration: 0.28 * k })
    .to(el, { scaleX: 1.05, scaleY: 0.94, skewX: 2.5, duration: 0.35 * k })
    .to(el, { scaleX: 0.97, scaleY: 1.1, skewX: -1, duration: 0.35 * k })
    .to(el, { scaleX: 1, scaleY: 1, skewX: 0, duration: 0.42 * k });
  return phase(tl, offset);
}

export function ambient(reg: Register) {
  const all = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel);
  const loop = (a: gsap.core.Animation, el: Element | null) => reg(a, el);

  // film grain over the whole page, and over the movie screen (that one sleeps with its scene)
  all(".fx-grain").forEach((g) => {
    const tl = gsap.timeline({ repeat: -1 });
    GRAIN.forEach(([x, y], i) => tl.set(g, { xPercent: x, yPercent: y }, i * 0.1));
    tl.to({}, { duration: 0.1 });
    loop(tl, g.closest("[data-scene]") ? g : null);
  });

  // the little flame in the nav brand
  all(".nb-mark").forEach((m) => loop(flicker(m, 1.6), null));

  // hero: sun pulse, god rays, the sheen that crosses the logo
  all(".sun").forEach((s) => loop(gsap.fromTo(s, { opacity: 0.75 }, { opacity: 1, duration: 3.5, ease: EASE.breathe, repeat: -1, yoyo: true }), s));
  all(".godrays").forEach((g) =>
    loop(
      gsap.fromTo(g, { rotation: -1.4, opacity: 0.4 }, { rotation: 1.4, opacity: 0.7, duration: 14, ease: EASE.breathe, repeat: -1, yoyo: true }),
      g,
    ),
  );
  all(".logo-sheen b").forEach((b) =>
    loop(gsap.fromTo(b, { xPercent: -130, skewX: -12 }, { xPercent: 430, skewX: -12, duration: 3.6, ease: "none", repeat: -1 }), b),
  );

  // the "scroll" mouse wheel
  all(".mouse i").forEach((w) =>
    loop(gsap.fromTo(w, { y: 0, opacity: 1 }, { y: 11, opacity: 0, duration: 1.8, ease: "power2.out", repeat: -1 }), w),
  );

  // pulsing dots next to the hints
  all(".hint i, .reel-hint i").forEach((d) =>
    loop(gsap.fromTo(d, { opacity: 0.25, scale: 0.7 }, { opacity: 1, scale: 1.3, duration: 0.8, ease: EASE.breathe, repeat: -1, yoyo: true }), d),
  );

  // stage beams swing back and forth (their own composited elements)
  all<SVGElement | HTMLElement>(".beam").forEach((b) => {
    const svg = b.tagName.toLowerCase() === "svg";
    const dur = svg ? cssNum(b, "--dur", 7) : 9;
    const dl = svg ? cssNum(b, "--dl", 0) : 0;
    const oy = cssNum(b, "--oy", 64);
    gsap.set(b, { transformOrigin: svg ? `450px ${oy}px` : "0 0" });
    loop(phase(gsap.fromTo(b, { rotation: -9 }, { rotation: 9, duration: dur, ease: EASE.breathe, repeat: -1, yoyo: true }), dl), b);
  });

  // chenda lamp flames: lit by the controller, flickering all the time
  all(".flick").forEach((f) => loop(flicker(f, 1.4, cssNum(f, "--dl", 0)), f));

  // the bioscope's lantern
  all(".flicker").forEach((f) => {
    const tl = gsap.timeline({ repeat: -1 });
    (
      [
        [0.258, 0.86],
        [0.344, 1],
        [1.333, 0.93],
        [1.419, 1],
        [2.451, 0.82],
        [2.537, 0.97],
        [3.569, 0.9],
        [3.655, 1],
      ] as const
    ).forEach(([t, o]) => tl.set(f, { opacity: o }, t));
    tl.to({}, { duration: 4.3 - 3.655 });
    loop(tl, f);
  });

  // twinkling red lamps on the CRT
  all(".tw").forEach((t) => {
    const dur = cssNum(t, "--dur", 3);
    loop(phase(gsap.fromTo(t, { opacity: 0.25 }, { opacity: 1, duration: dur / 2, ease: EASE.breathe, repeat: -1, yoyo: true }), cssNum(t, "--dl", 0)), t);
  });

  // Polaroids pinned to the fashion wire sway
  all<HTMLElement>(".pol").forEach((p) => {
    const r = cssNum(p, "--r", 0);
    const amp = cssNum(p, "--amp", 3);
    gsap.set(p, { transformOrigin: "50% -8px" });
    loop(
      phase(
        gsap.fromTo(p, { rotation: r - amp }, { rotation: r + amp, duration: cssNum(p, "--dur", 4), ease: EASE.breathe, repeat: -1, yoyo: true }),
        cssNum(p, "--dl", 0),
      ),
      p,
    );
  });

  // movie night: projector jitter and the cigarette-burn cue
  all(".mv-film").forEach((f) => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(f, { x: 0, y: 0, opacity: 1 }, 0)
      .set(f, { x: 1, y: -1, opacity: 0.88 }, 0.096)
      .set(f, { opacity: 1 }, 0.144)
      .set(f, { x: -1, y: 1 }, 0.48)
      .set(f, { x: 0, y: 0, opacity: 0.92 }, 0.528)
      .set(f, { opacity: 1 }, 0.6)
      .to({}, { duration: 0.6 });
    loop(tl, f);
  });
  all(".mv-cue").forEach((c) => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(c, { opacity: 0.9 }, 8.01).set(c, { opacity: 0 }, 8.28).to({}, { duration: 0.72 });
    loop(tl, c);
  });

  // CRT scanlines crawl
  all(".crt-scan").forEach((s) =>
    loop(gsap.fromTo(s, { backgroundPositionY: "0px" }, { backgroundPositionY: "60px", duration: 7, ease: "none", repeat: -1 }), s),
  );

  // the marching dashes on the cassette's tape
  all<SVGElement>(".march").forEach((p) =>
    loop(gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -80, duration: 2.4, ease: "none", repeat: -1 }), p),
  );
}
