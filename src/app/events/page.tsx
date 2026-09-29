import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import EventsExplorer from "@/components/events/EventsExplorer";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <>
      <PageHeader title="Events" subtitle="Pick a category, rewind a day." />
      <EventsExplorer />
    </>
  );
}
