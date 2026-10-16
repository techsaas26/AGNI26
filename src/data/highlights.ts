import type { Highlight } from "@/types";

/**
 * The five "Why AGNI" scenes, in scroll order.
 * Each one pairs with an illustrated stage in `components/home/art/`.
 */
export const highlights: Highlight[] = [
  {
    id: "chenda",
    fx: 1000,
    fw: 1000,
    anchor: "chenda",
    label: "Inauguration & Chenda Melam",
    title: "Inauguration",
    accent: "& Chenda Melam",
    description: "Kick off AGNI’26 with an inspiring ceremony.",
    tagline: "The lamp · The drums",
    hint: "Where the fest begins",
    side: "left",
    titleClass: "title--long",
  },
  {
    id: "concert",
    fx: 800,
    fw: 1000,
    anchor: "concert",
    label: "Concert Night",
    title: "Concert",
    accent: "Night",
    description: "Memorable Mass Performances by Artists on the Concert Night!",
    tagline: "Live · Loud",
    hint: "Live under the open sky",
    side: "left",
  },
  {
    id: "movie",
    fx: 1060,
    fw: 1120,
    anchor: "movie",
    label: "Movie Night",
    title: "Movie",
    accent: "Night",
    description: "Ending Day 0 with a Movie Screening!",
    tagline: "Night show · Old picture house",
    hint: "Tap a frame to change the reel",
    hintSide: "left",
    side: "left",
  },
  {
    id: "talent",
    fx: 800,
    fw: 1300,
    anchor: "talent",
    label: "Talent of AGNI",
    title: "Talent",
    accent: "of AGNI",
    description: "One of the Premier events of this Intra-Cultural Fest where Students showcase their talent and compete for the Title - Talent of Agni",
    tagline: "Song · Dance · Rhythm",
    hint: "Where every talent finds the stage",
    hintSide: "left",
    side: "mid",
    titleClass: "title--inline",
  },
];
