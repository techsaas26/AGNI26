import BuiltBy from "./BuiltBy";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="foot">
      <BuiltBy />
      <div className="foot-line">
        <p>© 2026 AGNI @ {site.organizer}</p>
        <p>{site.designCredit}</p>
      </div>
    </footer>
  );
}
