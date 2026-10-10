import { teamSection } from "@/data/site";
import { team } from "@/data/team";
import { groupBy } from "@/lib/utils";

/** Team — "Cast & Crew": the credits roll up the screen as the section is scrolled. */
export default function TeamSection() {
  const groups = [...groupBy(team, (m) => m.role)];
  return (
    <section className="credits" id="team" data-scene="team" data-label="Our Team">
      <div className="credits-pin">
        <div className="credits-bg" />
        <div className="credits-roll" id="credits-roll">
          <header className="cr-head">
            <p className="eyebrow">
              <b>{teamSection.no}</b>
              <span>{teamSection.eyebrow}</span>
            </p>
            <h2 className="title">
              Cast <span>&amp;</span> Crew
            </h2>
            <p className="cr-sub">{teamSection.subtitle}</p>
          </header>
          {groups.map(([role, members]) => (
            <div className="cr-group" key={role}>
              <h3>{role}</h3>
              {members.map((m) => (
                <p key={m.name}>{m.name}</p>
              ))}
            </div>
          ))}
          <footer className="cr-end">
            <i />
            <p>{teamSection.endLine}</p>
            <small>{teamSection.endNote}</small>
          </footer>
        </div>
        <div className="credits-fade" aria-hidden="true" />
      </div>
    </section>
  );
}
