import { Layer } from "./shared";

/**
 * Sunset Fusion stage. Back to front: sky, palms & gopurams, the marigold stage, then the
 * performers, who zoom out into place (CSS, restarts each time the scene comes on screen).
 */
export default function TalentArt() {
  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <img className="t-in" src="/images/talent/bg.webp" alt="" />
      </Layer>
      <Layer depth={0.12} bleed={1.06}>
        <img className="t-in" src="/images/talent/far.webp" alt="" />
      </Layer>
      <Layer depth={0.2} bleed={1.04}>
        <img className="t-in" src="/images/talent/stage.webp" alt="" />
      </Layer>
      <Layer depth={0.34} bleed={1.04}>
        <img className="t-people" src="/images/talent/people.webp" alt="" />
      </Layer>
    </>
  );
}
