"use client";

import { useEffect, useRef } from "react";

/**
 * A muted looping clip that only runs while its scene is on screen (the engine marks the other
 * scenes `.is-off`) and starts from the first frame each time the scene comes back.
 */
export default function SceneVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    const scene = v?.closest<HTMLElement>("[data-scene]");
    if (!v || !scene || matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the poster stays
    const sync = () => {
      if (scene.classList.contains("is-off")) {
        v.pause();
        v.currentTime = 0;
      } else v.play().catch(() => {});
    };
    const mo = new MutationObserver(sync);
    mo.observe(scene, { attributes: true, attributeFilter: ["class"] });
    // fetch the file once the page has settled, so the first play does not wait for the network
    const warm = () => (v.preload = "auto");
    // Safari has no requestIdleCallback
    const idle = window.requestIdleCallback ? window.requestIdleCallback(warm, { timeout: 5000 }) : window.setTimeout(warm, 3000);
    return () => {
      mo.disconnect();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />;
}
