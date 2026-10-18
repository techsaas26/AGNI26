import Image from "next/image";
import { builders } from "@/data/builders";

/** "Built by" for the phone footer: five small round portraits and their names, nothing animated. */
export default function MobileBuiltBy() {
  return (
    <section className="m-bb" aria-label="Built by">
      <h3>Built by</h3>
      <ul>
        {builders.map((b) => (
          <li key={b.name}>
            <Image src={b.image} alt="" width={b.w} height={620} sizes="64px" loading="lazy" draggable={false} />
            <span>{b.name}</span>
            {b.instagram ? (
              <a href={b.instagram} target="_blank" rel="noopener" aria-label={`${b.name} on Instagram`}>
                Instagram
              </a>
            ) : (
              <small aria-hidden="true">Instagram</small>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
