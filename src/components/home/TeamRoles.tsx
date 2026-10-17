"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TeamMember } from "@/types";
import { sfx } from "@/lib/audio";
import { sceneStore } from "@/lib/scene-store";
import { formatUrl } from "@/lib/utils";

export interface RoleGroup {
  role: string;
  members: TeamMember[];
}

/**
 * The crew by department, in one horizontal strip: each department is a slide with all of its people
 * side by side in black and white, and their names set large in gold across the photos.
 * Scroll sideways (drag, swipe, trackpad, ‹ ›, or the arrow keys while the team scene holds the screen).
 */
export default function TeamRoles({ groups }: { groups: RoleGroup[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft < 8;
    const end = el.scrollLeft + el.clientWidth > el.scrollWidth - 8;
    setEdge((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  const step = useCallback((d: number) => {
    const el = track.current;
    const slide = el?.querySelector("li");
    if (!el || !slide) return;
    el.scrollBy({ left: d * (slide.getBoundingClientRect().width), behavior: "smooth" });
    sfx.tick();
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]")) return;
      const staged = document.documentElement.classList.contains("staged");
      if (staged ? sceneStore.get() !== "team" : !seen) return;
      e.preventDefault();
      step(e.key === "ArrowLeft" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [measure, step]);

  // a mouse can drag the strip like a finger does
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || (e.target as HTMLElement).closest("a")) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.drag = "";
    }
    e.currentTarget.scrollLeft = d.left - dx;
  };
  const onUp = (e: React.PointerEvent<HTMLUListElement>) => {
    if (drag.current?.moved) delete e.currentTarget.dataset.drag;
    drag.current = null;
  };

  return (
    <div className="crew">
      <button type="button" className="crew-arrow crew-arrow--prev" onClick={() => step(-1)} aria-label="Previous departments" disabled={edge.start}>
        <ChevronLeft aria-hidden="true" strokeWidth={1.4} />
      </button>
      <button type="button" className="crew-arrow crew-arrow--next" onClick={() => step(1)} aria-label="Next departments" disabled={edge.end}>
        <ChevronRight aria-hidden="true" strokeWidth={1.4} />
      </button>

      <ul
        className="crew-track"
        ref={track}
        onScroll={measure}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        tabIndex={0}
        aria-label="The team, department by department"
      >
        {groups.map((g, gi) => (
          <li className="crew-slide" key={g.role} data-n={g.members.length}>
            <h3 className="crew-role-tag">{g.role}</h3>
            <div className="crew-people">
              {g.members.map((m, mi) => (
                <article className="crew-card" key={m.name}>
                  <div className="crew-photo">
                    <Image
                      src={m.image}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 40vw, 24vw"
                      loading={gi < 2 && mi < 2 ? "eager" : "lazy"}
                      draggable={false}
                    />
                    <h4>{m.name}</h4>
                  </div>
                  <p className="crew-links">
                    {m.instagram && (
                      <a href={m.instagram} target="_blank" rel="noopener" data-cursor="IG" aria-label={`${m.name} on Instagram`}>
                        Instagram
                      </a>
                    )}
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noopener" data-cursor="IN" aria-label={`${m.name} on LinkedIn`}>
                        LinkedIn
                      </a>
                    )}
                  </p>
                </article>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
