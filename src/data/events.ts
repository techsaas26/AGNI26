/**
 * The event listing, as published on the AGNI site (AGNI'25 list — swap in the 2026 list here when it is out).
 * Every card links to `site.eventsUrl`; give an event its own `href` to send it somewhere more specific.
 */
export type EventCategory = "club" | "signature" | "iconic" | "proshow";
export type EventDay = 0 | 1 | 2;

export interface FestEvent {
  name: string;
  /** Organising club (empty for the fest-wide shows). */
  club: string;
  category: EventCategory;
  day: EventDay;
  href?: string;
}

export const categoryLabels: Record<EventCategory, string> = {
  club: "Club",
  signature: "Signature",
  iconic: "Iconic",
  proshow: "Proshow",
};

const c = (club: string, name: string, day: EventDay, category: EventCategory = "club"): FestEvent => ({ club, name, day, category });

export const events: FestEvent[] = [
  // proshows
  { name: "Movie Screening", club: "", category: "proshow", day: 0 },
  { name: "Concert Night", club: "", category: "proshow", day: 1 },
  { name: "Talent of Agni", club: "", category: "proshow", day: 2 },
  // iconic
  { name: "Fashion Show", club: "", category: "iconic", day: 1 },
  // signature
  c("Sruthilaya", "Solo Singing", 1, "signature"),
  c("Sruthilaya", "Solo Instrumentation", 1, "signature"),
  c("Saptham", "Nadha Vaibhavam", 1, "signature"),
  c("Saptham", "Natya Vaibhavam", 1, "signature"),
  c("Spartans", "Intra Variety: Echoes of the Past", 2, "signature"),
  c("Twisters", "Solo Dance", 2, "signature"),
  c("Twisters", "Duo Dance", 2, "signature"),
  c("Twisters", "Adaptunes", 2, "signature"),
  // clubs, day 1
  c("Aakriti", "Hop Hustle", 1),
  c("ACM", "Bid and Build", 1),
  c("AU Podium", "Speechify the Song", 1),
  c("AUSEC", "Bizarre Bazaar", 1),
  c("CSAU", "Hit Bull’s Eye", 1),
  c("EQ", "EQ Compass", 1),
  c("LitClub", "Two Sides of a Coin", 1),
  c("Maathavam", "நீ தான்டா Artist uhh", 1),
  c("Pixels", "Bid for the Shot", 1),
  c("QA", "Arena Quiz", 1),
  c("Robotics", "Escape Room", 1),
  c("SQC", "Quality Quest: Roll & Rise", 1),
  c("GT", "Pass the Puzzle", 1),
  c("Theatron", "Channel Surfing", 1),
  c("Scribbles", "Cover Story", 1),
  c("Astro", "Balloon Buzz", 2),
  // clubs, day 2
  c("AU Podium", "Roast vs Defend", 2),
  c("AUSEC", "Money Feud", 2),
  c("EQ", "Veil of Doubt", 2),
  c("GB", "Eco Sculpt", 2),
  c("Leo", "Hangin’ for Clues", 2),
  c("Quizzers Anonymous", "Kollywood Quiz", 2),
  c("LitClub", "Assassin", 2),
  c("Pixels", "The Reverse Click", 2),
  c("QA", "Motion Quiz", 2),
  c("Saptham", "Follow the Moves", 2),
  c("Sruthilaya", "The Singing Telephone", 2),
  c("SQC", "Quality Charades", 2),
  c("GT", "Mission: Among Us", 2),
  c("Theatron", "Reverse Theatre", 2),
  c("FINS AU", "Predict and Profit", 2),
];
