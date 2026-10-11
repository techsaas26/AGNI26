import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import TshirtViewer from "@/components/merch/TshirtViewer";
import { merch } from "@/data/merch";
import { site } from "@/data/site";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 pt-5">
        <Image
          src="/images/branding/saas-logo.png"
          alt={`SAAS — ${site.organizer}`}
          width={134}
          height={44}
          preload
          className="h-8 w-auto sm:h-10"
        />
        <span className="text-sm font-medium tracking-wide text-paper/60">presents</span>
      </header>

      {/* Two boxes on desktop: the T-shirt, and the logo + details, each centered.
          On mobile the second box dissolves (`contents`) so the logo can sit above
          the T-shirt: logo → T-shirt → details. */}
      <section className="mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-6 px-4 py-6 md:grid-cols-[3fr_2fr] md:gap-12 md:py-10">
        <div className="flex items-center justify-center">
          <TshirtViewer src={merch.model} alt={`3D model of the ${merch.name}`} />
        </div>
        <div className="contents md:flex md:flex-col md:items-center md:justify-center md:gap-2">
          <Image
            src="/images/branding/agni26-logo.webp"
            alt=""
            width={1200}
            height={602}
            preload
            className="order-first mx-auto h-auto w-full max-w-xs sm:max-w-sm md:order-none"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="whitespace-nowrap text-3xl font-bold text-mustard sm:text-5xl">
              <span className="sr-only">{site.name} </span>
              {merch.title}
            </h1>
            <p className="text-paper/70">{merch.tagline}</p>
            <a
              href={merch.orderFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-mustard px-8 py-3 text-xl font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <ShoppingBag className="size-6" aria-hidden />
              Buy Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
