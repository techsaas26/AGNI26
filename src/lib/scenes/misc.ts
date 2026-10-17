import { sfx } from "@/lib/audio";
import { tilt } from "@/lib/fx";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { clamp } from "@/lib/utils";
import { byId, listeners, type SceneController, type SceneEnv } from "./types";

/** Register ticket, contact postcard and the merch tee tilt toward the pointer. */
export function setupToys(): SceneController {
  const ticket = byId("ticket");
  const offs = [
    tilt(ticket, { max: 5, base: -2.5, shine: ticket ?? undefined }),
    tilt(byId("postcard"), { max: 5, base: 1.6, perspective: 1200 }),
  ];
  const l = listeners();
  const wrap = byId("tee-wrap");
  if (wrap) offs.push(tilt(wrap, { max: 6, perspective: 1100 }));
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
  const t = gsap.timeline({ paused: true }).to(words, { opacity: 1, color: "#f7e8cc", duration: 0.6, ease: "none", stagger: 0.07 });
  ScrollTrigger.create({
    trigger: "#about",
    start: () => env.appear() + (env.arrive() - env.appear()) * 0.6,
    end: () => env.gone() + 1,
    onEnter: () => void t.play(),
    onLeaveBack: () => void t.reverse(),
  });
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

/** Merch — pull the print through the screen with the squeegee; tap the tee to turn it round. */
export function setupMerch(): SceneController | null {
  const wrap = byId("tee-wrap");
  const tee = byId("tee");
  const sq = byId("tee-sq");
  if (!wrap || !tee || !sq) return null;
  const LO = 24; // the print spans these % of the tee's width
  const HI = 75;
  const st = { p: LO, done: false };
  const paint = () => wrap.style.setProperty("--p", `${st.p}%`);
  paint();

  const l = listeners();
  let back = false;
  l.on(tee, "click", () => {
    back = !back;
    wrap.classList.toggle("flipped", back);
    gsap.to(tee, { rotationY: back ? 180 : 0, duration: 1.15, ease: "back.out(1.35)", overwrite: true });
    sfx.clack();
  });

  let drag = false;
  const at = (e: PointerEvent) => {
    const r = wrap.getBoundingClientRect();
    st.p = clamp(((e.clientX - r.left) / r.width) * 100, LO, HI);
    paint();
  };
  l.on(sq, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    drag = true;
    gsap.killTweensOf(st);
    sq.setPointerCapture(ev.pointerId);
    ev.preventDefault();
    ev.stopPropagation();
  });
  l.on(sq, "pointermove", (e) => drag && at(e as PointerEvent));
  const up = () => {
    drag = false;
  };
  l.on(sq, "pointerup", up);
  l.on(sq, "pointercancel", up);
  l.on(sq, "click", (e) => e.stopPropagation());

  const pull = (to: number) => {
    gsap.to(st, { p: to, duration: 2.4, ease: "power2.inOut", overwrite: true, onUpdate: paint });
    sfx.reel();
  };
  return {
    // the first time the shop comes up, the squeegee makes one pass on its own
    enter() {
      if (st.done) return;
      st.done = true;
      gsap.delayedCall(0.6, () => !drag && pull(HI));
    },
    destroy() {
      l.clear();
    },
  };
}

/** Contact — the card arrives face-down (its address side) and is turned over as you scroll. */
export function setupContact(env: SceneEnv): SceneController | null {
  const flip = byId("pc-flip");
  if (!flip || env.reduce) return null;
  gsap.set(flip, { rotationX: 180 });
  const note = document.querySelector<HTMLElement>("#contact .pc-note");
  const wipe = note ? gsap.fromTo(note, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 2.2, delay: 1.2, ease: "power1.inOut", paused: true }) : null;
  const turn = gsap.to(flip, { rotationX: 0, duration: 2, ease: "power2.inOut", paused: true });
  ScrollTrigger.create({
    trigger: "#contact",
    start: () => env.arrive() - env.vh() * 0.1,
    end: () => env.arrive() + 1e7,
    onEnter: () => {
      turn.play();
      wipe?.play();
    },
    onLeaveBack: () => {
      turn.reverse();
      wipe?.reverse();
    },
  });
  return { destroy() {} };
}
