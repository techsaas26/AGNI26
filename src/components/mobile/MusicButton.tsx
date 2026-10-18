"use client";

import { useEffect, useState } from "react";
import { keepMusic, resumeMusic, track } from "@/lib/mobile-audio";

/**
 * The music toggle (three bars that dance while it plays), for the phone site's top bar and the events page. It follows the
 * shared track, pauses it while the tab is hidden, and carries the music over from the previous page of the site.
 */
export default function MusicButton() {
  const [on, setOn] = useState(false);
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
    const unkeep = keepMusic();
    const unresume = resumeMusic();
    return () => {
      a.removeEventListener("play", sync);
      a.removeEventListener("pause", sync);
      document.removeEventListener("visibilitychange", vis);
      unkeep();
      unresume();
    };
  }, []);
  const toggle = () => {
    const a = track();
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };
  return (
    <button type="button" className="m-snd" aria-pressed={on} aria-label={on ? "Mute music" : "Play music"} onClick={toggle}>
      <b />
      <b />
      <b />
    </button>
  );
}
