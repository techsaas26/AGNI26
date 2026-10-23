import type { Sponsor } from "@/types";

/**
 * Sponsors on the ticket-stub strip above the footer (desktop Contact scene and the phone page). Originals in
 * assets/sponsors-src/, `npm run images` writes public/images/sponsors/*.webp. The strip loops, so order is the running order.
 */
export const sponsorsSection = { eyebrow: "In association with" };

export const sponsors: Sponsor[] = [
  { name: "Zebronics", image: "/images/sponsors/zebronics.webp" },
  { name: "Canara Bank", image: "/images/sponsors/canara-bank.webp", dark: true },
  { name: "Rajams Digital Offset Prints", image: "/images/sponsors/rajams.webp" },
  { name: "RYUX Esports", image: "/images/sponsors/ryux-esports.webp" },
  { name: "Gurunath", image: "/images/sponsors/gurunath.webp" },
  { name: "KTPL", image: "/images/sponsors/ktpl.webp" },
];
