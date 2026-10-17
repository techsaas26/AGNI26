"use client";

import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { eventSections, type EventCard as EventData, type SectionId } from "@/data/event-cards";
import { cn } from "@/lib/utils";
import EventCard from "./EventCard";

type Cat = SectionId | "all";

const CATS: { id: Cat; label: string }[] = [{ id: "all", label: "All events" }, ...eventSections];

// everything a visitor might type for an event, lower-cased once
const haystack = new Map(
  eventSections.flatMap((s) => s.events.map((e) => [e.slug, [e.name, e.tagline, e.tag, e.host, e.venue, e.date, e.time, e.about].join(" ").toLowerCase()] as const)),
);
const matches = (e: EventData, words: string[]) => words.every((w) => haystack.get(e.slug)!.includes(w));

/** A poster is only mounted once it is near the screen: thirty flip cards at once would be a lot of layers to carry. */
function Near({ eager, children }: { eager: boolean; children: ReactNode }) {
  const [on, setOn] = useState(eager);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (on || !el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { rootMargin: "1000px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  // the box has the poster's shape from the start, so nothing jumps when the card arrives
  return (
    <div ref={ref} className="aspect-[4/5] w-full">
      {on ? children : null}
    </div>
  );
}

/** Every event as a flip card, in its three sections, with a search that narrows them in place. */
export default function EventsShowcase() {
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<string | null>(null); // the one poster that is flipped
  const input = useRef<HTMLInputElement>(null);
  const deferred = useDeferredValue(q);

  useEffect(() => {
    // the home page links here as /events?cat=club; the address is only readable after hydration
    const p = new URLSearchParams(window.location.search);
    const c = p.get("cat");
    /* eslint-disable react-hooks/set-state-in-effect */
    if (CATS.some((x) => x.id === c)) setCat(c as Cat);
    setQ(p.get("q") ?? "");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (cat !== "all") p.set("cat", cat);
      if (q.trim()) p.set("q", q.trim());
      const s = p.toString();
      window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    }, 250);
    return () => clearTimeout(t);
  }, [cat, q, ready]);

  const words = deferred.toLowerCase().split(/\s+/).filter(Boolean);
  const found = eventSections.map((s) => ({ ...s, events: words.length ? s.events.filter((e) => matches(e, words)) : s.events }));
  const count = (c: Cat) => (c === "all" ? found.reduce((n, s) => n + s.events.length, 0) : (found.find((s) => s.id === c)?.events.length ?? 0));
  const shown = found.filter((s) => (cat === "all" || s.id === cat) && s.events.length);
  const n = count(cat);
  const eager = shown[0]?.events.slice(0, 3).map((e) => e.slug) ?? []; // the first row
  const clear = () => {
    setQ("");
    input.current?.focus();
  };

  return (
    <section aria-label="Events" className="mx-auto max-w-[1280px] px-(--pad)">
      {/* search + sections in one bar that stays under the nav while the posters scroll */}
      <div className="relative z-30 mx-auto max-w-[1060px] rounded-2xl border border-[#b8924a]/60 bg-ink/75 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
          <form
            role="search"
            className="relative w-full md:max-w-[340px] md:shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              input.current?.blur(); // the list already follows every keystroke: Enter just puts the keyboard away
            }}
          >
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/60" />
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              placeholder="Search events, clubs or venues"
              aria-label="Search events"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              className="w-full rounded-full border border-[#b8924a]/40 bg-ink/70 py-2.5 pr-11 pl-11 font-sans text-sm font-normal text-cream placeholder:text-cream/50 focus:border-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {q && (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-amber"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </form>

          <div role="group" aria-label="Choose a section" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:ml-auto md:pb-0 [scrollbar-width:none]">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={c.id === cat}
                onClick={() => setCat(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2.5 font-sans text-[10.5px] font-medium tracking-[.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
                  c.id === cat ? "border-transparent bg-[linear-gradient(100deg,#ffe2b0,#e8a94c)] text-ink" : "border-[#b8924a]/60 text-cream hover:border-amber hover:text-amber",
                  count(c.id) === 0 && c.id !== cat && "opacity-45",
                )}
              >
                {c.label}
                <span className="ml-2 opacity-60">{count(c.id)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p role="status" className={cn("mt-4 text-center font-sans text-xs tracking-[.14em] text-cream/75", !words.length && "sr-only")}>
        {n ? `${n} ${n === 1 ? "event" : "events"}${words.length ? ` match “${deferred.trim()}”` : ""}` : `No events match “${deferred.trim()}”`}
      </p>

      {n === 0 && (
        <div className="py-12 text-center">
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-cream/40 px-7 py-3 font-sans text-xs font-medium tracking-[.22em] text-cream uppercase transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="mt-6 space-y-12">
        {shown.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-40">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-cream/10 pb-3">
              <h2 id={`${s.id}-title`} className="font-display text-3xl leading-tight font-light text-gold italic [text-shadow:0_2px_18px_rgba(11,4,3,.8)] md:text-4xl">
                {s.label}
              </h2>
              <span className="font-sans text-xs font-medium tracking-[.26em] text-amber uppercase">
                {s.events.length} {s.events.length === 1 ? "event" : "events"}
              </span>
            </div>
            <p className="mt-3 max-w-[80ch] text-cream/85 [text-shadow:0_1px_14px_rgba(11,4,3,.9)]">{s.blurb}</p>
            <ul className="mt-5 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
              {s.events.map((e) => (
                <li key={e.slug}>
                  <Near eager={eager.includes(e.slug)}>
                    <EventCard event={e} eager={eager.includes(e.slug)} flipped={open === e.slug} onFlipChange={(f) => setOpen(f ? e.slug : (o) => (o === e.slug ? null : o))} />
                  </Near>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
