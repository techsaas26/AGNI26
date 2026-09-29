export interface NavLink {
  href: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface TeamMember {
  name: string;
  role: string;
  /** Path under /public, e.g. "/images/team/joel-muthu-rajan.jpg" */
  image: string;
  instagram?: string;
  linkedin?: string;
}

export type EventCategoryId = "signature" | "iconic" | "clubs" | "proshows";

export type FestDay = "Day 1" | "Day 2" | "Day 3";

export interface EventCategory {
  id: EventCategoryId;
  name: string;
  /** Cover image under /public/images/events; a placeholder is shown if omitted */
  image?: string;
}

export interface FestEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategoryId;
  day: FestDay;
  /** "Free", or a price label such as "₹100" */
  pricing: string;
  /** Poster under /public/images/events; a placeholder is shown if omitted */
  image?: string;
  registrationUrl?: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  /** e.g. "Associate Sponsor", "Media Partner" */
  category: string;
  url?: string;
}

export interface ScheduleDay {
  day: FestDay;
  date?: string;
  /** Agenda poster under /public/images/agenda */
  image: string;
}
