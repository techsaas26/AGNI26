import type { Metadata } from "next";
import Image from "next/image";
import EventsShowcase from "@/components/events/EventsShowcase";
import PageCursor from "@/components/layout/PageCursor";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Events",
  description: "Every event at AGNI’26: signature events, club events and pro shows. Search them, then flip a poster for the venue, time and details.",
};

/** The events page lives inside the site's own shell (nav, grain, vignette come from the layout); this is only its content. */
export default function EventsPage() {
  return (
    <div className="evp">
      <PageCursor />
      {/* The room, fixed behind everything so scrolling never repaints it; the gradient keeps the posters readable. */}
      <div aria-hidden className="evp-bg">
        <Image src="/images/events/room.webp" alt="" fill preload sizes="100vw" />
      </div>

      <header className="evp-head">
        <p className="evp-eyebrow">AGNI’26 · Oct 22-24</p>
        <h1>
          Explore the <em>Events</em>
        </h1>
        <p className="evp-lede">Find your next obsession.</p>
      </header>

      <EventsShowcase />
      <Footer />
    </div>
  );
}
