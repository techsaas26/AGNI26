import type { GalleryFrame } from "@/types";

/** Frames of the "memory reel". Photos live in public/images/{gallery,hero,branding}/. */
export const galleryFrames: GalleryFrame[] = [
  { no: "001", caption: "The last bench", image: "/images/gallery/campus-bench.webp", position: "50% 62%", size: "cover" },
  { no: "002", caption: "Where we waited", image: "/images/gallery/maple-lake.webp", position: "50% 50%", size: "cover" },
  { no: "003", caption: "5:42 PM, clock tower", image: "/images/hero/hero-bg.jpeg", position: "78% 30%", size: "260%" },
  { no: "004", caption: "Roots", image: "/images/hero/hero-poster.jpg", position: "6% 62%", size: "250%" },
  { no: "005", caption: "AGNI’26", image: "/images/branding/agni26-logo.webp", position: "50% 50%", size: "contain", logo: true },
  { no: "006", caption: "Golden hour, 6:10", image: "/images/gallery/campus-bench.webp", position: "78% 22%", size: "240%" },
  { no: "007", caption: "A lantern, left on", image: "/images/gallery/maple-lake.webp", position: "6% 78%", size: "260%" },
  { no: "END", caption: "See you on Oct 22-24" },
];
