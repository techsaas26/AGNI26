import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = pageMetadata({
  path: "/events",
  title: `Events — ${site.name} | CEG Cultural Fest 2026`,
  description: `Every event at ${site.name} (AGNI 2026), the cultural fest of the College of Engineering, Guindy: signature events, club events and proshows · ${site.dates}, 2026.`,
});

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: site.themeColor };

/** The events page is its own small site: no loader, no staged scroll, just a page that scrolls. */
export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="evp-body">{children}</body>
    </html>
  );
}
