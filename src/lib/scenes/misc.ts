import { sfx } from "@/lib/audio";
import { tilt } from "@/lib/fx";
import { gsap } from "@/lib/gsap";
import { clamp } from "@/lib/utils";
import { byId, listeners, type SceneController, type SceneEnv } from "./types";

/** Register ticket, contact postcard and the merch tee tilt toward the pointer; the tee flips on click. */
export function setupToys(): SceneController {
  const ticket = byId("ticket");
  const offs = [
    tilt(ticket, { max: 10, base: -2.5, shine: ticket ?? undefined }),
    tilt(byId("postcard"), { max: 5, base: 1.6, perspective: 1200 }),
  ];
  const l = listeners();
  const wrap = byId("tee-wrap");
  const tee = byId("tee");
  if (wrap && tee) {
    offs.push(tilt(wrap, { max: 11, perspective: 1100 }));
    let back = false;
    l.on(tee, "click", () => {
      back = !back;
      tee.classList.toggle("is-back", back);
      gsap.to(tee, { rotationY: back ? 180 : 0, duration: 1.15, ease: "back.out(1.35)", overwrite: true });
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

/** About — the words of the paragraph light up one after another across the scene's beat. */
export function setupAbout(env: SceneEnv): SceneController | null {
  const el = byId("about-text");
  if (!el) return null;
  const words = [...el.querySelectorAll<HTMLElement>(".w")];
  if (env.reduce) {
    gsap.set(words, { opacity: 1, color: "#f7e8cc" });
    return { destroy() {} };
  }
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#about",
        // from the moment the card is readable until most of its beat has passed
        start: () => env.appear() + (env.arrive() - env.appear()) * 0.7,
        end: () => env.arrive() + (env.leave() - env.arrive()) * 0.72,
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    })
    .to(words, { opacity: 1, color: "#f7e8cc", duration: 1, ease: "none", stagger: 0.22 });
  return { destroy() {} };
}

/** Gallery — the film strip winds sideways across the scene's beat. */
export function setupReel(env: SceneEnv): SceneController | null {
  const track = byId("reel-track");
  const meter = byId("reel-meter");
  if (!track || !meter) return null;
  const frames = [...track.querySelectorAll<HTMLElement>(".frame")];
  const max = () => Math.max(0, track.scrollWidth - env.vw() * 0.62);
  gsap.set(track, { yPercent: -50, x: 0 }); // CSS had translate3d(0,-50%,0)

  // the frame nearest the middle of the screen is "in the gate": it develops in colour and
  // comes forward, while the ones either side tip away a little
  const photos = frames.map((f) => f.querySelector<HTMLElement>(".ph"));
  const centre = () => {
    const x = gsap.getProperty(track, "x") as number;
    const mid = env.vw() * 0.5;
    frames.forEach((f, i) => {
      const c = f.offsetLeft + f.offsetWidth / 2 + x;
      f.classList.toggle("is-center", Math.abs(c - mid) < f.offsetWidth * 0.55);
      const d = clamp((c - mid) / mid, -1.4, 1.4);
      const near = 1 - Math.min(1, Math.abs(d));
      if (photos[i]) gsap.set(photos[i], { scale: 0.92 + 0.08 * near, rotation: d * 1.4, y: (1 - near) * 12 });
    });
  };
  gsap
    .timeline({
      defaults: { ease: "none", duration: 1 },
      scrollTrigger: {
        trigger: "#gallery",
        // the whole beat, bar a short hold at either end
        start: () => env.arrive() + (env.leave() - env.arrive()) * 0.04,
        end: () => env.leave() - (env.leave() - env.arrive()) * 0.05,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: centre,
        onRefresh: centre,
      },
    })
    .fromTo(track, { x: 0 }, { x: () => -max() }, 0)
    .fromTo(meter, { scaleX: 0 }, { scaleX: 1 }, 0);
  return { destroy() {} };
}

/** Team — the credits roll up the screen across the scene's beat. */
export function setupCredits(env: SceneEnv): SceneController | null {
  const roll = byId("credits-roll");
  if (!roll) return null;
  gsap.set(roll, { xPercent: -50, x: 0, y: env.vh() * 0.92 }); // CSS had translate(-50%, 100vh)
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#team",
        start: () => env.arrive(),
        end: () => env.leave(),
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      roll,
      { y: () => env.vh() * 0.92 },
      { y: () => -(roll.offsetHeight - env.vh() * 0.62), ease: "none", duration: 1 },
    );
  return { destroy() {} };
}
