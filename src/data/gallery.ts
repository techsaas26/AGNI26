import type { GalleryFrame } from "@/types";

/**
 * Frames of the "memory reel" (desktop film strip and the phone polaroids). Originals in assets/gallery-src/,
 * `npm run images` writes public/images/gallery/*.webp. `position` frames the photo in both crops (5:4 desktop, 4:5 phone).
 */
export const galleryFrames: GalleryFrame[] = [
  { no: "001", caption: "Morning, outside Vivekananda", image: "/images/gallery/vivekananda-auditorium.webp", position: "50% 50%", size: "cover" },
  { no: "002", caption: "Twelve of us, one count", image: "/images/gallery/dance-crew.webp", position: "50% 50%", size: "cover" },
  { no: "003", caption: "The first step, in silk", image: "/images/gallery/classical-dance.webp", position: "46% 50%", size: "cover" },
  { no: "004", caption: "Blue light, bare stage", image: "/images/gallery/solo-under-lights.webp", position: "44% 50%", size: "cover" },
  { no: "005", caption: "Under the wings", image: "/images/gallery/agni-wings.webp", position: "44% 50%", size: "cover" },
  { no: "006", caption: "One song, every voice", image: "/images/gallery/the-band.webp", position: "44% 50%", size: "cover" },
  { no: "007", caption: "Veshtis on the stage", image: "/images/gallery/veshti-band.webp", position: "50% 50%", size: "cover" },
  { no: "008", caption: "The duet we still hum", image: "/images/gallery/duet.webp", position: "55% 50%", size: "cover" },
  { no: "009", caption: "Lasers and a last chorus", image: "/images/gallery/laser-night.webp", position: "50% 50%", size: "cover" },
  { no: "010", caption: "Sparks for the finale", image: "/images/gallery/sparklers.webp", position: "50% 50%", size: "cover" },
  { no: "END", caption: "See you on Oct 22-24" },
];
