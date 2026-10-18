import Footer from "@/components/layout/Footer";
import { contact, site, socialLinks } from "@/data/site";
import { ContactArt } from "./art/MiscArt";

/** Tap targets over the printed details on the postcard picture, in % of the picture (it is 900 × 534 at its design size). */
const at = (x: number, y: number, w: number, h: number) =>
  ({ left: `${(x / 9).toFixed(2)}%`, top: `${(y / 5.34).toFixed(2)}%`, width: `${(w / 9).toFixed(2)}%`, height: `${(h / 5.34).toFixed(2)}%` }) as const;
const SOCIAL_AT = [[131, 363], [189, 361], [246, 358], [303, 354], [356, 352]] as const;

/** Contact — a postcard with the address, email and social links. */
export default function ContactSection() {
  return (
    <section
      className="contact"
      id="contact"
      data-scene="contact"
      data-label="Contact"
    >
      <div className="stage" id="art-contact">
        <ContactArt />
      </div>
      <div className="contact-in">
        <div className="copy copy--contact">
          <h2 className="title title--mid rv">
            {contact.title} <span>{contact.accent}</span>
          </h2>
        </div>
        <div className="pc-wrap rv" id="postcard" data-cursor="Tilt">
          <div className="pc-flip" id="pc-flip">
            <article className="pc-face pc-front pc-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact-postcard.webp" alt={`${site.organizerName} (${site.organizerShort}), ${site.college}, ${site.university}`} width={1400} height={832} loading="lazy" decoding="async" draggable={false} />
              <a className="pc-hot" style={at(200, 298, 195, 30)} href={`mailto:${site.email}`} aria-label={`Email ${site.email}`} data-cursor="Write" />
              {socialLinks.map((l, i) => (
                <a key={l.label} className="pc-hot" style={at(SOCIAL_AT[i][0], SOCIAL_AT[i][1], 44, 44)} href={l.href} target="_blank" rel="noopener" aria-label={l.label} data-cursor={l.cursor} />
              ))}
              <a className="pc-hot" style={at(135, 424, 233, 24)} href={site.mapUrl} target="_blank" rel="noopener" aria-label={contact.mapLabel} data-cursor="Map" />
            </article>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
