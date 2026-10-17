"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { logoSheet } from "@/data/preloader";
import { sfx } from "@/lib/audio";
import { startLoader } from "@/lib/loader";
import { getEngine } from "@/lib/scene-store";
import { cn } from "@/lib/utils";

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
  // The headphones page comes first. The logo run-in is scored (it lands on the song's beats), so it
  // waits for one tap — which is also what lets the browser start the sound. `?skip` goes straight in.
  const [stage, setStage] = useState<"pre" | "leaving" | "go">("pre");
  const skip = useSyncExternalStore(
    () => () => {},
    () => /[?&]skip/.test(location.search),
    () => false,
  );

  // Entered anywhere but the home page (see the script in the layout): no intro, the site is simply open.
  useEffect(() => {
    if (!document.documentElement.classList.contains("no-intro")) return;
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    ref.current?.classList.add("is-gone");
  }, []);

  const begin = () => {
    if (stage !== "pre") return;
    sfx.intro();
    setStage("leaving");
    window.setTimeout(() => setStage("go"), 650);
  };

  useEffect(() => {
    if (document.documentElement.classList.contains("no-intro")) return;
    if (stage !== "go" && !skip) return;
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
  }, [stage, skip]);

  const byName = Object.fromEntries(logoSheet.parts.map((p) => [p.name, p]));

  return (
    <div id="loader" ref={ref} className={stage !== "go" && !skip ? "is-pre" : undefined} role="status" aria-live="polite">
      <div className="ld-gate" aria-hidden="true">
        <i className="t" />
        <i className="b" />
      </div>
      <div className="ld-grain" id="ld-grain" aria-hidden="true" />
      {stage !== "go" && !skip && (
        <div
          className={cn("ld-pre", stage === "leaving" && "is-leaving")}
          role="button"
          tabIndex={0}
          aria-label="Tap anywhere to continue"
          onClick={begin}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              begin();
            }
          }}
        >
          <p className="ld-pre-eyebrow">
            <span>A film in sound</span>
          </p>
          <h2 className="ld-pre-title">
            <span className="ln">
              <span>Best heard</span>
            </span>
            <span className="ln">
              <span>
                with <em>headphones</em>
              </span>
            </span>
          </h2>
          <i className="ld-pre-rule" aria-hidden="true" />
          <p className="ld-pre-foot">
            <span>Volume up</span>
            <b>Tap anywhere to continue</b>
            <span>Lights down</span>
          </p>
        </div>
      )}
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
