"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { navLinks, site } from "@/data/site";
import { sfx } from "@/lib/audio";
import { EASE, gsap } from "@/lib/gsap";
import { getEngine, sceneStore, SPY } from "@/lib/scene-store";
import { cn } from "@/lib/utils";

/** Resting heights of the four sound bars (matches the stylesheet). */
const BARS = [0.38, 0.7, 0.5, 0.38];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const active = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.getServer);
  const key = SPY[active];
  const links = useRef<HTMLElement>(null);
  const bars = useRef<HTMLSpanElement>(null);

  // the mobile menu pauses smooth scrolling while it is open, and its links rise in one by one
  useEffect(() => {
    getEngine()?.lock(open);
    if (!open || !links.current) return;
    const anim = gsap.fromTo(
      links.current.querySelectorAll("a"),
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: EASE.enter, stagger: 0.07, delay: 0.12 },
    );
    return () => {
      anim.kill();
    };
  }, [open]);

  // reflect the sound state (it can also change from the loader)
  useEffect(() => {
    const onSfx = (e: Event) => setSound((e as CustomEvent<boolean>).detail);
    document.addEventListener("sfx", onSfx);
    return () => document.removeEventListener("sfx", onSfx);
  }, []);

  // the equalizer dances while sound is on and settles when it is off
  useEffect(() => {
    const els = bars.current ? [...bars.current.querySelectorAll("i")] : [];
    if (!els.length) return;
    if (!sound) {
      gsap.to(els, { scaleY: (i: number) => BARS[i], duration: 0.4, ease: EASE.soft, overwrite: true });
      return;
    }
    const loops = els.map((b, i) => {
      const t = gsap.fromTo(b, { scaleY: 0.25 }, { scaleY: 1, duration: 0.5, ease: EASE.breathe, repeat: -1, yoyo: true });
      t.totalTime([0, 0.3, 0.6, 0.15][i]);
      return t;
    });
    return () => loops.forEach((t) => t.kill());
  }, [sound]);

  return (
    <header className={cn("nav", open && "open")} id="nav">
      <a className="nav-brand" href="#home" data-cursor="Home" aria-label={`${site.name} home`}>
        <span className="nb-mark" />
        <span className="nb-word">
          AGNI<i>’</i>26
        </span>
      </a>
      <nav className="nav-links" id="nav-links" aria-label="Primary" ref={links}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-spy={link.href.slice(1)}
            className={cn(key === link.href.slice(1) && "is-on")}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-right">
        <button
          className="snd"
          id="snd"
          type="button"
          aria-pressed={sound}
          aria-label="Toggle sound"
          data-cursor="Sound"
          onClick={() => sfx.set(!sfx.on)}
        >
          <span className="snd-bars" ref={bars}>
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
        <a className="nav-cta" href="#register" data-cursor="Book">
          Register
        </a>
        <button
          className="burger"
          id="burger"
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
