import type { CSSProperties, ReactNode } from "react";
import type { LightsName } from "@/lib/art";

export type Stop = readonly [offset: number, color: string, opacity?: number];

export function Lin({ id, stops, x2 = 0, y2 = 1 }: { id: string; stops: readonly Stop[]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c, a = 1], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
      ))}
    </linearGradient>
  );
}

export function Rad({
  id,
  stops,
  cx = 0.5,
  cy = 0.5,
  r = 0.5,
}: {
  id: string;
  stops: readonly Stop[];
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c, a = 1], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
      ))}
    </radialGradient>
  );
}

/** Polished brass — used for the bioscope trim and the ceremonial lamp. */
export function Brass({ id }: { id: string }) {
  return (
    <Lin
      id={id}
      x2={1}
      y2={0}
      stops={[
        [0, "#7a4a12"],
        [0.25, "#f6d27a"],
        [0.5, "#c88a22"],
        [0.75, "#fff0b0"],
        [1, "#6a3c0c"],
      ]}
    />
  );
}

/**
 * One parallax plane of a scene. The engine reads `data-depth`, `data-bleed`
 * and `data-zoom` straight from the DOM.
 */
export function Layer({
  depth,
  bleed,
  zoom,
  origin,
  id,
  className,
  children,
}: {
  depth: number;
  bleed?: number;
  zoom?: number;
  /** transform-origin of the zoom, e.g. "42% 66%". */
  origin?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={className ? `layer ${className}` : "layer"}
      data-depth={depth}
      data-bleed={bleed}
      data-zoom={zoom}
      data-origin={origin}
      id={id}
    >
      {children}
    </div>
  );
}

/** A 1600×900 SVG plane. */
export function Svg({ children, viewBox = "0 0 1600 900", className, id }: { children: ReactNode; viewBox?: string; className?: string; id?: string }) {
  return (
    <svg id={id} className={className} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

/** Canvas the engine paints twinkling bulbs / stars / lighters onto. */
export function LightsCanvas({ name, y0 = 0, h = 900 }: { name: LightsName; y0?: number; h?: number }) {
  return (
    <canvas
      className="lights"
      data-lights={name}
      data-y0={y0}
      width={1600}
      height={h}
      style={{ top: y0, height: h }}
    />
  );
}

/** A beam of stage light — its own composited element so it rotates on the GPU. */
export function Beam({
  x,
  color,
  delay,
  duration,
  y = 64,
  len = 900,
  ox = 450,
  opacity = 0.42,
}: {
  x: number;
  color: string;
  delay: number;
  duration: number;
  y?: number;
  len?: number;
  ox?: number;
  opacity?: number;
}) {
  const style = {
    left: x - ox,
    "--dl": `${delay}s`,
    "--dur": `${duration}s`,
    "--oy": `${y}px`,
    "--bo": opacity,
  } as CSSProperties;
  return (
    <svg className="beam" viewBox="0 0 900 900" style={style}>
      <defs>
        <Lin
          id={`bg${x}`}
          stops={[
            [0, color, 0.7],
            [0.55, color, 0.1],
            [1, color, 0],
          ]}
        />
      </defs>
      <polygon points={`${ox - 16},${y - 4} ${ox + 16},${y - 4} ${ox + 230},${len} ${ox - 230},${len}`} fill={`url(#bg${x})`} />
      {y > 10 && (
        <>
          <circle cx={ox} cy={y} r={22} fill="#1a0c10" />
          <circle cx={ox} cy={y + 12} r={14} fill={color} />
        </>
      )}
    </svg>
  );
}

/** Custom-property helper so inline styles stay typed. */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Font stacks for SVG text (families are hashed by next/font, so go through the theme vars). */
export const ff = {
  display: { fontFamily: "var(--font-display)" } as CSSProperties,
  type: { fontFamily: "var(--font-type)" } as CSSProperties,
  pixel: { fontFamily: "var(--font-pixel)" } as CSSProperties,
  sign: { fontFamily: "var(--font-sign)" } as CSSProperties,
  tamil: { fontFamily: "var(--font-tamil)" } as CSSProperties,
};
