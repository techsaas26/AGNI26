/**
 * Small bridge between the imperative engine and React components.
 * Kept separate from the engine so server-rendered components can import it cheaply.
 */

/** Which top-bar link lights up for each scene. */
export const SPY: Record<string, string | undefined> = {
  hero: "home",
  about: "about",
  concert: "events",
  movie: "events",
  talent: "events",
  chenda: "events",
  events: "events",
  gallery: "gallery",
  contact: "contact",
};

/* ── which scene is active (read by the nav bar and the side rail) ───────── */

let activeScene = "hero";
const subscribers = new Set<() => void>();

export const sceneStore = {
  get: () => activeScene,
  getServer: () => "hero",
  set(name: string) {
    if (name === activeScene) return;
    activeScene = name;
    subscribers.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },
};

/* ── the engine, as seen from components ─────────────────────────────────── */

export interface EngineHandle {
  /** Pause / resume smooth scrolling (the mobile menu is open). */
  lock(locked: boolean): void;
  /** The loader's gate is opening — start scrolling and dolly the hero in. */
  open(): void;
}

let handle: EngineHandle | null = null;
export const setEngineHandle = (h: EngineHandle | null) => {
  handle = h;
};
export const getEngine = () => handle;
