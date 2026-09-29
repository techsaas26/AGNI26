/** Shown wherever an image hasn't been added yet. */
export default function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-sepia)_0_10px,var(--color-ink)_10px_20px)] font-display text-2xl text-paper">
      {label}
    </div>
  );
}
