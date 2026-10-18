"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/mobile-audio";

/** The phone loader: the logo fades in, and one tap lets the music in (browsers won't play sound before a tap). */
export default function MobileIntro() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add("m-lock");
    return () => document.documentElement.classList.remove("m-lock");
  }, []);
  const enter = (sound: boolean) => {
    // "without sound" also stops music carried over from the page before (see resumeMusic)
    if (sound) track().play().catch(() => {});
    else track().pause();
    setLeaving(true);
    document.documentElement.classList.remove("m-lock");
    setTimeout(() => setGone(true), 450);
  };
  if (gone) return null;
  return (
    <div className="m-intro" data-leaving={leaving} role="dialog" aria-label="Welcome to AGNI’26">
      <div className="m-intro-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/m/logo.webp" alt="AGNI’26" width={900} height={456} fetchPriority="high" />
      </div>
      <p className="m-intro-line">A Journey thru’ Time, A Celebration of Memories</p>
      <button type="button" className="m-btn m-intro-go" onClick={() => enter(true)}>
        Tap to enter
      </button>
      <button type="button" className="m-intro-skip" onClick={() => enter(false)}>
        Continue without sound
      </button>
    </div>
  );
}
