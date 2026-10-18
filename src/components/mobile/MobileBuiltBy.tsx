"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { builders } from "@/data/builders";

/** Pixels per second the strip moves by itself, without ever stopping. */
const SPEED = 40;
/** After the visitor lets go, how long the strip waits before moving again. */
const RESUME_MS = 1000;
/** A press that travels further than this is a drag, not a tap on a link. */
const DRAG_PX = 6;

/**
 * "Built by" for the phone footer: a strip of round portraits gliding sideways at a constant pace in an endless loop.
 * Hold it to stop it, swipe (or drag with a mouse) to move it by hand; it glides on again a second after release.
 * It is moved with a transform, not by scrolling: scroll positions snap to whole pixels, which makes a slow glide judder.
 * The five are rendered three times and the strip is shown from inside the middle copy, so it can wrap either way unseen.
 */
export default function MobileBuiltBy() {
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = view.current;
    const strip = track.current;
    if (!el || !strip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let off = 0; // how far into one copy of the five the strip has moved, kept within [0, copy width)
    let held = false;
    let idleAt = 0; // still until this time after the visitor lets go
    let visible = false;
    let last = 0;
    let raf = 0;

    const copy = () => strip.scrollWidth / 3;
    const draw = () => {
      const w = copy();
      off = ((off % w) + w) % w;
      strip.style.transform = `translate3d(${-(w + off)}px,0,0)`;
    };
    draw();

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(t - last, 100) : 0;
      last = t;
      if (held || reduce || !visible || t < idleAt) return;
      off += (SPEED * dt) / 1000;
      draw();
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    // hold to stop, drag sideways to move it; vertical swipes still scroll the page (touch-action: pan-y)
    let press: { id: number; x: number; y: number } | null = null;
    let dragging = false;
    let moved = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      held = true;
      press = { id: e.pointerId, x: e.clientX, y: e.clientY };
      dragging = false;
      moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (!press || e.pointerId !== press.id) return;
      const dx = e.clientX - press.x;
      moved += Math.abs(dx);
      // capture only once it is clearly a drag, so a plain tap still lands on the link under the finger
      if (!dragging && moved > DRAG_PX) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
      }
      if (dragging) {
        off -= dx;
        draw();
      }
      press.x = e.clientX;
      press.y = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (press && e.pointerId !== press.id) return;
      held = false;
      press = null;
      idleAt = performance.now() + RESUME_MS;
    };
    // a drag that ends over a link is not a click on it
    const click = (e: MouseEvent) => {
      if (moved > DRAG_PX) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = 0;
    };
    const resize = () => draw();

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="m-bb" aria-label="Built by">
      <h3>Built by</h3>
      <div className="m-bb-view" ref={view}>
        <ul ref={track}>
          {[0, 1, 2].flatMap((n) =>
            builders.map((b) => {
              // only the middle copy is read out and reachable by keyboard; the other two are scenery for the loop
              const hidden = n !== 1;
              return (
                <li key={`${n}-${b.name}`} aria-hidden={hidden || undefined}>
                  {b.linkedin ? (
                    <a className="m-bb-pic" href={b.linkedin} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true" draggable={false}>
                      <Image src={b.image} alt="" width={b.w} height={620} sizes="80px" loading="lazy" draggable={false} />
                    </a>
                  ) : (
                    <Image src={b.image} alt="" width={b.w} height={620} sizes="80px" loading="lazy" draggable={false} />
                  )}
                  <span>{b.name}</span>
                  {b.linkedin ? (
                    <a href={b.linkedin} target="_blank" rel="noopener" tabIndex={hidden ? -1 : undefined} aria-label={`${b.name} on LinkedIn`} draggable={false}>
                      LinkedIn
                    </a>
                  ) : (
                    <small aria-hidden="true">LinkedIn</small>
                  )}
                  {b.instagram ? (
                    <a href={b.instagram} target="_blank" rel="noopener" tabIndex={hidden ? -1 : undefined} aria-label={`${b.name} on Instagram`} draggable={false}>
                      Instagram
                    </a>
                  ) : (
                    <small aria-hidden="true">Instagram</small>
                  )}
                </li>
              );
            }),
          )}
        </ul>
      </div>
    </section>
  );
}
