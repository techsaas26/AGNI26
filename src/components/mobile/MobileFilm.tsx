"use client";

import { useEffect, useRef } from "react";
import { galleryFrames } from "@/data/gallery";
import { cn } from "@/lib/utils";

/** The memory reel on the phone: the same film strip as the desktop scene, swiped sideways instead of wound by the scroll. */
export default function MobileFilm() {
  const box = useRef<HTMLDivElement>(null);

  // the frame nearest the middle is "in the gate": it develops in colour, as on the desktop strip
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const frames = [...el.querySelectorAll<HTMLElement>(".frame")];
    let raf = 0;
    const centre = () => {
      raf = 0;
      const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best: HTMLElement | null = null;
      let d = Infinity;
      for (const f of frames) {
        const r = f.getBoundingClientRect();
        const dx = Math.abs(r.left + r.width / 2 - mid);
        if (dx < d) {
          d = dx;
          best = f;
        }
      }
      for (const f of frames) f.classList.toggle("is-center", f === best);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(centre);
    };
    centre();
    el.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <div className="m-film" ref={box} tabIndex={0} aria-label="Photo reel">
      <div className="m-film-track">
        {galleryFrames.map((frame) => {
          const end = !frame.image;
          return (
            <figure className={cn("frame", end && "frame--end")} key={frame.no}>
              {end ? (
                <div className="ph ph--end">
                  <span>
                    Some fires
                    <br />
                    never fade
                  </span>
                </div>
              ) : (
                <div
                  className={cn("ph", frame.logo && "ph--logo")}
                  role="img"
                  aria-label={frame.caption}
                  style={{ backgroundImage: `url(${frame.image})`, backgroundPosition: frame.position, backgroundSize: frame.size }}
                />
              )}
              <figcaption>
                <b>{frame.no}</b>
                {frame.caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
