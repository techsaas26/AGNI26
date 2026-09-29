import { site, socialLinks } from "@/data/site";

// TODO: add the AGNI'26 web team credits (AGNI'25 showed a "Designed by" popup).
export default function Footer() {
  return (
    <footer className="border-t border-sepia/40 bg-black/40 px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-paper/70 sm:flex-row">
        <p>
          &copy; 2026 AGNI @ {site.organizer}
        </p>
        <ul className="flex gap-4">
          {socialLinks.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-mustard">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
