"use client";

import { useEffect } from "react";

/**
 * The phone edition's motion, kept small and in one place, with no animation library:
 *  [data-r]    fades and rises once when it enters the screen (--d = stagger delay)
 *  [data-par]  drifts a few pixels against the scroll (the value is the most it moves, in px) while its picture is on screen
 * plus the register pill, which shows once the hero is behind you. Only transform and opacity, and only what is on screen is measured.
 */
export default function MobileFX() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("m-js");
    if (reduce) {
      document.querySelectorAll("[data-r]").forEach((e) => e.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-r]").forEach((e) => io.observe(e));

    // slight parallax: only pictures near the screen are measured, once per frame while scrolling
    const live = new Set<HTMLElement>();
    const watch = new IntersectionObserver(
      (es) => es.forEach((e) => (e.isIntersecting ? live.add(e.target as HTMLElement) : live.delete(e.target as HTMLElement))),
      { rootMargin: "20% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-par]").forEach((p) => watch.observe(p));
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = innerHeight;
      live.forEach((el) => {
        const r = el.parentElement!.getBoundingClientRect();
        const k = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1 across the screen
        el.style.transform = `translate3d(0,${(k * Number(el.dataset.par) * -1).toFixed(1)}px,0)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    frame();

    // the floating register pill appears once the hero is behind you
    const hero = document.getElementById("home");
    const pill = new IntersectionObserver(([e]) => root.classList.toggle("m-past-hero", !e.isIntersecting), { threshold: 0 });
    if (hero) pill.observe(hero);

    return () => {
      io.disconnect();
      watch.disconnect();
      pill.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      root.classList.remove("m-js", "m-past-hero");
    };
  }, []);
  return null;
}
