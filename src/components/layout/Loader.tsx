"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { startLoader } from "@/lib/loader";
import { getEngine } from "@/lib/scene-store";

/** Pictures that are painted with CSS (so the loader cannot see them as <img>). */
const PRELOAD = [
  "/images/gallery/campus-bench.webp",
  "/images/gallery/maple-lake.webp",
  "/images/hero/hero-poster.jpg",
];

/** A match burns down while the page loads; the fire becomes the logo. */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    return startLoader(
      {
        root,
        canvas: q<HTMLCanvasElement>("#ld-canvas"),
        glow: q(".ld-glow"),
        counter: q(".ld-count"),
        num: q("#ld-num"),
        word: q("#ld-word"),
        status: q("#ld-status"),
        logo: q(".ld-logo"),
        enter: q(".ld-enter"),
        enterBtn: q("#ld-enter"),
        muteBtn: q("#ld-mute"),
        line: q(".ld-line i"),
        lineWrap: q(".ld-line"),
        gateTop: q(".ld-gate .t"),
        gateBottom: q(".ld-gate .b"),
      },
      { preload: PRELOAD, onOpen: () => getEngine()?.open() },
    );
  }, []);

  return (
    <div id="loader" ref={ref} role="status" aria-live="polite">
      <div className="ld-glow" />
      <canvas id="ld-canvas" />
      <div className="ld-count" aria-hidden="true">
        <b id="ld-num">00</b>
        <small>%</small>
      </div>
      <div className="ld-word" aria-hidden="true">
        <span id="ld-word">अग्नि</span>
      </div>
      <p className="ld-status" id="ld-status">
        Striking the match…
      </p>
      <div className="ld-logo">
        <Image src="/images/branding/agni26-logo.webp" alt="AGNI'26" width={1436} height={728} loading="eager" />
      </div>
      <div className="ld-enter">
        <button className="ld-btn" id="ld-enter" type="button" data-cursor="Ignite">
          Strike to enter
        </button>
        <button className="ld-mute" id="ld-mute" type="button">
          or enter without sound
        </button>
      </div>
      <div className="ld-line" aria-hidden="true">
        <i />
      </div>
      <div className="ld-gate" aria-hidden="true">
        <i className="t" />
        <i className="b" />
      </div>
    </div>
  );
}
