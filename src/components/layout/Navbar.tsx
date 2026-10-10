"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { navLinks, site } from "@/data/site";
import { sfx } from "@/lib/audio";
import { getEngine, sceneStore, SPY } from "@/lib/scene-store";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const active = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.getServer);
  const key = SPY[active];

  // the mobile menu pauses smooth scrolling while it is open
  useEffect(() => {
    getEngine()?.lock(open);
  }, [open]);

  // reflect the sound state (it can also change from the loader)
  useEffect(() => {
    const onSfx = (e: Event) => setSound((e as CustomEvent<boolean>).detail);
    document.addEventListener("sfx", onSfx);
    return () => document.removeEventListener("sfx", onSfx);
  }, []);

  return (
    <header className={cn("nav", open && "open")} id="nav">
      <a className="nav-brand" href="#home" data-cursor="Home" aria-label={`${site.name} home`}>
        <span className="nb-mark" />
        <span className="nb-word">
          AGNI<i>’</i>26
        </span>
      </a>
      <nav className="nav-links" id="nav-links" aria-label="Primary">
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
          <span className="snd-bars">
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
