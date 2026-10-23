import Image from "next/image";
import { sponsors, sponsorsSection } from "@/data/sponsors";
import { cn } from "@/lib/utils";

/** Sponsors — a looping row of ticket stubs. The list is printed twice so the strip can run −50% and start over unseen. */
export default function SponsorsMarquee({ className }: { className?: string }) {
  return (
    <section className={cn("spn", className)} aria-label="Sponsors">
      <p className="spn-eyebrow">{sponsorsSection.eyebrow}</p>
      <div className="spn-view">
        <div className="spn-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="spn-row" aria-hidden={copy === 1 || undefined}>
              {sponsors.map((s) => {
                const logo = <Image src={s.image} alt={copy ? "" : s.name} fill sizes="200px" />;
                return (
                  <li key={s.name} className={cn("spn-card", s.dark && "spn-card--dark")}>
                    {s.href ? (
                      <a className="spn-logo" href={s.href} target="_blank" rel="noopener" tabIndex={copy ? -1 : undefined}>
                        {logo}
                      </a>
                    ) : (
                      <span className="spn-logo">{logo}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
