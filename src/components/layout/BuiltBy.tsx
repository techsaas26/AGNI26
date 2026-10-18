"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { builders } from "@/data/builders";

/** "Built by" — five portraits rising out of the dark when the section scrolls into view. */
export default function BuiltBy() {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The portraits overlap and each photo is wider than its slot, so plain :hover always lands on the topmost neighbour.
  // Pick the portrait whose centre is nearest the pointer instead (and only from the top of that portrait down).
  const pick = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    const lis = [...e.currentTarget.children] as HTMLElement[];
    let best: HTMLElement | null = null;
    let d = Infinity;
    for (const li of lis) {
      const r = li.querySelector(".bb-fig")!.getBoundingClientRect();
      const dx = Math.abs(e.clientX - (r.left + r.width / 2));
      if (e.clientY >= r.top && dx < d) {
        d = dx;
        best = li;
      }
    }
    for (const li of lis) {
      if (li === best) li.setAttribute("data-on", "");
      else li.removeAttribute("data-on");
    }
  };
  const drop = (e: React.PointerEvent<HTMLUListElement>) => {
    for (const li of e.currentTarget.children) li.removeAttribute("data-on");
  };

  return (
    <section className="bb" ref={ref} data-seen={seen || undefined} aria-label="Built by">
      <div className="bb-bg" aria-hidden="true">
        <i className="bb-glow" />
        <i className="bb-lines" />
      </div>
      <p className="bb-eyebrow">Built by</p>
      <ul className="bb-row" onPointerMove={pick} onPointerLeave={drop}>
        {builders.map((b, i) => (
          <li key={b.name} style={{ "--d": Math.abs(i - 2) } as React.CSSProperties}>
            <div className="bb-fig">
              <div className="bb-photo">
                <Image src={b.image} alt={b.name} width={b.w} height={620} sizes="(max-width: 760px) 30vw, 22vw" loading="lazy" draggable={false} />
              </div>
            </div>
            <span className="bb-name">{b.name}</span>
            {b.instagram ? (
              <a className="bb-ig" href={b.instagram} target="_blank" rel="noopener" data-cursor="IG" aria-label={`${b.name} on Instagram`}>
                Instagram
              </a>
            ) : (
              <span className="bb-ig bb-ig--soon" aria-hidden="true">
                Instagram
              </span>
            )}
            {b.role && <small className="bb-role">{b.role}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}
