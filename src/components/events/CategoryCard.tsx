import Image from "next/image";
import type { EventCategory } from "@/types";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: EventCategory;
  active: boolean;
  onSelect: () => void;
}

export default function CategoryCard({ category, active, onSelect }: CategoryCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-lg border-2 text-left transition-transform hover:-translate-y-1",
        active ? "border-mustard" : "border-transparent",
      )}
    >
      {category.image ? (
        <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
      ) : (
        <ImagePlaceholder label={category.name} />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 font-display text-2xl">{category.name}</span>
    </button>
  );
}
