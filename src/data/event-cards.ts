/**
 * The events showcase (/events). Three categories, as on last year's site: Signature Events (the stage events at the Vivek and
 * TAG auditoria), Club Events (the contests and games run by the clubs) and Proshows (the opening ceremony and the nights).
 *
 * Sources: the club proposals in the Drive folder "Finalised Event AGNI'26" (descriptions, rounds, rules) and the fest agenda
 * (days, times, venues). An event with no slot in the agenda has an empty `when` and shows "to be announced". Phone numbers,
 * registration numbers and e-mail addresses from the proposals are deliberately not copied.
 * Each poster is public/images/events/<slug>.webp (800x1000): a generated stand-in, so a real poster dropped over the same
 * file name replaces it and nothing else needs to change. The section ids match the `?cat=` links on the home page.
 */
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
}

export interface EventSection {
  id: SectionId;
  label: string;
  blurb: string;
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
        slug: "solo-duo-singing",
        name: "Solo / Duo Singing",
        tagline: "Solo or duo, one stage",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 1, time: "1:30–3:00 PM", venue: "Vivek Auditorium" }],
        about: "Sing solo or as a duo, in any language, with a karaoke track or without music. Solos and duos compete in one category.",
        facts: ["Up to 4 minutes, set-up included", "Judged on voice, pitch and expression", "Karaoke tracks handed in beforehand"],
      },
      {
        slug: "solo-instrumental",
        name: "Solo Instrumental",
        tagline: "Play your instrument",
        tag: "Music & Dance",
        host: "Sruthilaya",
        when: [{ day: 1, time: "3:00–4:30 PM", venue: "Vivek Auditorium" }],
        about: "Perform one piece on an instrument of your choice: film, classical, western or an original composition.",
        facts: ["Solo event, one instrument only", "Up to 4 minutes, bring your own", "No pre-recorded tracks or vocals"],
      },
      {
        slug: "intra-variety-show",
        name: "Intra Variety Show",
        tagline: "Variety teams, one theme",
        tag: "Stage & Speech",
        host: "CEG Spartanz",
        when: [{ day: 2, time: "10:30 AM–12:30 PM", venue: "Vivek Auditorium" }],
        about: "Variety teams from the college perform on one unified theme and compete for the first prize.",
        facts: ["Up to 15 members per team", "15 minutes on stage plus 2 to set up", "The winners perform again on the final night"],
      },
      {
        slug: "solo-dance",
        name: "Solo Dance",
        tagline: "Any western style",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "1:00–2:00 PM", venue: "Vivek Auditorium" }],
        about: "Perform any choreography you like on your own, in any western dance style.",
        facts: ["1:30 to 3 minutes on stage", "No profanity in the track", "No powders or props that disturb the next act"],
      },
      {
        slug: "duo-dance",
        name: "Duo Dance",
        tagline: "Any western style",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "2:00–3:30 PM", venue: "Vivek Auditorium" }],
        about: "Perform any choreography you like as a pair, in any western dance style.",
        facts: ["2 to 3 minutes on stage", "No profanity in the track", "No powders or props that disturb the next act"],
      },
      {
        slug: "adaptunes",
        name: "Adaptunes",
        tagline: "Dance to surprise tracks",
        tag: "Music & Dance",
        host: "Twisters Crew",
        when: [{ day: 2, time: "3:30–4:30 PM", venue: "Vivek Auditorium" }],
        about: "A solo dance competition where you adapt your moves to music that is played on the spot.",
        facts: ["Solo event, each round eliminatory", "Judged on spontaneity and creativity", "Match your moves to changing beats"],
      },
      {
        slug: "nrithyopasana",
        name: "Nrithyopasana",
        tagline: "A dance event",
        tag: "Music & Dance",
        when: [{ day: 2, time: "10:30–11:30 AM", venue: "TAG Auditorium" }],
        about: "A dance event at the TAG Auditorium.",
        facts: ["Held at the TAG Auditorium", "More details to be announced"],
      },
      {
        slug: "nadopasana",
        name: "Nadopasana",
        tagline: "A music event",
        tag: "Music & Dance",
        when: [{ day: 2, time: "11:30 AM–12:30 PM", venue: "TAG Auditorium" }],
        about: "A music event at the TAG Auditorium.",
        facts: ["Held at the TAG Auditorium", "More details to be announced"],
      },
    ],
  },
  {
    id: "club",
    label: "Club Events",
    blurb: "Contests, games and showcases run by the clubs of CEG.",
    events: [
      {
        slug: "balloon-cup-stack",
        name: "Balloon Cup Stack",
        tagline: "Keep the balloon up",
        tag: "Games",
        host: "Aakriti Girls Forum",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-13 Veranda" }],
        about: "Stack ten cups into one tower while keeping a balloon in the air. The fastest finisher wins.",
        facts: ["One of the Aakriti Carnival games", "The balloon must never touch the ground", "Judged on the shortest time"],
      },
      {
        slug: "say-and-sketch",
        name: "Say & Sketch",
        tagline: "Describe it, they draw it",
        tag: "Games",
        host: "Aakriti Girls Forum",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-13 Veranda" }],
        about: "One player describes a picture while a partner draws it unseen behind a cardboard divider. The closest drawing wins.",
        facts: ["One of the Aakriti Carnival games", "Pairs: one describes, one draws", "Spoken instructions only, no gestures"],
      },
      {
        slug: "telepathy",
        name: "Telepathy",
        tagline: "Guess each other’s word",
        tag: "Games",
        host: "Aakriti Girls Forum",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-13 Veranda" }],
        about: "Two players are secretly given different words and must work out each other’s word by asking questions.",
        facts: ["One of the Aakriti Carnival games", "Pairs, yes/no or clue-based questions", "The fastest pair to guess both wins"],
      },
      {
        slug: "you-draw-you-guess",
        name: "You Draw, You Guess",
        tagline: "Fifteen boxes, fifteen sketches",
        tag: "Games",
        host: "Aakriti Girls Forum",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Drawing Hall-13 Veranda" }],
        about: "Sketch fifteen called-out objects in fifteen boxes, then pick out the drawing the organiser names.",
        facts: ["One of the Aakriti Carnival games", "Quick sketches on one A4 sheet", "Most correct picks wins"],
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
        slug: "informals-talent-of-agni",
        name: "Informals & Talent of AGNI",
        tagline: "Your way to the main stage",
        tag: "Stage & Speech",
        host: "CEG Spartanz",
        when: [{ day: 1, time: "10:30 AM–4:30 PM", venue: "Chemistry Dept" }, { day: 2, time: "10:30 AM–4:30 PM", venue: "Chemistry Dept" }],
        about: "Show any talent on stage: singing, mimicry, instruments, dance and more. Standouts move on to Talent of AGNI.",
        facts: ["3 minutes per performance", "Judged on stage presence", "Mr. AGNI and Ms. AGNI winners"],
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
        name: "Survive The Market",
        tagline: "Spot the Ponzi",
        tag: "Quiz & Strategy",
        host: "FINS AU",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-9" }],
        about: "Invest fake capital as the market moves, then play “Ponzi Among Us” to expose financial fraud.",
        facts: ["Teams of 2 to 4", "Round 1 investing, Round 2 Ponzi Among Us", "No phones or laptops, only data sheets"],
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
        slug: "ipl-auction",
        name: "IPL Auction",
        tagline: "An auction event",
        tag: "Games",
        when: [{ day: 1, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-74" }],
        about: "An auction event in the style of the IPL.",
        facts: ["Round 1 and Round 2 on Day 1", "More details to be announced"],
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
        slug: "uno-chess-tournament",
        name: "Uno Chess Tournament",
        tagline: "UNO meets chess",
        tag: "Quiz & Strategy",
        host: "Castle Red",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Drawing Hall-10" }],
        about: "Play an UNO card, then make the chess move it allows. There is no checkmate: capture the King to win.",
        facts: ["Swiss rounds, then a top-8 knockout", "15 minutes a side, 5 seconds added a move", "Break ties on pieces left, then cards"],
      },
      {
        slug: "emotional-impostor",
        name: "Emotional Impostor",
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
        slug: "word-bomb",
        name: "Word Bomb!",
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
        name: "What If",
        tagline: "Improv with a twist",
        tag: "Stage & Speech",
        host: "Theatron",
        when: [{ day: 2, time: "R1 10:30 AM–12:15 PM · R2 1:30–4:30 PM", venue: "Red Building-74" }],
        about: "Two actors play an everyday scene, then an unexpected “What if…?” twist is thrown in and they have to adapt.",
        facts: ["Exactly 2 actors per team", "60 seconds realistic, then a 2-minute twist", "No scripts"],
      },
      {
        slug: "meme-fest",
        name: "Meme Fest",
        tagline: "Life be Lifing",
        tag: "Art & Media",
        host: "CEG Spartanz",
        when: [],
        about: "Make a meme on the theme “Life be Lifing”. Entries are posted on the club’s page and judged on creativity and likes.",
        facts: ["One entry per participant", "Video memes under 60 seconds", "Open to CEG students only"],
      },
      {
        slug: "reel-fest",
        name: "Reel Fest",
        tagline: "Absolute Cinema",
        tag: "Art & Media",
        host: "CEG Spartanz",
        when: [],
        about: "Shoot an acting reel of up to 60 seconds on the theme “Absolute Cinema”. The winner is picked on creativity and likes.",
        facts: ["One entry per participant", "An Instagram Reel, 60 seconds at most", "Open to CEG students only"],
      },
    ],
  },
  {
    id: "proshow",
    label: "Proshows",
    blurb: "The nights of AGNI’26: the opening ceremony, the movie, the concert, the choreo night and Talent of AGNI.",
    events: [
      {
        slug: "inauguration-chenda-melam",
        name: "Inauguration & Chenda Melam",
        tagline: "The lamp · The drums",
        tag: "Ceremony",
        host: "SAAS",
        when: [{ day: 0, time: "4:30–6:00 PM" }],
        about: "Kick off AGNI’26 with an inspiring ceremony: the wall drop, the chenda melam and the lighting of the kuthuvilaku.",
        facts: ["Wall drop and chenda melam at 4:30 PM", "Tamil Thai Vazhthu, then the lamp is lit", "Chief guest’s speech and felicitation"],
      },
      {
        slug: "movie-night",
        name: "Movie Night",
        tagline: "Night show",
        tag: "Pro Show",
        host: "SAAS",
        when: [{ day: 0, time: "6:00–9:45 PM" }],
        about: "Ending Day 0 with a movie screening, after a classical dance and music performance by Saptham.",
        facts: ["The movie team on stage at 6:00 PM", "Classical dance and music by Saptham, 6:20 PM", "The screening runs 7:00 – 9:45 PM"],
      },
      {
        slug: "concert-night",
        name: "Concert Night",
        tagline: "Live · Loud",
        tag: "Pro Show",
        host: "SAAS",
        when: [{ day: 1, time: "7:00–9:45 PM" }],
        about: "Memorable mass performances by artists on the concert night.",
        facts: ["Mass performances by artists", "Live under the open sky"],
      },
      {
        slug: "choreo-night",
        name: "Choreo Night",
        tagline: "Club performances",
        tag: "Pro Show",
        host: "SAAS",
        when: [{ day: 2, time: "5:30–7:30 PM" }],
        about: "An evening of club performances on the stage.",
        facts: ["A club performance night", "The Intra Variety winners perform at 7:30 PM"],
      },
      {
        slug: "talent-of-agni",
        name: "Talent of AGNI",
        tagline: "Song · Dance · Rhythm",
        tag: "Talent Show",
        host: "SAAS",
        when: [{ day: 2, time: "8:00–9:45 PM" }],
        about: "One of the premier events of this intra-cultural fest, where students showcase their talent and compete for the title of Talent of AGNI.",
        facts: ["Qualify through the Informals round", "Mr. AGNI and Ms. AGNI winners"],
      },
    ],
  },
];
