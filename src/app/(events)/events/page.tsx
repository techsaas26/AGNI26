import EventsBrowser from "@/components/events/EventsBrowser";
import { events } from "@/data/events";
import { site } from "@/data/site";

export default function EventsPage() {
  return (
    <>
      <header className="evp-top">
        {/* plain anchors on purpose: a full page load keeps the home page's scroll engine clean */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="evp-brand" href="/" aria-label="AGNI’26 home">
          AGNI’26
        </a>
        <nav aria-label="Page">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">Home</a>
          <a href={site.eventsUrl} target="_blank" rel="noopener">
            AGNI site
          </a>
        </nav>
      </header>
      <main className="evp">
        <h1 className="evp-title">
          AGNI’26 <em>Events</em>
        </h1>
        <p className="evp-sub">Contests, workshops and showcases from the clubs of CEG. Narrow them down by what, when and who.</p>
        <EventsBrowser events={events} eventsUrl={site.eventsUrl} />
      </main>
      <footer className="evp-foot">© AGNI @ Student Association and Arts Society, CEG</footer>
    </>
  );
}
