import Image from "next/image";
import EventsShowcase from "@/components/events/EventsShowcase";
import MusicButton from "@/components/mobile/MusicButton";
import { navLinks, site } from "@/data/site";

// The home page's own menu, pointed back at it. Plain anchors on purpose: a full page load keeps its scroll engine clean
// (it is a different root layout). On a phone "/" sends on to /m, keeping the #anchor.
const nav = navLinks.map((l) => ({
  label: l.label,
  href: l.href === "#home" ? "/" : l.href === "#events" ? "/events" : `/${l.href}`,
}));

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
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 py-3 md:gap-6">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" aria-label="AGNI’26 home" className="shrink-0">
            <Image src="/images/branding/agni26-logo.webp" alt="AGNI’26" width={96} height={48} className="h-11 w-auto" />
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
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <a href={site.saasUrl} target="_blank" rel="noopener" className="shrink-0">
              <Image src="/images/branding/saas-logo.webp" alt="SAAS CEG — Students’ Association and Arts Society" width={350} height={480} className="h-11 w-auto" />
            </a>
            <MusicButton />
          </div>
          <details className="group md:hidden">
            <summary aria-label="Menu" className="flex size-11 cursor-pointer list-none flex-col items-center justify-center gap-[7px] [&::-webkit-details-marker]:hidden">
              <span className="h-px w-6 bg-cream transition-transform group-open:translate-y-1 group-open:rotate-45" />
              <span className="h-px w-6 bg-cream transition-transform group-open:-translate-y-1 group-open:-rotate-45" />
            </summary>
            <nav aria-label="Site" className="absolute inset-x-0 top-full flex flex-col gap-1 bg-ink/95 px-6 pt-4 pb-8">
              {nav.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  aria-current={l.href === "/events" ? "page" : undefined}
                  className="py-2 font-display text-4xl font-light text-cream aria-[current=page]:text-amber"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </details>
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
