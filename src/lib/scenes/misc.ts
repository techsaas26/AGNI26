import { sfx } from "@/lib/audio";
import { tilt } from "@/lib/fx";
import { clamp, lerp } from "@/lib/utils";
import { byId, listeners, type SceneController } from "./types";

/** Register ticket, contact postcard and the merch tee tilt toward the pointer; the tee flips on click. */
export function setupToys(): SceneController {
  const offs = [tilt(byId("ticket"), { max: 10 }), tilt(byId("postcard"), { max: 5 })];
  const l = listeners();
  const wrap = byId("tee-wrap");
  const tee = byId("tee");
  if (wrap && tee) {
    offs.push(tilt(wrap, { max: 11 }));
    l.on(tee, "click", () => {
      tee.classList.toggle("is-back");
      sfx.clack();
    });
  }
  return {
    destroy() {
      offs.forEach((off) => off());
      l.clear();
    },
  };
}

/** About — the words of the paragraph light up as you scroll. */
export function setupAbout(): SceneController | null {
  const el = byId("about-text");
  if (!el) return null;
  const ws = [...el.querySelectorAll<HTMLElement>(".w")];
  let last = -1;
  return {
    tick(_dt, _t, p) {
      const n = Math.round(clamp((p + 0.55) / 0.95, 0, 1) * ws.length);
      if (n === last) return;
      last = n;
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    },
    destroy() {},
  };
}

/** Gallery — the film strip winds sideways while the section is pinned. */
export function setupReel(): SceneController | null {
  const track = byId("reel-track");
  const meter = byId("reel-meter");
  if (!track || !meter) return null;
  const frames = [...track.querySelectorAll<HTMLElement>(".frame")];
  return {
    tick(_dt, _t, _p, ctx) {
      const max = Math.max(0, track.scrollWidth - ctx.vw * 0.62);
      const x = ctx.prog * max;
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,-50%,0)`;
      meter.style.transform = `scaleX(${ctx.prog.toFixed(3)})`;
      const mid = ctx.vw * 0.5;
      frames.forEach((f) => {
        const r = f.getBoundingClientRect();
        f.classList.toggle("is-center", Math.abs(r.left + r.width / 2 - mid) < r.width * 0.55);
      });
    },
    destroy() {},
  };
}

/** Team — the credits roll up the screen as you scroll. */
export function setupCredits(): SceneController | null {
  const roll = byId("credits-roll");
  if (!roll) return null;
  return {
    tick(_dt, _t, _p, ctx) {
      const h = roll.offsetHeight;
      const y = lerp(ctx.vh * 0.92, -(h - ctx.vh * 0.62), ctx.prog);
      roll.style.transform = `translate(-50%,${y.toFixed(1)}px)`;
    },
    destroy() {},
  };
}
