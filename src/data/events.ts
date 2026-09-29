import type { EventCategory, FestEvent } from "@/types";

// Add cover images under public/images/events/ and set `image` on each category.
export const eventCategories: EventCategory[] = [
  { id: "signature", name: "Signature" },
  { id: "iconic", name: "Iconic" },
  { id: "clubs", name: "Clubs" },
  { id: "proshows", name: "Proshows" },
];

// Sample entry showing the shape — replace with AGNI'26 events.
export const events: FestEvent[] = [
  {
    id: "sample-event",
    title: "Sample Event",
    description: "Describe the event here.",
    category: "signature",
    day: "Day 1",
    pricing: "Free",
  },
];
