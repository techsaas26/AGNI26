import type { NavLink, SocialLink } from "@/types";

export const site = {
  name: "AGNI'26",
  /** Public origin — used to resolve social-share images. */
  url: "https://agni.saasceg.in",
  theme: "Nostalgia",
  tagline: "Some fires never fade",
  /** Browser tab and search-result title — names the year, CEG and SAAS so it isn't mistaken for an earlier AGNI. */
  title: "AGNI'26 — CEG Cultural Fest 2026 | SAAS, College of Engineering Guindy",
  organizer: "Students’ Association and Arts Society, CEG",
  organizerName: "Students’ Association and Arts Society",
  organizerShort: "SAAS",
  college: "College of Engineering, Guindy",
  university: "Anna University, Chennai — 600025",
  description:
    "AGNI'26 (AGNI 2026), the cultural fest of the College of Engineering, Guindy, Anna University, by SAAS CEG. Concert night, movie screening and more · Oct 22-24, 2026.",
  /** Search terms people use for the fest. */
  keywords: [
    "AGNI'26",
    "AGNI 2026",
    "Agni 26",
    "Agni CEG",
    "Agni SAAS",
    "SAAS CEG",
    "CEG cultural fest",
    "College of Engineering Guindy culturals",
    "Anna University cultural fest",
    "Chennai college fest 2026",
  ],
  /** Fest days (ISO, IST) — for the search engines' Event listing. */
  startDate: "2026-10-22",
  endDate: "2026-10-24",
  address: { street: "Sardar Patel Road, Guindy", city: "Chennai", region: "Tamil Nadu", postalCode: "600025", country: "IN" },
  shareDescription:
    "An event for tomorrow's dreamers. College of Engineering, Guindy · Oct 22-24.",
  themeColor: "#0b0403",
  /** Dates as set in the hero / credits. */
  dates: "Oct 22-24",
  datesShort: "Oct 22-24",
  email: "saasceg26@gmail.com",
  /** The live AGNI site — event listing, registration and merch pages live there. */
  eventsUrl: "https://agni.saasceg.in/events",
  merchUrl: "https://agni.saasceg.in/merch",
  /** The SAAS website — the SAAS logo in the top bar links here. */
  saasUrl: "https://saasceg.in",
  mapUrl: "https://www.google.com/maps/place/College+of+Engineering,+Guindy",
  designCredit: "Designed by Technical Design, SAAS",
};

/** Links in the top bar — each one scrolls to a section of the home page. */
export const navLinks: NavLink[] = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#events", label: "Events" },
  { href: "#gallery", label: "Gallery" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
];

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/saas_ceg/", cursor: "IG" },
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
  headline: "AGNI’26 — A Journey thru’ Time, A Celebration of Memories. College of Engineering, Guindy.",
  kicker: ["A Journey thru’ Time,", "A Celebration of Memories"],
  vertical: "A journey back to what matters",
  scroll: "Scroll to explore",
  college: "College of Engineering Guindy",
};

export const about = {
  no: "01",
  eyebrow: "About Us",
  title: "Some moments aren’t just remembered — they stay with you.",
  text: "As the saying goes, “A small match lights a big fire,” SAAS organizes an intra-college cultural fest AGNI every year. The fest includes movie screening, concert night, and a plethora of events for students to participate and enjoy with their friends.",
  byline: "Students’ Association & Arts Society · CEG",
  link: "Why AGNI",
};

export const register = {
  no: "03",
  eyebrow: "Register Now",
  title: "Your seat is",
  accent: "waiting.",
  button: "Book your concert night ticket",
  url: "https://docs.google.com/forms/d/e/1FAIpQLSdSH2fQTlEcoBsX-1zhp0hETBTEPTVYQ7e9--7dMGUZEsNLGA/viewform",
  ticket: {
    top: "★ Concert Night ★",
    number: "No. 0026",
    subtitle: "Concert Night Ticket",
    venue: "CEG, Guindy",
    show: "Concert Night",
    stub: "Concert night",
    stubNo: "26",
  },
};

/**
 * The Events scene: one card per category of /events, in the same order. Each sends the visitor to that category
 * (`?cat=` is what the events page reads: signature, club or proshow). `image` is the desktop photo, `phone` the one the phone site loads.
 */
export const eventsSection = {
  title: "AGNI’26",
  accent: "Events",
  text: "Fun Games, Interesting Events for you and your friends, conducted by our CEG Clubs",
  categories: [
    {
      title: "Signature Events",
      text: "The stage events at Vivek and TAG: singing, instruments, dance and folk arts.",
      cta: "Explore signature events",
      href: "/events?cat=signature",
      image: "/images/gallery/classical-dance.webp",
      phone: "/images/gallery/classical-dance.webp",
    },
    {
      title: "Club Events",
      text: "Contests, games and showcases run by the clubs of CEG.",
      cta: "Explore club events",
      href: "/events?cat=club",
      image: "/images/gallery/club-events.webp",
      phone: "/images/m/club-events.webp",
    },
    {
      title: "Proshows",
      text: "The opening ceremony, movie night, concert night, choreo night and Talent of AGNI.",
      cta: "Explore proshows",
      href: "/events?cat=proshow",
      image: "/images/events/proshows.webp",
      phone: "/images/m/proshows.webp",
    },
  ],
};

export const merch = {
  title: "The official",
  accent: "AGNI’26 T-Shirt",
  perks: [
    {
      title: "Made for the fest",
      text: "An exclusive AGNI’26 T-Shirt, printed for every student who wants to carry the Nostalgic memories home.",
    },
  ],
  button: "See designs & discounts",
  hint: "Drag to turn the T-Shirt",
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
  subtitle: "Students’ Association & Arts Society",
  endLine: "The Team Behind the Screens",
  endNote: "AGNI’26 · Oct 22-24",
};

export const contact = {
  no: "07",
  eyebrow: "Contact Us",
  title: "Drop us",
  accent: "a line",
  note: ["Carry the Nostalgic Memories home.", "See you under the maple tree,", "Oct 22-24.", "— SAAS"],
  mapLabel: "Open in Google Maps",
  back: ["To: whoever remembers", "c/o the old campus", "Chennai — 600025"],
  turn: "Scroll to turn it over",
};

/** Entries of the side rail, in scroll order: [anchor id, scene name, label]. */
export const railItems: { href: string; scene: string; label: string }[] = [
  { href: "#home", scene: "hero", label: "Home" },
  { href: "#about", scene: "about", label: "About" },
  { href: "#chenda", scene: "chenda", label: "Inauguration & Chenda Melam" },
  { href: "#movie", scene: "movie", label: "Movie Night" },
  { href: "#concert", scene: "concert", label: "Concert Night" },
  { href: "#talent", scene: "talent", label: "Talent of AGNI" },
  { href: "#events", scene: "events", label: "Events" },
  { href: "#register", scene: "register", label: "Register" },
  { href: "#merch", scene: "merch", label: "Merchandise" },
  { href: "#gallery", scene: "gallery", label: "Gallery" },
  { href: "#team", scene: "team", label: "Our Team" },
  { href: "#contact", scene: "contact", label: "Contact" },
];
