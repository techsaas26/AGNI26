"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import MusicButton from "./MusicButton";

const LINKS = [
  ["home", "Home"],
  ["about", "About"],
  ["events", "Events"],
  ["gallery", "Gallery"],
  ["team", "Team"],
  ["contact", "Contact"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("m-lock", open);
    return () => document.documentElement.classList.remove("m-lock");
  }, [open]);
  return (
    <>
      <header className="m-bar">
        <a className="m-brand" href="#home" aria-label="AGNI’26, top of page">
          <Image src="/images/branding/agni26-logo.webp" alt="" width={1707} height={858} preload draggable={false} />
        </a>
        <Image className="m-saas" src="/images/branding/saas-logo.webp" alt="SAAS — Students’ Association and Arts Society" width={350} height={480} draggable={false} />
        <MusicButton />
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
