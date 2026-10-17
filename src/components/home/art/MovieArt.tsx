import { Layer, Svg } from "./shared";

/** Movie Night: just the photograph of the old picture house, projector and all. */
export default function MovieArt() {
  return (
    <Layer depth={0.05} bleed={1.08}>
      <Svg>
        <g className="mv-bg">
          <image href="/images/movie/vintage-cinema.webp" width={1600} height={900} preserveAspectRatio="xMidYMid slice" />
        </g>
      </Svg>
    </Layer>
  );
}
