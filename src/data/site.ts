import type { NavLink, SocialLink } from "@/types";

export const site = {
  name: "AGNI'26",
  /** Public origin — used to resolve social-share images. */
  url: "https://agni.saasceg.in",
  theme: "Nostalgia",
  tagline: "Some fires never fade",
  /** Browser tab title. */
  title: "AGNI'26 — Some fires never fade · CEG Guindy",
  organizer: "Student Association and Arts Society, CEG",
  organizerShort: "SAAS",
  college: "College of Engineering, Guindy",
  university: "Anna University, Chennai — 600025",
  description:
    "AGNI'26 — the cultural fest of the College of Engineering, Guindy. An event for tomorrow's dreamers. Jan 23–26, 2026.",
  shareDescription:
    "An event for tomorrow's dreamers. College of Engineering, Guindy · Jan 23–26, 2026.",
  themeColor: "#0b0403",
  /** Dates as set in the hero / credits. */
  dates: "Jan 23 — 26, 2026",
  datesShort: "Jan 23 — 26",
  email: "saasceg26@gmail.com",
  /** The live AGNI site — event listing, registration and merch pages live there. */
  eventsUrl: "https://agni.saasceg.in/events",
  merchUrl: "https://agni.saasceg.in/merch",
  mapUrl: "https://www.google.com/maps/place/College+of+Engineering,+Guindy",
  designCredit: "Designed by Technical Design, SAAS",
};

/** Links in the top bar — each one scrolls to a section of the home page. */
export const navLinks: NavLink[] = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#events", label: "Events" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/saas_ceg/", cursor: "IG" },
  { label: "Facebook", href: "https://www.facebook.com/techofes.co.in", cursor: "FB" },
  { label: "X", href: "https://twitter.com/saas_ceg", cursor: "X" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/saasceg/", cursor: "IN" },
  {
    label: "WhatsApp channel",
    href: "https://www.whatsapp.com/channel/0029VaE66JJ9xVJeMj7E8M08",
    cursor: "WA",
  },
];

/** Hero copy — each string is revealed line by line. */
export const hero = {
  headline: "AGNI’26 — an event for tomorrow’s dreamers. College of Engineering, Guindy.",
  kicker: ["An event", "for tomorrow’s", "dreamers"],
  vertical: "A journey back to what matters",
  scroll: "Scroll to explore",
  college: "College of Engineering Guindy",
};

export const about = {
  no: "01",
  eyebrow: "About Us",
  title: "Some moments aren’t just remembered — they stay with you.",
  text: "As the saying goes, “A small match lights a big fire,” SAAS organizes an intra-college cultural fest — AGNI — every year. The fest includes movie screening, concert night, and a plethora of events for students to participate and enjoy with their friends.",
  byline: "Student Association & Arts Society · CEG",
  link: "Why AGNI",
};

export const register = {
  no: "03",
  eyebrow: "Register Now",
  title: "Your seat is",
  accent: "waiting.",
  button: "Register Now",
  ticket: {
    top: "★ Admit One ★",
    number: "No. 0026",
    subtitle: "The Cultural Festival",
    venue: "CEG, Guindy",
    show: "All Day · All Night",
    stub: "Admit one",
    stubNo: "26",
  },
};

export const merch = {
  no: "04",
  eyebrow: "Merchandise",
  title: "Unlock your style with the official",
  accent: "Agni26 tee",
  perks: [
    {
      title: "Unlock Your Style",
      text: "Get ready to celebrate AGNI’26 in style! Exclusive Agni26 t-shirts that are a must-have for every student.",
    },
    {
      title: "Designs & Discounts",
      text: "Explore vibrant and creative designs for this year’s tee and discover attractive discounts to showcase your Agni pride.",
    },
    {
      title: "Wear Your Story",
      text: "Show your spirit, wear your story. Get your limited edition Agni26 t-shirt today!",
    },
  ],
  button: "Discover Designs & Discounts",
  hint: "Tap the tee to flip it",
};

export const gallery = {
  no: "05",
  eyebrow: "Gallery",
  title: "The memory",
  accent: "reel",
  hint: "Scroll to wind the reel",
};

export const teamSection = {
  no: "06",
  eyebrow: "Our Team",
  subtitle: "Student Association & Arts Society",
  endLine: "Some fires never fade",
  endNote: "AGNI’26 · Jan 23 — 26",
};

export const contact = {
  no: "07",
  eyebrow: "Contact Us",
  title: "Drop us",
  accent: "a line",
  note: ["Wish you were here.", "See you under the maple tree,", "Jan 23 — 26.", "— SAAS"],
  mapLabel: "Open in Google Maps",
};

/** Entries of the side rail, in scroll order: [anchor id, scene name, label]. */
export const railItems: { href: string; scene: string; label: string }[] = [
  { href: "#home", scene: "hero", label: "Home" },
  { href: "#about", scene: "about", label: "About" },
  { href: "#events", scene: "concert", label: "Concert Night" },
  { href: "#movie", scene: "movie", label: "Movie Night" },
  { href: "#talent", scene: "talent", label: "Talent of AGNI" },
  { href: "#chenda", scene: "chenda", label: "Inauguration & Chenda Melam" },
  { href: "#fashion", scene: "fashion", label: "Fashion Show" },
  { href: "#register", scene: "register", label: "Register" },
  { href: "#merch", scene: "merch", label: "Merchandise" },
  { href: "#gallery", scene: "gallery", label: "Gallery" },
  { href: "#team", scene: "team", label: "Our Team" },
  { href: "#contact", scene: "contact", label: "Contact" },
];
