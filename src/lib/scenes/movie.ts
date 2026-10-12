import { sfx } from "@/lib/audio";
import { gsap } from "@/lib/gsap";
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

  gsap.set(wheel, { svgOrigin: "496 330" });
  const wheelState = { ang: 0 };
  const paint = () => gsap.set(wheel, { rotation: wheelState.ang });

  let idx = 0;
  let acc = 0;
  let drag = false;
  let la = 0;
  let vel = 0;
  let since = 0;

  const show = () => {
    const u = (i: number) => `url(${FRAMES[(idx + i) % FRAMES.length]})`;
    film.style.backgroundImage = u(0);
    wins[1].style.backgroundImage = u(0);
    wins[0].style.backgroundImage = u(1);
    wins[2].style.backgroundImage = u(2);
  };
  /** The next frame is wound in from above the screen. */
  const next = () => {
    idx = (idx + 1) % FRAMES.length;
    show();
    gsap.fromTo(film, { yPercent: -100 }, { yPercent: 0, duration: 0.6, ease: "power4.out", overwrite: "auto" });
    sfx.reel();
  };
  show();

  /** Turn the wheel by `deg` with a settle, and let go of any drag velocity smoothly. */
  const spinBy = (deg: number, duration = 0.6) =>
    gsap.to(wheelState, { ang: wheelState.ang + deg, duration, ease: "power3.out", overwrite: true, onUpdate: paint });

  const center = (): [number, number] => {
    const r = wheel.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };

  const l = listeners();
  l.on(crank, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    drag = true;
    gsap.killTweensOf(wheelState);
    crank.setPointerCapture(ev.pointerId);
    const [cx, cy] = center();
    la = Math.atan2(ev.clientY - cy, ev.clientX - cx);
    since = 0;
    vel = 0;
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
    const deg = (d * 180) / Math.PI;
    wheelState.ang += deg;
    vel = deg;
    paint();
    acc += Math.abs(d);
    since = 0;
    if (acc > 1.15) {
      acc = 0;
      next();
      sfx.ratchet();
    }
  });
  const up = () => {
    if (!drag) return;
    drag = false;
    if (Math.abs(vel) > 1) spinBy(vel * 9, 1.1); // the crank keeps turning a little
  };
  l.on(crank, "pointerup", up);
  l.on(crank, "pointercancel", up);
  l.on(crank, "click", () => {
    if (acc === 0 && !drag) {
      spinBy(60, 0.5);
      next();
    }
  });

  return {
    tick(dt) {
      since += dt;
      if (!drag && since > 4.2) {
        since = 0;
        spinBy(90, 0.9);
        next();
      }
    },
    destroy() {
      l.clear();
    },
  };
}
