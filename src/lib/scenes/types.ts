import type { Field } from "@/lib/fx";

export interface TickContext {
  vw: number;
  vh: number;
  /** 0→1 progress through a tall (pinned) scene. */
  prog: number;
}

/**
 * Behaviour of one scene. The engine calls `tick` every frame while the scene is on screen,
 * `leave` when it scrolls away and `enter` when it scrolls into view.
 */
export interface SceneController {
  tick?(dt: number, t: number, p: number, ctx: TickContext): void;
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
