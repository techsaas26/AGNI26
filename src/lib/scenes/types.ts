import type { Field } from "@/lib/fx";

/** What a scene controller may ask of the engine. All values are live (re-measured on resize). */
export interface SceneEnv {
  vw(): number;
  vh(): number;
  /**
   * The scene's place on the scroll, in px. It `appear`s when the cut into it begins, has
   * `arrive`d when that cut ends, holds the screen until `leave`, and is `gone` when the cut out
   * of it ends. `arrive → leave` is its beat.
   */
  appear(): number;
  arrive(): number;
  leave(): number;
  gone(): number;
  reduce: boolean;
  /** Pause this loop while the scene is off screen. */
  hold(anim: gsap.core.Animation): void;
}

/**
 * Behaviour of one scene. `tick` runs every frame while the scene is on screen; `enter` when it
 * takes the screen over (half-way through the cut into it) and `leave` when it hands it on.
 * Scroll-linked motion is made with ScrollTrigger inside `setup*`; the engine reverts all of it
 * when the page is torn down.
 */
export interface SceneController {
  tick?(dt: number, t: number): void;
  enter?(): void;
  leave?(): void;
  /** Hands over the scene's particle field (sparks) so it can emit bursts. */
  bindField?(field: Field): void;
  destroy(): void;
}

export const byId = <T extends Element = HTMLElement>(id: string) => document.getElementById(id) as T | null;

/** Collects event listeners so a controller can remove them all in `destroy()`. */
export function listeners() {
  const offs: (() => void)[] = [];
  return {
    on(target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) {
      target.addEventListener(type, fn, opts);
      offs.push(() => target.removeEventListener(type, fn, opts));
    },
    /** Register an arbitrary cleanup (timers, DOM nodes…). */
    add(off: () => void) {
      offs.push(off);
    },
    clear() {
      offs.splice(0).forEach((off) => off());
    },
  };
}

export const store = {
  get(k: string, d: string) {
    try {
      return localStorage.getItem(k) ?? d;
    } catch {
      return d;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage unavailable */
    }
  },
};
