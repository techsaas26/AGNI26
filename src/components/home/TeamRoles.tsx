"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TeamMember } from "@/types";
import { sfx } from "@/lib/audio";
import { EASE, gsap } from "@/lib/gsap";
import { sceneStore } from "@/lib/scene-store";
import { formatUrl } from "@/lib/utils";

export interface RoleGroup {
  role: string;
  members: TeamMember[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The crew, one role at a time: ‹ › (or the arrow keys while the team scene holds the screen,
 * or a swipe) step through the roles; each member is a photo print in the style of the
 * original TeamMemberCard (paper frame, a little tilt, sepia that warms up on hover).
 */
export default function TeamRoles({ groups }: { groups: RoleGroup[] }) {
  const [at, setAt] = useState(0);
  const dir = useRef(1);
  const first = useRef(true);
  const root = useRef<HTMLDivElement>(null);
  const count = groups.length;
  const group = groups[at];

  const go = (to: number, d: number) => {
    dir.current = d;
    setAt(((to % count) + count) % count);
    sfx.tick();
  };
  const step = (d: number) => go(at + d, d);

  // the new role's prints are dealt in from the side we're travelling towards
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const d = dir.current;
      gsap.fromTo(
        ".crew-role-name",
        { opacity: 0, x: 40 * d },
        { opacity: 1, x: 0, duration: 0.6, ease: EASE.soft, overwrite: true },
      );
      gsap.fromTo(
        ".crew-card",
        { opacity: 0, x: 90 * d, y: 24, rotation: 6 * d },
        { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.9, ease: EASE.enter, stagger: 0.07, overwrite: true },
      );
    }, el);
    return () => ctx.revert();
  }, [at]);

  // arrow keys, only while the team scene is the one on screen (or, without the stage, in view)
  useEffect(() => {
    const shift = (d: number) => {
      dir.current = d;
      setAt((a) => (a + d + count) % count);
      sfx.tick();
    };
    const el = root.current;
    if (!el) return;
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
      shift(e.key === "ArrowLeft" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [count]);

  // horizontal swipe on the prints
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) step(dx < 0 ? 1 : -1);
  };

  return (
    <div className="crew" ref={root}>
      <div className="crew-nav">
        <button type="button" className="crew-arrow" onClick={() => step(-1)} aria-label="Previous role">
          <ChevronLeft aria-hidden="true" strokeWidth={1.4} />
        </button>
        <div className="crew-role" aria-live="polite">
          <small>
            {pad(at + 1)} <i>/</i> {pad(count)}
          </small>
          <h3 className="crew-role-name">{group.role}</h3>
        </div>
        <button type="button" className="crew-arrow" onClick={() => step(1)} aria-label="Next role">
          <ChevronRight aria-hidden="true" strokeWidth={1.4} />
        </button>
      </div>

      <ul className="crew-cards" data-n={group.members.length} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
        {group.members.map((m) => (
          <li className="crew-card" key={m.name}>
            <article className="crew-print">
              <div className="crew-photo">
                <Image src={m.image} alt={m.name} fill sizes="(max-width: 760px) 40vw, 240px" />
              </div>
              <h4>{m.name}</h4>
              {(m.instagram || m.linkedin) && (
                <p className="crew-links">
                  {m.instagram && (
                    <a href={formatUrl(m.instagram)} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  )}
                  {m.linkedin && (
                    <a href={formatUrl(m.linkedin)} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>

      <div className="crew-ticks" role="group" aria-label="Roles">
        {groups.map((g, i) => (
          <button
            type="button"
            key={g.role}
            className={i === at ? "on" : ""}
            aria-label={g.role}
            aria-current={i === at}
            onClick={() => i !== at && go(i, i > at ? 1 : -1)}
          />
        ))}
      </div>
    </div>
  );
}
