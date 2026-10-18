"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { track } from "@/lib/mobile-audio";

const LINKS = [
  ["home", "Home"],
  ["about", "About"],
  ["events", "Events"],
  ["merch", "Merch"],
  ["contact", "Contact"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(false);
  // follow the shared track so the button is right whoever started it; pause when the tab is hidden
  useEffect(() => {
    const a = track();
    const sync = () => setOn(!a.paused);
    let resume = false;
    const vis = () => {
      if (document.hidden) {
        resume = !a.paused;
        a.pause();
      } else if (resume) a.play().catch(() => {});
    };
    a.addEventListener("play", sync);
    a.addEventListener("pause", sync);
    document.addEventListener("visibilitychange", vis);
    sync();
    return () => {
      a.removeEventListener("play", sync);
      a.removeEventListener("pause", sync);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  const toggle = () => {
    const a = track();
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };
  useEffect(() => {
    document.documentElement.classList.toggle("m-lock", open);
    return () => document.documentElement.classList.remove("m-lock");
  }, [open]);
  return (
    <>
      <header className="m-bar">
        <a className="m-brand" href="#home" aria-label="AGNI’26, top of page">
          <Image src="/images/branding/agni26-logo.webp" alt="" width={1436} height={728} preload draggable={false} />
        </a>
        <Image className="m-saas" src="/images/branding/saas-logo.webp" alt="SAAS — Students’ Association and Arts Society" width={350} height={480} draggable={false} />
        <button type="button" className="m-snd" aria-pressed={on} aria-label={on ? "Mute music" : "Play music"} onClick={toggle}>
          <b />
          <b />
          <b />
        </button>
        <button type="button" className="m-burger" aria-expanded={open} aria-controls="m-sheet" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          <span />
          <span />
        </button>
      </header>
      <nav id="m-sheet" className="m-sheet" aria-hidden={!open} data-open={open}>
        {LINKS.map(([id, label], i) => (
          <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} style={{ "--i": i } as React.CSSProperties} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="m-sheet-alt" href="/events" tabIndex={open ? 0 : -1} style={{ "--i": LINKS.length } as React.CSSProperties}>
          All events →
        </a>
      </nav>
    </>
  );
}
