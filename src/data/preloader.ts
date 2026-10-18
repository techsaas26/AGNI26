/**
 * Sprite sheet of the AGNI'26 logo, cut into its lettering and props (see the loader).
 * Coordinates are in the logo's own 1600×800 space; files live in public/images/preloader/.
 */
export interface LogoPart {
  name: string;
  kind: "letter" | "prop";
  x: number;
  y: number;
  w: number;
  h: number;
  file: string;
}

export const logoSheet = {
  W: 1600,
  H: 800,
  /** The finished logo, drawn on top once every piece has landed. */
  full: "full.webp",
  parts: [
    { name: "A", kind: "letter", x: 155, y: 267, w: 432, h: 398, file: "A.webp" },
    { name: "G", kind: "letter", x: 525, y: 355, w: 203, h: 249, file: "G.webp" },
    { name: "N", kind: "letter", x: 713, y: 357, w: 204, h: 254, file: "N.webp" },
    { name: "I", kind: "letter", x: 915, y: 357, w: 92, h: 263, file: "I.webp" },
    { name: "apos", kind: "letter", x: 979, y: 311, w: 90, h: 113, file: "apos.webp" },
    { name: "two", kind: "letter", x: 1010, y: 357, w: 187, h: 268, file: "two.webp" },
    { name: "six", kind: "letter", x: 1177, y: 351, w: 191, h: 283, file: "six.webp" },
    { name: "camera", kind: "prop", x: 140, y: 117, w: 335, h: 308, file: "camera.webp" },
    { name: "gramophone", kind: "prop", x: 560, y: 22, w: 340, h: 323, file: "gramophone.webp" },
    { name: "books", kind: "prop", x: 900, y: 223, w: 162, h: 122, file: "books.webp" },
    { name: "mic", kind: "prop", x: 1062, y: 154, w: 138, h: 236, file: "mic.webp" },
    { name: "record", kind: "prop", x: 1178, y: 229, w: 167, h: 171, file: "record.webp" },
    { name: "notes", kind: "prop", x: 1345, y: 221, w: 152, h: 204, file: "notes.webp" },
    { name: "car", kind: "prop", x: 1340, y: 425, w: 235, h: 235, file: "car.webp" },
    { name: "film", kind: "prop", x: 74, y: 401, w: 346, h: 319, file: "film.webp" },
    { name: "flourish", kind: "prop", x: 540, y: 615, w: 580, h: 130, file: "flourish.webp" },
    { name: "plaque", kind: "prop", x: 240, y: 218, w: 1195, h: 532, file: "plaque.webp" },
  ] as LogoPart[],
};
