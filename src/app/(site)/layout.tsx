import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import FilmLayer from "@/components/layout/FilmLayer";
import NoMenu from "@/components/layout/NoMenu";
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
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* The intro belongs to the home page, once per visit: any other entry (the events page) skips it, and phones and
            small tablets landing on the home page get the phone edition (?desktop opts out). Extensions inject their own
            <script> into <head> before React hydrates; don't warn about that one node. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,q=location.search;if(location.pathname.indexOf("/events")>-1)d.classList.add("no-intro");else if(!/desktop/.test(q)&&matchMedia("(max-width:760px),(pointer:coarse) and (max-width:1024px)").matches)location.replace("/m"+q+location.hash)}catch(e){}`,
          }}
        />
      </head>
      <body className="is-loading">
        <NoMenu />
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
