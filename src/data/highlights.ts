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
    description: "Electrifying performances by top artists!",
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
    description: "Relax and enjoy popular movies after dark.",
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
    description: "Showcasing the best student talents.",
    tagline: "Song · Dance · Rhythm",
    hint: "Where every talent finds the stage",
    hintSide: "left",
    side: "mid",
    titleClass: "title--inline",
  },
];
