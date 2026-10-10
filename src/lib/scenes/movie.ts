import { sfx } from "@/lib/audio";
import { byId, listeners, type SceneController } from "./types";

const FRAMES = [
  "/images/gallery/maple-lake.webp",
  "/images/gallery/campus-bench.webp",
  "/images/hero/hero-poster.jpg",
  "/images/gallery/maple-lake.webp",
  "/images/gallery/campus-bench.webp",
];

/** Movie Night — turn the bioscope's crank to wind the film in the open-air screen. */
export function setupMovie(): SceneController | null {
  const film = byId("mv-film");
  const wheel = byId<SVGGElement>("crankwheel");
  const crank = byId<SVGGElement>("crank");
  const host = byId("bio-layer");
  if (!film || !wheel || !crank || !host) return null;
  const wins = [...host.querySelectorAll<HTMLElement>(".bw")];
  if (wins.length < 3) return null;

  let idx = 0;
  let ang = 0;
  let acc = 0;
  let drag = false;
  let la = 0;
  let since = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = () => {
    const u = (i: number) => `url(${FRAMES[(idx + i) % FRAMES.length]})`;
    film.style.backgroundImage = u(0);
    wins[1].style.backgroundImage = u(0);
    wins[0].style.backgroundImage = u(1);
    wins[2].style.backgroundImage = u(2);
  };
  const next = () => {
    idx = (idx + 1) % FRAMES.length;
    show();
    film.classList.remove("adv");
    void film.offsetWidth;
    film.classList.add("adv");
    sfx.reel();
  };
  show();

  const center = (): [number, number] => {
    const r = wheel.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };

  const l = listeners();
  l.on(crank, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    drag = true;
    crank.setPointerCapture(ev.pointerId);
    const [cx, cy] = center();
    la = Math.atan2(ev.clientY - cy, ev.clientX - cx);
    since = 0;
    ev.preventDefault();
  });
  l.on(crank, "pointermove", (e) => {
    if (!drag) return;
    const ev = e as PointerEvent;
    const [cx, cy] = center();
    const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
    let d = a - la;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    la = a;
    ang += (d * 180) / Math.PI;
    wheel.style.transform = `rotate(${ang}deg)`;
    acc += Math.abs(d);
    since = 0;
    if (acc > 1.15) {
      acc = 0;
      next();
      sfx.ratchet();
    }
  });
  const up = () => {
    drag = false;
  };
  l.on(crank, "pointerup", up);
  l.on(crank, "pointercancel", up);
  l.on(crank, "click", () => {
    if (acc === 0 && !drag) {
      ang += 60;
      wheel.style.transform = `rotate(${ang}deg)`;
      wheel.style.transition = "transform .4s var(--ease)";
      timer = setTimeout(() => (wheel.style.transition = ""), 420);
      next();
    }
  });

  return {
    tick(dt) {
      since += dt;
      if (!drag && since > 4.2) {
        since = 0;
        ang += 90;
        wheel.style.transform = `rotate(${ang}deg)`;
        next();
      }
    },
    destroy() {
      l.clear();
      if (timer) clearTimeout(timer);
    },
  };
}
