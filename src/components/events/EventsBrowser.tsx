"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabels, type EventCategory, type EventDay, type FestEvent } from "@/data/events";

const CATS = Object.keys(categoryLabels) as EventCategory[];
const DAYS: EventDay[] = [0, 1, 2];

/** Filters live in the address (?cat=club&day=1&club=EQ&q=quiz) so a filtered list can be shared. */
function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const cat = p.get("cat");
  const day = p.get("day");
  return {
    q: p.get("q") ?? "",
    cat: (CATS as string[]).includes(cat ?? "") ? (cat as EventCategory) : null,
    day: day !== null && ["0", "1", "2"].includes(day) ? (Number(day) as EventDay) : null,
    clubs: (p.get("club") ?? "").split("|").filter(Boolean),
  };
}

export default function EventsBrowser({ events, eventsUrl }: { events: FestEvent[]; eventsUrl: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<EventCategory | null>(null);
  const [day, setDay] = useState<EventDay | null>(null);
  const [clubs, setClubs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- the address is only readable after hydration */
    const f = fromUrl();
    setQ(f.q);
    setCat(f.cat);
    setDay(f.day);
    setClubs(f.clubs);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat) p.set("cat", cat);
    if (day !== null) p.set("day", String(day));
    if (clubs.length) p.set("club", clubs.join("|"));
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }, [q, cat, day, clubs, ready]);

  const allClubs = useMemo(() => [...new Set(events.map((e) => e.club).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [events]);

  const needle = q.trim().toLowerCase();
  const match = (e: FestEvent, skip?: "cat" | "day" | "club") =>
    (skip === "cat" || !cat || e.category === cat) &&
    (skip === "day" || day === null || e.day === day) &&
    (skip === "club" || !clubs.length || clubs.includes(e.club)) &&
    (!needle || `${e.name} ${e.club} ${categoryLabels[e.category]}`.toLowerCase().includes(needle));

  const shown = events.filter((e) => match(e));
  // each option shows how many events it would give with everything else kept, so no choice leads to an empty list
  const count = {
    cat: (c: EventCategory) => events.filter((e) => match(e, "cat") && e.category === c).length,
    day: (d: EventDay) => events.filter((e) => match(e, "day") && e.day === d).length,
    club: (c: string) => events.filter((e) => match(e, "club") && e.club === c).length,
  };
  const active = Boolean(needle || cat || day !== null || clubs.length);
  const reset = () => {
    setQ("");
    setCat(null);
    setDay(null);
    setClubs([]);
  };
  const toggleClub = (c: string) => setClubs((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const chip = (on: boolean, n: number, label: string, onClick: () => void, key: string) => (
    <button key={key} type="button" className="evp-chip" aria-pressed={on} disabled={!on && n === 0} onClick={onClick}>
      {label} <span>{n}</span>
    </button>
  );

  return (
    <div className="evp-grid">
      <aside className="evp-filters" aria-label="Filters">
        <label className="evp-search">
          <span className="sr">Search events</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events or clubs" autoComplete="off" />
        </label>

        <fieldset>
          <legend>Type</legend>
          <div className="evp-chips">
            {CATS.map((c) => chip(cat === c, count.cat(c), categoryLabels[c], () => setCat(cat === c ? null : c), c))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Day</legend>
          <div className="evp-chips">
            {DAYS.map((d) => chip(day === d, count.day(d), `Day ${d}`, () => setDay(day === d ? null : d), `d${d}`))}
          </div>
        </fieldset>

        <fieldset>
          <legend>
            Club {clubs.length > 0 && <b>{clubs.length} selected</b>}
          </legend>
          <div className="evp-chips evp-clubs">{allClubs.map((c) => chip(clubs.includes(c), count.club(c), c, () => toggleClub(c), c))}</div>
        </fieldset>

        <button type="button" className="evp-reset" onClick={reset} disabled={!active}>
          Clear filters
        </button>
      </aside>

      <section aria-label="Results">
        <p className="evp-count" role="status" aria-live="polite">
          {shown.length} of {events.length} events
        </p>
        {shown.length === 0 ? (
          <div className="evp-empty">
            <p>Nothing matches that combination.</p>
            <button type="button" className="evp-reset on" onClick={reset}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="evp-list">
            {shown.map((e) => (
              <li key={`${e.club}-${e.name}`}>
                <a className="evp-card" data-cat={e.category} href={e.href ?? eventsUrl} target="_blank" rel="noopener">
                  <span className="evp-club">{e.club || "AGNI"}</span>
                  <h2>{e.name}</h2>
                  <span className="evp-meta">
                    <i>{categoryLabels[e.category]}</i>
                    <i>Day {e.day}</i>
                  </span>
                  <span className="evp-go">Details on the AGNI site →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
