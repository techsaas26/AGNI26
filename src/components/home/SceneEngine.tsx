"use client";

import { useEffect } from "react";
import { Engine } from "@/lib/engine";

/**
 * Starts the projector for the home page: smooth scroll, parallax, particles and
 * the per-scene interactions. Renders nothing — the sections it drives are server markup.
 */
export default function SceneEngine() {
  useEffect(() => {
    const engine = new Engine();
    // The intro has already played (the visitor came back from another page): no gate to wait for.
    if (!document.body.classList.contains("is-loading")) engine.open(true);
    return () => engine.destroy();
  }, []);
  return null;
}
