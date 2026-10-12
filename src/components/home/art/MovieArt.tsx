import { movieData } from "@/lib/art";
import { Brass, Layer, LightsCanvas, Lin, Rad, Svg, ff } from "./shared";

const f = (n: number) => Math.round(n * 10) / 10;

function Palm({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0C6-70 -10-150 8-230" stroke="#0b0612" strokeWidth={9} fill="none" />
      {(
        [
          [-90, -10],
          [-60, -50],
          [-20, -70],
          [30, -60],
          [70, -30],
          [100, 10],
        ] as const
      ).map(([dx, dy]) => (
        <path
          key={`${dx}-${dy}`}
          d={`M8-230Q${8 + dx * 0.5} ${-230 + dy - 34} ${8 + dx} ${-230 + dy + 40}`}
          stroke="#0b0612"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

/** Peep-hole of the bioscope. */
function Window({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r + 9} fill="url(#brs)" />
      <circle cx={cx} cy={cy} r={r} fill="#0a0812" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a1a0a" strokeWidth={3} />
    </>
  );
}

/** The three round viewing lenses are layered above the box by the movie controller. */
const LENSES = [
  [164, 636, 39],
  [287, 636, 58],
  [410, 636, 39],
] as const;

export default function MovieArt() {
  const { buildings, audience } = movieData();
  const bunting = ["#ffd27a", "#2f8f5b", "#d83a2a", "#fff0c0"];

  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="msk"
              stops={[
                [0, "#03051a"],
                [0.4, "#12113a"],
                [0.72, "#4a1d3c"],
                [1, "#8a3d30"],
              ]}
            />
            <Rad
              id="mn"
              stops={[
                [0, "#fff6dd"],
                [0.2, "#fff0c0", 0.9],
                [1, "#ffd9a0", 0],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#msk)" />
          <circle cx={1340} cy={170} r={190} fill="url(#mn)" opacity={0.55} />
          <circle cx={1340} cy={170} r={52} fill="#fff6dd" />
        </Svg>
        <LightsCanvas name="movie-stars" y0={0} h={600} />
      </Layer>

      <Layer depth={0.08}>
        <Svg>
          <g opacity={0.95}>
            {buildings.map((b, i) => (
              <g key={i}>
                <rect x={f(b.x)} y={f(700 - b.h)} width={f(b.w)} height={f(b.h + 200)} fill="#0e0816" />
                {b.window && <rect x={f(b.x + b.w * 0.3)} y={f(700 - b.h + 14)} width={6} height={9} fill="#ffb347" opacity={0.8} />}
                {b.dome && <path d={`M${f(b.x + 6)} ${f(700 - b.h)}q${f(b.w / 2 - 6)}-${f(40)} ${f(b.w - 12)} 0z`} fill="#0e0816" />}
              </g>
            ))}
          </g>
          <Palm x={1480} y={720} s={1.1} />
          <Palm x={1360} y={730} s={0.8} />
          <rect y={690} width={1600} height={300} fill="#0b0612" />
        </Svg>
      </Layer>

      <Layer depth={0.2}>
        <div className="mv-screen" id="mv-screen">
          <div className="mv-film" id="mv-film" />
          <i className="mv-cue" />
        </div>
        <Svg>
          <defs>
            <Lin
              id="pj"
              stops={[
                [0, "#fff0c8", 0],
                [0.5, "#fff0c8", 0.16],
                [1, "#fff0c8", 0.34],
              ]}
            />
          </defs>
          <polygon points="540,960 560,150 1020,150 1160,960" fill="url(#pj)" style={{ mixBlendMode: "screen" }} />
          <path d="M548 140V470M1032 140V470" stroke="#1a0f12" strokeWidth={10} />
          <path d="M556 142H1024" stroke="#1a0f12" strokeWidth={6} />
        </Svg>
      </Layer>

      <Layer depth={0.42} bleed={1.03} id="bio-layer">
        <Svg>
          <defs>
            <Lin
              id="bx"
              stops={[
                [0, "#c3342a"],
                [0.5, "#8a1c14"],
                [1, "#5a0f0b"],
              ]}
            />
            <Lin
              id="rf"
              stops={[
                [0, "#7a1710"],
                [1, "#3a0a07"],
              ]}
            />
            <Brass id="brs" />
          </defs>
          <g id="bioscope" transform="translate(76 346) scale(.88)">
            <path d="M70 470L48 602H84L112 470zM410 470L432 602H396L368 470z" fill="#3a1d10" />
            <path d="M80 540H400" stroke="#3a1d10" strokeWidth={10} />
            <rect x={30} y={206} width={420} height={270} rx={20} fill="url(#bx)" />
            <rect x={44} y={222} width={392} height={240} rx={12} fill="none" stroke="#f6d27a" strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d={`M${52 + i * 28.5} 212l14.25 26 14.25-26z`} fill={bunting[i % 4]} />
            ))}
            <Window cx={100} cy={330} r={44} />
            <Window cx={240} cy={330} r={66} />
            <Window cx={380} cy={330} r={44} />
            {(
              [
                [96, 262],
                [385, 262],
                [96, 398],
                [385, 398],
                [240, 424],
              ] as const
            ).map(([fx, fy]) => (
              <g key={`${fx}-${fy}`} transform={`translate(${fx} ${fy})`}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx={0} cy={-9} rx={4.5} ry={9} fill="#ffd27a" transform={`rotate(${a})`} />
                ))}
                <circle r={4} fill="#d83a2a" />
              </g>
            ))}
            <path d="M10 206L90 126H390L470 206z" fill="url(#rf)" />
            <path d="M10 206H470" stroke="#f6d27a" strokeWidth={5} />
            <path d="M90 126H390" stroke="#f6d27a" strokeWidth={4} />
            <path d="M200 126L214 92H266L280 126z" fill="#7a1710" />
            <rect x={236} y={62} width={8} height={32} fill="#f6d27a" />
            <circle cx={240} cy={58} r={9} fill="#f6d27a" />
            <g transform="translate(240 8)">
              <rect x={-148} y={0} width={296} height={64} rx={8} fill="#2a0c08" stroke="#f6d27a" strokeWidth={3} />
              <text x={0} y={36} textAnchor="middle" style={ff.sign} fontSize={32} fill="#ffd27a" letterSpacing={5}>
                BIOSCOPE
              </text>
              <text x={0} y={56} textAnchor="middle" style={ff.tamil} fontWeight={800} fontSize={14} fill="#fff0c0">
                பயாஸ்கோப்
              </text>
            </g>
            <g id="crank" className="art-pe" data-cursor="Crank">
              {/* an invisible grab area, so the whole wheel can be turned and not only its thin ring */}
              <circle cx={496} cy={330} r={50} fill="transparent" />
              <path d="M450 330H492" stroke="#7a4a12" strokeWidth={10} strokeLinecap="round" />
              <g id="crankwheel" style={{ transformOrigin: "496px 330px" }}>
                <circle cx={496} cy={330} r={38} fill="none" stroke="url(#brs)" strokeWidth={7} />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <path key={a} d="M496 330L496 296" stroke="#e0a83a" strokeWidth={5} transform={`rotate(${a} 496 330)`} />
                ))}
                <circle cx={496} cy={330} r={9} fill="#f6d27a" />
                <circle cx={496} cy={288} r={12} fill="#d83a2a" stroke="#f6d27a" strokeWidth={3} />
              </g>
            </g>
            <g transform="translate(-12 380)">
              <path d="M12 -60V-14" stroke="#e0a83a" strokeWidth={3} />
              <g className="flicker">
                <rect x={-10} y={-14} width={44} height={64} rx={10} fill="#ffb347" opacity={0.18} />
              </g>
              <rect x={-2} y={-12} width={28} height={48} rx={7} fill="#3a1d10" stroke="#e0a83a" strokeWidth={2.5} />
              <rect x={3} y={-6} width={18} height={36} rx={5} fill="#ffcf6a" />
            </g>
          </g>
        </Svg>
        {LENSES.map(([x, y, r]) => (
          <div
            key={x}
            className="bw"
            style={{ left: x - r, top: y - r, width: r * 2, height: r * 2 }}
          />
        ))}
      </Layer>

      <Layer depth={0.78} bleed={1.06}>
        <Svg>
          {audience.map((p, i) => (
            <g key={i}>
              <path d={p.body} fill={p.fill} />
              <circle cx={p.head.cx} cy={p.head.cy} r={p.head.r} fill={p.fill} />
              <path d={p.rim} fill="none" stroke="rgba(255,226,180,.45)" strokeWidth={1.8} />
            </g>
          ))}
        </Svg>
      </Layer>
    </>
  );
}
