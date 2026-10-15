import { Fragment, type ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import { contact, site, socialLinks } from "@/data/site";
import { ContactArt } from "./art/MiscArt";

/** Brand glyphs for the postcard's social row, keyed by link label. */
const ICONS: Record<string, ReactNode> = {
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" />
    </>
  ),
  Facebook: (
    <path d="M14 8.5V7c0-.8.4-1.2 1.3-1.2H17V3h-2.6C11.9 3 11 4.6 11 6.5v2H9v3h2V21h3v-9.5h2.6l.4-3z" />
  ),
  X: (
    <path d="M4 4l6.8 9L4 20h1.8l5.8-6.2L16 20h4l-7.2-9.6L19.4 4h-1.8l-5.4 5.8L8 4z" />
  ),
  LinkedIn: (
    <path d="M5 9h3.4v10H5zM6.7 4.3a2 2 0 110 4 2 2 0 010-4zM10.3 9h3.2v1.4c.5-.9 1.6-1.7 3.2-1.7 3 0 3.6 2 3.6 4.6V19h-3.4v-5c0-1.2 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19h-3.4z" />
  ),
  "WhatsApp channel": (
    <path d="M12 3.2a8.7 8.7 0 00-7.5 13.1L3.3 20.7l4.5-1.2A8.7 8.7 0 1012 3.2zm4.6 12.2c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500.2.600.8 2 .9 2.100.1.100.1.300 0 .4-.1.200-.2.300-.3.500-.2.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.5.100.6-.1.200-.2.700-.8.900-1.100.2-.3.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.700-.1 1.300z" />
  ),
};

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
            <article className="pc-face pc-front">
              <i className="pc-stamp">
                <b>
                  AGNI
                  <br />
                  ’26
                </b>
              </i>
              <i className="pc-mark" aria-hidden="true" />
              <div className="pc-body">
                <h3>
                  Student Association and Arts Society{" "}
                  <small>({site.organizerShort})</small>
                </h3>
                <address>
                  {site.college}
                  <br />
                  {site.university}
                </address>
                <p className="pc-mail">
                  <span>Email</span>
                  <a href={`mailto:${site.email}`} data-cursor="Write">
                    {site.email}
                  </a>
                </p>
                <div className="pc-soc">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={s.label}
                      data-cursor={s.cursor}
                    >
                      <svg viewBox="0 0 24 24">{ICONS[s.label]}</svg>
                    </a>
                  ))}
                </div>
                <p className="pc-note">
                  {contact.note.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
                <a
                  className="pc-map"
                  href={site.mapUrl}
                  target="_blank"
                  rel="noopener"
                  data-cursor="Map"
                >
                  <i />
                  <span>{contact.mapLabel}</span>
                </a>
              </div>
            </article>
            <div className="pc-face pc-back" aria-hidden="true">
              <svg viewBox="0 0 100 60" preserveAspectRatio="none">
                <path d="M0 0L50 36L100 0" />
                <path d="M0 60L38 28M100 60L62 28" />
              </svg>
              <i className="pc-seal">
                <b>A</b>
              </i>
              <span className="pcb-cue">{contact.turn} ↓</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
