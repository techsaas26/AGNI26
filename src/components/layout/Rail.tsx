"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { railItems } from "@/data/site";
import { sceneStore } from "@/lib/scene-store";
import { cn } from "@/lib/utils";

/** The thin section index on the right edge; the active scene is highlighted. */
export default function Rail() {
  const active = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.getServer);
  if (usePathname().startsWith("/events")) return null;
  return (
    <aside className="rail" id="rail" aria-hidden="true">
      {railItems.map((item) => (
        <a key={item.href} href={item.href} data-s={item.scene} className={cn(active === item.scene && "is-on")}>
          <i />
          <span>{item.label}</span>
        </a>
      ))}
    </aside>
  );
}
