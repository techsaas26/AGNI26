import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="foot">
      <p>© 2026 AGNI @ {site.organizer}</p>
      <p>{site.designCredit}</p>
    </footer>
  );
}
