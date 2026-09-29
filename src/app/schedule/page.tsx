import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ScheduleGallery from "@/components/schedule/ScheduleGallery";
import { schedule } from "@/data/schedule";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <>
      <PageHeader title="Schedule" />
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <ScheduleGallery days={schedule} />
      </div>
    </>
  );
}
