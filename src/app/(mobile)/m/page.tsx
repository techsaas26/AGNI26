import type { CSSProperties } from "react";
import MerchViewer from "@/components/home/MerchViewer";
import TeamRoles from "@/components/home/TeamRoles";
import MobileIntro from "@/components/mobile/MobileIntro";
import MobileFilm from "@/components/mobile/MobileFilm";
import MobileBuiltBy from "@/components/mobile/MobileBuiltBy";
import MobileFX from "@/components/mobile/MobileFX";
import MobileNav from "@/components/mobile/MobileNav";
import { highlights } from "@/data/highlights";
import { about, contact, eventsSection, hero, merch, register, site, socialLinks, teamSection } from "@/data/site";
import { team } from "@/data/team";
import { MAPLE, f, rng } from "@/lib/art";
import { groupBy } from "@/lib/utils";

const d = (n: number) => ({ "--d": `${n * 90}ms` }) as CSSProperties;
const img = (name: string) => `/images/m/${name}.webp`;
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
      <div className="m-pic" data-r>{children}</div>
      <div className="m-copy">{copy}</div>
    </section>
  );
}

/** The PC Events backdrop (a dark wash with a few faint maple leaves, same seed and colours), laid out for a tall phone section. */
function EventsBackdrop() {
  const r = rng(11);
  return (
    <svg className="m-evs-bg" viewBox="0 0 400 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="m-evb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d0a0a" />
          <stop offset="1" stopColor="#0c0405" />
        </linearGradient>
      </defs>
      <rect width="400" height="1100" fill="url(#m-evb)" />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={MAPLE}
          transform={`translate(${f(r() * 400)} ${f(r() * 1100)}) rotate(${f(r() * 360)}) scale(${f(0.55 + r() * 0.7)})`}
          fill={i % 2 ? "#c4281f" : "#ff6a1a"}
          opacity={0.14}
        />
      ))}
    </svg>
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
            <img data-par="26" src={img("hero")} alt="AGNI’26 in brass letters under a maple tree at sunset" width={720} height={900} fetchPriority="high" decoding="async" />
          </div>
          <span className="m-leaves" aria-hidden="true">
            <svg width="0" height="0" style={{ position: "absolute" }} focusable="false">
              <symbol id="m-leaf" viewBox="-24 -26 48 52">
                <path d={MAPLE} />
              </symbol>
            </svg>
            {Array.from({ length: 7 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    "--x": `${8 + ((i * 53) % 84)}%`,
                    "--s": `${16 + (i % 3) * 7}px`,
                    "--t": `${12 + (i % 4) * 2.5}s`,
                    "--o": `${-i * 2.1}s`,
                    "--dx": `${(i % 2 ? -1 : 1) * (24 + (i % 3) * 14)}px`,
                    "--r": `${(i % 2 ? -1 : 1) * (120 + i * 25)}deg`,
                  } as CSSProperties
                }
              >
                <svg viewBox="-24 -26 48 52">
                  <use href="#m-leaf" />
                </svg>
              </i>
            ))}
          </span>
          <div className="m-hero-copy" data-par="10">
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
              <a className="m-btn" href={register.url} target="_blank" rel="noopener">
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
              <p className="m-lede" data-r style={d(1)}>
                {about.text}
              </p>
              <p className="m-by" data-r>
                {about.byline}
              </p>
            </>
          }
        >
          <img data-par="22" src={img("about")} alt="An empty bench under a maple tree, autumn leaves on the ground" width={720} height={900} loading="lazy" decoding="async" />
        </Chapter>

        {/* INAUGURATION: the PC picture in four layers that drift a little apart as you scroll */}
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
          <div className="m-stack">
            {(["sky", "far", "hall", "near"] as const).map((n, i) => (
              <img
                key={n}
                data-par={[4, 8, 14, 22][i]}
                src={img(`inaug-${n}`)}
                alt={i === 0 ? "A tall brass lamp with garlands at sunset between chenda drummers, a temple tower behind" : ""}
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
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
          <img data-par="12" src={img("concert")} alt="A band playing under red lights on an open-air stage, a crowd in front" width={720} height={900} loading="lazy" decoding="async" />
        </Chapter>

        <Chapter
          id="movie"
          cls="m-ch--sq"
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
          <div className="m-stack">
            <div className="m-shift" data-par="10">
              <img src={img("movie")} alt="An open-air cinema at night with six silhouettes on the screen" width={800} height={800} loading="lazy" decoding="async" />
              <i className="m-flick" aria-hidden="true" />
            </div>
          </div>
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
          <img data-par="8" src={img("talent")} alt="Silhouettes of singers and dancers against a red sky" width={960} height={540} loading="lazy" decoding="async" />
        </Chapter>

        {/* EVENTS */}
        <section className="m-sec" id="events">
          <EventsBackdrop />
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
          <p className="m-hint" data-r>
            {register.lede}
          </p>
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
          <a className="m-btn m-btn--wide" href={register.url} target="_blank" rel="noopener" data-r style={d(2)}>
            {register.button}
          </a>
        </section>

        {/* MERCH */}
        <section className="m-sec" id="merch">
          <h2 className="m-title" data-r>
            {merch.title} <em>{merch.accent}</em>
          </h2>
          <div className="m-tee" data-r style={d(1)}>
            <MerchViewer model="/models/tee-opt.glb" front="/images/merch-front.webp" back="/images/merch-back.webp" standIn={false} />
          </div>
          <ul className="m-perks">
            <li data-r style={d(1)}>
              <p>{merch.text}</p>
            </li>
          </ul>
        </section>

        {/* GALLERY */}
        <section className="m-sec m-sec--bleed" id="gallery">
          <h2 className="m-title m-pad" data-r>
            The memory <em>reel</em>
          </h2>
          <p className="m-hint m-pad">Swipe the reel</p>
          <MobileFilm />
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
          <MobileBuiltBy />
          <p>{site.tagline}</p>
          <small>{teamSection.endNote}</small>
          <small>{site.designCredit}</small>
        </footer>
      </main>
      <a className="m-pill" href={register.url} target="_blank" rel="noopener">
        Tickets
      </a>
    </>
  );
}
