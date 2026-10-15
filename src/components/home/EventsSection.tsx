import { eventsSection } from "@/data/site";
import { EventsArt } from "./art/MiscArt";

/** Events — two doors into the full event listing: club events and signature events. */
export default function EventsSection() {
  return (
    <section
      className="scene evs"
      id="events"
      data-scene="events"
      data-label="Events"
    >
      <div className="stage" id="art-events">
        <EventsArt />
      </div>
      <div className="evs-wrap">
        <div className="copy copy--center">
          <h2 className="title title--mid rv">
            {eventsSection.title} <span>{eventsSection.accent}</span>
          </h2>
        </div>
        <div className="evs-cards">
          {eventsSection.categories.map((c) => (
            <a
              key={c.title}
              className="evs-card rv"
              href={c.href}
              data-cursor="Open"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" loading="lazy" />
              <div className="evs-txt">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span>{c.cta} →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
