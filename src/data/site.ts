import type { NavLink, SocialLink } from "@/types";

export const site = {
  name: "AGNI'26",
  theme: "Nostalgia",
  organizer: "Student Association and Arts Society, CEG",
  description:
    "AGNI'26 — the cultural fest of CEG, Anna University. This year we rewind to the golden days: Nostalgia.",
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/merch", label: "Merch" },
  { href: "/schedule", label: "Schedule" },
];

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/saas_ceg" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/saasceg/" },
  { label: "X", href: "https://twitter.com/saas_ceg" },
  { label: "Facebook", href: "https://www.facebook.com/techofes.co.in" },
];
