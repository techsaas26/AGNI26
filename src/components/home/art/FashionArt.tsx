import { f } from "@/lib/art";
import { Beam, Layer, Lin, Rad, Svg, ff, vars } from "./shared";

const STAGE_X = [310, 540, 770];

function Curtain({ mirror }: { mirror: boolean }) {
  const n = 9;
  const W = 380;
  return (
    <g transform={mirror ? "translate(1600 0) scale(-1 1)" : undefined}>
      {Array.from({ length: n }, (_, i) => {
        const x = (i * W) / n;
        const w = W / n;
        return (
          <path
            key={i}
            d={`M${f(x)} 0H${f(x + w)}V${900 - (i % 2 ? 8 : 0)}Q${f(x + w / 2)} ${930 + (i % 2 ? 10 : -4)} ${f(x)} ${900 - (i % 2 ? 0 : 8)}z`}
            fill={`url(#vel${i % 3})`}
          />
        );
      })}
      <path d="M0 520Q190 560 380 480" stroke="#e9b96e" strokeWidth={10} fill="none" />
      <path d="M350 484l16 90" stroke="#e9b96e" strokeWidth={5} />
      <ellipse cx={366} cy={590} rx={14} ry={28} fill="#e9b96e" />
      <path d="M350 574h32l-6 -18h-20z" fill="#c8923a" />
    </g>
  );
}

interface ModelProps {
  cx: number;
  gown: string;
  trim: string;
  hem?: number;
  scale?: number;
  skin?: string;
  gold?: string;
}

/** A long-limbed fashion-plate figure; y runs up from the floor. */
function Model({ cx, gown, trim, hem = 120, scale = 1, skin = "#d6a077", gold = "#f0c870" }: ModelProps) {
  return (
    <g transform={`translate(${cx} 748) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={hem + 34} ry={15} fill="#000" opacity={0.6} />
      <path d="M-35 -398Q-60 -340 -48 -290Q-44 -262 -38 -244" fill="none" stroke={skin} strokeWidth={11} strokeLinecap="round" />
      <path d="M35 -398Q62 -352 44 -318Q36 -300 24 -292" fill="none" stroke={skin} strokeWidth={11} strokeLinecap="round" />
      <path
        d={`M-34 -402Q0 -388 34 -402L40 -338Q24 -302 22 -286L36 -226C60 -150 ${f(hem * 0.92)} -70 ${hem} -2Q0 20 -${hem} -2C-${f(hem * 0.92)} -70 -60 -150 -36 -226L-22 -286Q-24 -302 -40 -338Z`}
        fill={gown}
      />
      <path
        d={`M-34 -402Q-20 -390 -12 -380L-30 -230L-36 -226C-60 -150 -${f(hem * 0.92)} -70 -${hem} -2Q-${f(hem * 0.5)} 6 0 8L0 -230Z`}
        fill="rgba(255,255,255,.1)"
      />
      {[-0.8, -0.45, -0.1, 0.25, 0.6].map((k) => (
        <g key={k}>
          <path d={`M${f(k * 26)} -224Q${f(k * hem * 0.7)} -110 ${f(k * hem * 0.96)} -6`} stroke="rgba(0,0,0,.26)" strokeWidth={3} fill="none" />
          <path
            d={`M${f(k * 26 + 9)} -224Q${f(k * hem * 0.7 + 10)} -110 ${f(k * hem * 0.96 + 12)} -6`}
            stroke="rgba(255,255,255,.12)"
            strokeWidth={2}
            fill="none"
          />
        </g>
      ))}
      <path d="M24 -402L38 -398L-24 -226L-42 -224Z" fill={trim} opacity={0.92} />
      <path d="M38 -398L-24 -226" stroke={gold} strokeWidth={3} fill="none" />
      <path d="M-15 -402Q0 -374 15 -402" stroke={gold} strokeWidth={3} fill="none" />
      <path d="M-23 -287Q0 -279 23 -287" stroke={gold} strokeWidth={6} fill="none" />
      <path d={`M-${hem} -2Q0 20 ${hem} -2`} stroke={gold} strokeWidth={9} fill="none" />
      <path d={`M-${f(hem * 0.97)} -14Q0 8 ${f(hem * 0.97)} -14`} stroke={trim} strokeWidth={5} fill="none" opacity={0.85} />
      <rect x={-5.5} y={-418} width={11} height={20} rx={4} fill={skin} />
      <ellipse cx={0} cy={-436} rx={15.5} ry={19.5} fill={skin} />
      <path d="M-17 -438Q-18 -460 0 -460Q18 -460 17 -438Q8 -452 -2 -450Q-12 -448 -17 -438Z" fill="#1a0d08" />
      <circle cx={0} cy={-466} r={9} fill="#1a0d08" />
    </g>
  );
}

/** Photos pegged on a string above the runway — [file, offsetX, offsetY, width, height] in photo pixels. */
const POLAROIDS = [
  ["campus-bench.webp", 0, 0, 1600, 1067],
  ["maple-lake.webp", -60, 0, 1500, 844],
  ["hero-bg.jpeg", -900, -120, 2400, 1350],
  ["maple-lake.webp", -600, -300, 2400, 1350],
  ["campus-bench.webp", -720, -120, 2000, 1333],
] as const;
const POLAROID_X = [220, 450, 680, 910, 1140];
const POLAROID_ROT = [-4, 3, -2, 4, -3];
const POLAROID_DIR: Record<string, string> = {
  "campus-bench.webp": "gallery",
  "maple-lake.webp": "gallery",
  "hero-bg.jpeg": "hero",
};

const VELVET = [
  [0, "#3a0509"],
  [0.25, "#9a1a22"],
  [0.5, "#5a0a10"],
  [0.8, "#a82028"],
  [1, "#3a0509"],
] as const;

export default function FashionArt() {
  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="fbg"
              stops={[
                [0, "#060102"],
                [1, "#1a0709"],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#fbg)" />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <rect x={i * 200} width={198} height={720} fill={["#1a0608", "#220a0c"][i % 2]} />
              <path d={`M${i * 200 + 99} 40V680`} stroke="#e9b96e" strokeOpacity={0.12} strokeWidth={2} />
            </g>
          ))}
          <text x={560} y={300} textAnchor="middle" style={ff.display} fontStyle="italic" fontWeight={300} fontSize={150} fill="#e9b96e" opacity={0.07}>
            Couture Night
          </text>
        </Svg>
      </Layer>

      <Layer depth={0.1}>
        {STAGE_X.map((x, i) => (
          <Beam key={x} x={x} color="#fff3d6" delay={-1 - i * 1.7} duration={7 + i} y={0} len={780} ox={450} opacity={0.7} />
        ))}
      </Layer>

      <Layer depth={0.2}>
        <Svg>
          <defs>
            <Lin
              id="fl"
              stops={[
                [0, "#2a1109"],
                [1, "#080203"],
              ]}
            />
            <Lin
              id="rw"
              stops={[
                [0, "#7a4a2a", 0.5],
                [1, "#2a1109", 0.2],
              ]}
            />
            <Rad
              id="pool2"
              stops={[
                [0, "#ffe9c0", 0.5],
                [1, "#ffe9c0", 0],
              ]}
            />
          </defs>
          <rect y={716} width={1600} height={190} fill="url(#fl)" />
          <path d="M450 716H630L880 900H200z" fill="url(#rw)" />
          <path d="M450 716L200 900M630 716L880 900" stroke="#e9b96e" strokeWidth={3} opacity={0.7} />
          {STAGE_X.map((x) => (
            <ellipse key={x} cx={x} cy={760} rx={200} ry={38} fill="url(#pool2)" />
          ))}
        </Svg>
      </Layer>

      <Layer depth={0.32} bleed={1.03} id="forms-layer">
        <Svg>
          <Model cx={STAGE_X[0]} gown="#0f6b4a" trim="#d9a93a" hem={104} scale={0.96} />
          <Model cx={STAGE_X[1]} gown="#a3141c" trim="#e8b050" hem={128} scale={1.04} />
          <Model cx={STAGE_X[2]} gown="#2a2a8a" trim="#d9a93a" hem={96} scale={0.96} skin="#c18a62" />
        </Svg>
      </Layer>

      <Layer depth={0.46} id="pol-layer">
        <Svg>
          <path d="M-20 100Q560 160 1140 120" fill="none" stroke="#e9b96e" strokeWidth={2} opacity={0.8} />
        </Svg>
        {POLAROIDS.map(([src, ox, oy, iw, ih], i) => {
          const sc = 124 / Math.min(iw, ih);
          return (
            <div
              key={i}
              className="pol"
              style={vars({
                left: POLAROID_X[i] - 70,
                "--r": `${POLAROID_ROT[i]}deg`,
                "--dl": `${f(-i * 0.9)}s`,
                "--dur": `${f(3.6 + i * 0.5)}s`,
                "--amp": `${f(2.6 + (i % 2))}deg`,
              })}
            >
              <i
                style={{
                  backgroundImage: `url(/images/${POLAROID_DIR[src]}/${src})`,
                  backgroundSize: `${f(iw * sc)}px ${f(ih * sc)}px`,
                  backgroundPosition: `${f(ox * sc)}px ${f(oy * sc)}px`,
                }}
              />
              <span>AGNI’26 · no.{i + 1}</span>
            </div>
          );
        })}
      </Layer>

      <Layer depth={0.62} bleed={1} id="curtain-layer">
        <Svg>
          <defs>
            {[0, 1, 2].map((i) => (
              <Lin key={i} id={`vel${i}`} x2={1} y2={0} stops={VELVET} />
            ))}
          </defs>
          <g id="curL">
            <Curtain mirror={false} />
          </g>
          <g id="curR">
            <Curtain mirror />
          </g>
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 80} 0H${i * 80 + 80}V70Q${i * 80 + 40} 126 ${i * 80} 70z`}
              fill={`url(#vel${i % 3})`}
              stroke="#e9b96e"
              strokeWidth={3}
            />
          ))}
        </Svg>
      </Layer>
    </>
  );
}
