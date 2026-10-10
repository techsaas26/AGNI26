import { Layer, Lin, Rad, Svg, ff, vars } from "./shared";

function Cart({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={64} height={76} rx={5} fill="#8e8a82" />
      <rect x={6} y={8} width={52} height={40} rx={3} fill={color} />
      <text x={32} y={33} textAnchor="middle" style={ff.pixel} fontSize={8} fill="#fff">
        {label}
      </text>
      <rect x={12} y={56} width={40} height={10} fill="#5a574f" />
    </g>
  );
}

export default function TalentArt() {
  return (
    <>
      <Layer depth={0.03} bleed={1.1}>
        <Svg>
          <defs>
            <Lin
              id="tbg"
              stops={[
                [0, "#1c120e"],
                [1, "#0d0706"],
              ]}
            />
            <Rad
              id="lampglow"
              cx={0.1}
              cy={0.1}
              r={0.6}
              stops={[
                [0, "#ffb347", 0.55],
                [1, "#ffb347", 0],
              ]}
            />
          </defs>
          <rect width={1600} height={900} fill="url(#tbg)" />
          {Array.from({ length: 25 }, (_, i) => (
            <rect key={i} x={i * 64} width={30} height={900} fill="#fff" opacity={0.022} />
          ))}
          <rect width={1600} height={900} fill="url(#lampglow)" />
          <rect y={760} width={1600} height={140} fill="#08040a" />
          <path d="M0 760H1600" stroke="rgba(255,190,120,.25)" strokeWidth={3} />
        </Svg>
      </Layer>

      <Layer depth={0.1}>
        <Svg>
          <g transform="translate(80 150)">
            <rect x={-10} y={86} width={470} height={12} rx={3} fill="#3a2214" />
            <Cart x={10} y={10} color="#2a5db0" label="CONTRA" />
            <Cart x={86} y={10} color="#d83a2a" label="MARIO" />
            <Cart x={162} y={10} color="#2f8f5b" label="TANK" />
            <Cart x={238} y={10} color="#e0a83a" label="9999" />
            <Cart x={314} y={10} color="#7a3aa8" label="DUCK" />
          </g>
          <g transform="translate(1380 200) rotate(3)">
            <rect width={130} height={170} fill="#f6e3b6" stroke="#3a0f0a" strokeWidth={6} />
            <circle cx={65} cy={70} r={32} fill="#ff8a3a" />
            <path d="M65 40L72 66L98 70L72 78L65 104L58 78L32 70L58 66z" fill="#ffd27a" />
            <text x={65} y={140} textAnchor="middle" style={ff.display} fontWeight={900} fontSize={16} fill="#3a0f0a">
              AGNI’26
            </text>
          </g>
        </Svg>
      </Layer>

      <Layer depth={0.26} bleed={1.03} id="tv-layer">
        <Svg>
          <defs>
            <Lin
              id="wood"
              x2={1}
              y2={1}
              stops={[
                [0, "#7a4425"],
                [0.5, "#5a3018"],
                [1, "#3a1d0e"],
              ]}
            />
            <Lin
              id="grain"
              stops={[
                [0, "#000", 0],
                [1, "#000", 0.35],
              ]}
            />
            <Lin
              id="glass"
              x2={1}
              y2={1}
              stops={[
                [0, "#fff", 0.14],
                [0.35, "#fff", 0],
                [1, "#fff", 0],
              ]}
            />
          </defs>
          <g id="tv" transform="translate(560 120)">
            <path d="M200 20L110-60M300 20L400-72" stroke="#cfcfcf" strokeWidth={4} strokeLinecap="round" />
            <circle cx={110} cy={-62} r={7} fill="#e8e8e8" />
            <circle cx={400} cy={-74} r={7} fill="#e8e8e8" />
            <ellipse cx={250} cy={22} rx={62} ry={16} fill="#2a2018" />
            <ellipse cx={380} cy={688} rx={380} ry={30} fill="#000" opacity={0.5} />
            <rect x={20} y={24} width={740} height={580} rx={46} fill="url(#wood)" />
            <rect x={20} y={24} width={740} height={580} rx={46} fill="url(#grain)" opacity={0.5} />
            <rect x={36} y={40} width={708} height={548} rx={36} fill="none" stroke="rgba(255,220,160,.25)" strokeWidth={3} />
            <rect x={52} y={58} width={520} height={510} rx={34} fill="#17100c" />
            <rect x={76} y={82} width={472} height={352} rx={40} fill="#030503" stroke="#4a4036" strokeWidth={6} />
            <rect x={76} y={82} width={472} height={352} rx={40} id="crt-glass" fill="url(#glass)" />
            <g transform="translate(600 76)">
              <rect width={116} height={130} rx={12} fill="#17100c" />
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={14} y={16 + i * 10.5} width={88} height={4} rx={2} fill="#050302" />
              ))}
            </g>
            <g transform="translate(600 230)">
              <circle cx={30} cy={30} r={27} fill="#2a2018" stroke="#a89878" strokeWidth={3} />
              <path d="M30 8V22" stroke="#e8d8b0" strokeWidth={3} strokeLinecap="round" id="knob1" />
              <circle cx={88} cy={30} r={27} fill="#2a2018" stroke="#a89878" strokeWidth={3} />
              <path d="M88 8V22" stroke="#e8d8b0" strokeWidth={3} strokeLinecap="round" transform="rotate(40 88 30)" />
            </g>
            <g transform="translate(606 330)">
              <rect width={104} height={30} rx={4} fill="#d8c8a0" />
              <text x={52} y={21} textAnchor="middle" style={ff.display} fontWeight={900} fontSize={17} fill="#3a0f0a" letterSpacing={3}>
                AGNI
              </text>
            </g>
            <circle cx={660} cy={410} r={6} fill="#ff3a1a" className="tw" style={vars({ "--dur": "1.4s" })} />
            <path d="M70 604L52 664H106L112 604zM650 604L668 664H714L708 604z" fill="#2a1a10" />
          </g>
          <g transform="translate(620 722)">
            <rect width={640} height={104} rx={8} fill="#c9c3b4" />
            <rect y={42} width={640} height={26} fill="#17100c" />
            <rect x={22} y={14} width={150} height={20} rx={3} fill="#a8a294" />
            <rect x={470} y={14} width={150} height={20} rx={3} fill="#a8a294" />
            <circle cx={64} cy={78} r={8} fill="#ff3a1a" className="tw" style={vars({ "--dur": "2s" })} />
            <rect x={230} y={12} width={180} height={26} rx={3} fill="#8a847a" />
            <rect x={236} y={-20} width={168} height={40} rx={3} fill="#6a665e" />
            <rect x={246} y={-12} width={148} height={24} fill="#d83a2a" />
            <text x={320} y={6} textAnchor="middle" style={ff.pixel} fontSize={9} fill="#fff0c0">
              AGNI’26
            </text>
          </g>
        </Svg>
        <div className="crt-wrap" id="crt-wrap">
          <canvas id="crt" width={480} height={360} />
          <div className="crt-scan" />
          <div className="crt-vig" />
        </div>
      </Layer>

      <Layer depth={0.5} bleed={1.04} id="ctrl-layer">
        <Svg>
          <g id="controller" transform="translate(1090 736) rotate(-5)">
            <rect width={300} height={120} rx={12} fill="#bdb7a8" />
            <rect x={14} y={14} width={272} height={92} rx={8} fill="#17100c" />
            <g transform="translate(52 28)">
              <rect x={26} y={0} width={28} height={80} rx={3} fill="#3a3630" />
              <rect x={0} y={26} width={80} height={28} rx={3} fill="#3a3630" />
              <circle cx={40} cy={40} r={9} fill="#26231f" />
            </g>
            <rect x={124} y={60} width={38} height={12} rx={6} fill="#6a665e" />
            <rect x={170} y={60} width={38} height={12} rx={6} fill="#6a665e" />
            <text x={143} y={92} textAnchor="middle" style={ff.pixel} fontSize={6} fill="#cfc8b8">
              SELECT
            </text>
            <text x={189} y={92} textAnchor="middle" style={ff.pixel} fontSize={6} fill="#cfc8b8">
              START
            </text>
            <circle id="btnB" cx={236} cy={60} r={16} fill="#d83a2a" />
            <circle id="btnA" cx={272} cy={60} r={16} fill="#d83a2a" />
            <path d="M0 60C-60 70-80 -10-200 -20" fill="none" stroke="#17100c" strokeWidth={7} />
          </g>
        </Svg>
        {/* invisible hit-targets over the pad, in stage coordinates */}
        <div className="pad" id="pad">
          <button type="button" data-k="U" aria-label="up" />
          <button type="button" data-k="L" aria-label="left" />
          <button type="button" data-k="R" aria-label="right" />
          <button type="button" data-k="D" aria-label="down" />
          <button type="button" data-k="S" aria-label="start" />
          <button type="button" data-k="A" aria-label="A" />
        </div>
      </Layer>
    </>
  );
}
