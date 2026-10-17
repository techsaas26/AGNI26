import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/data/site";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `Events | ${site.name}`,
  description: "Every event at AGNI’26.",
  icons: { icon: "/images/branding/agni26-logo.webp" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: site.themeColor };

/** The events page is its own small site: no loader, no staged scroll, just a page that scrolls. */
export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="evp-body">{children}</body>
    </html>
  );
}
