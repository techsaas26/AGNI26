"use client";

import { useDeferredValue, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { dateOf, eventSections, festDays, type EventCard as EventData, type EventDay, type SectionId } from "@/data/event-cards";
import { cn } from "@/lib/utils";
import EventCard from "./EventCard";

// everything a visitor might type for an event (name, club, day, room, time...), lower-cased once
const haystack = new Map(
  eventSections.flatMap((s) =>
    s.events.map(
      (e) =>
        [e.slug, [e.name, e.tagline, e.tag, e.host, dateOf(e), ...e.when.flatMap((w) => [festDays[w.day].label, w.time, w.venue]), e.about].join(" ").toLowerCase()] as const,
    ),
  ),
);
const matches = (e: EventData, words: string[]) => words.every((w) => haystack.get(e.slug)!.includes(w));
const onDay = (e: EventData, d: EventDay) => e.when.some((w) => w.day === d);

/** The photograph on each category's card, and where to centre it in the card. */
const COVERS: Record<SectionId, { src: string; at: string }> = {
  signature: { src: "/images/gallery/classical-dance.webp", at: "62% 50%" },
  club: { src: "/images/gallery/dance-crew.webp", at: "50% 50%" },
  proshow: { src: "/images/concert/concert-stage.webp", at: "50% 50%" },
};

/** A poster is only mounted once it is near the screen: forty flip cards at once would be a lot of layers to carry. */
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

const pill =
  "rounded-full border border-cream/40 px-5 py-2.5 font-sans text-xs font-medium tracking-[.22em] text-cream uppercase transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

/** The three categories as big photograph cards, the way last year's events page opened. */
function Categories({ onPick }: { onPick: (id: SectionId) => void }) {
  return (
    <ul className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
      {eventSections.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onPick(s.id)}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[18px] text-left ring-1 ring-cream/20 transition-shadow duration-500 hover:ring-amber/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
          >
            <Image
              src={COVERS[s.id].src}
              alt=""
              fill
              sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 92vw"
              draggable={false}
              style={{ objectPosition: COVERS[s.id].at }}
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,4,3,.1)_20%,rgba(11,4,3,.92))]" />
            <span className="absolute inset-x-0 bottom-0 p-7">
              <span className="block font-sans text-[11px] font-medium tracking-[.3em] text-amber uppercase">{s.events.length} events</span>
              <span className="mt-2 block font-display text-4xl leading-[1.05] font-light text-cream">{s.label}</span>
              <span className="mt-3 block max-w-[34ch] text-cream/80">{s.blurb}</span>
              <span className="mt-5 inline-flex items-center gap-2 font-sans text-xs font-medium tracking-[.22em] text-cream uppercase transition-colors group-hover:text-amber">
                Explore
                <ArrowRight aria-hidden className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// the fest days that have anything on them at all (the agenda has nothing on Day 0, so it gets no tab)
const liveDays = festDays.filter((d) => eventSections.some((s) => s.events.some((e) => e.when.some((w) => w.day === d.id))));

/** Day 1, Day 2 (or all of them), under the site header while the page scrolls. A day with nothing in this category is dimmed. */
function DayTabs({ day, all, counts, onPick }: { day: EventDay | null; all: number; counts: number[]; onPick: (d: EventDay | null) => void }) {
  // on a phone the four tabs are labels only ("All", "Day 0"…): with the counts they are wider than a 360px screen
  const tab = (id: EventDay | null, label: ReactNode, n: number) => (
    <button
      key={id ?? "all"}
      type="button"
      disabled={n === 0}
      aria-pressed={day === id}
      onClick={() => onPick(id)}
      className={cn(
        "rounded-full px-2.5 py-2 font-sans text-[11px] font-medium tracking-[.12em] whitespace-nowrap uppercase transition-colors sm:px-5 sm:text-xs sm:tracking-[.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        day === id ? "bg-cream text-ink" : "text-cream hover:text-amber",
        n === 0 && "opacity-40",
      )}
    >
      {label}
      <span className="ml-2 opacity-60 max-sm:hidden">{n}</span>
    </button>
  );
  return (
    // top-[76px]: just under the site header (68px) with a small gap
    <div role="group" aria-label="Choose a day" className="sticky top-[76px] z-20 mx-auto mt-8 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-ink/85 p-1.5 ring-1 ring-cream/15 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tab(null, <>All<span className="max-sm:hidden"> days</span></>, all)}
      {liveDays.map((d) => tab(d.id, d.label, counts[d.id]))}
    </div>
  );
}

/**
 * Every event as a flip card. It opens on the three categories; a category opens its events, which a Day tab narrows, and
 * the search looks through all of them at once. `?cat=club` (the home page's link) opens a category straight away.
 */
export default function EventsShowcase() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SectionId | null>(null);
  const [day, setDay] = useState<EventDay | null>(null);
  const [ready, setReady] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const deferred = useDeferredValue(q);

  useEffect(() => {
    // the address is only readable after hydration
    const p = new URLSearchParams(window.location.search);
    const c = p.get("cat");
    const d = p.get("day");
    const known = eventSections.some((s) => s.id === c);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (known) setCat(c as SectionId);
    if (d !== null && festDays.some((x) => x.id === Number(d))) setDay(Number(d) as EventDay);
    setQ(p.get("q") ?? "");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (known) requestAnimationFrame(() => body.current?.scrollIntoView({ block: "start" })); // arriving from a link: straight to the events
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (cat) p.set("cat", cat);
      if (day !== null) p.set("day", String(day));
      if (q.trim()) p.set("q", q.trim());
      const s = p.toString();
      window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    }, 250);
    return () => clearTimeout(t);
  }, [cat, day, q, ready]);

  const words = deferred.toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const view = searching ? "results" : cat ? "category" : "landing";
  // the sections in play, with the search applied; the Day tabs count from these and then narrow them
  const scope = eventSections.filter((s) => searching || s.id === cat).map((s) => ({ ...s, events: searching ? s.events.filter((e) => matches(e, words)) : s.events }));
  const all = scope.reduce((sum, s) => sum + s.events.length, 0);
  const counts = festDays.map((d) => scope.reduce((sum, s) => sum + s.events.filter((e) => onDay(e, d.id)).length, 0));
  const shown = scope.map((s) => ({ ...s, events: day === null ? s.events : s.events.filter((e) => onDay(e, day)) })).filter((s) => s.events.length);
  const n = shown.reduce((sum, s) => sum + s.events.length, 0);
  const eager = shown[0]?.events.slice(0, 3).map((e) => e.slug) ?? []; // the first row
  const current = eventSections.find((s) => s.id === cat);

  const open = (id: SectionId | null) => {
    setCat(id);
    setDay(null);
    // the heading row sits in the same place whichever view is under it, so this can run straight away
    body.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const clear = () => {
    setQ("");
    input.current?.focus();
  };

  return (
    <section aria-label="Events" className="mx-auto max-w-[1280px] px-6">
      <form
        role="search"
        className="relative mx-auto max-w-[640px]"
        onSubmit={(e) => {
          e.preventDefault();
          input.current?.blur(); // the list already follows every keystroke: Enter just puts the keyboard away
        }}
      >
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-cream/60" />
        <input
          ref={input}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setQ("")}
          placeholder="Search events, clubs, days or rooms"
          aria-label="Search events"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-full border border-cream/30 bg-ink/60 py-4 pr-14 pl-14 font-sans text-base font-normal text-cream placeholder:text-cream/50 focus:border-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {q && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-amber"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </form>

      <div ref={body} className="scroll-mt-24 pt-10">
        {view === "category" && (
          <div className="flex justify-start">
            <button type="button" onClick={() => open(null)} className={cn(pill, "inline-flex items-center gap-2")}>
              <ArrowLeft aria-hidden className="size-4" />
              All categories
            </button>
          </div>
        )}
        {view === "results" && (
          <div className="flex justify-start">
            <button type="button" onClick={clear} className={cn(pill, "inline-flex items-center gap-2")}>
              <ArrowLeft aria-hidden className="size-4" />
              Clear search
            </button>
          </div>
        )}
        {view === "category" && current && (
          <div className="mt-8 text-center">
            <h2 className="font-display text-4xl leading-tight font-light text-cream md:text-5xl">{current.label}</h2>
            <p className="mx-auto mt-3 max-w-[60ch] text-cream/80">{current.blurb}</p>
          </div>
        )}

        {view !== "landing" && <DayTabs day={day} all={all} counts={counts} onPick={setDay} />}
        {view !== "landing" && day !== null && <p className="mt-4 text-center font-sans text-xs font-medium tracking-[.26em] text-amber uppercase">{festDays[day].date} 2026</p>}

        <p role="status" className="mt-6 text-center text-cream/85">
          {view === "landing"
            ? `${eventSections.reduce((sum, s) => sum + s.events.length, 0)} events in ${eventSections.length} categories`
            : n
              ? `${n} ${n === 1 ? "event" : "events"}${searching ? ` match “${deferred.trim()}”` : ""}`
              : `No events match “${deferred.trim()}”`}
        </p>
        {n > 0 && view !== "landing" && (
          <p className="mt-2 text-center font-sans text-[11px] font-normal tracking-[.26em] text-cream/55 uppercase">Tap or drag a poster to flip it</p>
        )}

        {view !== "landing" && n === 0 && (
          <div className="py-16 text-center">
            <button type="button" onClick={clear} className={pill}>
              Clear search
            </button>
          </div>
        )}

        {/* a new view fades in; switching days keeps the same key, so the cards stay where they are */}
        <div key={`${view}-${cat}`} className="ev-in">
          {view === "landing" && <Categories onPick={open} />}
          {view !== "landing" && (
            <div className="mt-12 space-y-24">
              {shown.map((s) => (
                <section key={s.id} aria-label={s.label}>
                  {view === "results" && (
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h2 className="font-display text-3xl leading-tight font-light text-cream md:text-4xl">{s.label}</h2>
                      <span className="font-sans text-xs font-medium tracking-[.26em] text-amber uppercase">
                        {s.events.length} {s.events.length === 1 ? "event" : "events"}
                      </span>
                    </div>
                  )}
                  {/* even columns, every row aligned: two from tablet width, three from 1280px (a card needs about 330px for its back) */}
                  <ul className={cn("grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-8 md:gap-y-16 xl:grid-cols-3 xl:gap-x-10 xl:gap-y-20", view === "results" && "mt-10")}>
                    {s.events.map((e) => (
                      <li key={e.slug}>
                        <Near eager={eager.includes(e.slug)}>
                          <EventCard event={e} registration={s.registration} eager={eager.includes(e.slug)} />
                        </Near>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
