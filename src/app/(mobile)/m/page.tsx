import { Fragment, type CSSProperties } from "react";
import MerchViewer from "@/components/home/MerchViewer";
import TeamRoles from "@/components/home/TeamRoles";
import MobileIntro from "@/components/mobile/MobileIntro";
import MobileFX from "@/components/mobile/MobileFX";
import MobileNav from "@/components/mobile/MobileNav";
import { galleryFrames } from "@/data/gallery";
import { highlights } from "@/data/highlights";
import { about, contact, eventsSection, hero, merch, register, site, socialLinks, teamSection } from "@/data/site";
import { team } from "@/data/team";
import { groupBy } from "@/lib/utils";

const d = (n: number) => ({ "--d": `${n * 90}ms` }) as CSSProperties;
const img = (name: string) => `/images/m/${name}.webp`;
// the memory reel: the same photos as the desktop strip (not the closing card)
const reel = galleryFrames.filter((f) => f.image && !f.logo);
const hl = (id: string) => highlights.find((h) => h.id === id)!;
// the crew by role, with the phone-sized portraits from /images/m/team
const crew = [...groupBy(team, (m) => m.role)].map(([role, members]) => ({
  role,
  members: members.map((m) => ({ ...m, image: `/images/m/team/${m.image.split("/").pop()!.replace(/\.\w+$/, "")}.webp` })),
}));

/** One chapter: a picture, then its words. */
function Chapter({ id, children, copy, cls = "" }: { id: string; children: React.ReactNode; copy: React.ReactNode; cls?: string }) {
  return (
    <section className={`m-ch ${cls}`} id={id}>
      <div className="m-pic">{children}</div>
      <div className="m-copy">{copy}</div>
    </section>
  );
}

function Title({ a, b }: { a: string; b: string }) {
  return (
    <h2 className="m-title" data-r>
      {a} <em>{b}</em>
    </h2>
  );
}

export default function MobilePage() {
  const words = about.text.trim().split(/\s+/);
  const chenda = hl("chenda");
  const concert = hl("concert");
  const movie = hl("movie");
  const talent = hl("talent");
  return (
    <>
      <MobileIntro />
      <MobileNav />
      <MobileFX />
      <main className="m-main">
        {/* HERO */}
        <section className="m-hero" id="home">
          <div className="m-hero-pic">
            <img src={img("hero")} alt="AGNI’26 in brass letters under a maple tree at sunset" width={720} height={900} fetchPriority="high" decoding="async" />
            <span className="m-embers" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--t": `${6 + (i % 5)}s`, "--o": `${(i % 7) * -0.9}s` } as CSSProperties} />
              ))}
            </span>
          </div>
          <div className="m-hero-copy">
            <h1 className="sr">{hero.headline}</h1>
            <p className="m-kick" aria-hidden="true">
              {hero.kicker.map((l, i) => (
                <span key={l} style={d(i + 1)}>
                  {l}
                </span>
              ))}
            </p>
            <p className="m-date" style={d(4)}>
              {site.dates}
            </p>
            <div className="m-cta" style={d(5)}>
              <a className="m-btn" href={site.eventsUrl} target="_blank" rel="noopener">
                {register.button}
              </a>
              <a className="m-btn m-btn--ghost" href="/events">
                Explore events
              </a>
            </div>
          </div>
          <a className="m-down" href="#about" aria-label="Scroll to About">
            <i />
          </a>
        </section>

        {/* ABOUT */}
        <Chapter
          id="about"
          cls="m-ch--about"
          copy={
            <>
              <h2 className="m-title m-title--quote" data-r>
                {about.title}
              </h2>
              <p className="m-lede m-words" data-words>
                {words.map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span style={{ "--i": i } as CSSProperties}>{w}</span>
                  </Fragment>
                ))}
              </p>
              <p className="m-by" data-r>
                {about.byline}
              </p>
            </>
          }
        >
          <img data-par="26" src={img("about")} alt="An empty bench under a maple tree, autumn leaves on the ground" width={720} height={900} loading="lazy" decoding="async" />
        </Chapter>

        {/* INAUGURATION: two planes of one picture drift apart as you scroll */}
        <Chapter
          id="chenda"
          cls="m-ch--sq"
          copy={
            <>
              <Title a={chenda.title} b={chenda.accent} />
              <p className="m-lede" data-r style={d(1)}>
                {chenda.description}
              </p>
              <p className="m-tag" data-r style={d(2)}>
                {chenda.tagline}
              </p>
            </>
          }
        >
          <img className="m-plane m-plane--back" data-par="10" src={img("inaug-sky")} alt="" width={800} height={800} loading="lazy" decoding="async" />
          <img className="m-plane m-plane--front" data-par="34" src={img("inaug-frame")} alt="A brass lamp and garlands framing a sunset over a lake" width={800} height={800} loading="lazy" decoding="async" />
        </Chapter>

        <Chapter
          id="concert"
          copy={
            <>
              <Title a={concert.title} b={concert.accent} />
              <p className="m-lede" data-r style={d(1)}>
                {concert.description}
              </p>
              <p className="m-tag" data-r style={d(2)}>
                {concert.tagline}
              </p>
            </>
          }
        >
          <img data-par="24" src={img("concert")} alt="Stage lights cutting through the dark over a crowd with phone torches" width={720} height={900} loading="lazy" decoding="async" />
        </Chapter>

        <Chapter
          id="movie"
          copy={
            <>
              <Title a={movie.title} b={movie.accent} />
              <p className="m-lede" data-r style={d(1)}>
                {movie.description}
              </p>
              <p className="m-tag" data-r style={d(2)}>
                {movie.tagline}
              </p>
            </>
          }
        >
          <img data-par="24" src={img("movie")} alt="An old film projector casting light across a picture-house" width={720} height={900} loading="lazy" decoding="async" />
        </Chapter>

        <Chapter
          id="talent"
          cls="m-ch--wide"
          copy={
            <>
              <Title a={talent.title} b={talent.accent} />
              <p className="m-lede" data-r style={d(1)}>
                {talent.description}
              </p>
              <p className="m-tag" data-r style={d(2)}>
                {talent.tagline}
              </p>
            </>
          }
        >
          <img data-par="12" src={img("talent")} alt="Silhouettes of singers and dancers against a red sky" width={960} height={540} loading="lazy" decoding="async" />
        </Chapter>

        {/* EVENTS */}
        <section className="m-sec" id="events">
          <h2 className="m-title" data-r>
            AGNI’26 <em>Events</em>
          </h2>
          <p className="m-lede" data-r style={d(1)}>
            {eventsSection.text}
          </p>
          <div className="m-evs">
            {eventsSection.categories.map((c, i) => (
              <a key={c.title} className="m-ev" href={c.href} data-r style={d(i + 1)}>
                <img src={c.phone} alt="" width={720} height={900} loading="lazy" decoding="async" />
                <span>
                  <b>{c.title}</b>
                  <small>{c.cta} →</small>
                </span>
              </a>
            ))}
          </div>
          <a className="m-btn m-btn--wide" href="/events" data-r>
            See all events
          </a>
        </section>

        {/* REGISTER */}
        <section className="m-sec m-reg" id="register">
          <h2 className="m-title" data-r>
            {register.title} <em>{register.accent}</em>
          </h2>
          <div className="m-ticket" data-r style={d(1)}>
            <p className="m-tk-top">
              <span>{register.ticket.top}</span>
              <span>{register.ticket.number}</span>
            </p>
            <h3>
              AGNI<i>’</i>26
            </h3>
            <p className="m-tk-sub">{register.ticket.subtitle}</p>
            <dl>
              <div>
                <dt>Date</dt>
                <dd>{site.datesShort}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{register.ticket.venue}</dd>
              </div>
              <div>
                <dt>Show</dt>
                <dd>{register.ticket.show}</dd>
              </div>
            </dl>
            <i className="m-tk-bar" aria-hidden="true" />
          </div>
          <a className="m-btn m-btn--wide" href={site.eventsUrl} target="_blank" rel="noopener" data-r style={d(2)}>
            {register.button}
          </a>
        </section>

        {/* MERCH */}
        <section className="m-sec" id="merch">
          <h2 className="m-title" data-r>
            {merch.title} <em>{merch.accent}</em>
          </h2>
          <div className="m-tee" data-r style={d(1)}>
            <MerchViewer model="/models/tee-opt.glb" front="/images/merch-front.webp" back="/images/merch-back.webp" />
          </div>
          <ul className="m-perks">
            {merch.perks.map((p, i) => (
              <li key={p.title} data-r style={d(i)}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* GALLERY */}
        <section className="m-sec m-sec--bleed" id="gallery">
          <h2 className="m-title m-pad" data-r>
            The memory <em>reel</em>
          </h2>
          <p className="m-hint m-pad">Swipe</p>
          <ul className="m-reel" tabIndex={0} aria-label="Photo reel">
            {reel.map((f, i) => (
              <li key={f.no} data-r style={d(Math.min(i, 3))}>
                <img
                  src={f.image}
                  alt={f.caption}
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: f.position }}
                />
                <span>{f.caption}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* TEAM */}
        <section className="m-sec m-sec--bleed" id="team">
          <h2 className="m-title m-pad" data-r>
            Our <em>Team</em>
          </h2>
          <p className="m-lede m-pad" data-r>
            {teamSection.subtitle}
          </p>
          <TeamRoles groups={crew} />
        </section>

        {/* CONTACT */}
        <section className="m-sec m-contact" id="contact">
          <h2 className="m-title" data-r>
            {contact.title} <em>{contact.accent}</em>
          </h2>
          <div className="m-card" data-r style={d(1)}>
            <h3>
              {site.organizerName} <small>({site.organizerShort})</small>
            </h3>
            <address>
              {site.college}
              <br />
              {site.university}
            </address>
            <a className="m-mail" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p className="m-soc">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener">
                  {s.label}
                </a>
              ))}
            </p>
            <a className="m-btn m-btn--wide" href={site.mapUrl} target="_blank" rel="noopener">
              {contact.mapLabel}
            </a>
          </div>
          <p className="m-sign" data-r>
            {contact.note.join(" ")}
          </p>
        </section>

        <footer className="m-foot">
          <p>{site.tagline}</p>
          <small>{teamSection.endNote}</small>
          <small>{site.designCredit}</small>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain anchor on purpose */}
          <a href="/?desktop">View the full site</a>
        </footer>
      </main>
      <a className="m-pill" href={site.eventsUrl} target="_blank" rel="noopener">
        Register
      </a>
    </>
  );
}
