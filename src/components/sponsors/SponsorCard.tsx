import Image from "next/image";
import type { Sponsor } from "@/types";

export default function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const logo = (
    <div className="flex h-32 items-center justify-center rounded-lg bg-paper p-4">
      <Image src={sponsor.logo} alt={sponsor.name} width={200} height={100} className="max-h-full w-auto object-contain" />
    </div>
  );
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer" title={sponsor.name}>
      {logo}
    </a>
  ) : (
    logo
  );
}
