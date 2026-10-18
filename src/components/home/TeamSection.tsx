import { teamSection } from "@/data/site";
import { team } from "@/data/team";
import { groupBy } from "@/lib/utils";
import TeamRoles from "./TeamRoles";

/** Team — "Cast & Crew": the crew one role at a time, ‹ › to step through the roles. */
export default function TeamSection() {
  const groups = [...groupBy(team, (m) => m.role)].map(([role, members]) => ({ role, members }));
  return (
    <section className="credits" id="team" data-scene="team" data-label="Our Team">
      <div className="credits-pin">
        <div className="credits-bg" />
        <div className="credits-body">
          <header className="cr-head">
            <h2 className="title">
              Cast <span>&amp;</span> Crew
            </h2>
            <p className="cr-sub">{teamSection.subtitle}</p>
          </header>
          <TeamRoles groups={groups} />
          <footer className="cr-end">
            <p>{teamSection.endLine}</p>
            <small>{teamSection.endNote}</small>
          </footer>
        </div>
      </div>
    </section>
  );
}
