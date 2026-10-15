import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/data/site";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  icons: { icon: "/images/branding/agni26-logo.webp" },
  openGraph: { title: `${site.name} — ${site.tagline}`, description: site.shareDescription, images: ["/images/hero/hero-poster.jpg"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: site.themeColor };

/** The phone edition: its own page, with no loader, no staged-scroll engine and phone-sized images. */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        {/* a big screen that lands here goes to the full site (?mobile keeps it here) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var q=location.search;if(!/mobile/.test(q)&&!matchMedia("(max-width:760px),(pointer:coarse) and (max-width:1024px)").matches)location.replace("/"+q+location.hash)}catch(e){}`,
          }}
        />
      </head>
      <body className="m-body">{children}</body>
    </html>
  );
}
