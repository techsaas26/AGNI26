/**
 * The loader: the AGNI'26 lettering runs in from the right and hops, lands and rings; the props
 * pop out around it; dust puffs off every landing — one GSAP timeline — while the page's pictures
 * and fonts arrive. When both are done the whole loader catches fire (lib/burn.ts) and burns away
 * to reveal the site, which starts moving underneath it.
 */
import { logoSheet, type LogoPart } from "@/data/preloader";
import { sfx } from "@/lib/audio";
import { createBurn } from "@/lib/burn";
import { gsap } from "@/lib/gsap";

export interface LoaderElements {
  root: HTMLElement;
  /** Sizes the 1600×800 stage. */
  wrap: HTMLElement;
  stage: HTMLElement;
  dust: HTMLCanvasElement;
  grain: HTMLElement;
  final: HTMLElement;
  bar: HTMLElement;
  pct: HTMLElement;
  status: HTMLElement;
  caption: HTMLElement;
}

export interface LoaderOptions {
  /** Pictures the page needs besides the `<img>` tags already in the DOM. */
  preload: string[];
  /** Called as the burn begins: scrolling starts and the hero dollies in. */
  onOpen: () => void;
}

const LETTERS = ["A", "G", "N", "I", "apos", "two", "six"];
const PROP_ORDER = ["film", "camera", "gramophone", "books", "mic", "record", "notes", "car"];

const RUN_SPEED = 3000; // logo px per second
const LAUNCH_AT = 0.15;
const LAUNCH_GAP = 0.2;
const HOP = 34; // px
const HOP_PERIOD = 0.13; // s

/** The burn: slow ignition, then a rush. */
const burnEase = (t: number) => 0.45 * t + 0.55 * t * t * (3 - 2 * t);

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
}

export function startLoader(el: LoaderElements, { preload, onOpen }: LoaderOptions): () => void {
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const SKIP = /[?&]skip/.test(location.search);
  const { W, H } = logoSheet;
  let dead = false;
  let fire: ReturnType<typeof createBurn> = null;

  const ctx = gsap.context(() => {
    /* ── what we are waiting for ── */
    const imgs = [...document.querySelectorAll<HTMLImageElement>("main img, #loader img")];
    const total = imgs.length + preload.length + 1;
    let loaded = 0;
    const bump = () => {
      loaded++;
    };
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth) bump();
      else {
        img.addEventListener("load", bump, { once: true });
        img.addEventListener("error", bump, { once: true });
      }
    });
    preload.forEach((src) => {
      const i = new Image();
      i.onload = i.onerror = bump;
      i.src = src;
    });
    (document.fonts?.ready ?? Promise.resolve()).then(bump, bump);
    gsap.delayedCall(12, () => {
      loaded = total; // never hang on a missing asset
    });

    /* ── fit the 1600×800 logo space into its wrapper ── */
    const fit = () => gsap.set(el.stage, { scale: el.wrap.clientWidth / W, transformOrigin: "0 0" });
    const ro = new ResizeObserver(fit);
    ro.observe(el.wrap);
    fit();

    /* ── film grain: one noise tile, nudged to a new spot five times a second ── */
    {
      const c = document.createElement("canvas");
      c.width = c.height = 160;
      const g = c.getContext("2d")!;
      const d = g.createImageData(160, 160);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
      el.grain.style.backgroundImage = `url(${c.toDataURL()})`;
      if (!reduce) {
        const tl = gsap.timeline({ repeat: -1 });
        (
          [
            [0, 0],
            [-37, 23],
            [51, -61],
            [-83, -17],
            [29, 71],
          ] as const
        ).forEach(([x, y], i) => tl.set(el.grain, { x, y }, i * 0.1));
        tl.to({}, { duration: 0.1 });
      }
    }

    /* ── the pieces ── */
    type Piece = LogoPart & { img: HTMLImageElement };
    const piece: Record<string, Piece> = {};
    for (const p of logoSheet.parts) {
      const img = el.stage.querySelector<HTMLImageElement>(`img[data-part="${p.name}"]`);
      if (!img) continue;
      piece[p.name] = { ...p, img };
      gsap.set(img, { x: p.x, y: p.y, opacity: 0, transformOrigin: p.kind === "letter" ? "50% 100%" : "50% 50%" });
    }
    const all = Object.values(piece);

    /* ── dust puffs where a letter lands ── */
    const dust = el.dust.getContext("2d")!;
    let motes: Mote[] = [];
    const puff = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++)
        motes.push({ x, y, vx: 120 + Math.random() * 380, vy: -60 - Math.random() * 160, life: 1, r: 4 + Math.random() * 9 });
    };
    const drawDust = (_time: number, ms: number) => {
      const dt = Math.min(0.05, ms / 1000);
      dust.clearRect(0, 0, W, H);
      motes = motes.filter((m) => (m.life -= dt * 1.8) > 0);
      for (const m of motes) {
        m.vy += 260 * dt;
        m.vx *= 0.96;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        dust.fillStyle = `rgba(255,168,60,${m.life * 0.3})`; // warm dust, matched to the site's amber
        dust.beginPath();
        dust.arc(m.x, m.y, m.r * (1.6 - m.life * 0.6), 0, 7);
        dust.fill();
      }
    };
    gsap.ticker.add(drawDust);

    /* ── the choreography ── */
    const tl = gsap.timeline({ paused: true });

    LETTERS.forEach((name, i) => {
      const b = piece[name];
      if (!b) return;
      const t0 = LAUNCH_AT + i * LAUNCH_GAP;
      const dist = W - b.x + 120 + ((i * 37) % 60); // just off the right edge
      const dur = dist / RUN_SPEED;
      const k = Math.max(1, Math.round(dur / HOP_PERIOD));
      const half = dur / (2 * k);
      const hit = t0 + dur;

      tl.set(b.img, { opacity: 1, x: b.x + dist, y: b.y, rotation: -11, scaleX: 1.08, scaleY: 0.94 }, t0)
        // the run: a hopping gait with a lean, a waddle and a stretch in the air
        .to(b.img, { x: b.x, duration: dur, ease: "none" }, t0)
        .to(b.img, { y: b.y - HOP, duration: half, ease: "sine.out", repeat: 2 * k - 1, yoyo: true }, t0)
        .to(b.img, { rotation: -6, duration: half, ease: "sine.inOut", repeat: 2 * k - 1, yoyo: true }, t0)
        .to(b.img, { scaleY: 1.06, scaleX: 0.96, duration: half, ease: "sine.inOut", repeat: 2 * k - 1, yoyo: true }, t0)
        // the landing: squashed against the others, then it rings out
        .to(b.img, { scaleX: 0.74, scaleY: 1.2, rotation: -6, x: b.x - 12, duration: 0.07, ease: "power2.out" }, hit)
        .to(b.img, { scaleX: 1, scaleY: 1, rotation: 0, x: b.x, duration: 0.95, ease: "elastic.out(1, 0.34)" }, hit + 0.07)
        .call(() => puff(b.x + 10, b.y + b.h - 6, 14), [], hit);

      // the letters already standing take the knock, fading down the line
      for (let k2 = i - 1, f = 1; k2 >= 0 && f > 0.15; k2--, f *= 0.5) {
        const n = piece[LETTERS[k2]];
        if (!n) continue;
        tl.fromTo(
          n.img,
          { skewX: 7 * f, yPercent: -3 * f },
          { skewX: 0, yPercent: 0, duration: 0.75, ease: "elastic.out(1, 0.4)", immediateRender: false },
          hit,
        );
      }
    });

    /** A prop pops out from behind the lettering and springs into place. */
    const SPECIAL: Record<string, Partial<{ dx: number; dy: number; sx: number; sy: number; rot: number; ease: string }>> = {
      car: { dx: 420, dy: 0, sx: 1, sy: 1, rot: 4, ease: "back.out(1.1)" },
      notes: { dx: -30, dy: 140, sx: 0.6, sy: 0.6 },
      flourish: { dx: 0, dy: 120, sx: 0.4, sy: 1, rot: 0 },
      plaque: { dx: 0, dy: 0, sx: 0.55, sy: 0.3, rot: 0 },
    };
    const pop = (name: string, at: number) => {
      const b = piece[name];
      if (!b) return;
      // start tucked behind the lettering, small, then spring out to its place
      const f = {
        dx: (780 - (b.x + b.w / 2)) * 0.75,
        dy: (470 - (b.y + b.h / 2)) * 0.75,
        sx: 0.25,
        sy: 0.25,
        rot: ((PROP_ORDER.indexOf(name) * 29) % 40) - 20,
        ease: "back.out(1.9)",
        ...SPECIAL[name],
      };
      tl.set(b.img, { opacity: 0, x: b.x + f.dx, y: b.y + f.dy, scaleX: f.sx, scaleY: f.sy, rotation: f.rot }, at)
        .to(b.img, { opacity: 1, duration: 0.18, ease: "power1.out" }, at)
        .to(b.img, { x: b.x, y: b.y, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.9, ease: f.ease }, at);
    };
    pop("plaque", 1.0);
    pop("flourish", 1.12);
    PROP_ORDER.forEach((n, i) => pop(n, 1.3 + i * 0.11));

    /* ── progress, and the hand-off to the burn ── */
    let finished = false;
    const setBar = gsap.quickSetter(el.bar, "width", "%");
    const progress = (p: number, label?: string) => {
      const v = Math.round(p * 100);
      el.pct.textContent = v + "%";
      setBar(v);
      if (label && el.status.textContent !== label) el.status.textContent = label;
    };
    el.status.textContent = "Rolling film";
    progress(0);
    gsap.set(el.final, { opacity: 0 });

    const gone = () => {
      el.root.classList.add("is-gone");
      document.documentElement.classList.remove("lock");
    };

    /** The whole loader burns away (GPU fire shader), revealing the page underneath. */
    const enter = () => {
      if (dead) return;
      sfx.set(true);
      sfx.ignite();
      document.getElementById("cursor")?.classList.remove("hot");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      onOpen();

      fire = createBurn(el.final as HTMLImageElement);
      if (!fire) {
        gsap.to(el.root, { opacity: 0, duration: 0.6, ease: "power1.out", onComplete: gone });
        return;
      }
      fire.draw(0, gsap.ticker.time); // paint first, then hide the DOM copy: no blank frame
      el.root.style.visibility = "hidden";
      const p = { v: 0 };
      gsap.to(p, {
        v: 1,
        duration: SKIP ? 0.6 : 2.8,
        ease: burnEase,
        onUpdate: () => fire?.draw(p.v, gsap.ticker.time),
        onComplete: () => {
          fire?.destroy();
          fire = null;
          gone();
        },
      });
    };

    const finish = () => {
      finished = true;
      progress(1, "AGNI’26 is ready");
      // the exact logo fades in over the pieces, the caption steps aside, then the fire
      gsap.to(el.final, { opacity: 1, duration: 0.45, ease: "power1.out" });
      gsap.to(el.caption, { opacity: 0, y: 10, duration: 0.4, ease: "power2.in", delay: SKIP ? 0 : 0.3 });
      gsap.delayedCall(SKIP ? 0.15 : 0.75, enter);
    };

    const watch = () => {
      if (dead || finished) return;
      const done = tl.progress() >= 1;
      const shown = Math.min(0.99, tl.progress() * 0.99, loaded / total);
      progress(done && loaded >= total ? 1 : shown, tl.time() < 1.0 ? "Rolling film" : "Setting the stage");
      if (done && loaded >= total) finish();
    };
    gsap.ticker.add(watch);

    // roll as soon as every sprite has decoded (or after a short grace period)
    let started = false;
    const go = () => {
      if (started || dead) return;
      started = true;
      if (reduce || SKIP) tl.progress(1, true);
      else tl.play(0);
    };
    Promise.all(all.map((b) => b.img.decode().catch(() => {}))).then(go);
    gsap.delayedCall(4, go);

    return () => {
      gsap.ticker.remove(drawDust);
      gsap.ticker.remove(watch);
      ro.disconnect();
    };
  });

  return () => {
    dead = true;
    fire?.destroy();
    fire = null;
    ctx.revert();
  };
}
