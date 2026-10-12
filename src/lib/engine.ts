/**
 * The projector — a GSAP rig.
 *
 * The scenes are not a scrolling stack any more: once the engine runs (`html.staged`) each one is
 * a full-screen fixed layer and scroll only drives *time*. Every scene gets a beat in which it
 * holds the screen (`PACE[name][0]` viewports of scroll, so its own animation and its props have
 * room), then a cut takes it to the next scene (`PACE[name][1]` viewports; the eleven cuts live
 * in lib/transitions.ts). Lenis supplies the smooth scroll position and is clocked by GSAP's
 * ticker; ScrollTrigger scrubs the cuts, the parallax and the per-scene scroll effects, and one
 * small state machine (`state()`) decides each frame which layers are on screen.
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
import { EASE, gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneStore, setEngineHandle } from "@/lib/scene-store";
import { setupChenda } from "@/lib/scenes/chenda";
import { setupConcert } from "@/lib/scenes/concert";
import { setupFashion } from "@/lib/scenes/fashion";
import { setupAbout, setupCredits, setupReel, setupToys } from "@/lib/scenes/misc";
import { setupMovie } from "@/lib/scenes/movie";
import { setupTalent } from "@/lib/scenes/talent";
import type { SceneController, SceneEnv } from "@/lib/scenes/types";
import { cutFor, warmCuts, type Cut, type CutCtx } from "@/lib/transitions";
import { clamp } from "@/lib/utils";

/* ── pacing ──────────────────────────────────────────────────────────────── */

/**
 * [beat, cut] per scene, in viewport heights of scroll: how long the scene holds the screen,
 * and how long the cut out of it lasts. Raise the first number to give a scene more time.
 */
const PACE: Record<string, [beat: number, cut: number]> = {
  hero: [1.5, 1.0],
  about: [1.3, 1.0],
  concert: [1.4, 1.0],
  movie: [1.4, 1.0],
  talent: [1.4, 1.1],
  chenda: [1.4, 1.1],
  fashion: [1.4, 1.1],
  register: [1.2, 1.0],
  merch: [1.2, 1.2],
  gallery: [3.0, 1.0],
  team: [4.6, 1.0],
  contact: [0.5, 0],
};
const DEFAULT_PACE: [number, number] = [1.3, 1];

/** A cut left part-way is carried to its end: past this share of it, forward; before it, back. */
const SETTLE_AT = 0.12;
/** Seconds without scrolling before a half-finished cut is carried through. */
const SETTLE_AFTER = 0.16;

/** How far the nearest plane (depth 1) pushes in while its scene is on screen. */
const PUSH = 0.12;

/** Pointer-parallax reach, percent of a plane (64px / 1600, 38px / 900). */
const PX = 4;
const PY = 4.2;

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

interface SceneState {
  el: HTMLElement;
  name: string;
  planes: Plane[];
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

  /** The copy's arrival, and the share of the incoming cut after which it starts. */
  copy: gsap.core.Timeline | null;
  reveal: number;
  shown: boolean;
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
      { y: 58, opacity: 0, skewY: 2.5, filter: "blur(10px)" },
      { y: 0, opacity: 1, skewY: 0, filter: "blur(0px)", duration: 1.5, clearProps: "filter" },
    ];
  if (c.contains("eyebrow")) return [{ x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }];
  if (c.contains("hint")) return [{ y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }];
  if (c.contains("postcard")) return [{ y: 54, rotationX: 14, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 1.4 }];
  return [{ y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }];
}

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

  /** Overlay root for the cuts, the backdrop seen behind a scene that is turned away, and the black far jumps dip through. */
  private tfx!: HTMLElement;
  private back!: HTMLElement;
  private dip!: HTMLElement;
  /** Index of the cut on screen (= index of its outgoing scene), or −1. */
  private cut = -1;
  /** Index of the scene that owns the screen (nav highlight, controllers). */
  private active = -1;

  // settling half-finished cuts
  private lastY = 0;
  private idle = 0;
  private dir = 1;
  private touching = false;
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
      copy: null,
      reveal: 0.6,
      shown: false,
    }));
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

  /** The box the cuts draw their overlays in (flares, curtains, bars…), and the dip-to-black. */
  private makeOverlay() {
    this.tfx = document.createElement("div");
    this.tfx.className = "tfx";
    this.tfx.setAttribute("aria-hidden", "true");
    this.dip = document.createElement("div");
    this.dip.className = "tfx-dip";
    this.tfx.appendChild(this.dip);
    this.back = document.createElement("div");
    this.back.className = "tfx-back";
    this.back.setAttribute("aria-hidden", "true");
    this.main.append(this.back, this.tfx);
    this.offs.push(() => {
      this.tfx.remove();
      this.back.remove();
    });
  }

  private byName = (name: string) => this.scenes.find((s) => s.name === name);

  private makeControllers() {
    const make: Record<string, ((env: SceneEnv) => SceneController | null) | undefined> = {
      about: setupAbout,
      concert: setupConcert,
      movie: setupMovie,
      talent: setupTalent,
      chenda: setupChenda,
      fashion: setupFashion,
      gallery: setupReel,
      team: setupCredits,
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
      this.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
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
    if (s.name === "hero" || !s.planes.length) return;
    const tl = gsap.timeline({
      defaults: { ease: "none", duration: 1 },
      scrollTrigger: {
        trigger: this.main,
        start: () => s.appear,
        end: () => Math.max(s.gone, s.leave + 1),
        scrub: true,
      },
    });
    for (const p of s.planes) {
      const drift = (p.bleed - 1) * 900 * 0.22; // stage px
      tl.fromTo(p.el, { scale: p.bleed, y: drift }, { scale: p.bleed * (1 + p.d * PUSH), y: -drift }, 0);
    }
  }

  /** The copy's arrival, played when the cut into the scene is far enough along (see `state`). */
  private copy(s: SceneState) {
    if (s.name === "hero" || s.name === "team") return;
    const items = gsap.utils.toArray<HTMLElement>(".rv", s.el);
    if (!items.length) return;
    if (this.reduce) {
      gsap.set(items, { opacity: 1 });
      return;
    }
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.enter } });
    items.forEach((n, i) => {
      const [from, to] = reveal(n);
      tl.fromTo(n, from, to, i * 0.095);
    });
    s.copy = tl;
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
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // scrub must stay `true` (no smoothing): `state` relies on the cut being rendered before it looks
      scrollTrigger: { trigger: this.main, start: () => a.leave, end: () => a.gone, scrub: true },
    });
    const c: CutCtx = { tl, a: a.el, b: b.el, ov, back: this.back, vw: () => this.vw, vh: () => this.vh };
    cut.build(c);
    tl.set({}, {}, 1); // every cut is exactly one unit long
    b.reveal = cut.reveal;
    this.cuts.push({ a, b, cut, tl, c, ov });
  }

  /* ── which layers are on screen ────────────────────────────────────────── */

  /**
   * Everything that depends on *where* the scroll is rather than on it moving: which scene owns
   * the screen, whether a cut is running, whose copy has arrived. Runs every frame after the
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

    for (let k = 0; k <= last; k++) this.setVisible(sc[k], k === i || (cutting && k === i + 1));
    this.setCut(cutting ? i : -1, i, force);
    this.setActive(cutting && p >= 0.5 ? i + 1 : i);

    for (const x of sc) {
      if (!x.copy) continue;
      const want = y >= x.appear + (x.arrive - x.appear) * x.reveal;
      if (want === x.shown) continue;
      x.shown = want;
      if (want) x.copy.timeScale(1).play();
      else x.copy.timeScale(2).reverse();
    }
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
      if (prev.cut.aClass) prev.a.el.classList.remove(prev.cut.aClass);
      if (prev.cut.bClass) prev.b.el.classList.remove(prev.cut.bClass);
      prev.a.el.style.zIndex = prev.b.el.style.zIndex = "";
    }
    this.cut = next;
    const now = this.cuts[next];
    if (!now) return this.rest(this.scenes[cur].el);

    now.ov.hidden = false;
    if (now.cut.aClass) now.a.el.classList.add(now.cut.aClass);
    if (now.cut.bClass) now.b.el.classList.add(now.cut.bClass);
    now.a.el.style.zIndex = now.cut.aOnTop ? "3" : "2";
    now.b.el.style.zIndex = now.cut.aOnTop ? "2" : "3";
    now.cut.prep?.(now.c);
    // the scenes were at rest: put every tween of this cut back where the scrub has it
    now.tl.render(now.tl.time(), false, true);
    if (this.ready && sfx.on && now.tl.progress() < 0.5) now.cut.sound?.();
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
      const z = 1 + l.zoom * this.heroE;
      const dolly = 1 + this.intro.v * (0.13 + l.d * 0.5);
      gsap.set(l.el, { scale: l.bleed * z * dolly, y: -((this.heroE * l.d * this.vh * 0.32) / s.k) });
    }
  };

  private renderBits = () => {
    for (const b of this.bits) b.el.style.opacity = (b.a * this.fade).toFixed(3);
  };

  /** The gate opens: scrolling starts, the hero dollies in and the chrome arrives. */
  open() {
    if (this.ready || this.destroyed) return;
    this.ready = true;
    this.lenis?.start();
    this.ctx.add(() => {
      const s = this.hero;
      // draw the cuts' textures while the page is busy burning the loader away
      gsap.delayedCall(1.4, () => warmCuts(this.tfx));
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
        }
      },
      { passive: true },
    );

    // a finger on the glass: never take the page out of its hand
    on(window, "touchstart", () => (this.touching = true), { passive: true });
    on(window, "touchend", () => (this.touching = false), { passive: true });
    on(window, "touchcancel", () => (this.touching = false), { passive: true });
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
      lenis.scrollTo(y, { duration: 1.9, easing: gsap.parseEase("power2.inOut") as (t: number) => number });
      // not Lenis's onComplete: it never fires if the visitor scrolls during the move
      this.ctx.add(() => gsap.delayedCall(2, done));
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

  /**
   * A cut is a piece of film: it should not be left hanging half-way. When the scroll comes to
   * rest inside one, carry it through in the direction it was going (or back, if it had barely begun).
   */
  private settle(dt: number, y: number) {
    const dy = y - this.lastY;
    this.lastY = y;
    if (Math.abs(dy) > 0.2) {
      this.dir = dy > 0 ? 1 : -1;
      this.idle = 0;
      return;
    }
    this.idle += dt;
    const now = this.cuts[this.cut];
    if (!now || !this.lenis || !this.ready || this.jumping || this.touching || this.idle < SETTLE_AFTER) return;
    const span = now.a.gone - now.a.leave;
    const p = (y - now.a.leave) / span;
    if (p < 0.005 || p > 0.995) return;
    const forward = this.dir > 0 ? p > SETTLE_AT : p > 1 - SETTLE_AT;
    const to = forward ? now.a.gone : now.a.leave;
    this.idle = 0;
    this.lenis.scrollTo(to, {
      duration: 0.55 + (Math.abs(to - y) / span) * 1.15,
      easing: gsap.parseEase("sine.inOut") as (t: number) => number,
    });
  }

  /* ── the frame ─────────────────────────────────────────────────────────── */

  private frame(time: number, ms: number) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, ms / 1000);
    this.T += dt;
    this.lenis?.raf(time * 1000); // → ScrollTrigger.update → the scrubbed timelines render
    const y = scrollY;
    this.state(y);
    this.settle(dt, y);

    const decay = Math.pow(0.92, dt * 60);
    ptr.vx *= decay;
    ptr.vy *= decay;

    for (const s of this.scenes) {
      if (s.vis) s.controller?.tick?.(dt, this.T);
    }
    if (!document.hidden) {
      for (const { f, s } of this.fields) if (s && s.vis) f.update(dt);
    }
    const now = this.cuts[this.cut];
    now?.cut.tick?.(now.c);
  }

  /* ── teardown ──────────────────────────────────────────────────────────── */

  destroy() {
    this.destroyed = true;
    const now = this.cuts[this.cut];
    if (now) {
      if (now.cut.aClass) now.a.el.classList.remove(now.cut.aClass);
      if (now.cut.bClass) now.b.el.classList.remove(now.cut.bClass);
    }
    this.ctx.revert();
    setEngineHandle(null);
  }
}
