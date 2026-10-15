import { MAPLE, f, rng } from "@/lib/art";
import { Layer, LightsCanvas, Lin, Rad, Svg, ff } from "./shared";

/** Events — a quiet, dark backdrop with a few drifting maple leaves. */
export function EventsArt() {
  const r = rng(11);
  const leaves = Array.from({ length: 10 }, (_, i) => (
    <path
      key={i}
      d={MAPLE}
      transform={`translate(${f(r() * 1600)} ${f(r() * 900)}) rotate(${f(r() * 360)}) scale(${f(0.8 + r() * 1.2)})`}
      fill={i % 2 ? "#c4281f" : "#ff6a1a"}
      opacity={0.1}
    />
  ));
  return (
    <Layer depth={0.03} bleed={1.1}>
      <Svg>
        <defs>
          <Lin
            id="evb"
            stops={[
              [0, "#1d0a0a"],
              [1, "#0c0405"],
            ]}
          />
        </defs>
        <rect width={1600} height={900} fill="url(#evb)" />
        {leaves}
      </Svg>
    </Layer>
  );
}

/** Register — the cinema lobby: damask wall, marquee frame and drifting maple leaves. */
export function RegisterArt() {
  const r = rng(5);
  const leafFill = ["#ff6a1a", "#c4281f", "#ffa83c"];
  const leaves = Array.from({ length: 14 }, (_, i) => {
    const tx = f(r() * 1600);
    const ty = f(r() * 900);
    const rot = f(r() * 360);
    const sc = f(0.7 + r() * 1.1);
    return <path key={i} d={MAPLE} transform={`translate(${tx} ${ty}) rotate(${rot}) scale(${sc})`} fill={leafFill[i % 3]} opacity={0.16} />;
  });
  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <pattern id="dam" width={120} height={160} patternUnits="userSpaceOnUse">
              <path d="M60 0L120 80L60 160L0 80z" fill="none" stroke="#e9b96e" strokeOpacity={0.08} strokeWidth={2} />
              <circle cx={60} cy={80} r={7} fill="#e9b96e" fillOpacity={0.1} />
              <path d="M0 0l15 0M105 0l15 0M0 160l15 0M105 160l15 0" stroke="#e9b96e" strokeOpacity={0.08} />
            </pattern>
            <Rad
              id="lob"
              r={0.8}
              stops={[
                [0, "#8a1c14", 0.9],
                [1, "#1b0707", 1],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#lob)" />
          <rect width={1600} height={900} fill="url(#dam)" />
          {leaves}
        </Svg>
      </Layer>
      <Layer depth={0.1}>
        <Svg>
          <rect x={22} y={22} width={1556} height={856} rx={10} fill="none" stroke="#e9b96e" strokeWidth={2} opacity={0.5} />
          <rect x={32} y={32} width={1536} height={836} rx={6} fill="none" stroke="#e9b96e" strokeWidth={1} opacity={0.3} />
        </Svg>
        <LightsCanvas name="register-bulbs" y0={0} h={900} />
      </Layer>
    </>
  );
}

/** One side of the tee. The back and front share a silhouette. */
function Tee({ back, gradient }: { back: boolean; gradient: string }) {
  return (
    <g>
      <path
        d="M300 130C340 190 460 190 500 130L640 190L710 330L610 372L582 330V700H218V330L190 372L90 330L160 190z"
        fill={`url(#${gradient})`}
        stroke="rgba(60,30,10,.45)"
        strokeWidth={3}
      />
      <path d="M300 130C340 200 460 200 500 130C480 150 320 150 300 130z" fill="#2a0d08" />
      <path d="M300 130C340 190 460 190 500 130" stroke="#6a1a10" strokeWidth={10} fill="none" />
      <path d="M222 330Q400 350 578 330" stroke="rgba(0,0,0,.18)" strokeWidth={2} fill="none" />
      {[250, 330, 400, 470, 550].map((x) => (
        <path key={x} d={`M${x} 250C${x + 8} 400 ${x - 8} 560 ${x + 4} 700`} stroke="rgba(80,40,10,.07)" strokeWidth={5} fill="none" />
      ))}
      {back ? (
        <>
          <text x={400} y={360} textAnchor="middle" style={ff.display} fontStyle="italic" fontWeight={300} fontSize={46} fill="#3a0f0a">
            Some fires
          </text>
          <text x={400} y={414} textAnchor="middle" style={ff.display} fontStyle="italic" fontWeight={300} fontSize={46} fill="#3a0f0a">
            never fade
          </text>
          <text x={400} y={470} textAnchor="middle" style={ff.type} fontSize={18} letterSpacing={6} fill="#b3261e">
            CEG · 2026
          </text>
        </>
      ) : (
        <path d="M236 286H564V494H236z" fill="none" stroke="rgba(80,40,10,.18)" strokeWidth={1.5} strokeDasharray="4 6" />
      )}
    </g>
  );
}

const TEE_STOPS = [
  [0, "#f3e3bd"],
  [0.5, "#e3cd9d"],
  [1, "#c2a76d"],
] as const;

/**
 * Merch — the print shop. A blank tee hangs on the line; drag the squeegee across it and the
 * logo is pulled through the screen. Tap the tee to see the back.
 */
export function MerchArt() {
  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="mbg"
              stops={[
                [0, "#24140d"],
                [1, "#120a07"],
              ]}
            />
            <Lin
              id="mtb"
              stops={[
                [0, "#4a2f1c"],
                [1, "#25150c"],
              ]}
            />
            <Rad
              id="mgl"
              cx={0.72}
              cy={0.4}
              r={0.5}
              stops={[
                [0, "#ffcf8a", 0.22],
                [1, "#ffcf8a", 0],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#mbg)" />
          <rect width={1600} height={900} fill="url(#mgl)" />
          {/* the work table */}
          <rect y={740} width={1600} height={170} fill="url(#mtb)" />
          <rect y={738} width={1600} height={5} fill="#7a5230" />
          {[90, 260, 430, 610, 780, 950, 1130, 1300, 1480].map((x) => (
            <path key={x} d={`M${x} 746V900`} stroke="rgba(0,0,0,.25)" strokeWidth={2} />
          ))}
        </Svg>
      </Layer>

      <Layer depth={0.3} bleed={1.03} id="tee-layer">
        <Svg>
          <path d="M760 246H1620" stroke="#8a6a44" strokeWidth={3} />
          <circle cx={760} cy={246} r={7} fill="#b8864a" />
        </Svg>
        <div className="tee-wrap" id="tee-wrap">
          <div className="tee" id="tee">
            <div className="tee-face tee-front">
              <Svg viewBox="60 0 680 760">
                <defs>
                  <Lin id="teeb" x2={1} y2={1} stops={TEE_STOPS} />
                </defs>
                <Tee back={false} gradient="teeb" />
              </Svg>
              <Svg viewBox="60 0 680 760" className="print" id="tee-print">
                <image href="/images/branding/agni26-logo.webp" x={236} y={286} width={328} height={165} preserveAspectRatio="xMidYMid meet" />
                <text x={400} y={494} textAnchor="middle" style={ff.type} fontSize={17} letterSpacing={6} fill="#3a0f0a">
                  SOME FIRES NEVER FADE
                </text>
              </Svg>
            </div>
            <div className="tee-face tee-back">
              <Svg viewBox="60 0 680 760">
                <defs>
                  <Lin id="teeb2" x2={1} y2={1} stops={TEE_STOPS} />
                </defs>
                <Tee back gradient="teeb2" />
              </Svg>
            </div>
          </div>
          <div className="sq" id="tee-sq" data-cursor="Drag" aria-label="Squeegee: drag across the tee">
            <i />
          </div>
          {/* two pegs hold the shoulders on the line */}
          <svg className="pegs" viewBox="0 0 560 40" aria-hidden="true">
            <rect x={70} y={4} width={22} height={36} rx={4} fill="#b8864a" />
            <rect x={468} y={4} width={22} height={36} rx={4} fill="#b8864a" />
          </svg>
        </div>
      </Layer>
    </>
  );
}

/** Contact — contour lines and an airmail border. */
export function ContactArt() {
  return (
    <Layer depth={0.04} bleed={1.1}>
      <Svg>
        <defs>
          <Lin
            id="cbg2"
            stops={[
              [0, "#1a0807"],
              [1, "#0c0303"],
            ]}
          />
        </defs>
        <rect width={1600} height={900} fill="url(#cbg2)" />
        {Array.from({ length: 14 }, (_, i) => {
          const rr = 50 + i * 46;
          return (
            <ellipse
              key={i}
              cx={1180 + i * 6}
              cy={500 - i * 3}
              rx={rr * 1.7}
              ry={rr}
              fill="none"
              stroke="#ffb347"
              strokeOpacity={f(0.2 - i * 0.01)}
              strokeWidth={1.3}
              transform={`rotate(${-12 + i * 1.6} 1180 500)`}
            />
          );
        })}
        <g opacity={0.7}>
          {Array.from({ length: 46 }, (_, i) => (
            <path key={i} d={`M${i * 44 - 30} 0l-34 34`} stroke={i % 2 ? "#c4281f" : "#2a4fa0"} strokeWidth={12} />
          ))}
        </g>
      </Svg>
    </Layer>
  );
}
