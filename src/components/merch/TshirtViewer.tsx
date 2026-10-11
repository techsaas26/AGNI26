"use client";

import { createElement, useEffect, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

interface TshirtViewerProps {
  src: string;
  alt: string;
}

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

// <model-viewer> is a web component that touches `window`, so it is loaded
// only in the browser. It handles mouse drag, touch rotate and pinch-zoom.
export default function TshirtViewer({ src, alt }: TshirtViewerProps) {
  const [ready, setReady] = useState(false);
  const [viewer, setViewer] = useState<ModelViewerElement | null>(null);

  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const onLoad = () => makeMatte(viewer);
    if (viewer.loaded) onLoad();
    viewer.addEventListener("load", onLoad);
    return () => viewer.removeEventListener("load", onLoad);
  }, [viewer]);

  return (
    <div className="relative h-[55svh] max-h-[600px] min-h-[300px] w-full overflow-hidden md:h-[70vh] rounded-2xl border-2 border-sepia/60 bg-[radial-gradient(circle_at_center,_#3a2a1f_0%,_#1b1520_70%)] shadow-[8px_8px_0_0_var(--color-cassette)]">
      {ready ? (
        createElement("model-viewer", {
          ref: setViewer,
          src,
          alt,
          "camera-controls": true,
          "touch-action": "pan-y",
          "auto-rotate": true,
          "auto-rotate-delay": 2000,
          "rotation-per-second": "20deg",
          "interaction-prompt": "auto",
          "shadow-intensity": "1",
          exposure: "1",
          "environment-image": "neutral",
          style: { width: "100%", height: "100%", backgroundColor: "transparent" },
        })
      ) : (
        <div className="flex h-full items-center justify-center font-display text-2xl text-paper/60">
          Loading tee…
        </div>
      )}
    </div>
  );
}
