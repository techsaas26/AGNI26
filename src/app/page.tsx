import HeroSection from "@/components/home/HeroSection";
import TeamMemberCard from "@/components/home/TeamMemberCard";
import { team } from "@/data/team";

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* TODO: About, highlights, and sponsor strip sections. */}

      <section id="team" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-10 text-center font-display text-5xl text-mustard">Meet the Team</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {team.map((m) => (
            <TeamMemberCard key={m.name} member={m} />
          ))}
        </div>
      </section>
    </>
  );
}
