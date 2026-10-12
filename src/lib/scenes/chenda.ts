import { sfx } from "@/lib/audio";
import type { Field } from "@/lib/fx";
import { gsap, EASE } from "@/lib/gsap";
import { byId, listeners, type SceneController } from "./types";

/** Inauguration & Chenda Melam — light the five-wick lamp, strike the drums. */
export function setupChenda(): SceneController | null {
  const sc = byId("chenda");
  const lamp = byId<SVGGElement>("lamp");
  const hint = byId("hint-lamp");
  const tag = sc?.querySelector<HTMLElement>(".tagline");
  const dark = sc?.querySelector<HTMLElement>(".ch-dark");
  if (!sc || !lamp || !hint || !tag || !dark) return null;

  const flames = [0, 1, 2, 3, 4].map((i) => byId<SVGGElement>("flame" + i)!);
  if (flames.some((f) => !f)) return null;
  const drums = [...sc.querySelectorAll<SVGGElement>(".drum")];

  // unlit: a spark of a flame, folded down onto its wick
  gsap.set(flames, { scale: 0.2, opacity: 0, transformOrigin: "50% 100%" });
  gsap.set(drums, { transformOrigin: "50% 100%" });
  gsap.set(dark, { opacity: 1 });

  let lit = 0;
  let field: Field | null = null;
  let auto = false;
  let call: gsap.core.Tween | undefined;

  /** The veil over the stage lifts as the lamp fills up. */
  const setDark = () => gsap.to(dark, { opacity: 1 - (lit / 5) * 0.9, duration: 1.6, ease: "power2.out", overwrite: true });

  /** Centre of a flame, in the scene's own pixel space. */
  const flamePos = (i: number): [number, number] => {
    const r = flames[i].getBoundingClientRect();
    const s = sc.getBoundingClientRect();
    return [r.left + r.width / 2 - s.left, r.top + r.height * 0.35 - s.top];
  };

  const light = (i: number) => {
    if (flames[i].classList.contains("on")) return false;
    flames[i].classList.add("on");
    lit++;
    gsap.to(flames[i], { opacity: 1, duration: 0.35, ease: "power1.out", overwrite: "auto" });
    gsap.to(flames[i], { scale: 1, duration: 1.3, ease: EASE.spring, overwrite: "auto" });
    setDark();
    sfx.light();
    if (field) {
      const [x, y] = flamePos(i);
      const d = field.dpr || 1;
      field.burst(x * d, y * d, 26, { cone: 2.4, speed: 300 });
    }
    if (lit === 5) {
      sfx.flare();
      sc.classList.add("all-lit");
      if (hint.lastChild) hint.lastChild.textContent = "The fest begins · strike the drums";
      tag.textContent = "Let the fest begin";
      // all five roar up together, once the last wick has finished catching
      gsap.to(flames, { scale: 1.18, duration: 0.45, ease: "power2.out", yoyo: true, repeat: 1, stagger: 0.05, delay: 1.3 });
      if (field) {
        for (let k = 0; k < 5; k++) {
          const [x, y] = flamePos(k);
          const d = field.dpr || 1;
          field.burst(x * d, y * d, 24, { cone: 3, speed: 420 });
        }
      }
    } else if (hint.lastChild) hint.lastChild.textContent = `Light the lamp · ${lit} / 5`;
    return true;
  };

  const l = listeners();
  l.on(lamp, "click", (e) => {
    const ev = e as MouseEvent;
    let best = 0;
    let bd = 1e9;
    flames.forEach((f, i) => {
      if (f.classList.contains("on")) return;
      const r = f.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - ev.clientX);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    light(best);
  });
  drums.forEach((d, i) => {
    l.on(d, "pointerdown", (e) => {
      const ev = e as PointerEvent;
      sfx.chenda(i ? 150 : 190);
      // the skin is struck: squashed flat, then it rings back
      gsap.fromTo(d, { scaleX: 1.07, scaleY: 0.93 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: "elastic.out(1, 0.32)", overwrite: true });
      if (field) {
        const r = sc.getBoundingClientRect();
        const dp = field.dpr || 1;
        field.burst((ev.clientX - r.left) * dp, (ev.clientY - r.top) * dp, 10, { cone: 3.2, speed: 230 });
      }
    });
  });

  return {
    bindField(f) {
      field = f;
    },
    /** The lamp lights its middle wick by itself shortly after the scene arrives. */
    enter() {
      if (auto) return;
      auto = true;
      call = gsap.delayedCall(1.7, () => {
        if (lit === 0) light(2);
      });
    },
    destroy() {
      l.clear();
      call?.kill();
    },
  };
}
