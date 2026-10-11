import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import TshirtViewer from "@/components/merch/TshirtViewer";
import { merch } from "@/data/merch";

export const metadata: Metadata = { title: "Merch" };

export default function MerchPage() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-6 md:grid-cols-[3fr_2fr] md:gap-12 md:py-12">
      <TshirtViewer src={merch.model} alt={`3D model of the ${merch.name}`} />
      <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
        <h1 className="font-display text-4xl tracking-wide text-mustard sm:text-6xl">{merch.name}</h1>
        <p className="text-paper/70">{merch.tagline}</p>
        <a
          href={merch.orderFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-mustard px-8 py-3 font-display text-3xl tracking-wide text-ink shadow-[4px_4px_0_0_var(--color-cassette)] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <ShoppingBag className="size-6" aria-hidden />
          Buy Now
        </a>
      </div>
    </section>
  );
}
