export interface NavLink {
  /** In-page anchor, e.g. "#about" — the id of a section on the home page. */
  href: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Short label shown inside the custom cursor while hovering the link. */
  cursor?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  /** Path under /public, e.g. "/images/team/joel-muthu-rajan.jpg" */
  image: string;
  instagram?: string;
  linkedin?: string;
}

/** The five "Why AGNI" scenes on the home page. */
export type HighlightId = "concert" | "movie" | "talent" | "chenda" | "fashion";

export interface Highlight {
  id: HighlightId;
  /** Anchor / section id (the first scene keeps the id "events" — it is the nav target). */
  anchor: string;
  /** Label shown on the side rail. */
  label: string;
  title: string;
  /** The italic, gradient second line of the title. */
  accent: string;
  description: string;
  tagline: string;
  /** Small instruction shown in the corner of the scene. */
  hint: string;
  /** `left` / `right`: which side the copy sits on. */
  side: "left" | "right";
  /** Where the hint sits; defaults to the right-hand corner. */
  hintSide?: "left";
  /** Extra title modifier class (long titles are set smaller). */
  titleClass?: string;
  /** Id of the hint element, when a controller rewrites the hint text. */
  hintId?: string;
  /** Horizontal focus point (stage px) and visible width used to frame the art on narrow screens. */
  fx: number;
  fw: number;
}

export interface GalleryFrame {
  /** Frame counter shown in the caption, e.g. "001". */
  no: string;
  caption: string;
  /** Path under /public. Omit for the closing "END" card. */
  image?: string;
  /** CSS background-position / background-size used to crop the photo. */
  position?: string;
  size?: string;
  /** Adds the logo backdrop colour. */
  logo?: boolean;
}
