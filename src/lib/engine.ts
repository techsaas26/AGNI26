/**
 * The projector — a GSAP rig.
 *
 * Once the engine runs (`html.staged`) each scene is a full-screen fixed layer and scroll drives
 * where everything is. Every scene gets a beat in which it holds the screen (`PACE[name][0]`
 * viewports of scroll, so its own animation and its props have room), then the next scene is pulled
 * up over it (`PACE[name][1]` viewports, one move for every pair: lib/transitions.ts). Lenis
 * supplies the smooth scroll position and is clocked by GSAP's ticker; ScrollTrigger scrubs the
 * cuts, the parallax, the copy and the per-scene scroll effects — nothing is time-triggered, so
 * what is on screen is always a function of where the scroll is — and one small state machine
 * (`state()`) decides each frame which layers are on screen.
 *
 * Sections declare themselves in the markup:
 *   [data-scene]   a scene (`data-fx` / `data-fw` frame its art on narrow screens)
 *   [data-depth]   a parallax plane inside a scene (`data-bleed`, `data-zoom`, `data-origin`)
 */
import Lenis from "lenis";
import { ambient } from "@/lib/ambient";
import { getLights } from "@/lib/art";
import { sfx } from "@/lib/audio";
import { Field, Lights, initCursor, magnet, ptr, type FieldKind, type FieldOptions } from "@/lib/fx";
import { EASE, gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { sceneStore, setEngineHandle } from "@/lib/scene-store";
import { setupAbout, setupContact, setupMerch, setupReel, setupToys } from "@/lib/scenes/misc";
import type { SceneController, SceneEnv } from "@/lib/scenes/types";
import { cutFor, type Cut, type CutCtx } from "@/lib/transitions";
import { clamp } from "@/lib/utils";

/* ── pacing ──────────────────────────────────────────────────────────────── */

/**
 * [beat, cut] per scene, in viewport heights of scroll: how long the scene holds the screen,
 * and how long the cut out of it lasts. Raise the first number to give a scene more time.
 * A scene's words are a timed animation that starts part-way into the cut that brings it in, so
 * the hold is also what keeps them from being pulled away mid-arrival: it has to outlast them at
 * an ordinary scrolling pace. The two cuts with the most choreography (the curtain out of About,
 * the projector out of Concert) are the longest.
 */
const PACE: Record<string, [beat: number, cut: number]> = {
  hero: [1.6, 1.8],
  about: [1.6, 2.2],
  chenda: [1.5, 1.7],
  concert: [1.5, 2.2],
  movie: [1.6, 1.8],
  talent: [1.5, 1.8],
  events: [1.5, 1.8],
  register: [1.6, 1.7],
  merch: [1.6, 1.8],
  gallery: [2.3, 1.8],
  team: [2, 1.8], // the crew is stepped through role by role (arrows or swipe), so it gets a little longer than a plain scene
  contact: [1.0, 0],
};
const DEFAULT_PACE: [number, number] = [1, 1];

/**
 * When each scene's copy starts: the share of the cut that brings the scene in. The copy is a short
 * timed animation, not a scrubbed one, so a single scroll into a scene plays all of it.
 */
const COPY_AT: Record<string, number> = { concert: 0.35, talent: 0.4, chenda: 0.35, merch: 0.3 };
const COPY_DEFAULT = 0.25;
/** The share of a scene's hold by which its timed arrival animations (words, cards, lighting) are finished, however fast the visitor scrolls. */
const DONE_BY = 0.5;
/** How long a scene's copy takes to arrive: its natural time stretched by COPY_SLOW, but never more than COPY_TIME seconds. */
const COPY_TIME = 2.8;
const COPY_SLOW = 1.4;

/** How much of the push-in and drift a scene gets (1 = the full amount): calm scenes hold nearly still. */
const CALM: Record<string, number> = { about: 0.45, movie: 0.5, talent: 0.4, register: 0.6, events: 0.6, merch: 0.5, contact: 0.3, concert: 1.2, chenda: 0.5 };

/** How far the nearest plane (depth 1) pushes in while its scene is on screen. */
const PUSH = 0.12;

/** Scroll drift of a plane, stage px per unit of depth (planes are over-scaled just enough to hide it). */
const DRIFT = 110;
/** How far each copy line travels relative to the rest: slower lines sit "further back". */
const COPY_DEPTH = [0.5, 1.4, 0.8, 0.6, 0.95, 1.2];

/** Pointer-parallax reach, percent of a plane (64px / 1600, 38px / 900). */
const PX = 2.5;
const PY = 2.6;

/* ── types ───────────────────────────────────────────────────────────────── */

interface Plane {
  el: HTMLElement;
  d: number;
  bleed: number;
  zoom: number;
  org: string;
  /** Pointer parallax: springy followers (percent of the 1600×900 plane). */
  qx: (v: number) => void;
  qy: (v: number) => void;
}

/** One line of copy, which leans away from the pointer by its own depth. */
interface Kid {
  el: HTMLElement;
  f: number;
  qx: (v: number) => void;
}

interface SceneState {
  el: HTMLElement;
  name: string;
  planes: Plane[];
  kids: Kid[];
  /** Horizontal focus point of the art, in stage px, used to frame it on narrow screens. */
  fx: number;
  /** Stage scale. */
  k: number;
  stage: HTMLElement | null;
  controller: SceneController | null;
  /** Ambient loops that only need to run while the scene is on screen. */
  loops: gsap.core.Animation[];
  vis: boolean;

  /** Scroll positions: starts to appear (the cut into it begins), has arrived, starts to leave, is gone. */
  appear: number;
  arrive: number;
  leave: number;
  gone: number;
  /** Content below the fold (contact; merch on phones): its beat scrolls through it. */
  ext: number;

}

interface CutState {
  a: SceneState;
  b: SceneState;
  cut: Cut;
  tl: gsap.core.Timeline;
  c: CutCtx;
  ov: HTMLElement;
}

interface Ticking {
  update(dt: number): void;
  resize(): void;
}

const FIELDS: Record<string, { kind: FieldKind; opts: FieldOptions; scene: string }> = {
  "leaves-far": { kind: "leaves", opts: { fixed: true, mix: [["far", 36]] }, scene: "hero" },
  "leaves-near": {
    kind: "leaves",
    opts: {
      mix: [
        ["near", 6],
        ["mid", 14],
      ],
    },
    scene: "hero",
  },
  "leaves-about": {
    kind: "leaves",
    opts: {
      fixed: true,
      mix: [
        ["far", 22],
        ["mid", 8],
      ],
    },
    scene: "about",
  },
};

/** Eases the hero's scroll progress: mostly linear with a soft shoulder. */
const heroEase = (p: number) => p * p * (3 - 2 * p) * 0.35 + p * 0.65;

/** How each kind of copy arrives: [from, to]. */
function reveal(n: HTMLElement): [gsap.TweenVars, gsap.TweenVars] {
  const c = n.classList;
  if (c.contains("rule")) return [{ scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1.3 }];
  if (c.contains("title"))
    return [
      { y: 44, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 },
    ];
  if (c.contains("eyebrow")) return [{ x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }];
  if (c.contains("hint")) return [{ y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }];
  if (c.contains("pc-wrap")) return [{ y: 54, rotationX: 14, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 1.4 }];
  return [{ y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }];
}

/* ── how copy arrives, scene by scene ───────────────────────────────────── */

type Style = (tl: gsap.core.Timeline, n: HTMLElement, i: number) => void;

/** Rules draw, eyebrows slide, everything else lifts a little: the plain arrival. */
const T_BASE: Style = (tl, n, i) => {
  const [from, to] = reveal(n);
  tl.fromTo(n, from, to, i * 0.095);
};
/** Headline word by word out of masks (the default). */
const T_WORDS: Style = (tl, n, i) => {
  const words = new SplitText(n, { type: "words", mask: "words" }).words;
  tl.set(n, { opacity: 1 }, i * 0.095);
  tl.fromTo(words, { yPercent: 130 }, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.07 }, i * 0.095);
};
/** Headline by phrase (its lines), each rising out of its own mask. */
const T_LINES: Style = (tl, n, i) => {
  const lines = new SplitText(n, { type: "lines", mask: "lines" }).lines;
  tl.set(n, { opacity: 1 }, i * 0.095);
  tl.fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.22 }, i * 0.095);
};
/** One decisive hit: in from the left, a touch large, and down to size. */
const T_PUNCH: Style = (tl, n, i) => {
  tl.fromTo(n, { opacity: 0, xPercent: -7, scale: 1.07, transformOrigin: "0 50%" }, { opacity: 1, xPercent: 0, scale: 1, duration: 0.55, ease: "power4.out" }, i * 0.05);
};
/** Projected light catching: it flutters up to full. */
const T_FLICKER: Style = (tl, n, i) => {
  tl.fromTo(
    n,
    { opacity: 0 },
    { keyframes: [{ opacity: 0.55, duration: 0.2 }, { opacity: 0.12, duration: 0.15 }, { opacity: 0.85, duration: 0.2 }, { opacity: 0.4, duration: 0.1 }, { opacity: 1, duration: 0.35 }], ease: "none" },
    i * 0.12,
  );
};
/** A slow, still fade: nothing travels. */
const fade =
  (d: number, gap = 0.25, y = 0): Style =>
  (tl, n, i) => {
    if (n.classList.contains("rule")) tl.fromTo(n, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: d }, i * gap);
    else tl.fromTo(n, { opacity: 0, y }, { opacity: 1, y: 0, duration: d }, i * gap);
  };
/** A wipe from the left, like a title card being drawn across. */
const T_WIPE: Style = (tl, n, i) => {
  tl.fromTo(
    n,
    { opacity: 1, clipPath: "inset(-20% 100% -25% -10%)" },
    { clipPath: "inset(-20% -10% -25% -10%)", duration: 1.3, ease: "power2.inOut" },
    i * 0.1,
  );
};
/** Printed matter laid down: each card arrives from its own depth and its own angle. */
const T_CARD: Style = (tl, n, i) => {
  const first = i % 2 === 1;
  tl.fromTo(
    n,
    { y: first ? 110 : 170, rotation: first ? -2.2 : 2.2, opacity: 0, transformOrigin: first ? "0 100%" : "100% 100%" },
    { y: 0, rotation: 0, opacity: 1, duration: first ? 1.3 : 1.5, ease: "power3.out" },
    0.25 + i * 0.3,
  );
};
/** The ticket is slid in from below and settles with a slight turn. */
const T_TICKET: Style = (tl, n, i) => {
  tl.fromTo(n, { y: 170, rotation: 5, opacity: 0, transformOrigin: "50% 100%" }, { y: 0, rotation: 0, opacity: 1, duration: 1.5, ease: "power3.out" }, 0.3 + i * 0.1);
};

const COPY_STYLE: Record<string, { title?: Style; rest?: Style; object?: Style }> = {
  about: { title: T_LINES },
  concert: { title: T_PUNCH, rest: (tl, n, i) => (n.classList.contains("rule") ? T_BASE(tl, n, i) : tl.fromTo(n, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2 + i * 0.05)) },
  movie: { title: T_FLICKER, rest: fade(0.9, 0.12, 0) },
  talent: { title: fade(2, 0.5), rest: fade(1.6, 0.4) },
  chenda: { title: fade(1.8, 0.3), rest: fade(1.5, 0.3) },
  events: { title: T_WIPE, object: T_CARD },
  register: { title: fade(1.4, 0.2, 14), object: T_TICKET },
  merch: { title: fade(0.6, 0.06), rest: fade(0.6, 0.06) },
  gallery: { title: T_WIPE },
  contact: { title: fade(1.4, 0.2, 10) },
};

/** What a scene looks like when no cut is touching it. */
const AT_REST: gsap.TweenVars = {
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  rotationY: 0,
  skewX: 0,
  xPercent: 0,
  yPercent: 0,
  transformPerspective: 0,
  transformOrigin: "50% 50%",
  clearProps: "opacity,filter,clipPath",
};

/* ── the engine ──────────────────────────────────────────────────────────── */

export class Engine {
  private root = document.documentElement;
  private main = document.getElementById("main")!;
  private scenes: SceneState[] = [];
  private cuts: CutState[] = [];
  private fields: { f: Ticking; s?: SceneState }[] = [];
  private lenis: Lenis | null = null;
  private reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  private fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  private vw = innerWidth;
  private vh = innerHeight;
  private k = 1;
  /** Scroll position at which the last scene's beat ends. */
  private total = 0;
  private ready = false;
  private destroyed = false;
  private T = 0;
  private ctx: gsap.Context;
  private offs: (() => void)[] = [];

  /** Overlay root for the cuts, and the black far jumps dip through. */
  private tfx!: HTMLElement;
  private dip!: HTMLElement;
  /** Index of the cut on screen (= index of its outgoing scene), or −1. */
  private cut = -1;
  /** Index of the scene that owns the screen (nav highlight, controllers). */
  private active = -1;

  /** A programmatic jump is under way. */
  private jumping = false;

  // pointer, −1…1
  private mx = 0;
  private my = 0;

  // hero
  private hero: SceneState | undefined;
  /** 1 = dollied in (before the gate opens) → 0 = at rest. */
  private intro = { v: 1 };
  /** Eased scroll progress of the hero, 0…1. */
  private heroE = 0;
  private heroCopy: HTMLElement | null = null;
  private heroDim: HTMLElement | null = null;
  private bits: { el: HTMLElement; a: number; delay: number }[] = [];
  private fade = 1;

  constructor() {
    if (location.protocol === "file:") this.root.classList.add("file");
    if (history.scrollRestoration) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    this.ctx = gsap.context(() => this.setup());
    setEngineHandle(this);
    // handy in the console while developing: __engine.scenes, __engine.goto("gallery")
    if (process.env.NODE_ENV !== "production") (window as unknown as { __engine: unknown }).__engine = this;
  }

  /* ── setup ─────────────────────────────────────────────────────────────── */

  private setup() {
    // from here on the scenes are layers, not a stack (the stylesheet does the rest)
    this.root.classList.add("staged");
    this.offs.push(() => {
      this.root.classList.remove("staged");
      this.main.style.height = "";
    });

    this.collectScenes();
    this.makeOverlay();
    this.measure();
    this.makeControllers();
    this.makeFields();
    this.makeLoops();
    this.setupScroll();
    this.setupHero();
    this.setupPointer();
    this.listen();
    this.state(scrollY, true);
    this.prewarm();

    // GSAP's ticker is the one clock: it advances Lenis, ScrollTrigger and everything below
    const tick = (time: number, ms: number) => this.frame(time, ms);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    this.offs.push(() => gsap.ticker.remove(tick));

    // ScrollTrigger measures through our layout pass, then re-reads every start/end function
    const onRefreshInit = () => this.measure();
    const onRefresh = () => this.state(scrollY, true);
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.addEventListener("refresh", onRefresh);
    this.offs.push(() => {
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    });
    const refresh = () => {
      if (!this.destroyed) ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh);
    addEventListener("load", refresh);
    this.offs.push(() => removeEventListener("load", refresh));

    this.offs.push(initCursor(document.getElementById("cursor")));
    return () => this.offs.splice(0).forEach((off) => off());
  }

  private collectScenes() {
    this.scenes = [...this.main.querySelectorAll<HTMLElement>("[data-scene]")].map((el) => ({
      el,
      name: el.dataset.scene!,
      planes: [...el.querySelectorAll<HTMLElement>("[data-depth]")].map((l) => ({
        el: l,
        d: +l.dataset.depth!,
        bleed: +(l.dataset.bleed || 1.06),
        zoom: +(l.dataset.zoom || 0),
        org: l.dataset.origin || "50% 50%",
        qx: gsap.quickTo(l, "xPercent", { duration: 1.1, ease: "power3.out" }),
        qy: gsap.quickTo(l, "yPercent", { duration: 1.1, ease: "power3.out" }),
      })),
      kids: gsap.utils.toArray<HTMLElement>(".copy > .rv", el).map((k, i) => ({
        el: k,
        f: COPY_DEPTH[i % COPY_DEPTH.length],
        qx: gsap.quickTo(k, "xPercent", { duration: 1.3, ease: "power3.out" }),
      })),
      fx: +(el.dataset.fx || 800),
      k: 1,
      stage: el.querySelector<HTMLElement>(".stage"),
      controller: null,
      loops: [],
      vis: true,
      appear: 0,
      arrive: 0,
      leave: 0,
      gone: 0,
      ext: 0,
    }));
    for (const s of this.scenes) {
      if (s.name === "hero") continue; // the hero has its own, much larger, lift
      for (const p of s.planes) p.bleed = Math.max(p.bleed, 1 + (p.d * DRIFT * Math.min(1, CALM[s.name] ?? 1)) / 450 + 0.02);
    }
    this.hero = this.scenes.find((s) => s.name === "hero");
    // every plane rests at its bleed scale; pointer and scroll are layered on top by GSAP
    for (const s of this.scenes) for (const p of s.planes) gsap.set(p.el, { scale: p.bleed, transformOrigin: p.org });
    this.offs.push(() =>
      this.scenes.forEach((s) => {
        s.el.classList.remove("is-off");
        s.el.removeAttribute("style"); // whatever a cut or a beat left on the layer
      }),
    );
  }

  /** The box the cuts draw their overlays in (the seam on a rising scene's edge), and the dip-to-black. */
  private makeOverlay() {
    this.tfx = document.createElement("div");
    this.tfx.className = "tfx";
    this.tfx.setAttribute("aria-hidden", "true");
    this.dip = document.createElement("div");
    this.dip.className = "tfx-dip";
    this.tfx.appendChild(this.dip);
    this.main.append(this.tfx);
    this.offs.push(() => this.tfx.remove());
  }

  private byName = (name: string) => this.scenes.find((s) => s.name === name);

  private makeControllers() {
    const make: Record<string, ((env: SceneEnv) => SceneController | null) | undefined> = {
      about: setupAbout,
      merch: setupMerch,
      contact: setupContact,
      gallery: setupReel,
    };
    for (const s of this.scenes) {
      const env: SceneEnv = {
        vw: () => this.vw,
        vh: () => this.vh,
        appear: () => s.appear,
        arrive: () => s.arrive,
        leave: () => s.leave,
        gone: () => s.gone,
        reduce: this.reduce,
        hold: (a) => s.loops.push(a),
      };
      s.controller = make[s.name]?.(env) ?? null;
    }
    const toys = setupToys();
    this.offs.push(() => {
      toys.destroy();
      this.scenes.forEach((s) => s.controller?.destroy());
    });
  }

  private makeFields() {
    const add = (f: Ticking, scene: string | SceneState | undefined) => {
      const s = typeof scene === "string" ? this.byName(scene) : scene;
      this.fields.push({ f, s });
      return f;
    };

    // leaves (hero + about)
    for (const [id, cfg] of Object.entries(FIELDS)) {
      const c = document.getElementById(id) as HTMLCanvasElement | null;
      if (c) add(new Field(c, cfg.kind, cfg.opts), cfg.scene);
    }

    // embers / dust / sparks, one canvas per scene
    for (const s of this.scenes) {
      s.el.querySelectorAll<HTMLCanvasElement>(".fxc[data-particles]").forEach((c) => {
        const field = new Field(c, c.dataset.particles as FieldKind);
        add(field, s);
        if (s.name === "chenda" && c.dataset.particles === "sparks") s.controller?.bindField?.(field);
      });
    }

    // twinkling bulbs, stars and lighters
    this.main.querySelectorAll<HTMLCanvasElement>("canvas[data-lights]").forEach((c) => {
      const s = this.scenes.find((sc) => sc.el.contains(c));
      add(new Lights(c, getLights(c.dataset.lights!)), s);
    });
    this.fields.forEach(({ f }) => f.resize());
  }

  /** Flames, beams, twinkles… — paused whenever their scene is off screen. */
  private makeLoops() {
    if (this.reduce) return;
    ambient((anim, el) => {
      const host = el?.closest("[data-scene]");
      const s = host ? this.scenes.find((x) => x.el === host) : undefined;
      if (s) s.loops.push(anim);
    });
  }

  /* ── scroll: Lenis position → ScrollTrigger → everything else ──────────── */

  private setupScroll() {
    if (!this.reduce) {
      this.lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1.5 });
      this.lenis.stop(); // the loader is up; scrolling starts when the gate opens
      this.lenis.on("scroll", ScrollTrigger.update);
      this.offs.push(() => {
        this.lenis?.destroy();
        this.lenis = null;
      });
    }

    this.scenes.forEach((s, i) => {
      this.parallax(s);
      this.copy(s);
      this.develop(s);
      this.lightStage(s);
      this.overflow(s);
      if (i > 0) this.makeCut(this.scenes[i - 1], s);
    });
  }

  /**
   * A slow push-in for as long as the scene is on screen: nearer planes grow more than far ones,
   * so the set gains depth, and because they only grow (plus a drift that stays inside their
   * bleed) a plane never shows its edge while the scene sits still on screen.
   */
  private parallax(s: SceneState) {
    if (s.name === "hero") return;
    if (!s.planes.length && !s.kids.length) return;
    const tl = gsap.timeline({
      defaults: { ease: "none", duration: 1 },
      scrollTrigger: {
        trigger: this.main,
        start: () => s.appear,
        end: () => Math.max(s.gone, s.leave + 1),
        scrub: true,
      },
    });
    // every line of copy travels at its own speed (yPercent: the reveal owns y), against the art
    const calm = CALM[s.name] ?? 1;
    s.kids.forEach((k) => tl.fromTo(k.el, { yPercent: 14 * k.f * calm }, { yPercent: -14 * k.f * calm }, 0));
    for (const p of s.planes) {
      const drift = p.d * DRIFT * calm; // stage px; nearer planes travel further
      tl.fromTo(p.el, { scale: p.bleed, y: drift }, { scale: p.bleed * (1 + p.d * PUSH * calm), y: -drift }, 0);
    }
  }

  /**
   * The copy's arrival: once the scene has begun to come in it plays through in about a second and
   * a half whatever the scroll does, and runs backwards if the visitor turns round. Each scene has
   * its own treatment (`COPY_STYLE`) so no two arrive the same way.
   */
  private copy(s: SceneState) {
    if (s.name === "hero" || s.name === "team") return;
    const items = gsap.utils.toArray<HTMLElement>(".rv", s.el);
    if (!items.length) return;
    if (this.reduce) {
      gsap.set(items, { opacity: 1 });
      return;
    }
    const from = COPY_AT[s.name] ?? COPY_DEFAULT;
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: EASE.enter },
    });
    const style = COPY_STYLE[s.name] ?? {};
    items.forEach((n, i) => {
      const own = n.classList.contains("title") ? style.title : n.classList.contains("evs-card") || n.classList.contains("ticket-scene") ? style.object : style.rest;
      (own ?? (n.classList.contains("title") ? T_WORDS : T_BASE))(tl, n, i);
    });
    tl.timeScale(Math.max(1 / COPY_SLOW, tl.duration() / COPY_TIME));
    this.timed(tl, s, from);
  }

  /** Play a timeline once the scroll is `from` of the way through the cut into `s`; reverse it going back. */
  private timed(tl: gsap.core.Timeline | gsap.core.Tween, s: SceneState, from: number) {
    ScrollTrigger.create({
      trigger: this.main,
      start: () => s.appear + (s.arrive - s.appear) * from,
      end: () => ScrollTrigger.maxScroll(window) + 1, // stays "entered" for the rest of the page: jumps and scrolling back up never leave it unplayed
      onEnter: () => void tl.play(),
      onLeaveBack: () => void tl.reverse(),
    });
    // …but scroll cannot outrun it: past the point where it should be done the animation is held to
    // the scroll, so a quick visitor sees it finish (swiftly) instead of the next cut taking the scene mid-arrival
    ScrollTrigger.create({
      trigger: this.main,
      start: () => s.appear + (s.arrive - s.appear) * from,
      end: () => s.arrive + (s.leave - s.arrive) * DONE_BY,
      onUpdate: (self) => {
        if (self.direction === 1 && tl.progress() < self.progress) tl.progress(self.progress);
      },
    });
  }

  /** The old photograph, developing: a veil over the art lifts as About arrives and settles. */
  private develop(s: SceneState) {
    if (s.name !== "about" || this.reduce || !s.stage) return;
    const veil = document.createElement("div");
    veil.className = "sc-veil";
    veil.setAttribute("aria-hidden", "true");
    s.stage.after(veil);
    this.offs.push(() => veil.remove());
    const t = gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, duration: 2.2, ease: "power1.inOut", immediateRender: true, paused: true });
    this.timed(t, s, 0.2);
  }

  /** Talent: the stage is lit plane by plane, back to front, before its words appear. */
  private lightStage(s: SceneState) {
    if (s.name !== "talent" || this.reduce) return;
    const ps = s.planes.slice(1).map((p) => p.el);
    if (!ps.length) return;
    const t = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } }).fromTo(ps, { opacity: 0 }, { opacity: 1, duration: 0.9, stagger: 0.45 }, 0);
    this.timed(t, s, 0.3);
  }

  /** A scene taller than the screen scrolls through its lower part at the end of its beat. */
  private overflow(s: SceneState) {
    if (s.name !== "contact" && s.name !== "merch") return;
    gsap.fromTo(
      s.el,
      { y: 0 },
      {
        y: () => -s.ext,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: this.main,
          start: () => s.leave - s.ext,
          end: () => s.leave,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  }

  /** One cut: its overlay box and the timeline that scroll scrubs across it. */
  private makeCut(a: SceneState, b: SceneState) {
    const cut = cutFor(a.name, b.name, this.reduce);
    const ov = document.createElement("div");
    ov.hidden = true;
    ov.dataset.cut = cut.name;
    this.tfx.appendChild(ov);
    const dim = document.createElement("div");
    dim.className = "sc-dim";
    dim.setAttribute("aria-hidden", "true");
    a.el.appendChild(dim);
    this.offs.push(() => dim.remove());
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // scrub must stay `true` (no smoothing): `state` relies on the cut being rendered before it looks
      scrollTrigger: { trigger: this.main, start: () => a.leave, end: () => a.gone, scrub: true },
    });
    const c: CutCtx = { tl, a: a.el, b: b.el, ov, dim, vw: () => this.vw, vh: () => this.vh };
    cut.build(c);
    if (!this.reduce) this.leaving(c, a);
    tl.set({}, {}, 1); // every cut is exactly one unit long
    this.cuts.push({ a, b, cut, tl, c, ov });
  }

  /**
   * The old scene's copy does not wait to be covered: as the cut begins each line drifts up and
   * fades, one after another, so scroll carries the words out the way it carried them in.
   */
  private leaving(c: CutCtx, a: SceneState) {
    if (a.name === "hero") return;
    const items = gsap.utils.toArray<HTMLElement>(".rv", a.el).filter((n) => !n.classList.contains("pc-wrap"));
    items.forEach((n, i) => {
      c.tl.fromTo(n, { y: 0, filter: "opacity(1)" }, { y: -44, filter: "opacity(0)", duration: 0.32, ease: "power2.in", immediateRender: false, overwrite: false }, i * 0.04);
    });
  }

  /* ── which layers are on screen ────────────────────────────────────────── */

  /**
   * Everything that depends on *where* the scroll is rather than on it moving: which scene owns
   * the screen and whether a cut is running. Runs every frame after the
   * scrubbed timelines have rendered, and only acts on changes.
   */
  private state(y: number, force = false) {
    const sc = this.scenes;
    const last = sc.length - 1;
    let i = 0;
    while (i < last && y >= sc[i].gone) i++;
    const s = sc[i];
    const cutting = i < last && y > s.leave;
    const p = cutting ? (y - s.leave) / Math.max(1, s.gone - s.leave) : 0;

    // the next scene is put on screen (invisibly) a little before its cut, so the cut starts with
    // its pictures already decoded and painted instead of doing that work mid-move
    const warm = !cutting && i < last && y > s.leave - this.vh * 0.3;
    for (let k = 0; k <= last; k++) {
      this.setVisible(sc[k], k === i || (k === i + 1 && (cutting || warm)));
      sc[k].el.classList.toggle("is-warm", warm && k === i + 1);
    }
    this.setCut(cutting ? i : -1, i, force);
    this.setActive(cutting && p >= 0.5 ? i + 1 : i);
  }

  private setVisible(s: SceneState, vis: boolean) {
    if (vis === s.vis && s.el.classList.contains("is-off") === !vis) return;
    s.vis = vis;
    s.el.classList.toggle("is-off", !vis);
    s.loops.forEach((a) => (vis ? a.resume() : a.pause()));
  }

  private setActive(i: number) {
    if (i === this.active) return;
    this.scenes[this.active]?.controller?.leave?.();
    this.active = i;
    const s = this.scenes[i];
    s.controller?.enter?.();
    sceneStore.set(s.name);
  }

  /** Nothing a cut did may linger on a scene that is simply being watched. */
  private rest(el: HTMLElement) {
    gsap.set(el, AT_REST);
    el.style.removeProperty("-webkit-clip-path");
    el.style.zIndex = "";
  }

  private setCut(next: number, cur: number, force: boolean) {
    if (next === this.cut && !force) return;
    const prev = this.cuts[this.cut];
    if (prev && next !== this.cut) {
      prev.ov.hidden = true;
      prev.a.el.style.zIndex = prev.b.el.style.zIndex = "";
    }
    this.cut = next;
    const now = this.cuts[next];
    if (!now) return this.rest(this.scenes[cur].el);

    now.ov.hidden = false;
    now.a.el.style.zIndex = "2";
    now.b.el.style.zIndex = "3";
    // the scenes were at rest: put every tween of this cut back where the scrub has it
    now.tl.render(now.tl.time(), false, true);
  }

  /* ── hero ──────────────────────────────────────────────────────────────── */

  private setupHero() {
    const s = this.hero;
    if (!s) return;
    this.heroCopy = document.getElementById("hero-copy");
    this.heroDim = s.el.querySelector<HTMLElement>(".hero-dim");
    const delays: Record<string, number> = { "hero-tag": 1.4, "hero-college": 1.4, "hero-scroll": 1.6, "hero-vert": 1.7 };
    this.bits = [...s.el.querySelectorAll<HTMLElement>(".hero-tag,.hero-vert,.hero-scroll,.hero-college")].map((el) => ({
      el,
      a: 0,
      delay: delays[[...el.classList].find((c) => c in delays) ?? ""] ?? 1.4,
    }));

    // lines of the kicker wait below their baseline until the gate opens
    gsap.set(s.el.querySelectorAll(".hero-copy .ln"), { yPercent: 120, y: 0, opacity: 0 });
    gsap.set(s.el.querySelector(".hc-rule"), { scaleX: 0, transformOrigin: "0 50%" });

    this.renderHero();
    // its whole beat is one slow push in toward the logo
    ScrollTrigger.create({
      trigger: this.main,
      start: 0,
      end: () => s.leave,
      invalidateOnRefresh: true,
      onRefresh: () => this.renderHero(),
      onUpdate: (self) => {
        this.heroE = heroEase(self.progress);
        this.fade = clamp(1 - self.progress * 2.4, 0, 1);
        this.renderHero();
        this.renderBits();
        if (this.heroCopy) gsap.set(this.heroCopy, { opacity: this.fade, y: -self.progress * 60 });
        if (this.heroDim) this.heroDim.style.opacity = (self.progress * 0.2).toFixed(3);
      },
    });
  }

  /** Planes: scroll zoom and lift, times the opening dolly. Pointer parallax rides on xPercent/yPercent. */
  private renderHero = () => {
    const s = this.hero;
    if (!s) return;
    for (const l of s.planes) {
      // the AGNI'26 logo never scales: it holds still, lifts a little and fades with the scroll
      if (l.el.classList.contains("logo-layer")) {
        gsap.set(l.el, { scale: l.bleed, y: -((this.heroE * this.vh * 0.1) / s.k), opacity: this.fade });
        continue;
      }
      const z = 1 + l.zoom * this.heroE;
      const dolly = 1 + this.intro.v * (0.13 + l.d * 0.5);
      gsap.set(l.el, { scale: l.bleed * z * dolly, y: -((this.heroE * l.d * this.vh * 0.32) / s.k) });
    }
  };

  private renderBits = () => {
    for (const b of this.bits) b.el.style.opacity = (b.a * this.fade).toFixed(3);
  };

  /**
   * Paint every scene once while the loader still covers the page, so a scene's first appearance in
   * a cut is not also its first raster (which is what makes the first pass through a cut stutter).
   */
  private prewarm() {
    if (this.reduce || !document.getElementById("loader")) return;
    const rest = this.scenes.filter((s) => s.name !== "hero");
    const was = rest.map((s) => s.el.style.opacity);
    rest.forEach((s) => {
      s.el.classList.remove("is-off");
      s.el.style.opacity = "0.01";
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setTimeout(() => {
          if (this.destroyed) return;
          rest.forEach((s, i) => (s.el.style.opacity = was[i]));
          this.state(scrollY, true);
        }, 500),
      ),
    );
  }

  /** Decode every picture once the page is idle, so a scene's first appearance never waits on it. */
  private warm() {
    const imgs = [...document.images];
    imgs.forEach((i) => {
      if (i.loading === "lazy") i.loading = "eager";
    });
    const run = () => imgs.forEach((i) => i.decode?.().catch(() => {}));
    if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 2500 });
    else setTimeout(run, 1200);
  }

  /** The gate opens: scrolling starts, the hero dollies in and the chrome arrives. */
  open() {
    if (this.ready || this.destroyed) return;
    this.ready = true;
    this.lenis?.start();
    this.warm();
    // arriving as /#team (the events page links back like this) goes straight to that scene, once:
    // the hash is dropped so a reload opens on the hero again instead of jumping there every time
    const arrival = location.hash.slice(1);
    this.goto(arrival);
    if (arrival) history.replaceState(null, "", location.pathname + location.search);
    this.ctx.add(() => {
      const s = this.hero;
      if (this.reduce) {
        this.intro.v = 0;
        this.renderHero();
        this.bits.forEach((b) => (b.a = 1));
        this.renderBits();
        if (s) gsap.set(s.el.querySelectorAll(".hero-copy .ln"), { yPercent: 0, opacity: 1 });
        gsap.set(".hc-rule", { scaleX: 1 });
        return;
      }
      // the camera dollies back from the planes
      gsap.to(this.intro, { v: 0, duration: 3.4, ease: "power4.out", onUpdate: this.renderHero });
      if (s) {
        gsap.to(s.el.querySelectorAll(".hero-copy .ln"), { yPercent: 0, opacity: 1, duration: 1.4, ease: EASE.enter, stagger: 0.14, delay: 0.7 });
        gsap.to(s.el.querySelector(".hc-rule"), { scaleX: 1, duration: 1.3, ease: EASE.enter, delay: 0.9 });
      }
      for (const b of this.bits) gsap.to(b, { a: 1, duration: 1.4, ease: "power2.out", delay: b.delay, onUpdate: this.renderBits });

      // the chrome slides in behind the fire
      const nav = gsap.timeline({ defaults: { ease: EASE.enter } });
      nav
        .fromTo(".nav-brand", { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3 }, 0.15)
        .fromTo(".nav-links a", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.07 }, 0.25)
        .fromTo(".nav-right > *", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.07 }, 0.4)
        .fromTo(".rail a", { x: 22, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, stagger: 0.05 }, 1.0);
    });
  }

  /* ── pointer & input ───────────────────────────────────────────────────── */

  private setupPointer() {
    if (!this.fine) return;
    // buttons lean toward the pointer
    if (!this.reduce) {
      this.main.querySelectorAll<HTMLElement>(".btn").forEach((b) => this.offs.push(magnet(b)));
      document.querySelectorAll<HTMLElement>(".nav-cta,.snd").forEach((b) => this.offs.push(magnet(b, 0.2)));
    }
  }

  private listen() {
    const on = <K extends keyof WindowEventMap>(t: Window, type: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      t.addEventListener(type, fn, o);
      this.offs.push(() => t.removeEventListener(type, fn, o));
    };

    // in-page anchors go to their scene
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!this.scenes.some((s) => s.el.id === id)) return;
      e.preventDefault();
      this.lenis?.start();
      this.goto(id);
      sfx.tick();
    };
    document.addEventListener("click", onClick);
    this.offs.push(() => document.removeEventListener("click", onClick));

    // a soft tick when the pointer enters a link or button
    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element).closest?.("a,button");
      if (!t) return;
      const from = e.relatedTarget as Node | null;
      if (from && t.contains(from)) return;
      if (sfx.on) sfx.hover();
    };
    document.addEventListener("pointerover", onOver);
    this.offs.push(() => document.removeEventListener("pointerover", onOver));

    on(
      window,
      "pointermove",
      (e) => {
        this.mx = (e.clientX / this.vw) * 2 - 1;
        this.my = (e.clientY / this.vh) * 2 - 1;
        ptr.vx = clamp(e.movementX / 26, -1, 1);
        ptr.vy = clamp(e.movementY / 26, -1, 1);
        if (this.reduce || !this.ready) return;
        for (const s of this.scenes) {
          if (!s.vis) continue;
          for (const l of s.planes) {
            l.qx(-this.mx * l.d * PX);
            l.qy(-this.my * l.d * PY);
          }
          for (const k of s.kids) k.qx(this.mx * k.f * 1.6);
        }
      },
      { passive: true },
    );
  }

  /* ── layout ────────────────────────────────────────────────────────────── */

  /** Size the art stages for the viewport and lay the scenes out along the scroll. */
  measure() {
    this.vw = innerWidth;
    this.vh = innerHeight;
    this.k = Math.max(this.vw / 1600, this.vh / 900);
    this.root.style.setProperty("--k", this.k.toFixed(4));
    const portrait = this.vw / this.vh < 0.9;
    this.root.classList.toggle("portrait", portrait);

    for (const s of this.scenes) {
      s.k = portrait ? clamp(this.vw / (+(s.el.dataset.fw || 0) || 1000), 0.3, 1) : this.k;
      if (!s.stage) continue;
      let ox = 0;
      const asp = this.vw / this.vh;
      if (portrait || asp < 1.6) {
        const max = Math.max(0, (1600 * s.k - this.vw) / 2);
        ox = clamp((800 - s.fx) * s.k, -max, max);
      }
      s.stage.style.setProperty("--k", s.k.toFixed(4));
      s.stage.style.setProperty("--ox", ox.toFixed(1) + "px");
      s.stage.style.setProperty("--cy", portrait ? "35%" : "50%");
    }

    // the timeline: beat, cut, beat, cut…
    let y = 0;
    const last = this.scenes.length - 1;
    this.scenes.forEach((s, i) => {
      const [beat, cut] = PACE[s.name] ?? DEFAULT_PACE;
      s.ext = Math.max(0, s.el.offsetHeight - this.vh);
      s.appear = i ? this.scenes[i - 1].leave : 0;
      s.arrive = y;
      s.leave = y + beat * this.vh + s.ext;
      s.gone = i < last ? s.leave + cut * this.vh : s.leave;
      y = s.gone;
    });
    this.total = y;
    this.main.style.height = `${Math.ceil(this.total + this.vh)}px`;
    this.lenis?.resize();
    this.fields.forEach(({ f }) => f.resize());
  }

  /* ── scrolling ─────────────────────────────────────────────────────────── */

  /**
   * Go to a scene. A neighbour is reached by playing the cut; anything further dips to black and
   * cuts straight there, rather than fast-forwarding through every scene in between.
   */
  goto(id: string) {
    const t = this.scenes.findIndex((x) => x.el.id === id);
    if (t < 0) return;
    const y = this.scenes[t].arrive;
    const lenis = this.lenis;
    if (!lenis) return void scrollTo(0, y);
    this.jumping = true;
    const done = () => {
      this.jumping = false;
    };
    if (Math.abs(t - this.active) <= 1) {
      // about 1.15 s per screen of travel, so the longer cuts are played at the same pace
      const dur = clamp((Math.abs(y - scrollY) / this.vh) * 1.15, 1.6, 5);
      lenis.scrollTo(y, { duration: dur, easing: gsap.parseEase("power2.inOut") as (t: number) => number });
      // not Lenis's onComplete: it never fires if the visitor scrolls during the move
      this.ctx.add(() => gsap.delayedCall(dur + 0.1, done));
      return;
    }
    this.ctx.add(() => {
      gsap
        .timeline({ onComplete: done })
        .to(this.dip, { opacity: 1, duration: 0.45, ease: "power2.in" })
        .call(() => {
          lenis.scrollTo(y, { immediate: true, force: true });
          ScrollTrigger.update();
          this.state(scrollY, true);
        })
        .to(this.dip, { opacity: 0, duration: 0.8, ease: "power2.out" }, "+=0.12");
    });
  }

  /** Pause / resume smooth scrolling (used while the mobile menu is open). */
  lock(locked: boolean) {
    if (locked) this.lenis?.stop();
    else if (this.ready) this.lenis?.start();
  }

  /* ── the frame ─────────────────────────────────────────────────────────── */

  private frame(time: number, ms: number) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, ms / 1000);
    this.T += dt;
    this.lenis?.raf(time * 1000); // → ScrollTrigger.update → the scrubbed timelines render
    const y = scrollY;
    this.state(y);

    const decay = Math.pow(0.92, dt * 60);
    ptr.vx *= decay;
    ptr.vy *= decay;

    for (const s of this.scenes) {
      if (s.vis) s.controller?.tick?.(dt, this.T);
    }
    if (!document.hidden) {
      // the scene being covered is dark and sinking: its particles stand still, so only one scene's canvases cost anything
      const gone = this.cuts[this.cut]?.a;
      for (const { f, s } of this.fields) if (s && s.vis && s !== gone) f.update(dt);
    }
  }

  /* ── teardown ──────────────────────────────────────────────────────────── */

  destroy() {
    this.destroyed = true;
    this.ctx.revert();
    setEngineHandle(null);
  }
}
