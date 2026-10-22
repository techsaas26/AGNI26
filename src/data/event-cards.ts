/**
 * The events showcase (/events). Three categories, as on last year's site: Signature Events (the stage events at the Vivek and
 * TAG auditoria), Club Events (the contests and games run by the clubs) and Proshows (the opening ceremony and the nights).
 *
 * Sources: the fest agenda (Agenda.pdf) is the source of truth: only the events it lists are here, with its names, days, times
 * and venues. Signature = the Vivek and TAG auditorium events, Proshows = the ceremony and the nights, Club = everything else.
 * Descriptions, rounds and rules come from the club proposals in the Drive folder "Finalised Event AGNI'26"; an event with no
 * proposal says "More details to be announced". Phone numbers, registration numbers and e-mail addresses are not copied.
 * Each poster is public/images/events/<slug>.webp (800x1000): a generated stand-in, so a real poster dropped over the same
 * file name replaces it and nothing else needs to change. The section ids match the `?cat=` links on the home page.
 */
import { register } from "./site";

export type SectionId = "signature" | "club" | "proshow";
export type EventDay = 0 | 1 | 2;
export type EventTag =
  | "Ceremony"
  | "Pro Show"
  | "Talent Show"
  | "Music & Dance"
  | "Stage & Speech"
  | "Workshop"
  | "Quiz & Strategy"
  | "Games"
  | "Art & Media";

/** One sitting of an event: the day, the time (or the rounds' times) and, when the agenda gives one, the room. */
export interface Slot {
  day: EventDay;
  time: string;
  venue?: string;
}

export interface EventCard {
  /** Also the poster's file name. */
  slug: string;
  name: string;
  tagline: string;
  tag: EventTag;
  /** Organising club or committee, when known. */
  host?: string;
  /** Empty until the event has a slot in the agenda. */
  when: Slot[];
  /** The back of the card: what it is, then a few quick facts. */
  about: string;
  facts: string[];
  /** The sign-up form: the back of the card shows a Register link only when there is one. */
  registrationUrl?: string;
  /** The link's wording, when "Register" is not right (a ticket). */
  registrationLabel?: string;
}

export interface EventSection {
  id: SectionId;
  label: string;
  blurb: string;
  /** How to sign up, shown on the back of each card in place of the Register button. */
  registration?: string;
  events: EventCard[];
}

export const festDays: { id: EventDay; label: string; date: string }[] = [
  { id: 0, label: "Day 0", date: "Thu 22 Oct" },
  { id: 1, label: "Day 1", date: "Fri 23 Oct" },
  { id: 2, label: "Day 2", date: "Sat 24 Oct" },
];

/** "Fri 23 Oct", "Oct 23–24" for an event on two days, or the fest dates while it has no slot yet. */
export function dateOf(e: EventCard): string {
  const days = [...new Set(e.when.map((w) => w.day))];
  if (!days.length) return "Oct 22–24";
  return days.length === 1 ? festDays[days[0]].date : `Oct ${22 + days[0]}–${22 + days[days.length - 1]}`;
}

export const eventSections: EventSection[] = [
  {
    id: "signature",
    label: "Signature Events",
    blurb: "The stage events at the Vivek and TAG auditoria: singing, instruments, dance and folk arts.",
    events: [
      {
        slug: "oyilattam-workshop",
        name: "Oyilattam Workshop",
        tagline: "Learn the folk dance",
        tag: "Workshop",
        when: [{ day: 1, time: "10:30 AM–12:30 PM", venue: "TAG Auditorium" }],
        about: "A workshop on Oyilattam, the traditional Tamil folk dance.",
        facts: ["Held at the TAG Auditorium", "More details to be announced"],
      },
      {
        slug: "saptham-performance",
        name: "Saptham Performance",
        tagline: "A host club performance",
        tag: "Music & Dance",
        host: "Saptham",
        when: [{ day: 1, time: "2:15–2:30 PM", venue: "Vivek Auditorium" }],
        about: "A performance by Saptham, on the Vivek Auditorium stage.",
        facts: ["A host club performance", "Held at the Vivek Auditorium"],
      },
      {
        slug: "solo-singing",
        name: "Solo Singing",
        tagline: "Any language, one stage",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 1, time: "2:30–4:00 PM", venue: "Vivek Auditorium" }],
        about: "Sing in any language, with a karaoke track or without music.",
        facts: ["Up to 4 minutes, set-up included", "Judged on voice, pitch and expression", "Karaoke tracks handed in beforehand"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLScKhneraQ814pI3Wht5Yd0no6GlwJEgDfVr_m6vQAXE5Ww0Jg/viewform",
      },
      {
        slug: "solo-instrumental",
        name: "Solo Instrumental",
        tagline: "Play your instrument",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 1, time: "4:00–5:30 PM", venue: "Vivek Auditorium" }],
        about: "Perform one piece on an instrument of your choice: film, classical, western or an original composition.",
        facts: ["Solo event, one instrument only", "Up to 4 minutes, bring your own", "No pre-recorded tracks or vocals"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfcfhaQHoCnIO-2TQB4SrDmfE_rse6xdH4Lz2411dt1zVH2KQ/viewform",
      },
      {
        slug: "sruthilaya-performance",
        name: "Sruthilaya Performance",
        tagline: "A host club performance",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 1, time: "5:30–6:00 PM", venue: "Vivek Auditorium" }],
        about: "A performance by Sruthilaya, on the Vivek Auditorium stage.",
        facts: ["A host club performance", "Held at the Vivek Auditorium"],
      },
      {
        slug: "solo-dance",
        name: "Solo Dance",
        tagline: "Any western style",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "10:00–11:00 AM", venue: "Vivek Auditorium" }],
        about: "Perform any choreography you like on your own, in any western dance style.",
        facts: ["1:30 to 3 minutes on stage", "No profanity in the track", "No powders or props that disturb the next act"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdwvB3jmxhtx1JdVD7itahrcFIqO5_ll5aZfQumjNm4YyCmMw/viewform",
      },
      {
        slug: "nrithyopasana",
        name: "Nrithyopasana",
        tagline: "A dance event",
        tag: "Music & Dance",
        when: [{ day: 2, time: "10:30–11:30 AM", venue: "TAG Auditorium" }],
        about: "A dance event at the TAG Auditorium.",
        facts: ["Held at the TAG Auditorium", "More details to be announced"],
        registrationUrl: "https://forms.gle/yS9jMFDKnzxJpSJM6",
      },
      {
        slug: "duo-dance",
        name: "Duo Dance",
        tagline: "Any western style",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "11:00 AM–12:00 PM", venue: "Vivek Auditorium" }],
        about: "Perform any choreography you like as a pair, in any western dance style.",
        facts: ["2 to 3 minutes on stage", "No profanity in the track", "No powders or props that disturb the next act"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfzUxxyTCVl26eXbAcMW8pDkNvsGqW7-IkMltwq3yZbCHy42A/viewform",
      },
      {
        slug: "nadopasana",
        name: "Nadopasana",
        tagline: "A music event",
        tag: "Music & Dance",
        when: [{ day: 2, time: "11:30 AM–12:30 PM", venue: "TAG Auditorium" }],
        about: "A music event at the TAG Auditorium.",
        facts: ["Held at the TAG Auditorium", "More details to be announced"],
        registrationUrl: "https://forms.gle/n1c3wMEEHth9xXZ67",
      },
      {
        slug: "adaptunes",
        name: "Adaptunes",
        tagline: "Dance to surprise tracks",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "12:00–12:45 PM", venue: "Vivek Auditorium" }],
        about: "A solo dance competition where you adapt your moves to music that is played on the spot.",
        facts: ["Solo event, each round eliminatory", "Judged on spontaneity and creativity", "Match your moves to changing beats"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfS5CxN0BBtw-fDh7tKZPPrhzFFw-h80hITnv9RhlP3CDDg1Q/viewform",
      },
      {
        slug: "twisters-host-performance",
        name: "Twisters Host Performance",
        tagline: "A host club performance",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "12:45–1:00 PM", venue: "Vivek Auditorium" }],
        about: "A performance by Twisters Crew, on the Vivek Auditorium stage.",
        facts: ["A host club performance", "Held at the Vivek Auditorium"],
      },
      {
        slug: "intra-variety",
        name: "Intra Variety",
        tagline: "Variety teams, one theme",
        tag: "Stage & Speech",
        host: "CEG Spartanz",
        when: [{ day: 2, time: "2:30–4:00 PM", venue: "Vivek Auditorium" }],
        about: "Variety teams from the college perform on one unified theme and compete for the first prize.",
        facts: ["Up to 15 members per team", "15 minutes on stage plus 2 to set up"],
        registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSefSnRomqP2jXqLIrfUMYwJvA-1HtP6tCApGeJChMJlHiVfKA/viewform",
      },
      {
        slug: "spartanz-host-performance",
        name: "Spartanz Host Performance",
        tagline: "A host club performance",
        tag: "Stage & Speech",
        host: "CEG Spartanz",
        when: [{ day: 2, time: "4:00–4:30 PM", venue: "Vivek Auditorium" }],
        about: "A performance by CEG Spartanz, on the Vivek Auditorium stage.",
        facts: ["A host club performance", "Held at the Vivek Auditorium"],
      },
    ],
  },
  {
    id: "club",
    label: "Club Events",
    blurb: "Contests, games and showcases run by the clubs of CEG.",
    registration: "Registration: on the day",
    events: [
      {
        slug: "informals",
        name: "Informals",
        tagline: "Your way to the main stage",
        tag: "Stage & Speech",
        host: "CEG Spartanz",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Chemistry Dept" }, { day: 2, time: "10:30 AM–4:30 PM", venue: "Chemistry Dept" }],
        about: "Show any talent on stage: singing, mimicry, instruments, dance and more. Standouts move on to Talent of AGNI.",
        facts: ["3 minutes per performance", "Judged on stage presence", "Mr. AGNI and Ms. AGNI winners"],
      },
      {
        slug: "esports",
        name: "Esports",
        tagline: "More details soon",
        tag: "Games",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-10" }],
        about: "Esports at AGNI’26. More details to be announced.",
        facts: ["Held at Drawing Hall 10", "More details to be announced"],
      },
      {
        slug: "carnivals",
        name: "Carnivals",
        tagline: "More details soon",
        tag: "Games",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-13 Veranda" }, { day: 2, time: "10:30 AM–4:30 PM", venue: "Quadrangle" }],
        about: "Carnivals at AGNI’26 on both days. More details to be announced.",
        facts: ["Day 1 at the Drawing Hall-13 Veranda", "Day 2 at the Quadrangle"],
      },
      {
        slug: "media-surfing",
        name: "Media Surfing",
        tagline: "Think fast, perform faster",
        tag: "Stage & Speech",
        host: "The Guindy Times",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-72" }],
        about: "Present on a topic while the slides change without warning, then play media personalities like news anchors.",
        facts: ["Individual event", "Round 1 surprise slides, Round 2 personas", "Judged on spontaneity and confidence"],
      },
      {
        slug: "cosmic-race",
        name: "Cosmic Race",
        tagline: "A space quiz and board race",
        tag: "Quiz & Strategy",
        host: "Astro Club",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-73" }],
        about: "Answer questions on space, science and sci-fi to move across a cosmic board, from Earth to the Final Dimension.",
        facts: ["Teams of 3 to 6", "Safe move or luck move after a right answer", "Clear the Final Boss Question to win"],
      },
      {
        slug: "ipl-auction",
        name: "IPL Auction",
        tagline: "An auction event",
        tag: "Games",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-74" }],
        about: "An auction event in the style of the IPL.",
        facts: ["Round 1 and Round 2 on Day 1", "More details to be announced"],
      },
      {
        slug: "nyabagam-varuthe",
        name: "Nyabagam Varuthe",
        tagline: "A trivia loop",
        tag: "Quiz & Strategy",
        host: "Quizzers Anonymous",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-75" }],
        about: "A trivia loop on a big public screen: be first to answer and win a spot reward. Anyone at the fest can join.",
        facts: ["Open to all, join on the spot", "25 rapid questions, then one every 12 minutes", "No phones, search or AI while answering"],
      },
      {
        slug: "switcheroo",
        name: "Switcheroo",
        tagline: "A musical guessing game",
        tag: "Music & Dance",
        host: "Saptham",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-76" }],
        about: "Guess the song on your forehead by asking questions, then sing one song’s lyrics to another’s tune.",
        facts: ["A two-player challenge", "Round 1 yes/no questions, Round 2 mash-up", "Judged on tune, lyrics and performance"],
      },
      {
        slug: "metropolis",
        name: "Metropolis",
        tagline: "Puzzles and a city race",
        tag: "Quiz & Strategy",
        host: "ACM",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-81" }],
        about: "Solve visual puzzles and plan a city’s road network, then race rival teams in a live hex-grid board game.",
        facts: ["Teams of 2 to 3", "Round 1 on paper, Round 2 a live board game", "No cheating or use of devices"],
      },
      {
        slug: "twin-therapy",
        name: "Twin Therapy",
        tagline: "Do you think alike?",
        tag: "Games",
        host: "Literary Club AU",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-82" }],
        about: "Best-friend pairs write their answers to the same questions without peeking. Matches score; a mismatch earns a dare.",
        facts: ["Pairs only", "Round 1 dares, Round 2 sudden death", "Answers written in 15 seconds"],
      },
      {
        slug: "enna-solla-pogirai",
        name: "Enna Solla Pogirai",
        tagline: "Shout it, find the place",
        tag: "Games",
        host: "LEO Club of CEG",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-83" }],
        about: "Over loud music through a headset, find the famous places your teammate shouts. No acting and no hand signs.",
        facts: ["Teams of 2", "Round 2: most places found in 5 minutes", "Shouting only"],
      },
      {
        slug: "startup-survival",
        name: "Startup Survival",
        tagline: "Hire, Build & Survive",
        tag: "Quiz & Strategy",
        host: "CSAU",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-84" }],
        about: "Bid for engineers in a live auction, plan a tech startup on paper, then survive sudden company crises with the team you hired.",
        facts: ["Teams of 2 to 3, about 2 hours", "Round 1 hiring auction, Round 2 crises", "No coding or laptops, all years welcome"],
      },
      {
        slug: "survive-the-market",
        name: "Survive the Market",
        tagline: "Spot the Ponzi",
        tag: "Quiz & Strategy",
        host: "FINS AU",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-9" }],
        about: "Invest fake capital as the market moves, then play “Ponzi Among Us” to expose financial fraud.",
        facts: ["Teams of 2 to 4", "Round 1 investing, Round 2 Ponzi Among Us", "No phones or laptops, only data sheets"],
      },
      {
        slug: "chromatic-chaos",
        name: "Chromatic Chaos",
        tagline: "A colour photography challenge",
        tag: "Art & Media",
        host: "Pixels",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Quadrangle" }],
        about: "Photograph the colours you are assigned, then tell a mood or a theme with them. Every shot is taken during the event.",
        facts: ["Solo or teams of up to 2", "Round 1 colour hunt, Round 2 colour story", "No downloaded or AI-generated photos"],
      },
      {
        slug: "cad-to-creation",
        name: "CAD to Creation",
        tagline: "More details soon",
        tag: "Workshop",
        when: [{ day: 1, time: "10:00 AM–12:30 PM", venue: "AUFRG" }],
        about: "CAD to Creation at AGNI’26. More details to be announced.",
        facts: ["Held at AUFRG", "More details to be announced"],
      },
      {
        slug: "pass-the-canvas",
        name: "Pass the Canvas",
        tagline: "Draw, pass, continue",
        tag: "Art & Media",
        host: "Scribbles",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Drawing Hall-13 Veranda" }],
        about: "When the music stops, everyone passes their canvas on and continues someone else’s drawing, guessing its theme.",
        facts: ["Teams of 3 to 4, 20 minutes", "Pass clockwise whenever the music stops", "No talking, materials provided"],
      },
      {
        slug: "balloon-debate",
        name: "The Balloon Debate",
        tagline: "Fight for your seat",
        tag: "Stage & Speech",
        host: "AU Podium",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-76" }],
        about: "Argue as a character aboard a sinking hot-air balloon and convince the audience that you deserve to stay.",
        facts: ["60-second speeches", "The audience votes passengers off", "Judged on persuasion, humour and spontaneity"],
      },
      {
        slug: "uno-chess",
        name: "Uno Chess",
        tagline: "UNO meets chess",
        tag: "Quiz & Strategy",
        host: "Castle Red",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Drawing Hall-10" }],
        about: "Play an UNO card, then make the chess move it allows. There is no checkmate: capture the King to win.",
        facts: ["Swiss rounds, then a top-8 knockout", "15 minutes a side, 5 seconds added a move", "Break ties on pieces left, then cards"],
      },
      {
        slug: "emotional-imposter",
        name: "Emotional Imposter",
        tagline: "Spot the odd one out",
        tag: "Games",
        host: "EQ Club",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-9" }],
        about: "A social-deduction game: everyone has a secret role and one person has a different goal. Question, discuss and find them.",
        facts: ["Small teams, two rounds", "No phones or outside help", "Judged on reasoning, questions and teamwork"],
      },
      {
        slug: "gossip-magazine",
        name: "Gossip Magazine",
        tagline: "Press conference to scandal",
        tag: "Art & Media",
        host: "Literary Club AU",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-81" }],
        about: "Get a recorded press-conference video and turn it into a gossip magazine, with dramatic headlines and twisted quotes.",
        facts: ["Teams of 1 to 4, 60 minutes", "A cover plus stories, on the paper provided", "No internet or AI tools"],
      },
      {
        slug: "maathi-yosi",
        name: "Maathi Yosi",
        tagline: "More details soon",
        tag: "Games",
        when: [{ day: 2, time: "10:30 AM–12:15 PM", venue: "Red Building-82" }],
        about: "Maathi Yosi at AGNI’26. More details to be announced.",
        facts: ["Held at Red Building-82", "More details to be announced"],
      },
      {
        slug: "web-series-quiz",
        name: "Web Series Quiz",
        tagline: "How well do you binge?",
        tag: "Quiz & Strategy",
        host: "Quizzers Anonymous",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-73" }],
        about: "A quiz on popular web series, characters and storylines, with a written preliminary round and a tougher final.",
        facts: ["Teams of 2 to 4", "The top 6 teams qualify for the final", "The top 3 teams win"],
      },
      {
        slug: "ctrl-alt-lol",
        name: "CTRL + ALT + LOL",
        tagline: "AI or real? Then make it funny",
        tag: "Games",
        host: "Robotics Club of CEG",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-84" }],
        about: "Spot real images among AI-generated ones, then write the funniest meme for a robotics or college-life moment.",
        facts: ["Teams of 2", "Round 1 AI or Aye, Round 2 Meme Machine", "Each round is half of the score"],
      },
      {
        slug: "word-bomb",
        name: "Word Bomb",
        tagline: "Sing a line, fast",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-72" }],
        about: "Draw a random word and sing a line from any song that contains it, in just 10 seconds. The crowd shouts the songs you miss.",
        facts: ["Solo or teams of 2 to 3", "Qualifier, then a final with 7-second words", "The line must come from a real song"],
      },
      {
        slug: "who-killed-the-event",
        name: "Who Killed the Event?",
        tagline: "A quality-control mystery",
        tag: "Quiz & Strategy",
        host: "Students Quality Council",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-83" }],
        about: "Investigate a failed event from a case file and use the Seven Quality Tools to find the root cause and the ignored tool.",
        facts: ["Teams of 3 to 5", "Case file, investigation, then a verdict", "Judged on verdict, root cause and evidence"],
      },
      {
        slug: "what-if",
        name: "What If!",
        tagline: "Improv with a twist",
        tag: "Stage & Speech",
        host: "Theatron",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-74" }],
        about: "Two actors play an everyday scene, then an unexpected “What if…?” twist is thrown in and they have to adapt.",
        facts: ["Exactly 2 actors per team", "60 seconds realistic, then a 2-minute twist", "No scripts"],
      },
      {
        slug: "rewind-and-risk",
        name: "Rewind & Risk",
        tagline: "More details soon",
        tag: "Quiz & Strategy",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-75" }],
        about: "Rewind & Risk at AGNI’26. More details to be announced.",
        facts: ["Held at Red Building-75", "More details to be announced"],
      },
    ],
  },
  {
    id: "proshow",
    label: "Proshows",
    blurb: "The big moments of AGNI’26: the opening ceremony, the movie night, the concert night and Talent of AGNI.",
    events: [
      {
        slug: "inauguration-chenda-melam",
        name: "Inauguration & Chenda Melam",
        tagline: "The lamp · The drums",
        tag: "Ceremony",
        host: "SAAS",
        when: [{ day: 1, time: "1:30–2:15 PM", venue: "Vivek Auditorium" }],
        about: "Kick off AGNI’26 with an inspiring ceremony: the wall drop, the chenda melam and the lighting of the kuthuvilaku.",
        facts: ["Wall drop and chenda melam at 1:30 PM", "Tamil Thai Vazhthu, then the lamp is lit", "Chief guest’s speech and felicitation"],
      },
      {
        slug: "movie-night",
        name: "Movie Night",
        tagline: "Night show",
        tag: "Pro Show",
        host: "SAAS",
        when: [{ day: 1, time: "6:30–9:30 PM", venue: "Main Gallery" }],
        about: "Ending Day 1 with a movie screening at the Main Gallery.",
        facts: ["The screening runs 6:30 – 9:30 PM", "At the Main Gallery"],
      },
      {
        slug: "concert-night",
        name: "Concert Night",
        tagline: "Live · Loud",
        tag: "Pro Show",
        host: "SAAS",
        when: [{ day: 2, time: "6:30–9:30 PM", venue: "Main Gallery" }],
        about: "Memorable mass performances by artists on the concert night.",
        facts: ["Mass performances by artists", "Live under the open sky"],
        registrationUrl: register.url,
        registrationLabel: "Buy your ticket",
      },
      {
        slug: "talent-of-agni",
        name: "Talent of AGNI",
        tagline: "Song · Dance · Rhythm",
        tag: "Talent Show",
        host: "SAAS",
        when: [{ day: 2, time: "4:30–6:00 PM", venue: "Vivek Auditorium" }],
        about: "One of the premier events of this intra-cultural fest, where students showcase their talent and compete for the title of Talent of AGNI.",
        facts: ["Qualify through the Informals round", "Mr. AGNI and Ms. AGNI winners"],
      },
    ],
  },
];
