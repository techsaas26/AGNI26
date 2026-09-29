import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import SponsorCard from "@/components/sponsors/SponsorCard";
import { sponsors } from "@/data/sponsors";
import { groupBy } from "@/lib/utils";

export const metadata: Metadata = { title: "Sponsors" };

export default function SponsorsPage() {
  const groups = groupBy(sponsors, (s) => s.category);

  return (
    <>
      <PageHeader title="Sponsors" />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-16">
        {[...groups].map(([category, list]) => (
          <section key={category}>
            <h2 className="mb-4 text-center font-display text-3xl text-vhs">{category}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((s) => (
                <SponsorCard key={s.name} sponsor={s} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
