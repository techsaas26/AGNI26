import { sfx } from "@/lib/audio";
import type { Field } from "@/lib/fx";
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

  let lit = 0;
  let field: Field | null = null;
  let auto = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const setDark = () => {
    dark.style.opacity = (1 - (lit / 5) * 0.9).toFixed(2);
  };
  setDark();

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
  sc.querySelectorAll<SVGGElement>(".drum").forEach((d, i) => {
    l.on(d, "pointerdown", (e) => {
      const ev = e as PointerEvent;
      sfx.chenda(i ? 150 : 190);
      d.classList.remove("hit");
      void d.getBoundingClientRect();
      d.classList.add("hit");
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
      timer = setTimeout(() => {
        if (lit === 0) light(2);
      }, 1700);
    },
    destroy() {
      l.clear();
      if (timer) clearTimeout(timer);
    },
  };
}
