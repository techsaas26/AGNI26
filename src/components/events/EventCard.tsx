"use client";

import type { SyntheticEvent } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import { dateOf, festDays, type EventCard as EventData, type EventDay, type Slot } from "@/data/event-cards";

/** FlipCard flips on any press, key or click that reaches it, so the back's own controls must not let those through. */
const stop = (e: SyntheticEvent) => e.stopPropagation();

/** Days that share a time and a room are one line ("Days 1 & 2"). */
function sittings(when: Slot[]) {
  const rows: { days: EventDay[]; time: string; venue?: string }[] = [];
  for (const w of when) {
    const row = rows.find((r) => r.time === w.time && r.venue === w.venue);
    if (row) row.days.push(w.day);
    else rows.push({ days: [w.day], time: w.time, venue: w.venue });
  }
  return rows;
}

/**
 * One event: the poster on the front, the details on the back. Everything on the back is sized in
 * container-query units (cqw = 1% of the card's width) so the same layout fits a 340px phone card and a 560px desktop one.
 */
function Back({ event: e }: { event: EventData }) {
  return (
    <div className="@container size-full">
      <div className="flex size-full flex-col justify-between rounded-[inherit] bg-[radial-gradient(120%_70%_at_100%_0%,rgba(255,168,60,.2),transparent_60%),linear-gradient(180deg,#1f0d08,#120605)] p-[6.5cqw] ring-1 ring-cream/15 ring-inset @max-[320px]:p-[5cqw]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-amber/60 px-[2.6cqw] py-[0.9cqw] font-sans text-[clamp(9px,2.1cqw,12px)] font-medium tracking-[.22em] text-amber uppercase">
              {e.tag}
            </span>
            <span className="inline-flex items-center gap-[1.2cqw] font-sans text-[clamp(10px,2.5cqw,14px)] font-normal tracking-[.14em] text-cream/80 uppercase">
              <CalendarDays className="size-[1.2em]" aria-hidden />
              {dateOf(e)}
            </span>
          </div>
          <h3 className="mt-[5cqw] font-display text-[clamp(22px,8.6cqw,54px)] leading-[1.02] font-light text-cream">{e.name}</h3>
          <p className="mt-[1.6cqw] font-sans text-[clamp(10.5px,2.6cqw,15px)] font-normal tracking-[.2em] text-gold uppercase">
            {e.tagline}
            {e.host && ` · ${e.host}`}
          </p>
        </div>

        <div className="space-y-[3cqw] font-sans font-normal">
          {e.when.length ? (
            <ul className="space-y-[1.4cqw] text-[clamp(12px,3.1cqw,17px)] text-cream">
              {sittings(e.when).map((r, _, rows) => (
                <li key={r.days.join()} className="flex flex-wrap items-center gap-x-[3.4cqw] gap-y-[1cqw]">
                  {(rows.length > 1 || r.days.length > 1) && (
                    <b className="font-medium text-amber">{r.days.length > 1 ? `Days ${r.days.join(" & ")}` : festDays[r.days[0]].label}</b>
                  )}
                  {r.venue && (
                    <span className="inline-flex items-center gap-[1.4cqw]">
                      <MapPin className="size-[1.15em] shrink-0 text-amber" aria-hidden />
                      {r.venue}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-[1.4cqw]">
                    <Clock className="size-[1.15em] shrink-0 text-amber" aria-hidden />
                    {r.time}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[clamp(12px,3.1cqw,17px)] text-cream/70">Schedule to be announced</p>
          )}
          <p className="text-[clamp(12.5px,3.3cqw,19px)] leading-[1.5] text-cream/85">{e.about}</p>
          <ul className="list-disc space-y-[0.8cqw] pl-[4.5cqw] text-[clamp(12px,3.1cqw,16px)] leading-[1.45] text-cream/75 marker:text-amber">
            {e.facts.map((f) => (
              // on a card narrower than 300px only the first fact stays: the schedule and the description matter more
              <li key={f} className="@max-[300px]:nth-[n+2]:hidden">
                {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onPointerDown={stop}
          onPointerUp={stop}
          onClick={stop}
          onKeyDown={stop}
          className="inline-flex w-full items-center justify-center gap-[2cqw] rounded-full bg-cream px-[6cqw] py-[3cqw] font-sans text-[clamp(11px,2.5cqw,14px)] font-medium tracking-[.22em] text-ink uppercase transition-colors hover:bg-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Register
          <ArrowRight className="size-[1.3em]" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default function EventCard({ event, eager = false }: { event: EventData; eager?: boolean }) {
  return (
    <FlipCard
      // FlipCard.css is unlayered, so each override needs `!` to beat it: fill the grid cell at the poster's 4:5
      className="block! h-auto! w-full! aspect-[4/5]!"
      width={384}
      height={480}
      radius={18}
      background="#190a07"
      ariaLabel={`${event.name}, ${dateOf(event)}. Flip for details`}
      front={
        <Image
          src={`/images/events/${event.slug}.webp`}
          alt={`${event.name}: ${event.tagline}, ${dateOf(event)}`}
          fill
          sizes="(min-width: 1328px) 384px, (min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw"
          loading={eager ? "eager" : "lazy"}
          draggable={false}
          className="object-cover"
        />
      }
      back={<Back event={event} />}
    />
  );
}
