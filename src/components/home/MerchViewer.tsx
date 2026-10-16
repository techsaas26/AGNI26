"use client";

import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

type View = "front" | "back";
const ORBIT: Record<View, string> = { front: "0deg 82deg auto", back: "180deg 82deg auto" };

// The GLB ships with a white sheen, a clearcoat and a roughness map, which
// show up as white highlights on the dark fabric. Flatten it to matte cotton.
function makeMatte(viewer: ModelViewerElement) {
  for (const material of viewer.model?.materials ?? []) {
    const pbr = material.pbrMetallicRoughness;
    pbr.setMetallicFactor(0);
    pbr.setRoughnessFactor(1);
    pbr.metallicRoughnessTexture?.setTexture(null);
    material.setClearcoatFactor(0);
    material.setSheenColorFactor([0, 0, 0]);
  }
}

/**
 * The tee in 3D (model-viewer, loaded after the page settles). Until the model is ready, or if it can't
 * load at all (no WebGL, offline, blocked), the front and back photographs of the tee stand in for it.
 */
export default function MerchViewer({ model, front, back }: { model: string; front: string; back: string }) {
  const host = useRef<HTMLDivElement>(null);
  const mv = useRef<HTMLElement | null>(null);
  const hold = useRef(0); // ignore camera readings while a button-driven turn is under way
  const [state, setState] = useState<"loading" | "3d" | "images">("loading");
  const [view, setView] = useState<View>("front");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    const fail = () => !dead && setState("images");
    const start = async () => {
      try {
        const gl = document.createElement("canvas");
        if (!(gl.getContext("webgl2") || gl.getContext("webgl"))) return fail();
        await import("@google/model-viewer");
        if (dead) return;
        const m = document.createElement("model-viewer");
        const set: Record<string, string> = {
          src: model,
          alt: "The AGNI’26 tee in 3D: drag to turn it",
          "camera-controls": "",
          "disable-zoom": "",
          "disable-pan": "",
          "touch-action": "pan-y",
          "interaction-prompt": "none",
          "camera-orbit": ORBIT.front,
          "min-camera-orbit": "-Infinity 60deg auto",
          "max-camera-orbit": "Infinity 105deg auto",
          "field-of-view": "28deg",
          exposure: "1",
          "shadow-intensity": "1",
          "shadow-softness": "1",
          "environment-image": "neutral",
          "auto-rotate-delay": "4000",
          "rotation-per-second": "18deg",
        };
        for (const k in set) m.setAttribute(k, set[k]);
        m.setAttribute("auto-rotate", "");
        m.className = "tee3d-mv";
        m.addEventListener("load", () => {
          makeMatte(m as ModelViewerElement);
          if (!dead) setState("3d");
        });
        m.addEventListener("error", fail);
        // keep the Front/Back buttons honest while it auto-rotates or is dragged
        m.addEventListener("camera-change", () => {
          const o = (m as HTMLElement & { getCameraOrbit?: () => { theta: number } }).getCameraOrbit?.();
          if (o && !dead && Date.now() > hold.current) setView(Math.cos(o.theta) < 0 ? "back" : "front");
        });
        mv.current = m;
        el.appendChild(m);
      } catch {
        fail();
      }
    };
    // the model is large: let the page and the first scenes settle before fetching it
    const go = () => void start();
    const t = window.setTimeout(go, 2500);
    return () => {
      dead = true;
      window.clearTimeout(t);
      mv.current?.remove();
      mv.current = null;
    };
  }, [model]);

  const turn = (v: View) => {
    setView(v);
    hold.current = Date.now() + 1800;
    const m = mv.current as (HTMLElement & { cameraOrbit?: string; autoRotate?: boolean }) | null;
    if (m && state === "3d") {
      m.removeAttribute("auto-rotate");
      m.setAttribute("camera-orbit", ORBIT[v]);
    }
  };

  return (
    <div className="tee3d" data-state={state}>
      <div className="tee3d-stage" ref={host}>
        <div className="tee3d-img" aria-hidden={state === "3d"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={front} alt="AGNI’26 tee, front" className={view === "front" ? "on" : ""} width={549} height={585} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={back} alt="AGNI’26 tee, back" className={view === "back" ? "on" : ""} width={549} height={585} />
        </div>
      </div>
      <div className="tee3d-bar" role="group" aria-label="Tee view">
        <button type="button" onClick={() => turn("front")} aria-pressed={view === "front"} className={view === "front" ? "on" : ""}>
          Front
        </button>
        <button type="button" onClick={() => turn("back")} aria-pressed={view === "back"} className={view === "back" ? "on" : ""}>
          Back
        </button>
      </div>
    </div>
  );
}
