import type { ReactNode } from "react";
import AboutSection from "@/components/home/AboutSection";
import ChendaArt from "@/components/home/art/ChendaArt";
import ConcertArt from "@/components/home/art/ConcertArt";
import FashionArt from "@/components/home/art/FashionArt";
import MovieArt from "@/components/home/art/MovieArt";
import TalentArt from "@/components/home/art/TalentArt";
import ContactSection from "@/components/home/ContactSection";
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
  concert: { art: <ConcertArt />, particles: ["embers"] },
  movie: { art: <MovieArt />, particles: ["dust"] },
  talent: { art: <TalentArt />, particles: ["dust"] },
  // a dark veil that lifts as the lamp is lit
  chenda: { art: <ChendaArt />, particles: ["embers", "sparks"], before: <div className="ch-dark" /> },
  // the spotlight follows the cursor
  fashion: { art: <FashionArt />, particles: [], after: <div className="spot" id="spot" aria-hidden="true" /> },
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
      <RegisterSection />
      <MerchSection />
      <GallerySection />
      <TeamSection />
      <ContactSection />
      <SceneEngine />
    </>
  );
}
