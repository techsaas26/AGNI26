import { Layer, Svg } from "./shared";

/**
 * Inauguration: the temple stage at sunset. Two planes of the same picture: the sky, lake and palms
 * far back, and the garlanded pillars, banana leaves and brass lamp in front. They drift apart
 * with the pointer and the scroll.
 */
export default function InaugArt() {
  return (
    <>
      <Layer depth={0.06} bleed={1.02} origin="50% 100%">
        <Svg>
          <image href="/images/inaug/sky.webp" width={1600} height={900} preserveAspectRatio="xMidYMid slice" />
        </Svg>
      </Layer>
      <Layer depth={0.32} bleed={1.02} origin="50% 100%">
        <Svg>
          <image href="/images/inaug/frame.webp" width={1600} height={900} preserveAspectRatio="xMidYMid slice" />
        </Svg>
      </Layer>
    </>
  );
}
