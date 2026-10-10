import localFont from "next/font/local";

/*
 * Webfonts are self-hosted (files live in ./fonts). Each family exposes a CSS variable that the
 * @theme tokens in globals.css pick up:  --font-fraunces → font-display,  --font-jost → font-sans, …
 */

/** Display serif: titles, numerals, the ticket. Variable weight 300–900. */
export const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  src: [
    { path: "./fonts/Fraunces-normal-300-900-latin.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/Fraunces-italic-300-900-latin.woff2", weight: "300 900", style: "italic" },
  ],
});

/** UI sans: nav, buttons, body copy. Variable weight 300–600. */
export const jost = localFont({
  variable: "--font-jost",
  display: "swap",
  src: [{ path: "./fonts/Jost-normal-300-600-latin.woff2", weight: "300 600", style: "normal" }],
});

/** Italic quote face for the "Cast & Crew" ampersand. */
export const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/CormorantGaramond-normal-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CormorantGaramond-normal-600-latin.woff2", weight: "600", style: "normal" },
    { path: "./fonts/CormorantGaramond-italic-400-latin.woff2", weight: "400", style: "italic" },
    { path: "./fonts/CormorantGaramond-italic-500-latin.woff2", weight: "500", style: "italic" },
  ],
});

/** Typewriter: tickets, captions, handwriting on the postcard. */
export const specialElite = localFont({
  variable: "--font-special-elite",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/SpecialElite-normal-400-latin.woff2", weight: "400", style: "normal" }],
});

/** Pixel font for the Talent-of-AGNI CRT and the console. */
export const pressStart = localFont({
  variable: "--font-press-start",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/PressStart2P-normal-400-latin.woff2", weight: "400", style: "normal" }],
});

/** Fairground sign lettering for the bioscope. */
export const rye = localFont({
  variable: "--font-rye",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/Rye-normal-400-latin.woff2", weight: "400", style: "normal" }],
});

/** Devanagari and Tamil faces used by the loader's cycling title and the bioscope sign. */
export const yatraOne = localFont({
  variable: "--font-yatra",
  display: "swap",
  preload: false,
  src: [{ path: "./fonts/YatraOne-normal-400-devanagari.woff2", weight: "400", style: "normal" }],
});

export const notoSerifTamil = localFont({
  variable: "--font-noto-tamil",
  display: "swap",
  preload: false,
  src: [
    { path: "./fonts/NotoSerifTamil-normal-600-tamil.woff2", weight: "600", style: "normal" },
    { path: "./fonts/NotoSerifTamil-normal-800-tamil.woff2", weight: "800", style: "normal" },
  ],
});

/** All variable classes, to be placed on <html>. */
export const fontVariables = [
  fraunces,
  jost,
  cormorant,
  specialElite,
  pressStart,
  rye,
  yatraOne,
  notoSerifTamil,
]
  .map((f) => f.variable)
  .join(" ");
