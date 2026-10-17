"use client";

import { useEffect } from "react";

/** No right-click menu and no double-tap zoom, on every page (the touch-action half is in the stylesheet). */
export default function NoMenu() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", stop);
    document.addEventListener("dblclick", stop);
    // iOS Safari ignores touch-action for pinch/double-tap zoom
    document.addEventListener("gesturestart", stop);
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("dblclick", stop);
      document.removeEventListener("gesturestart", stop);
    };
  }, []);
  return null;
}
