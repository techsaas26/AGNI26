import { Layer } from "./shared";

/**
 * Inauguration: the lamp is lit on the temple stage while the chenda drummers play. One picture cut into four planes so the
 * scene has depth. Back to front: the sky and sun; the palms, jungle and temples; the hall (curtains, pillars, drummers, lamp,
 * wall and floor); and the festoon, the hanging garlands and the two foreground lamps. Each plane carries on a little way behind
 * the ones in front of it, so none opens a hole when it moves.
 */
export default function InaugArt() {
  return (
    <>
      <Layer depth={0.04} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/inaug/lamp-sky.webp" alt="" />
      </Layer>
      <Layer depth={0.13} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/inaug/lamp-far.webp" alt="" />
      </Layer>
      <Layer depth={0.27} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/inaug/lamp-hall.webp" alt="" />
      </Layer>
      <Layer depth={0.5} bleed={1.03}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fill" src="/images/inaug/lamp-near.webp" alt="" />
      </Layer>
    </>
  );
}
