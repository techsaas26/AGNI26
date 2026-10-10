import { sfx } from "@/lib/audio";
import { clamp } from "@/lib/utils";
import { byId, listeners, type SceneController } from "./types";

/** Concert Night — press play on the cassette: reels spin, an EQ runs, a beat starts. */
export function setupConcert(): SceneController | null {
  const sc = byId("events");
  const cass = byId("cassette");
  const eq = byId<HTMLCanvasElement>("eq-canvas");
  const L = byId("reelL");
  const R = byId("reelR");
  const hint = byId("hint-cassette");
  if (!sc || !cass || !eq || !L || !R || !hint) return null;

  const ex = eq.getContext("2d")!;
  const N = 44;
  const H = eq.height;
  const g = ex.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, "#b3261e");
  g.addColorStop(0.45, "#ff8a3a");
  g.addColorStop(1, "#ffd27a");
  let playing = false;
  const lvl: number[] = Array(N).fill(0.06);

  const set = (v: boolean) => {
    playing = v;
    L.style.setProperty("--dur", v ? "1.3s" : "7s");
    R.style.setProperty("--dur", v ? ".9s" : "5s");
    if (hint.lastChild) hint.lastChild.textContent = v ? "Now playing · Side A — click to stop" : "Press play on the cassette";
    sc.classList.toggle("is-playing", v);
    sfx.beat(v);
  };

  const l = listeners();
  l.on(cass, "click", () => {
    sfx.clack();
    set(!playing);
  });
  l.on(document, "sfx", (e) => {
    if (playing) sfx.beat((e as CustomEvent<boolean>).detail);
  });

  return {
    tick(dt, t) {
      const beat = ((t * 100) / 60) % 1;
      const kick = beat < 0.18 ? 1 - beat / 0.18 : 0;
      ex.clearRect(0, 0, 1600, H);
      ex.fillStyle = g;
      ex.globalAlpha = 0.9;
      for (let i = 0; i < N; i++) {
        const env = 0.35 + 0.65 * Math.sin((Math.PI * (i + 3)) / (N + 6));
        const tg = playing
          ? clamp(0.14 + env * (0.35 + 0.5 * Math.abs(Math.sin(t * (2.1 + i * 0.17) + i * 1.3))) + kick * 0.3 * env, 0.05, 1)
          : 0.05 + 0.035 * Math.sin(t * 1.4 + i * 0.55);
        lvl[i] += (tg - lvl[i]) * Math.min(1, dt * (tg > lvl[i] ? 20 : 7));
        const h = Math.max(3, lvl[i] * (H - 8));
        ex.beginPath();
        ex.roundRect(i * 37 + 4, H - h, 22, h, 3);
        ex.fill();
      }
      ex.globalAlpha = 1;
    },
    leave() {
      if (playing) set(false);
    },
    destroy() {
      l.clear();
      if (playing) set(false);
    },
  };
}
