"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { logoSheet } from "@/data/preloader";
import { startLoader } from "@/lib/loader";
import { getEngine } from "@/lib/scene-store";

/** Pictures that are painted with CSS (so the loader cannot see them as <img>). */
const PRELOAD = [
  "/images/gallery/campus-bench.webp",
  "/images/gallery/maple-lake.webp",
  "/images/hero/hero-poster.jpg",
];

const LETTERS = ["A", "G", "N", "I", "apos", "two", "six"];
const PROP_ORDER = ["film", "camera", "gramophone", "books", "mic", "record", "notes", "car"];
/** Back-to-front paint order of the pieces. */
const Z = ["plaque", "flourish", ...PROP_ORDER, ...LETTERS];

/** The lettering and props of the logo run in and spring into place while the page loads. */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    return startLoader(
      {
        root,
        wrap: q("#ld-wrap"),
        stage: q("#ld-stage"),
        dust: q<HTMLCanvasElement>("#ld-dust"),
        grain: q("#ld-grain"),
        final: q("#ld-final"),
        bar: q("#ld-bar"),
        pct: q("#ld-pct"),
        status: q("#ld-status"),
        caption: q(".ld-caption"),
      },
      { preload: PRELOAD, onOpen: () => getEngine()?.open() },
    );
  }, []);

  const byName = Object.fromEntries(logoSheet.parts.map((p) => [p.name, p]));

  return (
    <div id="loader" ref={ref} role="status" aria-live="polite">
      <div className="ld-gate" aria-hidden="true">
        <i className="t" />
        <i className="b" />
      </div>
      <div className="ld-grain" id="ld-grain" aria-hidden="true" />
      <div className="ld-frame">
        <div className="ld-wrap" id="ld-wrap" role="img" aria-label="AGNI'26 logo">
          <div className="ld-stage" id="ld-stage">
            {Z.map((name, z) => {
              const p = byName[name];
              if (!p) return null;
              return (
                <Image
                  key={name}
                  src={`/images/preloader/${p.file}`}
                  alt=""
                  width={p.w}
                  height={p.h}
                  unoptimized
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  data-part={name}
                  style={{ zIndex: z + 1 }}
                />
              );
            })}
            <canvas id="ld-dust" width={logoSheet.W} height={logoSheet.H} />
            <Image
              id="ld-final"
              src={`/images/preloader/${logoSheet.full}`}
              alt=""
              width={logoSheet.W}
              height={logoSheet.H}
              unoptimized
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
        <div className="ld-caption" aria-live="polite">
          <span id="ld-status">Rolling film</span>
          <span className="ld-reel">
            <i id="ld-bar" />
          </span>
          <b id="ld-pct">0%</b>
        </div>
      </div>
    </div>
  );
}
