"use client";

import { useEffect } from "react";
import { initCursor } from "@/lib/fx";

/** The home page's cursor (dot + ring) for pages that run without the engine, which normally starts it. */
export default function PageCursor() {
  useEffect(() => initCursor(document.getElementById("cursor")), []);
  return null;
}
