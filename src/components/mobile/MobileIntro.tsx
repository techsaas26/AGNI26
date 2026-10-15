"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/mobile-audio";

/** The phone loader: the logo lights up, and one tap lets the music in (browsers won't play sound before a tap). */
export default function MobileIntro() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add("m-lock");
    return () => document.documentElement.classList.remove("m-lock");
  }, []);
  const enter = (sound: boolean) => {
    if (sound) track().play().catch(() => {});
    setLeaving(true);
    document.documentElement.classList.remove("m-lock");
    setTimeout(() => setGone(true), 900);
  };
  if (gone) return null;
  return (
    <div className="m-intro" data-leaving={leaving} role="dialog" aria-label="Welcome to AGNI’26">
      <span className="m-embers" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <i key={i} style={{ "--x": `${(i * 29) % 100}%`, "--t": `${5 + (i % 5)}s`, "--o": `${(i % 9) * -0.7}s` } as React.CSSProperties} />
        ))}
      </span>
      <div className="m-intro-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/m/logo.webp" alt="AGNI’26" width={900} height={456} fetchPriority="high" />
        <b aria-hidden="true" />
      </div>
      <p className="m-intro-line">An event for tomorrow’s dreamers</p>
      <button type="button" className="m-btn m-intro-go" onClick={() => enter(true)}>
        Tap to enter
      </button>
      <button type="button" className="m-intro-skip" onClick={() => enter(false)}>
        Continue without sound
      </button>
    </div>
  );
}
