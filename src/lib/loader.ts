/**
 * The loader: a match burns down while the page's pictures and fonts arrive,
 * the flame flares into the logo, and a click strikes the fest open.
 */
import { animate } from "framer-motion";
import { sfx } from "@/lib/audio";
import { Flame } from "@/lib/fx";
import { clamp } from "@/lib/utils";

export interface LoaderElements {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  glow: HTMLElement;
  counter: HTMLElement;
  num: HTMLElement;
  word: HTMLElement;
  status: HTMLElement;
  logo: HTMLElement;
  enter: HTMLElement;
  enterBtn: HTMLElement;
  muteBtn: HTMLElement;
  line: HTMLElement;
  lineWrap: HTMLElement;
  gateTop: HTMLElement;
  gateBottom: HTMLElement;
}

export interface LoaderOptions {
  /** Pictures the page needs besides the `<img>` tags already in the DOM. */
  preload: string[];
  /** Called as the gate starts to open. */
  onOpen: () => void;
}

const WORDS: [number, string, string][] = [
  [0, "अग्नि", "hi"],
  [0.27, "அக்னி", "ta"],
  [0.56, "Agni", ""],
  [0.86, "AGNI’26", ""],
];
const STATUS: [number, string][] = [
  [0, "Striking the match…"],
  [0.18, "Rewinding the reel…"],
  [0.4, "Warming up the projector…"],
  [0.62, "Dusting off the cassettes…"],
  [0.82, "Trimming the lamp…"],
  [0.97, "Ready."],
];

const power1Out = (t: number) => 1 - (1 - t) * (1 - t);
const power2In = (t: number) => t * t * t;
const power3Out = (t: number) => 1 - Math.pow(1 - t, 4);
const power4InOut = (t: number) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2);

export function startLoader(el: LoaderElements, { preload, onOpen }: LoaderOptions): () => void {
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const SKIP = /[?&]skip/.test(location.search);
  const MIN = SKIP ? 0.05 : reduce ? 0.6 : 3.6;

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const stops: (() => void)[] = [];
  let raf = 0;
  let dead = false;

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };
  /** Tween 0→1 over `duration`, handing the eased value to `fn`. */
  const tween = (duration: number, ease: (t: number) => number, fn: (v: number) => void, delay = 0) => {
    const a = animate(0, 1, { duration, delay, ease, onUpdate: fn });
    stops.push(() => a.stop());
  };

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
  later(() => {
    loaded = total;
  }, 9000);

  /* ── start state (also resets a previous run, e.g. React StrictMode) ── */
  el.word.className = "";
  el.word.textContent = WORDS[0][1];
  el.status.textContent = STATUS[0][1];
  el.logo.style.opacity = "0";

  const flame = new Flame(el.canvas);
  const onResize = () => flame.resize();
  addEventListener("resize", onResize);

  let shown = 0;
  let wi = -1;
  let si = -1;
  let done = false;
  let burn = 1;
  let stage = 0;
  let flareStart = 0;
  let entering = false;
  const t0 = performance.now();
  let prev = t0;

  const setWord = (i: number) => {
    if (i === wi) return;
    wi = i;
    const w = el.word;
    const [, txt, cls] = WORDS[i];
    w.classList.add("sw");
    later(
      () => {
        w.textContent = txt;
        w.className = "sw " + cls;
        requestAnimationFrame(() => w.classList.remove("sw"));
      },
      i ? 260 : 0,
    );
  };

  const tick = (now: number) => {
    if (dead) return;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const elapsed = (now - t0) / 1000;
    const target = Math.min(loaded / total, clamp(elapsed / MIN, 0, 1));
    shown = Math.min(target, shown + dt * 0.55);
    if (shown < target) shown += (target - shown) * Math.min(1, dt * 2.5);
    const p = clamp(shown, 0, 1);

    el.num.textContent = String(Math.round(p * 100)).padStart(2, "0");
    el.line.style.transform = `scaleX(${p})`;
    for (let i = WORDS.length - 1; i >= 0; i--) {
      if (p >= WORDS[i][0]) {
        setWord(i);
        break;
      }
    }
    for (let i = STATUS.length - 1; i >= 0; i--) {
      if (p >= STATUS[i][0]) {
        if (si !== i) {
          si = i;
          el.status.textContent = STATUS[i][1];
        }
        break;
      }
    }

    // the match: geometry follows the burn
    const W = innerWidth;
    const H = innerHeight;
    const len = Math.min(H * 0.5, 430);
    const cx = W / 2;
    const top = H * 0.5 - len * 0.5;
    const front = top + p * len * 0.97;
    const pw = stage === 0 ? 0.55 + 0.7 * Math.sin(Math.min(1, p) * Math.PI * 0.9) + 0.3 * p : 1;
    flame.set(cx, front - 4, burn * pw);
    flame.boost = stage >= 1 ? clamp((now - flareStart) / 900, 0, 1) : 0;
    flame.step(dt);
    el.glow.style.setProperty("--fx", "50%");
    el.glow.style.setProperty("--fy", ((front / H) * 100).toFixed(1) + "%");
    el.glow.style.opacity = (0.35 + p * 0.4 + flame.boost * 0.6).toFixed(2);

    flame.draw((c, d) => {
      if (burn <= 0.01) return;
      c.globalAlpha = burn;
      const w = 9 * d;
      const x0 = cx * d - w / 2;
      const yT = top * d;
      const yB = (top + len) * d;
      const yf = front * d;
      const g = c.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, "#b88f50");
      g.addColorStop(0.5, "#f4e0b0");
      g.addColorStop(1, "#a67c40");
      c.fillStyle = g;
      c.beginPath();
      c.roundRect(x0, yf, w, Math.max(0, yB - yf), w / 2);
      c.fill();
      c.fillStyle = "rgba(90,50,20,.35)";
      for (let i = 0; i < 9; i++) {
        const yy = yf + ((i * 53) % Math.max(8, yB - yf));
        c.fillRect(x0 + 1.5 * d, yy, w - 3 * d, 1 * d);
      }
      c.fillStyle = "#0f0705";
      c.beginPath();
      c.roundRect(x0 + 0.8 * d, yT, w - 1.6 * d, Math.max(2, yf - yT + 4 * d), 3 * d);
      c.fill();
      const eg = c.createLinearGradient(0, yf - 18 * d, 0, yf + 12 * d);
      eg.addColorStop(0, "rgba(255,90,10,0)");
      eg.addColorStop(0.65, "rgba(255,150,50,.95)");
      eg.addColorStop(1, "rgba(255,210,120,0)");
      c.fillStyle = eg;
      c.fillRect(x0 - 1 * d, yf - 18 * d, w + 2 * d, 30 * d);
      c.fillStyle = p > 0.01 ? "#0c0504" : "#9a1f12";
      c.beginPath();
      c.ellipse(cx * d, yT - 4 * d, 8.5 * d, 12 * d, 0, 0, 7);
      c.fill();
      c.globalAlpha = 1;
    });

    if (!done && p >= 0.995 && loaded >= total) {
      done = true;
      complete();
    }
    if (!(stage === 2 && el.root.classList.contains("is-opening") && burn <= 0)) raf = requestAnimationFrame(tick);
  };

  /** The match is spent: the flame flares and becomes the logo. */
  function complete() {
    stage = 1;
    flareStart = performance.now();
    el.status.textContent = "Ready.";
    tween(0.6, power1Out, (v) => {
      el.counter.style.opacity = String(1 - v);
      el.status.style.opacity = String(1 - v);
    });
    tween(1, power1Out, (v) => (burn = 1 - v), 0.35);
    tween(
      1.6,
      power3Out,
      (v) => {
        el.logo.style.opacity = String(v);
        el.logo.style.transform = `translate(-50%,-50%) scale(${0.94 + 0.06 * v})`;
        el.logo.style.filter = `brightness(${2.2 - 1.2 * v}) blur(${14 - 14 * v}px) saturate(${1.4 - 0.4 * v})`;
      },
      0.5,
    );
    tween(0.5, power1Out, (v) => (el.word.style.opacity = String(1 - v)));

    later(() => el.enter.classList.add("show"), 1500);
    const auto = later(() => enter(false), SKIP ? 200 : 9000);
    el.enterBtn.addEventListener(
      "click",
      () => {
        clearTimeout(auto);
        enter(true);
      },
      { once: true },
    );
    el.muteBtn.addEventListener(
      "click",
      () => {
        clearTimeout(auto);
        enter(false);
      },
      { once: true },
    );
  }

  /** The gate opens: flash, the logo burns away, the two halves slide apart. */
  function enter(sound: boolean) {
    if (entering) return;
    entering = true;
    stage = 2;
    sfx.set(sound);
    if (sound) sfx.ignite();
    document.getElementById("cursor")?.classList.remove("hot");
    const fl = document.getElementById("flash");
    fl?.classList.add("on");

    // 0s — chrome fades out
    tween(0.35, power1Out, (v) => {
      for (const n of [el.enter, el.status, el.lineWrap]) n.style.opacity = String(1 - v);
    });
    // .12s — end the flash
    later(() => fl?.classList.remove("on"), 120);
    // .1s — the logo flares away
    tween(
      1,
      power2In,
      (v) => {
        el.logo.style.opacity = String(1 - v);
        el.logo.style.transform = `translate(-50%,-50%) scale(${1 + 0.35 * v})`;
        el.logo.style.filter = `brightness(${1 + 1.4 * v}) blur(${18 * v}px) saturate(1)`;
      },
      0.1,
    );
    // .55s — the gate starts to open and the page comes alive
    later(() => {
      el.root.classList.add("is-opening");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      onOpen();
    }, 550);
    // .6s — the two halves of the gate part
    tween(1.5, power4InOut, (v) => (el.gateTop.style.transform = `translateY(${-101 * v}%)`), 0.6);
    tween(1.5, power4InOut, (v) => (el.gateBottom.style.transform = `translateY(${101 * v}%)`), 0.6);
    // .7s — flame canvas and glow fade
    later(() => {
      const cv0 = parseFloat(getComputedStyle(el.canvas).opacity) || 1;
      const gl0 = parseFloat(getComputedStyle(el.glow).opacity) || 1;
      tween(0.9, power1Out, (v) => {
        el.canvas.style.opacity = String(cv0 * (1 - v));
        el.glow.style.opacity = String(gl0 * (1 - v));
      });
    }, 700);
    // 2.3s — take the loader out of the page
    later(() => {
      el.root.classList.add("is-gone");
      document.documentElement.classList.remove("lock");
    }, 2300);
  }

  raf = requestAnimationFrame((t) => {
    prev = t;
    tick(t);
  });

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    timers.clear();
    stops.splice(0).forEach((stop) => stop());
    removeEventListener("resize", onResize);
  };
}
