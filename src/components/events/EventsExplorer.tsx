"use client";

import { useState } from "react";
import type { EventCategoryId, FestDay, FestEvent } from "@/types";
import { eventCategories, events } from "@/data/events";
import CategoryCard from "./CategoryCard";
import EventCard from "./EventCard";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const DAYS: (FestDay | "All Days")[] = ["All Days", "Day 1", "Day 2", "Day 3"];

export default function EventsExplorer() {
  const [category, setCategory] = useState<EventCategoryId>(eventCategories[0].id);
  const [day, setDay] = useState<FestDay | "All Days">("All Days");
  const [selected, setSelected] = useState<FestEvent | null>(null);

  const visible = events.filter((e) => e.category === category && (day === "All Days" || e.day === day));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {eventCategories.map((c) => (
          <CategoryCard key={c.id} category={c} active={c.id === category} onSelect={() => setCategory(c.id)} />
        ))}
      </div>

      <div className="my-8 flex flex-wrap justify-center gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={cn(
              "rounded-full border px-4 py-1 text-sm",
              d === day ? "border-mustard bg-mustard text-night" : "border-paper/40 hover:border-mustard",
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e) => (
            <EventCard key={e.id} event={e} onOpen={() => setSelected(e)} />
          ))}
        </div>
      ) : (
        <p className="text-center text-paper/60">Events coming soon.</p>
      )}

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <>
            <p className="mb-4">{selected.description}</p>
            <p className="text-sm text-sepia">
              {selected.day} · {selected.pricing}
            </p>
            {selected.registrationUrl && (
              <a
                href={selected.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded bg-cassette px-4 py-2 font-semibold text-paper"
              >
                Register
              </a>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
