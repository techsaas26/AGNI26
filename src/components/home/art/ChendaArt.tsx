import type { ReactNode } from "react";
import { chendaBulbs, f, rng } from "@/lib/art";
import { Brass, Layer, LightsCanvas, Lin, Rad, Svg, vars } from "./shared";

/** The temple gateway (gopuram) on the right-hand horizon. */
function Gopuram() {
  const r = rng(41);
  const tiers: ReactNode[] = [];
  let w = 360;
  let y = 720;
  const cx = 1470;
  for (let t = 0; t < 8; t++) {
    const h = 60 - t * 3;
    const cols: ReactNode[] = [];
    for (let k = 0; k < Math.floor(w / 26); k++) {
      const x = cx - w / 2 + 22 + k * 26;
      if (x < cx + w / 2 - 22) {
        cols.push(<path key={`c${k}`} d={`M${x} ${y - 8}v-${h - 18}a5 5 0 0 1 10 0v${h - 18}z`} fill="#2a0f22" />);
        if (r() < 0.4) cols.push(<rect key={`w${k}`} x={x + 3} y={y - h + 16} width={4} height={6} fill="#ffb347" opacity={0.75} />);
      }
    }
    tiers.push(
      <g key={t}>
        <path d={`M${cx - w / 2} ${y}L${cx - w / 2 + 14} ${y - h}H${cx + w / 2 - 14}L${cx + w / 2} ${y}z`} fill="#120614" />
        {cols}
      </g>,
    );
    y -= h;
    w *= 0.82;
  }
  return (
    <>
      {tiers}
      <path d={`M${cx - 34} ${y}h68l-10-30h-48z`} fill="#120614" />
      {[-20, 0, 20].map((dx) => (
        <ellipse key={dx} cx={cx + dx} cy={y - 40} rx={6} ry={14} fill="#120614" />
      ))}
    </>
  );
}

/** Rangoli drawn on the ground. */
function Kolam() {
  const cx = 800;
  const cy = 0;
  const rings = [0, 1, 2, 3].map((ring) => {
    const n = 8 + ring * 4;
    const R = 60 + ring * 55;
    const p = (rr: number, aa: number) => `${f(cx + Math.cos(aa) * rr)} ${f(cy + Math.sin(aa) * rr)}`;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const a2 = ((i + 0.5) / n) * Math.PI * 2;
      const a3 = ((i + 1) / n) * Math.PI * 2;
      d += `${i ? "" : "M" + p(R, a)} Q${p(R + 38, a2)} ${p(R, a3)}`;
    }
    return (
      <g key={ring}>
        <path d={`${d}z`} fill="none" stroke="#fff6dd" strokeWidth={3.4 - ring * 0.4} strokeLinejoin="round" />
        {Array.from({ length: n }, (_, i) => {
          const a = ((i + 0.5) / n) * Math.PI * 2;
          return <circle key={i} cx={f(cx + Math.cos(a) * (R - 14))} cy={f(cy + Math.sin(a) * (R - 14))} r={3.2} fill="#fff6dd" />;
        })}
      </g>
    );
  });
  return (
    <>
      {rings}
      <circle cx={cx} cy={cy} r={26} fill="none" stroke="#fff6dd" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={8} fill="#ffb347" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={f(cx + Math.cos(a) * 300)}
            cy={f(cy + Math.sin(a) * 300)}
            r={i % 2 ? 3 : 5}
            fill={i % 2 ? "#ffb347" : "#fff6dd"}
          />
        );
      })}
    </>
  );
}

/** One wick of the five-wick lamp; the flame is revealed by the chenda controller. */
function Wick({ x, y, i }: { x: number; y: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-14 10Q0 -4 14 10L9 22H-9z" fill="url(#brs2)" />
      <rect x={-1.5} y={-4} width={3} height={10} fill="#2a1a10" />
      <g className="flame" id={`flame${i}`}>
        <ellipse cx={0} cy={-6} rx={34} ry={46} fill="url(#fglow)" />
        <g className="flick" style={vars({ "--dl": `${f(-i * 0.27)}s` })}>
          <path d="M0-52C13-28 15-10 0 2C-15-10-13-28 0-52z" fill="#ff7a1a" />
          <path d="M0-34C7-20 8-8 0 0C-8-8-7-20 0-34z" fill="#ffd27a" />
          <path d="M0-14C3-8 3-3 0 0C-3-3-3-8 0-14z" fill="#fffbe6" />
        </g>
      </g>
    </g>
  );
}

function Lamp() {
  return (
    <g id="lamp" className="art-pe" data-cursor="Light" transform="translate(650 250)">
      <ellipse cx={150} cy={560} rx={150} ry={22} fill="#000" opacity={0.5} />
      <path d="M18 548C60 500 240 500 282 548L270 566H30z" fill="url(#brs2)" />
      <path d="M60 505C100 470 200 470 240 505C200 490 100 490 60 505z" fill="url(#brs2)" />
      <rect x={136} y={170} width={28} height={330} fill="url(#brs2)" />
      {[200, 260, 330, 400, 455].map((y, i) => (
        <ellipse key={y} cx={150} cy={y} rx={i % 2 ? 30 : 42} ry={i % 2 ? 7 : 10} fill="url(#brs2)" />
      ))}
      <path d="M30 168C30 130 270 130 270 168C270 190 30 190 30 168z" fill="url(#brs2)" />
      <path d="M30 150C30 -10 270 -10 270 150" fill="none" stroke="url(#brs2)" strokeWidth={9} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i / 8) * Math.PI;
        return <circle key={i} cx={f(150 + Math.cos(a) * 120)} cy={f(150 + Math.sin(a) * 140)} r={6} fill="#ffd27a" />;
      })}
      <Wick x={48} y={140} i={0} />
      <Wick x={99} y={128} i={1} />
      <Wick x={150} y={122} i={2} />
      <Wick x={201} y={128} i={3} />
      <Wick x={252} y={140} i={4} />
    </g>
  );
}

/** A chenda drum. `flip` mirrors it so the pair face each other. */
function Drum({ x, flip, scale = 1 }: { x: number; flip: boolean; scale?: number }) {
  return (
    <g transform={`translate(${x} ${f(812 - 340 * scale)}) scale(${scale}) ${flip ? "translate(160 0) scale(-1 1)" : ""}`}>
      <g className="drum art-pe" data-cursor="Strike">
        <ellipse cx={80} cy={340} rx={80} ry={18} fill="#000" opacity={0.45} />
        <path d="M10 40C-4 120 -4 240 14 320H146C164 240 164 120 150 40z" fill="url(#drm)" />
        <ellipse cx={80} cy={326} rx={68} ry={16} fill="#2a0f08" />
        <path d="M2 150H158L156 200H4z" fill="#b3261e" />
        <path
          d="M4 168l11-9 11 9 11-9 11 9 11-9 11 9 11-9 11 9 11-9 11 9 11-9 11 9"
          fill="none"
          stroke="#ffd27a"
          strokeWidth={3}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${14 + i * 22} 44L${25 + i * 22} 78M${25 + i * 22} 44L${14 + i * 22} 78`} stroke="#e6d7b0" strokeWidth={3} />
        ))}
        <ellipse className="skin" cx={80} cy={40} rx={76} ry={24} fill="#f1e1b8" stroke="#3a1d10" strokeWidth={5} />
        <ellipse cx={80} cy={40} rx={50} ry={14} fill="none" stroke="#c9a96a" strokeWidth={2} opacity={0.7} />
        <path d="M30-14C60 20 110 24 150-10" fill="none" stroke="#6a3c1c" strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Garlands() {
  const sets: [number, number, number, number, number][] = [
    [-30, 520, 40, 260, 1],
    [1080, 1630, 40, 260, 2],
  ];
  const cols = ["#ff9d0a", "#ffb700", "#ff7a1a", "#ffc83a"];
  return (
    <>
      {sets.map(([x0, x1, y0, sag, seed]) => {
        const rr = rng(seed);
        return Array.from({ length: 46 }, (_, i) => {
          const t = i / 45;
          const x = x0 + (x1 - x0) * t;
          const y = y0 + 4 * sag * t * (1 - t) + (i % 2 ? 4 : -4);
          const rad = f(13 + rr() * 6);
          return (
            <g key={`${seed}-${i}`}>
              <circle cx={f(x)} cy={f(y)} r={rad} fill={cols[i % 4]} />
              <circle cx={f(x - 3)} cy={f(y - 3)} r={4} fill="#fff0b0" opacity={0.5} />
            </g>
          );
        });
      })}
    </>
  );
}

export default function ChendaArt() {
  const { wire, sockets } = chendaBulbs();
  const flags = Array.from({ length: 30 }, (_, i) => {
    const t = i / 30;
    const x = -20 + t * 1640;
    const y = 64 + 4 * 40 * t * (1 - t);
    return (
      <path
        key={i}
        d={`M${f(x)} ${f(y)}l15 0l-7.5 34z`}
        fill={["#ffb100", "#d83a2a", "#2f8f5b", "#ffe08a"][i % 4]}
        transform={`rotate(${f((t - 0.5) * 9)} ${f(x)} ${f(y)})`}
      />
    );
  });

  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="csk"
              stops={[
                [0, "#120a2a"],
                [0.3, "#3a1240"],
                [0.58, "#b2392e"],
                [0.8, "#ff8a2a"],
                [1, "#ffc15a"],
              ]}
            />
            <Rad
              id="sunc"
              stops={[
                [0, "#fff0c0"],
                [0.3, "#ffb347", 0.7],
                [1, "#ff6a1a", 0],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#csk)" />
          <circle cx={640} cy={640} r={320} fill="url(#sunc)" opacity={0.8} />
          <g opacity={0.5} fill="#ff4f8b">
            <ellipse cx={300} cy={360} rx={300} ry={26} />
            <ellipse cx={1200} cy={300} rx={260} ry={20} />
            <ellipse cx={760} cy={470} rx={340} ry={18} />
          </g>
        </Svg>
      </Layer>

      <Layer depth={0.09}>
        <Svg>
          <Gopuram />
          <g opacity={0.95}>
            <path d="M-20 700C80 640 180 650 260 700V900H-20z" fill="#100612" />
          </g>
          <rect y={716} width={1600} height={200} fill="#0e0612" />
        </Svg>
      </Layer>

      <Layer depth={0.15}>
        <Svg>
          <path d="M-20 64Q800 144 1620 64" fill="none" stroke="#1a0c10" strokeWidth={3} />
          {flags}
          <path d={wire} fill="none" stroke="#150806" strokeWidth={3} />
          {sockets.map((d, i) => (
            <path key={i} d={d} fill="#150806" />
          ))}
        </Svg>
        <LightsCanvas name="chenda-bulbs" y0={0} h={320} />
      </Layer>

      <Layer depth={0.3}>
        <Svg>
          <ellipse cx={800} cy={810} rx={520} ry={110} fill="#1a0a0c" />
          <g transform="translate(0 810) scale(1 .22)" opacity={0.92}>
            <Kolam />
          </g>
        </Svg>
      </Layer>

      <Layer depth={0.38} bleed={1.03} id="lamp-layer">
        <Svg>
          <defs>
            <Brass id="brs2" />
            <Rad
              id="fglow"
              stops={[
                [0, "#ffcf6a", 0.85],
                [1, "#ff6a1a", 0],
              ]}
            />
          </defs>
          <Lamp />
        </Svg>
      </Layer>

      <Layer depth={0.5} bleed={1.04} id="drum-layer">
        <Svg>
          <defs>
            <Lin
              id="drm"
              x2={1}
              y2={0}
              stops={[
                [0, "#5a2a14"],
                [0.5, "#8a4a24"],
                [1, "#3a180a"],
              ]}
            />
          </defs>
          <Drum x={1180} flip scale={0.82} />
          <Drum x={1000} flip={false} />
        </Svg>
      </Layer>

      <Layer depth={0.66} bleed={1.06}>
        <Svg>
          <Garlands />
        </Svg>
      </Layer>
    </>
  );
}
