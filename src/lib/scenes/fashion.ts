import { sfx } from "@/lib/audio";
import { clamp, lerp } from "@/lib/utils";
import { byId, listeners, type SceneController } from "./types";

const POLAROIDS = [
  "/images/gallery/campus-bench.webp",
  "/images/gallery/maple-lake.webp",
  "/images/hero/hero-poster.jpg",
  "/images/branding/agni26-logo.webp",
];

/** Fashion Show — the cursor is the spotlight; click for a camera flash and a falling polaroid. */
export function setupFashion(): SceneController | null {
  const sc = byId("fashion");
  const spot = byId("spot");
  const curL = byId<SVGGElement>("curL");
  const curR = byId<SVGGElement>("curR");
  if (!sc || !spot || !curL || !curR) return null;

  let sx = 0.5;
  let sy = 0.62;
  let tx = 0.5;
  let ty = 0.62;
  let n = 0;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const l = listeners();
  l.on(sc, "pointermove", (e) => {
    const ev = e as PointerEvent;
    const r = sc.getBoundingClientRect();
    tx = (ev.clientX - r.left) / r.width;
    ty = (ev.clientY - r.top) / r.height;
  });
  l.on(sc, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    if ((ev.target as Element).closest("a")) return;
    const f = byId("flash");
    if (f) {
      f.classList.add("on");
      requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove("on")));
    }
    sfx.snap();
    const r = sc.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "pol-drop";
    d.style.cssText = `left:${ev.clientX - r.left}px;top:${ev.clientY - r.top}px;--r:${(Math.random() * 16 - 8).toFixed(1)}deg`;
    d.innerHTML = `<i style="background-image:url(${POLAROIDS[n++ % POLAROIDS.length]})"></i><span>AGNI’26</span>`;
    sc.appendChild(d);
    const t = setTimeout(() => {
      d.remove();
      timers.delete(t);
    }, 5200);
    timers.add(t);
  });

  return {
    tick(_dt, _t, p) {
      sx = lerp(sx, tx, 0.1);
      sy = lerp(sy, ty, 0.1);
      spot.style.setProperty("--sx", (sx * 100).toFixed(1) + "%");
      spot.style.setProperty("--sy", (sy * 100).toFixed(1) + "%");
      const open = clamp(1 + p * 1.25, 0, 1);
      const e = open * open * (3 - 2 * open);
      const dx = e * 250;
      curL.setAttribute("transform", `translate(${(-dx).toFixed(1)} 0)`);
      curR.setAttribute("transform", `translate(${dx.toFixed(1)} 0)`);
    },
    destroy() {
      l.clear();
      timers.forEach(clearTimeout);
      timers.clear();
      sc.querySelectorAll(".pol-drop").forEach((d) => d.remove());
    },
  };
}
