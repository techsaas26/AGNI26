import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import FilmLayer from "@/components/layout/FilmLayer";
import Loader from "@/components/layout/Loader";
import Navbar from "@/components/layout/Navbar";
import Rail from "@/components/layout/Rail";
import { site } from "@/data/site";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: { icon: "/images/branding/agni26-logo.webp" },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.shareDescription,
    images: ["/images/hero/hero-poster.jpg"],
  },
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
