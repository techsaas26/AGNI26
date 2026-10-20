import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/data/site";
import { pageMetadata, structuredDataJson } from "@/lib/seo";
import { fontVariables } from "../../fonts";
import "../../globals.css";

// the phone edition of "/": search engines should list the main URL, not this one
export const metadata: Metadata = pageMetadata({ path: "/m", canonical: "/" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: site.themeColor };

/** The phone edition: its own page, with no loader, no staged-scroll engine and phone-sized images. */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    // the head script may add `seen` to <html> before hydration
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* a big screen that lands here goes to the full site (?mobile keeps it here) */}
        {/* extensions inject their own <script> into <head> before React hydrates; don't warn about that one node */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var q=location.search;if(!/mobile/.test(q)&&!matchMedia("(max-width:760px),(pointer:coarse) and (max-width:1024px)").matches)location.replace("/"+q+location.hash);if(sessionStorage.getItem("agni:intro-seen")==="1")document.documentElement.classList.add("seen")}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson() }} />
      </head>
      <body className="m-body">{children}</body>
    </html>
  );
}
