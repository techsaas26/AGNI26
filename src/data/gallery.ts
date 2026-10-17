import type { GalleryFrame } from "@/types";

/**
 * Frames of the "memory reel" (desktop film strip and the phone polaroids). Originals in assets/gallery-src/,
 * `npm run images` writes public/images/gallery/*.webp. `position` frames the photo in both crops (5:4 desktop, 4:5 phone).
 */
export const galleryFrames: GalleryFrame[] = [
  { no: "001", caption: "Starting with Sound Rhythms", image: "/images/gallery/vivekananda-auditorium.webp", position: "50% 50%", size: "cover" },
  { no: "002", caption: "One step to Electrifying Performances", image: "/images/gallery/dance-crew.webp", position: "50% 50%", size: "cover" },
  { no: "003", caption: "Classical Vibes", image: "/images/gallery/classical-dance.webp", position: "46% 50%", size: "cover" },
  { no: "004", caption: "Dance to the Beats", image: "/images/gallery/solo-under-lights.webp", position: "44% 50%", size: "cover" },
  { no: "005", caption: "In the Spotlight at TOA Night", image: "/images/gallery/agni-wings.webp", position: "44% 50%", size: "cover" },
  { no: "006", caption: "Movie Team", image: "/images/gallery/the-band.webp", position: "44% 50%", size: "cover" },
  { no: "007", caption: "Together with Traditionals", image: "/images/gallery/veshti-band.webp", position: "50% 50%", size: "cover" },
  { no: "008", caption: "The duet we still hum", image: "/images/gallery/duet.webp", position: "55% 50%", size: "cover" },
  { no: "009", caption: "Songs that make Memories", image: "/images/gallery/laser-night.webp", position: "50% 50%", size: "cover" },
  { no: "010", caption: "Music Vibes at Concert Night", image: "/images/gallery/sparklers.webp", position: "50% 50%", size: "cover" },
  { no: "END", caption: "Revisiting you all on OCT 22-24" },
];
