import { concertBulbs, concertCrowd } from "@/lib/art";
import { Beam, Layer, LightsCanvas, Lin, Rad, Svg, ff, vars } from "./shared";

const BEAMS = [
  { x: 210, color: "#ffd29a", delay: -1.5, duration: 7 },
  { x: 560, color: "#ff6fa3", delay: -4, duration: 9 },
  { x: 920, color: "#ffb347", delay: -2.5, duration: 6.5 },
  { x: 1250, color: "#ff8a4a", delay: -5.5, duration: 8 },
  { x: 1500, color: "#ffd29a", delay: -3, duration: 7.5 },
];

/** Speaker stack: three cabinets. */
function Stack({ x, w }: { x: number; w: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => {
        const y = 900 - 190 * (i + 1);
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={186} rx={8} fill="#12060b" stroke="rgba(255,160,90,.18)" strokeWidth={2} />
            <circle cx={x + w / 2} cy={y + 112} r={w * 0.3} fill="#1c0a10" stroke="rgba(255,160,90,.25)" strokeWidth={3} />
            <circle cx={x + w / 2} cy={y + 112} r={w * 0.12} fill="#2a0f16" />
            <circle cx={x + w / 2} cy={y + 42} r={w * 0.1} fill="#1c0a10" stroke="rgba(255,160,90,.2)" strokeWidth={2} />
          </g>
        );
      })}
    </>
  );
}

/** Spinning cassette hub, positioned over the cassette's reel windows. */
function Hub({ id, px, py, duration }: { id: string; px: number; py: number; duration: number }) {
  // Same transform as the cassette group: translate(700 170) scale(.9) rotate(-4 440 280)
  const th = (-4 * Math.PI) / 180;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const vx = px - 440;
  const vy = py - 280;
  const x = 700 + 0.9 * (vx * c - vy * s + 440);
  const y = 170 + 0.9 * (vx * s + vy * c + 280);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return (
    <div className="reel-hub" id={id} style={vars({ left: r1(x - 29), top: r1(y - 29), "--dur": `${duration}s` })}>
      <svg viewBox="-34 -34 68 68">
        <circle r={32} fill="#efe6d2" />
        <circle r={12} fill="#150a07" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x={-4} y={-36} width={8} height={14} rx={2} fill="#150a07" transform={`rotate(${a})`} />
        ))}
      </svg>
    </div>
  );
}

export default function ConcertArt() {
  const { strings } = concertBulbs();
  const { people } = concertCrowd();

  let truss = "";
  for (let x = -40; x < 1640; x += 60) truss += `M${x} 70L${x + 30} 114L${x + 60} 70`;

  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="cbg"
              stops={[
                [0, "#0a020f"],
                [0.4, "#2b0a1d"],
                [0.78, "#6e1c1d"],
                [1, "#190606"],
              ]}
            />
            <Rad
              id="chz"
              cx={0.64}
              cy={0.5}
              r={0.55}
              stops={[
                [0, "#ff7a2a", 0.6],
                [1, "#ff7a2a", 0],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#cbg)" />
          <rect width={1600} height={900} fill="url(#chz)" />
          <path d={truss} stroke="#2a1420" strokeWidth={3} fill="none" />
          <path d="M0 70H1600M0 114H1600" stroke="#2a1420" strokeWidth={4} />
        </Svg>
      </Layer>

      <Layer depth={0.08}>
        {BEAMS.map((b) => (
          <Beam key={b.x} {...b} />
        ))}
      </Layer>

      <Layer depth={0.12}>
        <Svg>
          <g opacity={0.8}>
            <Stack x={-120} w={230} />
            <Stack x={1400} w={230} />
          </g>
        </Svg>
      </Layer>

      <Layer depth={0.16}>
        <Svg>
          {strings.map((s, i) => (
            <g key={i}>
              <path d={s.wire} fill="none" stroke="#150806" strokeWidth={3} />
              {s.sockets.map((d, j) => (
                <path key={j} d={d} fill="#150806" />
              ))}
            </g>
          ))}
        </Svg>
        <LightsCanvas name="concert-bulbs" y0={0} h={320} />
      </Layer>

      <Layer depth={0.26} bleed={1.04}>
        <Svg>
          <defs>
            <Lin
              id="cs-body"
              x2={1}
              y2={1}
              stops={[
                [0, "#fff4da"],
                [0.5, "#ecd9ac"],
                [1, "#c9b07a"],
              ]}
            />
            <Lin
              id="cs-bot"
              stops={[
                [0, "#e2cd9a"],
                [1, "#b79d66"],
              ]}
            />
          </defs>
          <g id="cassette" className="art-pe" data-cursor="Play" transform="translate(700 170) scale(.9) rotate(-4 440 280)">
            <ellipse cx={440} cy={596} rx={410} ry={24} fill="#000" opacity={0.55} />
            <rect width={880} height={560} rx={40} fill="url(#cs-body)" />
            <rect x={10} y={10} width={860} height={540} rx={32} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={2} />
            <path d="M64 54H816a18 18 0 0 1 18 18V316H46V72A18 18 0 0 1 64 54z" fill="#fff4d8" />
            <path d="M46 72A18 18 0 0 1 64 54H816a18 18 0 0 1 18 18V132H46z" fill="#b3261e" />
            <rect x={46} y={132} width={788} height={22} fill="#ff9a2e" />
            <text x={78} y={116} style={ff.display} fontWeight={900} fontSize={50} fill="#fff0cf" letterSpacing={7}>
              AGNI’26
            </text>
            <text x={808} y={112} textAnchor="end" style={ff.type} fontSize={21} fill="#ffd9a0" letterSpacing={5}>
              CONCERT NIGHT
            </text>
            <g stroke="#3a0f0a" strokeOpacity={0.28} strokeWidth={2}>
              <path d="M78 206H700M78 244H700M78 282H700" />
            </g>
            <text x={84} y={198} style={ff.type} fontSize={27} fill="#3a0f0a">
              Side A — live &amp; loud
            </text>
            <text x={84} y={236} style={ff.type} fontSize={27} fill="#7a2a12">
              Jan 23–26 · CEG Guindy
            </text>
            <circle cx={752} cy={238} r={44} fill="none" stroke="#b3261e" strokeWidth={5} />
            <text x={752} y={257} textAnchor="middle" style={ff.display} fontWeight={900} fontSize={54} fill="#b3261e">
              A
            </text>
            <rect x={168} y={326} width={544} height={150} rx={75} fill="#150a07" stroke="#8a6a3a" strokeWidth={4} />
            <circle cx={300} cy={401} r={60} fill="#2d1a11" />
            <circle cx={580} cy={401} r={44} fill="#2d1a11" />
            <path d="M300 341L580 357M300 461L580 445" stroke="#4a2c1c" strokeWidth={3} />
            <path d="M190 342Q440 316 690 342L640 470Q440 440 240 470Z" fill="#fff" opacity={0.06} />
            <path d="M150 560L198 484H682L730 560Z" fill="url(#cs-bot)" stroke="rgba(0,0,0,.25)" strokeWidth={2} />
            <circle cx={272} cy={528} r={14} fill="#2a1a10" />
            <circle cx={608} cy={528} r={14} fill="#2a1a10" />
            <rect x={408} y={512} width={64} height={24} rx={5} fill="#2a1a10" />
            {(
              [
                [40, 40],
                [840, 40],
                [40, 520],
                [840, 520],
              ] as const
            ).map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r={11} fill="#b8a27a" />
                <path d={`M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}`} stroke="#5a4528" strokeWidth={2.4} />
              </g>
            ))}
            <rect x={400} y={22} width={80} height={22} rx={6} fill="#d8c398" />
          </g>
        </Svg>
        <Hub id="reelL" px={300} py={401} duration={7} />
        <Hub id="reelR" px={580} py={401} duration={5} />
      </Layer>

      <Layer depth={0.2}>
        <canvas id="eq-canvas" width={1600} height={260} style={{ top: 640, height: 260 }} />
      </Layer>

      <Layer depth={0.5}>
        <Svg>
          <path d="M720 470C420 520 330 120 120 380S-60 780 240 880" fill="none" stroke="#2a150c" strokeWidth={13} strokeLinecap="round" />
          <path
            d="M720 470C420 520 330 120 120 380S-60 780 240 880"
            fill="none"
            stroke="#8a5a3a"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="18 22"
            opacity={0.7}
          >
            <animate attributeName="stroke-dashoffset" values="0;-80" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M1500 560C1650 600 1620 760 1450 800" fill="none" stroke="#2a150c" strokeWidth={10} strokeLinecap="round" />
        </Svg>
      </Layer>

      <Layer depth={0.7} bleed={1.06}>
        <Svg>
          {people.map((p, i) => (
            <g key={i}>
              <path d={p.body} fill={p.fill} />
              <circle cx={p.head.cx} cy={p.head.cy} r={p.head.r} fill={p.fill} />
              <path d={p.rim} fill="none" stroke="rgba(255,150,70,.35)" strokeWidth={1.6} />
              {p.arm && <path d={p.arm.d} fill="none" stroke={p.fill} strokeWidth={p.arm.width} strokeLinecap="round" />}
            </g>
          ))}
        </Svg>
        <LightsCanvas name="concert-crowd" y0={500} h={400} />
      </Layer>
    </>
  );
}
