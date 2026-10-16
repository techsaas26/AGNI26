"use client";

import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { sceneStore } from "@/lib/scene-store";

type View = "front" | "back";
type Viewer = HTMLElement & {
  getCameraOrbit?: () => { theta: number };
  turntableRotation?: number;
};

// auto-rotate spins the model (turntable yaw), not the camera, so the side facing
// the viewer is the camera's angle measured against the model's own rotation
const facing = (m: Viewer) => {
  const theta = m.getCameraOrbit?.().theta;
  if (theta == null) return null;
  return Math.cos(theta - (m.turntableRotation ?? 0)) < 0 ? "back" : "front";
};

// The original GLB (tee.glb) ships with a white sheen, a clearcoat and a roughness map, which
// show up as white highlights on the dark fabric. Flatten it to matte cotton. tee-opt.glb has
// this baked in (no sheen / clearcoat at all), so those setters are skipped when they'd throw.
function makeMatte(viewer: ModelViewerElement) {
  for (const material of viewer.model?.materials ?? []) {
    const pbr = material.pbrMetallicRoughness;
    pbr.setMetallicFactor(0);
    pbr.setRoughnessFactor(1);
    pbr.metallicRoughnessTexture?.setTexture(null);
    try {
      material.setClearcoatFactor(0);
      material.setSheenColorFactor([0, 0, 0]);
    } catch {
      /* no clearcoat / sheen on this model */
    }
  }
}

/**
 * The tee in 3D (model-viewer, fetched as the visitor nears it). Until the model is ready, or if it can't
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
          "camera-orbit": "0deg 82deg auto",
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
        // (the turntable spin fires no camera-change, so it is also sampled)
        const sync = () => {
          const f = facing(m);
          if (f && !dead && Date.now() > hold.current) setView(f);
        };
        m.addEventListener("camera-change", sync);
        poll = window.setInterval(sync, 250);
        mv.current = m;
        el.appendChild(m);
      } catch {
        fail();
      }
    };

    // fetch the model only as the visitor approaches the merch scene: on the staged page every
    // scene is a fixed layer, so follow the engine's active scene (load from the one before merch);
    // anywhere else (no stage, e.g. /m), an IntersectionObserver a viewport ahead does it
    let started = false;
    let poll = 0;
    const go = () => {
      if (started) return;
      started = true;
      unsub();
      io.disconnect();
      void start();
    };
    const scene = el.closest<HTMLElement>("[data-scene]");
    const near = () => {
      if (!scene || !document.documentElement.classList.contains("staged")) return;
      const order = [...document.querySelectorAll<HTMLElement>("main [data-scene]")].map((s) => s.dataset.scene);
      const at = order.indexOf(sceneStore.get());
      if (at >= 0 && at >= order.indexOf(scene.dataset.scene) - 1) go();
    };
    const unsub = sceneStore.subscribe(near);
    const io = new IntersectionObserver(
      (entries) => {
        if (!document.documentElement.classList.contains("staged") && entries.some((e) => e.isIntersecting)) go();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    near();
    return () => {
      dead = true;
      unsub();
      io.disconnect();
      window.clearInterval(poll);
      mv.current?.remove();
      mv.current = null;
    };
  }, [model]);

  const turn = (v: View) => {
    setView(v);
    hold.current = Date.now() + 1800;
    const m = mv.current as Viewer | null;
    const theta = m?.getCameraOrbit?.().theta;
    if (m && state === "3d" && theta != null) {
      m.removeAttribute("auto-rotate");
      // put the camera in front of the chosen side of the (possibly spun) model,
      // by the shortest way round from where it is now
      const want = (m.turntableRotation ?? 0) + (v === "back" ? Math.PI : 0);
      const to = want + Math.round((theta - want) / (2 * Math.PI)) * 2 * Math.PI;
      m.setAttribute("camera-orbit", `${to}rad 82deg auto`);
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
