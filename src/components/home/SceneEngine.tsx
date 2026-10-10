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
    return () => engine.destroy();
  }, []);
  return null;
}
