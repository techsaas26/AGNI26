import Image from "next/image";
import type { TeamMember } from "@/types";
import { formatUrl } from "@/lib/utils";

export default function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="rotate-[-1deg] bg-paper p-3 pb-5 text-ink shadow-lg transition-transform hover:rotate-0">
      <div className="relative aspect-square overflow-hidden bg-ink/10">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover sepia-[.3]"
        />
      </div>
      <h3 className="mt-3 text-center font-semibold">{member.name}</h3>
      <p className="text-center text-sm text-sepia">{member.role}</p>
      <div className="mt-2 flex justify-center gap-3 text-sm">
        {member.instagram && (
          <a href={formatUrl(member.instagram)} target="_blank" rel="noopener noreferrer" className="hover:text-cassette">
            Instagram
          </a>
        )}
        {member.linkedin && (
          <a href={formatUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-cassette">
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}
