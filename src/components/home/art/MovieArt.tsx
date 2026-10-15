import { Layer, Svg, ff } from "./shared";

/** The four reels. Their titles go on the plaque under the screen (see lib/scenes/movie.ts). */
export const POSTERS = [
  { title: "The last bench", image: "/images/gallery/campus-bench.webp" },
  { title: "Where we waited", image: "/images/gallery/maple-lake.webp" },
  { title: "Golden hour", image: "/images/hero/hero-poster.jpg" },
  { title: "Live at AGNI", image: "/images/concert/concert-night.jpeg" },
];

// the blank screen in /images/movie/picture-house.webp, in stage px (the photo is cropped to 1600×900)
const SX = 866;
const SY = 131;
const SW = 498;
const SH = 300;

/**
 * Movie Night: a photograph of an old picture house, a projector on the table throwing its beam at
 * a blank screen. The four reels play on that screen; a plaque names the one showing and four film
 * frames pick between them. Matte, no glows; it simply cross-fades.
 */
export default function MovieArt() {
  return (
    <>
      <Layer depth={0.05} bleed={1.08}>
        <Svg>
          <defs>
            <radialGradient id="mscr" cx="50%" cy="50%" r="75%">
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#1a0a02" stopOpacity="0.55" />
            </radialGradient>
            <linearGradient id="mscrim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0a0403" stopOpacity="0" />
              <stop offset="1" stopColor="#0a0403" stopOpacity="0.82" />
            </linearGradient>
          </defs>
          <g className="mv-bg">
            <image href="/images/movie/picture-house.webp" width={1600} height={900} preserveAspectRatio="xMidYMid slice" />
            <svg className="mv-screen" x={SX} y={SY} width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} overflow="hidden">
              <rect width={SW} height={SH} fill="#120905" />
              {POSTERS.map((p, i) => (
                <g key={p.image} className="mv-sc" data-i={i}>
                  <image href={p.image} width={SW} height={SH} preserveAspectRatio="xMidYMid slice" />
                </g>
              ))}
              <rect width={SW} height={SH} fill="rgba(255,196,120,.09)" />
              <rect width={SW} height={SH} fill="url(#mscr)" />
              <rect className="mv-flick" width={SW} height={SH} />
              <rect className="mv-shut" width={SW} height={SH} />
            </svg>
          </g>
          {/* the lower right is dark seating: a scrim for the plaque */}
          <rect x={0} y={500} width={1600} height={400} fill="url(#mscrim)" />
        </Svg>
      </Layer>

      <Layer depth={0.25} bleed={1.04}>
        <Svg>
          <text x={1500} y={712} textAnchor="end" style={ff.type} fontSize={14} letterSpacing={8} fill="#c9954a">
            NOW SHOWING
          </text>
          <text id="mv-title" x={1500} y={752} textAnchor="end" style={ff.sign} fontSize={32} letterSpacing={3} fill="#f6e3b0">
            {POSTERS[0].title.toUpperCase()}
          </text>
          {POSTERS.map((p, i) => {
            const x = 1060 + i * 112;
            const y = 772;
            return (
              <g key={p.image} className="mv-th art-pe" data-i={i} data-title={p.title} data-cursor="Play">
                <svg x={x} y={y} width={100} height={56} viewBox="0 0 100 56" overflow="hidden">
                  <image href={p.image} width={100} height={56} preserveAspectRatio="xMidYMid slice" />
                </svg>
                <rect className="ring" x={x} y={y} width={100} height={56} fill="none" />
              </g>
            );
          })}
        </Svg>
      </Layer>
    </>
  );
}
