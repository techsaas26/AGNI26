import type { Metadata, Viewport } from "next";
import FilmLayer from "@/components/layout/FilmLayer";
import Loader from "@/components/layout/Loader";
import Navbar from "@/components/layout/Navbar";
import Rail from "@/components/layout/Rail";
import { site } from "@/data/site";
import { fontVariables } from "./fonts";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
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
