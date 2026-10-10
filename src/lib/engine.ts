/**
 * The projector — smooth scroll, parallax planes, scene visibility, particle fields,
 * and the per-scene controllers. Everything here is driven by one requestAnimationFrame loop.
 *
 * Sections declare themselves in the markup:
 *   [data-scene]   a pinned scene (`data-fx` / `data-fw` frame it on narrow screens)
 *   [data-depth]   a parallax plane inside a scene (`data-bleed`, `data-zoom`, `data-origin`)
 */
import Lenis from "lenis";
import { animate } from "framer-motion";
import { getLights } from "@/lib/art";
import { sfx } from "@/lib/audio";
import { Field, Lights, initCursor, ptr, type FieldKind, type FieldOptions } from "@/lib/fx";
import { setupChenda } from "@/lib/scenes/chenda";
import { setupConcert } from "@/lib/scenes/concert";
import { setupFashion } from "@/lib/scenes/fashion";
import { setupAbout, setupCredits, setupReel, setupToys } from "@/lib/scenes/misc";
import { setupMovie } from "@/lib/scenes/movie";
import { setupTalent } from "@/lib/scenes/talent";
import type { SceneController } from "@/lib/scenes/types";
import { sceneStore, setEngineHandle } from "@/lib/scene-store";
import { clamp } from "@/lib/utils";

/* ── types ───────────────────────────────────────────────────────────────── */

interface Plane {
  el: HTMLElement;
  d: number;
  bleed: number;
  zoom: number;
  org: string;
}

interface SceneState {
  el: HTMLElement;
  name: string;
  planes: Plane[];
  /** Horizontal focus point of the art, in stage px, used to frame it on narrow screens. */
  fx: number;
  /** Stage scale. */
  k: number;
  /** Pinned scenes that span several screens (gallery, team, contact). */
  tall: boolean;
  top: number;
  h: number;
  end: number;
  vis: boolean | null;
  stage: HTMLElement | null;
  controller: SceneController | null;
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

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/* ── the engine ──────────────────────────────────────────────────────────── */

export class Engine {
  private root = document.documentElement;
  private main = document.getElementById("main")!;
  private scenes: SceneState[] = [];
  private fields: { f: Ticking; s?: SceneState }[] = [];
  private tops = new WeakMap<Element, number>();
  private lenis: Lenis | null = null;
  private reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  private vw = innerWidth;
  private vh = innerHeight;
  private k = 1;
  private ready = false;
  private intro = { v: 0 };
  private tx = 0;
  private ty = 0;
  private mx = 0;
  private my = 0;
  private T = 0;
  private last = performance.now();
  private raf = 0;
  private destroyed = false;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private offs: (() => void)[] = [];
  private tween: { stop(): void } | null = null;

  private heroCopy: HTMLElement | null;
  private heroBits: HTMLElement[];
  private heroDim: HTMLElement | null;

  constructor() {
    if (location.protocol === "file:") this.root.classList.add("file");

    this.heroCopy = document.getElementById("hero-copy");
    this.heroBits = [...document.querySelectorAll<HTMLElement>(".hero-tag,.hero-vert,.hero-scroll,.hero-college")];
    this.heroDim = document.querySelector<HTMLElement>(".hero-dim");

    this.collectScenes();
    this.makeControllers();
    this.makeFields();

    // smooth scroll
    if (!this.reduce) {
      this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.92, smoothWheel: true });
      this.lenis.stop();
    }

    this.listen();
    this.offs.push(initCursor(document.getElementById("cursor")));
    if (history.scrollRestoration) history.scrollRestoration = "manual";
    this.measure();
    scrollTo(0, 0);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    setEngineHandle(this);
  }

  /* ── setup ─────────────────────────────────────────────────────────────── */

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
      })),
      fx: +(el.dataset.fx || 800),
      k: 1,
      tall: el.classList.contains("reel") || el.classList.contains("credits") || el.classList.contains("contact"),
      top: 0,
      h: 0,
      end: 0,
      vis: null,
      stage: el.querySelector<HTMLElement>(".stage"),
      controller: null,
    }));
  }

  private byName = (name: string) => this.scenes.find((s) => s.name === name);

  private makeControllers() {
    const make: Record<string, () => SceneController | null> = {
      about: setupAbout,
      concert: setupConcert,
      movie: setupMovie,
      talent: setupTalent,
      chenda: setupChenda,
      fashion: setupFashion,
      gallery: setupReel,
      team: setupCredits,
    };
    for (const s of this.scenes) s.controller = make[s.name]?.() ?? null;
    const toys = setupToys();
    this.offs.push(() => toys.destroy());
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
  }

  private listen() {
    const on = <K extends keyof WindowEventMap>(t: Window, type: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      t.addEventListener(type, fn, o);
      this.offs.push(() => t.removeEventListener(type, fn, o));
    };

    // in-page anchors scroll with the smooth scroller
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

    on(window, "pointermove", (e) => {
      this.tx = (e.clientX / this.vw) * 2 - 1;
      this.ty = (e.clientY / this.vh) * 2 - 1;
      ptr.vx = clamp(e.movementX / 26, -1, 1);
      ptr.vy = clamp(e.movementY / 26, -1, 1);
    }, { passive: true });

    on(window, "resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.measure(), 120);
    });
    on(window, "load", () => this.measure());
    document.fonts?.ready.then(() => {
      if (!this.destroyed) this.measure();
    });
  }

  /* ── layout ────────────────────────────────────────────────────────────── */

  /** Re-measure scene positions and size the art stage for the current viewport. */
  measure() {
    this.vw = innerWidth;
    this.vh = innerHeight;
    this.k = Math.max(this.vw / 1600, this.vh / 900);
    this.root.style.setProperty("--k", this.k.toFixed(4));
    const portrait = this.vw / this.vh < 0.9;
    this.root.classList.toggle("portrait", portrait);

    let y = 0;
    for (const c of Array.from(this.main.children)) {
      this.tops.set(c, y);
      y += (c as HTMLElement).offsetHeight;
    }

    this.scenes.forEach((s, i) => {
      s.top = this.tops.get(s.el) ?? 0;
      s.h = s.el.offsetHeight;
      const n = this.scenes[i + 1];
      s.end = s.tall ? s.top + s.h : n ? (this.tops.get(n.el) ?? 0) : s.top + s.h;
      s.k = portrait ? clamp(this.vw / (+(s.el.dataset.fw || 0) || 1000), 0.3, 1) : this.k;
      if (s.stage) {
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
    });
    this.fields.forEach(({ f }) => f.resize());
  }

  /* ── scrolling ─────────────────────────────────────────────────────────── */

  goto(id: string) {
    const s = this.scenes.find((x) => x.el.id === id);
    if (!s) return;
    const y = s.top;
    if (this.lenis) {
      this.lenis.scrollTo(y, {
        duration: clamp((Math.abs(y - scrollY) / this.vh) * 0.38 + 0.9, 1.2, 3.2),
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else scrollTo({ top: y, behavior: "smooth" });
  }

  /** Pause / resume smooth scrolling (used while the mobile menu is open). */
  lock(locked: boolean) {
    if (locked) this.lenis?.stop();
    else if (this.ready) this.lenis?.start();
  }

  /** Called by the loader as the gate opens: scrolling starts and the hero dollies in. */
  open() {
    this.ready = true;
    this.lenis?.start();
    this.intro.v = 1;
    this.tween?.stop();
    this.tween = animate(1, 0, {
      duration: 3.2,
      ease: easeOutQuart,
      onUpdate: (v) => {
        this.intro.v = v;
      },
    });
    const hero = this.byName("hero");
    if (hero) {
      hero.el.classList.add("is-in");
      hero.el.querySelectorAll<HTMLElement>(".hero-copy .ln").forEach((n, i) => n.style.setProperty("--d", String(700 + i * 140)));
    }
  }

  /* ── the frame loop ────────────────────────────────────────────────────── */

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.T += dt;
    this.lenis?.raf(now);
    const sy = scrollY;
    const { vh, vw } = this;

    this.mx += (this.tx - this.mx) * Math.min(1, dt * 3.2);
    this.my += (this.ty - this.my) * Math.min(1, dt * 3.2);
    ptr.vx *= 0.92;
    ptr.vy *= 0.92;
    const ampX = this.reduce ? 0 : 64;
    const ampY = this.reduce ? 0 : 38;

    for (const s of this.scenes) {
      const vis = sy + vh > s.top - 4 && sy < s.end + 6;
      if (vis !== s.vis) {
        s.vis = vis;
        s.el.classList.toggle("is-off", !vis);
        if (!vis) s.controller?.leave?.();
        else s.controller?.enter?.();
      }
      if (!vis) continue;
      const p = (sy - s.top) / vh;

      // copy reveals
      if (!s.tall && s.name !== "hero") {
        if (sy > s.top - vh * 0.62) {
          if (!s.el.classList.contains("is-in")) {
            s.el.classList.add("is-in");
            s.el.querySelectorAll<HTMLElement>(".rv").forEach((n, i) => n.style.setProperty("--d", String(i * 95)));
          }
        } else if (sy < s.top - vh * 1.05) s.el.classList.remove("is-in");
      } else if (s.tall && s.name !== "team") {
        if (sy > s.top - vh * 0.6) s.el.classList.add("is-in");
        else if (sy < s.top - vh * 1.05) s.el.classList.remove("is-in");
      }

      // parallax
      if (s.name === "hero" && this.ready) {
        const hp = clamp(sy / (vh * 1.55), 0, 1);
        const ez = hp * hp * (3 - 2 * hp) * 0.35 + hp * 0.65;
        for (const l of s.planes) {
          const z = 1 + l.zoom * ez;
          const io = 1 + this.intro.v * (0.13 + l.d * 0.5);
          l.el.style.transformOrigin = l.org;
          l.el.style.transform = `translate3d(${(-this.mx * l.d * ampX).toFixed(2)}px,${(-this.my * l.d * ampY - (ez * l.d * vh * 0.32) / s.k).toFixed(2)}px,0) scale(${(l.bleed * z * io).toFixed(4)})`;
        }
        const fade = clamp(1 - hp * 2.4, 0, 1);
        if (this.heroCopy) {
          this.heroCopy.style.opacity = String(fade);
          this.heroCopy.style.transform = `translate3d(0,${-hp * 60}px,0)`;
        }
        for (const b of this.heroBits) {
          b.style.transition = "none";
          b.style.opacity = String(fade);
        }
        if (this.heroDim) this.heroDim.style.opacity = (hp * 0.7).toFixed(3);
      } else {
        for (const l of s.planes) {
          l.el.style.transform = `translate3d(${(-this.mx * l.d * ampX).toFixed(2)}px,${(-this.my * l.d * ampY - (p * l.d * vh * 0.34) / s.k).toFixed(2)}px,0) scale(${l.bleed})`;
        }
      }

      const prog = s.tall ? clamp((sy - s.top) / Math.max(1, s.h - vh), 0, 1) : 0;
      s.controller?.tick?.(dt, this.T, p, { vw, vh, prog });
    }

    for (const { f, s } of this.fields) {
      if (s && s.vis && !document.hidden) f.update(dt);
    }
    this.spy(sy);
    this.raf = requestAnimationFrame(this.frame);
  };

  private spy(sy: number) {
    let cur = this.scenes[0];
    for (const s of this.scenes) if (s.top <= sy + this.vh * 0.5) cur = s;
    if (cur) sceneStore.set(cur.name);
  }

  /* ── teardown ──────────────────────────────────────────────────────────── */

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resizeTimer);
    this.tween?.stop();
    this.offs.splice(0).forEach((off) => off());
    for (const s of this.scenes) s.controller?.destroy();
    this.lenis?.destroy();
    this.lenis = null;
    setEngineHandle(null);
  }
}
