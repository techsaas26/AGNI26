import Link from "next/link";
import { site } from "@/data/site";

// TODO: NOSTALGIA hero — cassette/VHS visuals, countdown, event dates.
export default function HeroSection() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-2xl tracking-[0.3em] text-vhs uppercase">Press play on</p>
      <h1 className="mt-2 font-display text-7xl text-mustard sm:text-9xl">{site.name}</h1>
      <p className="mt-4 font-display text-3xl text-cassette uppercase">{site.theme}</p>
      <Link
        href="/events"
        className="mt-10 rounded border-2 border-mustard px-6 py-3 font-semibold text-mustard transition-colors hover:bg-mustard hover:text-night"
      >
        Explore Events
      </Link>
    </section>
  );
}
