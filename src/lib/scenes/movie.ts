import { sfx } from "@/lib/audio";
import { gsap } from "@/lib/gsap";
import { byId, listeners, type SceneController } from "./types";

const HOLD = 4; // seconds each reel plays

/** Movie Night: one reel plays on the screen and the plaque names it; tap a frame to switch. */
export function setupMovie(env?: { reduce?: boolean }): SceneController | null {
  const title = byId<SVGTextElement>("mv-title");
  const art = byId("art-movie");
  const screens = [...(art?.querySelectorAll<SVGGElement>(".mv-sc") ?? [])];
  const thumbs = [...(art?.querySelectorAll<SVGGElement>(".mv-th") ?? [])];
  if (!title || !screens.length || screens.length !== thumbs.length) return null;

  const names = thumbs.map((c) => (c.dataset.title ?? "").toUpperCase());

  let idx = -1;
  let since = 0;
  const shut = art?.querySelector<SVGRectElement>(".mv-shut");
  const show = (i: number, quiet = false, user = false) => {
    if (i === idx) return;
    idx = i;
    since = user ? -8 : 0; // a reel the visitor picked is left to play longer
    if (user && shut && !env?.reduce)
      gsap.fromTo(shut, { opacity: 0.9 }, { opacity: 0, duration: 0.28, ease: "power2.out", overwrite: true });
    screens.forEach((c, j) => c.classList.toggle("on", j === i));
    thumbs.forEach((c, j) => c.classList.toggle("on", j === i));
    title.textContent = names[i];
    if (!quiet) sfx.clack();
  };
  show(0, true);

  const l = listeners();
  thumbs.forEach((c, i) => l.on(c, "click", () => show(i, false, true)));

  return {
    tick(dt) {
      since += dt;
      if (since > HOLD) show((idx + 1) % screens.length);
    },
    destroy() {
      l.clear();
    },
  };
}
