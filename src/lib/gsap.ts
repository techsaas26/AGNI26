/**
 * GSAP, registered once. Every animation on the page goes through this module so the
 * defaults, plugins and the motion language (the named eases below) stay in one place.
 *
 * Safe to import during SSR: nothing touches `window` until a client effect runs.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ ease: "power3.out", duration: 1 });
  // Lenis owns the scroll position; stop the touch address-bar resize from refreshing every trigger.
  ScrollTrigger.config({ ignoreMobileResize: true });
  // handy in the console while developing: __gsap.gsap.globalTimeline, __gsap.ScrollTrigger.getAll()
  if (process.env.NODE_ENV !== "production") (window as unknown as { __gsap: unknown }).__gsap = { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

/** The motion language: one family of eases, used everywhere. */
export const EASE = {
  /** Things arriving: a fast start that settles softly. */
  enter: "expo.out",
  /** Smaller UI moves. */
  soft: "power3.out",
  /** Two-sided moves (scroll jumps, curtains). */
  inOut: "power3.inOut",
  /** Props that land with a little life in them. */
  pop: "back.out(2)",
  spring: "elastic.out(1, 0.42)",
  /** Ambient loops. */
  breathe: "sine.inOut",
} as const;

export type Tween = gsap.core.Tween;
export type Timeline = gsap.core.Timeline;
