import type { Metadata } from "next";
import Image from "next/image";
import EventsShowcase from "@/components/events/EventsShowcase";

export const metadata: Metadata = {
  description: "Every event at AGNI’26: the signature events, the club events and the proshows. Pick a day, then flip a poster for the time, venue and details.",
};

// Plain anchors for the home page on purpose: a full page load keeps its scroll engine clean (it is a different root layout).
const nav = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/#about", label: "About" },
  { href: "/#team", label: "Team" },
  { href: "/#contact", label: "Reach Us" },
];

const pill =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3 font-sans text-[11px] font-medium tracking-[.22em] text-ink uppercase transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

export default function EventsPage() {
  return (
    // `isolate` makes this its own stacking context: without it the body's background would paint over the room.
    <div className="isolate">
      {/* The room, fixed behind everything so scrolling never repaints it; the gradient keeps the posters readable,
          and the scrim (globals.css) shades it a little more as the visitor scrolls down to the text and the posters. */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <Image src="/images/events/room.webp" alt="" fill preload sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,4,3,.1),rgba(11,4,3,.3)_40%,rgba(11,4,3,.55))]" />
        <div className="ev-scrim absolute inset-0" />
      </div>

      <header className="sticky top-0 z-30 bg-ink/80">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" aria-label="AGNI’26 home" className="shrink-0">
            <Image src="/images/branding/agni26-logo.webp" alt="AGNI’26" width={96} height={49} className="h-11 w-auto" />
          </a>
          <nav aria-label="Site" className="hidden items-center gap-9 md:flex">
            {nav.map((l) => (
              <a
                key={l.label}
                href={l.href}
                aria-current={l.href === "/events" ? "page" : undefined}
                className="border-b border-transparent py-2 font-sans text-xs font-medium tracking-[.24em] text-cream uppercase transition-colors hover:border-amber aria-[current=page]:border-amber aria-[current=page]:text-amber"
              >
                {l.label}
              </a>
            ))}
          </nav>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#register" className={pill}>
            Register
          </a>
        </div>
      </header>

      <main>
        <section className="px-6 pt-12 pb-10 text-center md:pt-20">
          <h1 className="font-display text-[clamp(64px,13vw,168px)] leading-none font-light text-cream [text-shadow:0_4px_40px_rgba(11,4,3,.55)]">
            Events
          </h1>
          <p className="mt-4 font-sans text-xs font-medium tracking-[.4em] text-amber uppercase md:text-sm">Ideas • People • Experiences</p>
          <p className="mx-auto mt-6 max-w-[52ch] text-cream/90 md:text-lg">
            Every event of AGNI’26 in three categories. Pick one, choose a day, then flip a poster to see when, where and how it works.
          </p>
        </section>

        <EventsShowcase />
      </main>

      <footer className="px-6 pt-16 pb-12 text-center font-sans text-xs font-normal tracking-[.14em] text-cream/70">
        © AGNI @ Students’ Association and Arts Society, CEG
      </footer>
    </div>
  );
}
