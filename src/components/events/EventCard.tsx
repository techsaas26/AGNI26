import Image from "next/image";
import type { FestEvent } from "@/types";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

interface EventCardProps {
  event: FestEvent;
  onOpen: () => void;
}

export default function EventCard({ event, onOpen }: EventCardProps) {
  return (
    <button
      onClick={onOpen}
      className="overflow-hidden rounded-lg bg-paper text-left text-ink shadow-lg transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4]">
        {event.image ? (
          <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : (
          <ImagePlaceholder label={event.title} />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-sm text-sepia">
          {event.day} · {event.pricing}
        </p>
      </div>
    </button>
  );
}
