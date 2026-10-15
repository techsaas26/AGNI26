import { Layer } from "./shared";

/** Concert Night: the festival-ground photo, full-bleed. The engine's push-in does the rest. */
export default function ConcertArt() {
  return (
    <Layer depth={0.04} bleed={1.08}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cn-photo" src="/images/concert/concert-night.jpeg" alt="" />
    </Layer>
  );
}
