import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import FilmLayer from "@/components/layout/FilmLayer";
import Loader from "@/components/layout/Loader";
import Navbar from "@/components/layout/Navbar";
import Rail from "@/components/layout/Rail";
import { site } from "@/data/site";
import { pageMetadata, structuredDataJson } from "@/lib/seo";
import { fontVariables } from "../fonts";
import "../globals.css";

const base = pageMetadata({ path: "/" });

export const metadata: Metadata = {
  ...base,
  title: { default: site.title, template: `%s | ${site.name}` },
  // phones are sent to /m (functions/index.js); this tells search engines it is the same page for small screens
  alternates: { ...base.alternates, media: { "only screen and (max-width: 640px)": "/m" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: site.themeColor,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // the head script may add `seen` to <html> before hydration
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* phones and small tablets get the phone edition (?desktop opts out) */}
        {/* extensions inject their own <script> into <head> before React hydrates; don't warn about that one node */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var q=location.search;if(!/desktop/.test(q)&&matchMedia("(max-width:760px),(pointer:coarse) and (max-width:1024px)").matches)location.replace("/m"+q+location.hash);if(sessionStorage.getItem("agni:intro-seen")==="1")document.documentElement.classList.add("seen")}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson() }} />
      </head>
      <body className="is-loading">
        <Loader />
        <FilmLayer />
        <Navbar />
        <Rail />
        <main id="main">{children}</main>
        <noscript>
          <style>{`#loader{display:none}.rv{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
