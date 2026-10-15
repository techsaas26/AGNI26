import type { ReactNode } from "react";
import AboutSection from "@/components/home/AboutSection";
import ConcertArt from "@/components/home/art/ConcertArt";
import InaugArt from "@/components/home/art/InaugArt";
import MovieArt from "@/components/home/art/MovieArt";
import TalentArt from "@/components/home/art/TalentArt";
import ContactSection from "@/components/home/ContactSection";
import EventsSection from "@/components/home/EventsSection";
import GallerySection from "@/components/home/GallerySection";
import HeroSection from "@/components/home/HeroSection";
import HighlightScene from "@/components/home/HighlightScene";
import MerchSection from "@/components/home/MerchSection";
import RegisterSection from "@/components/home/RegisterSection";
import SceneEngine from "@/components/home/SceneEngine";
import TeamSection from "@/components/home/TeamSection";
import { highlights } from "@/data/highlights";
import type { HighlightId } from "@/types";

interface SceneParts {
  art: ReactNode;
  particles: ("embers" | "dust" | "sparks")[];
  before?: ReactNode;
  after?: ReactNode;
}

/** Stage art and particle canvases for each "Why AGNI" scene. */
const SCENES: Record<HighlightId, SceneParts> = {
  concert: { art: <ConcertArt />, particles: [] },
  movie: { art: <MovieArt />, particles: ["dust"] },
  talent: { art: <TalentArt />, particles: ["dust"] },
  chenda: { art: <InaugArt />, particles: ["embers"] },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="runway" id="runway" aria-hidden="true" />
      <AboutSection />
      {highlights.map((item, i) => (
        <HighlightScene
          key={item.id}
          item={item}
          index={i + 1}
          total={highlights.length}
          art={SCENES[item.id].art}
          particles={SCENES[item.id].particles}
          beforeParticles={SCENES[item.id].before}
          afterParticles={SCENES[item.id].after}
        />
      ))}
      <EventsSection />
      <RegisterSection />
      <MerchSection />
      <GallerySection />
      <TeamSection />
      <ContactSection />
      <SceneEngine />
    </>
  );
}
