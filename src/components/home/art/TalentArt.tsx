import { Layer } from "./shared";

/**
 * The Talent of AGNI stage, cut into four planes from one picture so the scene has depth. Back to front:
 * the sky and sun, the palms and far shore, the stage with the performers, and the frame of pillars,
 * garlands, leaves and lamps. Each plane carries on behind the ones in front of it, so none opens a hole when it moves.
 */
export default function TalentArt() {
  return (
    <>
      <Layer depth={0.04} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/talent/fusion-sky.webp" alt="" />
      </Layer>
      <Layer depth={0.14} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/talent/fusion-land.webp" alt="" />
      </Layer>
      <Layer depth={0.28} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/talent/fusion-stage.webp" alt="" />
      </Layer>
      <Layer depth={0.5} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/talent/fusion-front.webp" alt="" />
      </Layer>
    </>
  );
}
