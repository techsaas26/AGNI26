import { sfx } from "@/lib/audio";
import { gsap, EASE } from "@/lib/gsap";
import { byId, listeners, type SceneController, type SceneEnv } from "./types";

const POLAROIDS = [
  "/images/gallery/campus-bench.webp",
  "/images/gallery/maple-lake.webp",
  "/images/hero/hero-poster.jpg",
  "/images/branding/agni26-logo.webp",
];

/** Fashion Show — curtains part as the scene arrives; the cursor is the spotlight; click for a flash and a falling polaroid. */
export function setupFashion(env: SceneEnv): SceneController | null {
  const sc = byId("fashion");
  const spot = byId("spot");
  const curL = byId<SVGGElement>("curL");
  const curR = byId<SVGGElement>("curR");
  if (!sc || !spot || !curL || !curR) return null;

  // the stage's own curtains part just after the house curtain has (see the cut in lib/transitions.ts)
  gsap
    .timeline({
      defaults: { ease: EASE.breathe },
      scrollTrigger: {
        trigger: sc,
        start: () => env.arrive() - (env.arrive() - env.appear()) * 0.3,
        end: () => env.arrive() + (env.leave() - env.arrive()) * 0.28,
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(curL, { x: 0 }, { x: -250 }, 0)
    .fromTo(curR, { x: 0 }, { x: 250 }, 0);

  // the spotlight trails the pointer with a soft follow
  const sx = gsap.quickTo(spot, "--sx", { duration: 0.6, ease: "power3.out" });
  const sy = gsap.quickTo(spot, "--sy", { duration: 0.6, ease: "power3.out" });
  let n = 0;
  const drops = new Set<gsap.core.Timeline>();

  const l = listeners();
  l.on(sc, "pointermove", (e) => {
    const ev = e as PointerEvent;
    const r = sc.getBoundingClientRect();
    sx(((ev.clientX - r.left) / r.width) * 100);
    sy(((ev.clientY - r.top) / r.height) * 100);
  });
  l.on(sc, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    if ((ev.target as Element).closest("a")) return;
    const f = byId("flash");
    if (f) gsap.fromTo(f, { opacity: 0.9 }, { opacity: 0, duration: 0.7, ease: "power2.out", overwrite: true });
    sfx.snap();

    const r = sc.getBoundingClientRect();
    const rot = Math.random() * 16 - 8;
    const d = document.createElement("div");
    d.className = "pol-drop";
    d.style.cssText = `left:${ev.clientX - r.left}px;top:${ev.clientY - r.top}px`;
    d.innerHTML = `<i style="background-image:url(${POLAROIDS[n++ % POLAROIDS.length]})"></i><span>AGNI’26</span>`;
    sc.appendChild(d);
    // drops in, develops while it drifts, then falls away
    gsap.set(d, { rotation: rot - 8, y: -40, opacity: 0 });
    const tl: gsap.core.Timeline = gsap
      .timeline({
        onComplete: () => {
          d.remove();
          drops.delete(tl);
        },
      })
      .to(d, { opacity: 1, y: 0, rotation: rot, duration: 0.6, ease: "back.out(1.8)" })
      .to(d.querySelector("i"), { filter: "blur(0px) brightness(1) sepia(0.2)", duration: 3, ease: "power1.out" }, 0.2)
      .to(d, { y: 40, duration: 3.6, ease: "none" }, 0.6)
      .to(d, { y: 120, rotation: rot + 6, opacity: 0, duration: 0.8, ease: "power2.in" }, 4.2);
    drops.add(tl);
  });

  return {
    destroy() {
      l.clear();
      drops.forEach((t) => t.kill());
      drops.clear();
      sc.querySelectorAll(".pol-drop").forEach((d) => d.remove());
    },
  };
}
